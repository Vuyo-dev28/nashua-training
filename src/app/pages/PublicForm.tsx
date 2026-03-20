import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { CheckCircle2, Loader2, AlertCircle, ArrowRight, ClipboardCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { storage } from '../utils/storage';
import { Form, FormField, Submission } from '../types';

export function PublicForm() {
  const { formId } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const loadForm = async () => {
      if (formId) {
        const loadedForm = await storage.getForm(formId);
        if (loadedForm) {
          setForm(loadedForm);
          // Initialize form data
          const initialData: Record<string, any> = {};
          loadedForm.fields.forEach(field => {
            initialData[field.id] = field.type === 'checkbox' ? false : '';
          });
          setFormData(initialData);
        }
      }
    };
    loadForm();
  }, [formId]);

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && !value) {
      return `${field.label} is required`;
    }

    if (value) {
      switch (field.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return 'Please enter a valid email address';
          }
          break;
        case 'phone':
          const phoneRegex = /^[\d\s\-\+\(\)]+$/;
          if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
            return 'Please enter a valid phone number';
          }
          break;
        case 'number':
          if (isNaN(value)) {
            return 'Please enter a valid number';
          }
          break;
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form) return;

    // Validate all fields
    const newErrors: Record<string, string> = {};
    form.fields.forEach(field => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      
      try {
        const submission: Submission = {
          id: `submission_${Date.now()}`,
          formId: form.id,
          data: formData,
          submittedAt: new Date().toISOString()
        };

        await storage.saveSubmission(submission);
        setIsSubmitting(false);
        setIsSubmitted(true);
      } catch (error) {
        console.error('Error submitting form:', error);
        setIsSubmitting(false);
        // Could add a toast here for error
      }
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const renderField = (field: FormField, index: number) => {
    const error = errors[field.id];
    const value = formData[field.id];

    const containerProps = {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: index * 0.05 + 0.2 }
    };

    const fieldContent = () => {
      switch (field.type) {
        case 'textarea':
          return (
            <div className="space-y-2">
              <Label htmlFor={field.id} className="text-sm font-semibold text-slate-700">
                {field.label}
                {field.required && <span className="text-indigo-500 ml-1 font-bold">*</span>}
              </Label>
              <Textarea
                id={field.id}
                value={value}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className={`min-h-[120px] bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all rounded-xl resize-none ${error ? 'border-red-500 bg-red-50' : ''}`}
              />
            </div>
          );

        case 'select':
          return (
            <div className="space-y-2">
              <Label htmlFor={field.id} className="text-sm font-semibold text-slate-700">
                {field.label}
                {field.required && <span className="text-indigo-500 ml-1 font-bold">*</span>}
              </Label>
              <Select
                value={value}
                onValueChange={(val) => handleFieldChange(field.id, val)}
              >
                <SelectTrigger className={`h-11 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all rounded-xl ${error ? 'border-red-500 bg-red-50' : ''}`}>
                  <SelectValue placeholder={field.placeholder || 'Select an option'} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  {field.options?.map((option) => (
                    <SelectItem key={option} value={option} className="rounded-lg">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );

        case 'checkbox':
          return (
            <div className="pt-2">
              <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100/50 transition-colors cursor-pointer group">
                <Checkbox
                  id={field.id}
                  checked={value}
                  onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
                  className="mt-0.5 border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
                <Label htmlFor={field.id} className="cursor-pointer text-sm leading-tight text-slate-600 group-hover:text-slate-900 transition-colors">
                  {field.label}
                  {field.required && <span className="text-indigo-500 ml-1 font-bold">*</span>}
                </Label>
              </div>
            </div>
          );

        default:
          return (
            <div className="space-y-2">
              <Label htmlFor={field.id} className="text-sm font-semibold text-slate-700">
                {field.label}
                {field.required && <span className="text-indigo-500 ml-1 font-bold">*</span>}
              </Label>
              <Input
                id={field.id}
                type={field.type}
                value={value}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className={`h-11 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all rounded-xl ${error ? 'border-red-500 bg-red-50' : ''}`}
              />
            </div>
          );
      }
    };

    return (
      <motion.div key={field.id} {...containerProps} className="space-y-1">
        {fieldContent()}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs font-medium text-red-500 flex items-center mt-1 ml-1"
            >
              <AlertCircle className="w-3 h-3 mr-1" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  if (!form) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="max-w-md w-full border-none shadow-lg rounded-2xl">
            <CardContent className="pt-10 pb-10 text-center space-y-4">
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <CardTitle className="text-slate-900">Form Not Found</CardTitle>
              <CardDescription>
                The form you're looking for doesn't exist or has been removed.
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-indigo-500" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full z-10"
        >
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardContent className="pt-16 pb-16 text-center space-y-8">
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="bg-emerald-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </motion.div>
              
              <div className="space-y-3">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Success!</h2>
                <p className="text-slate-500 text-lg">
                  Your response has been securely recorded.
                </p>
              </div>

              <div className="pt-4 px-6">
                <Button
                  onClick={() => {
                    setIsSubmitted(false);
                    const initialData: Record<string, any> = {};
                    form.fields.forEach(field => {
                      initialData[field.id] = field.type === 'checkbox' ? false : '';
                    });
                    setFormData(initialData);
                  }}
                  variant="outline"
                  className="w-full h-14 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-base"
                >
                  Submit Another Response
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
        <div className="absolute top-[10%] right-[10%] w-64 h-64 bg-indigo-100 blur-[100px] rounded-full" />
        <div className="absolute bottom-[20%] left-[5%] w-80 h-80 bg-blue-100 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl">
            <div className="h-2 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500" />
            <CardHeader className="pt-12 pb-8 px-8 md:px-12 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
                <div className="bg-indigo-600 text-white p-3 rounded-2xl w-fit mx-auto md:mx-0 shadow-lg shadow-indigo-200">
                  <ClipboardCheck className="w-8 h-8" />
                </div>
                <div className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-[0.2em]">
                  Public Form
                </div>
              </div>
              <CardTitle className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-4">
                {form.name}
              </CardTitle>
              {form.description && (
                <CardDescription className="text-lg text-slate-500 font-medium leading-relaxed">
                  {form.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="px-8 md:px-12 pb-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-8 pt-4">
                  {form.fields.map((field, i) => renderField(field, i))}
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="pt-10"
                >
                  <Button
                    type="submit"
                    className="w-full h-16 bg-slate-900 hover:bg-black text-white text-lg font-bold rounded-2xl tracking-tight shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <span className="flex items-center">
                        Submit Response
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                  <p className="text-center text-xs text-slate-400 font-semibold mt-6 uppercase tracking-widest">
                    Your data is stored securely
                  </p>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
