import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Plus, Trash2, GripVertical, ArrowLeft, Save, Settings, Check, Info, Layout, Type, Mail, Phone, Hash, AlignLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { storage } from '../utils/storage';
import { Form, FormField, FieldType } from '../types';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';

export function FormBuilder() {
  const navigate = useNavigate();
  const { formId } = useParams();
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);

  useEffect(() => {
    const loadForm = async () => {
      if (formId) {
        const form = await storage.getForm(formId);
        if (form) {
          setFormName(form.name);
          setFormDescription(form.description || '');
          setFields(form.fields);
        }
      }
    };
    loadForm();
  }, [formId]);

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: '',
      type: 'text',
      required: false,
      placeholder: ''
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < fields.length) {
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
      setFields(newFields);
    }
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error('Please enter a form name');
      return;
    }

    if (fields.length === 0) {
      toast.error('Please add at least one field');
      return;
    }

    const hasEmptyLabels = fields.some(f => !f.label.trim());
    if (hasEmptyLabels) {
      toast.error('Please fill in all field labels');
      return;
    }

    try {
      let createdAt = new Date().toISOString();
      if (formId) {
        const existingForm = await storage.getForm(formId);
        if (existingForm) {
          createdAt = existingForm.createdAt;
        }
      }

      const form: Form = {
        id: formId || `form_${Date.now()}`,
        name: formName,
        description: formDescription,
        fields,
        createdAt,
        createdBy: 'Trainer'
      };

      await storage.saveForm(form);
      toast.success(formId ? 'Form updated successfully' : 'Form created successfully');
      navigate('/');
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Failed to save form');
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="rounded-full bg-white shadow-sm border border-slate-200 hover:bg-slate-50 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900">
                {formId ? 'Edit Form' : 'New Design'}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-100 font-bold uppercase tracking-wider text-[10px] px-2 py-0">
                  Form Builder
                </Badge>
                {isSaving && (
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}>Saving...</motion.div>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="h-11 px-6 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 font-bold transition-all disabled:opacity-70 group"
            >
              <Save className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              {formId ? 'Update Changes' : 'Publish Form'}
            </Button>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Section 1: Form Identity */}
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
            <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-blue-500" />
            <CardHeader className="pt-8 pb-6 px-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-indigo-100 p-2 rounded-xl">
                  <Layout className="w-5 h-5 text-indigo-600" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">Form Details</CardTitle>
              </div>
              <CardDescription className="text-slate-500 font-medium font-outfit">
                Set the main title and description for your data collection form.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="formName" className="text-sm font-bold text-slate-700 ml-1">Form Title</Label>
                <Input
                  id="formName"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Q3 Customer Feedback Survey"
                  className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all rounded-xl text-lg font-semibold tracking-tight leading-tight"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="formDescription" className="text-sm font-bold text-slate-700 ml-1 opacity-70">Description (Optional)</Label>
                <Textarea
                  id="formDescription"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Explain the purpose of this form to your respondents..."
                  className="min-h-[100px] bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all rounded-xl resize-none font-medium leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Fields List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">Form Questions</h2>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{fields.length} questions total</p>
                </div>
              </div>
              <Button 
                onClick={addField}
                className="h-10 bg-white border border-slate-200 text-indigo-600 hover:bg-slate-50 hover:border-indigo-200 shadow-sm rounded-xl font-bold px-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>

            <Reorder.Group axis="y" values={fields} onReorder={setFields} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {fields.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key="empty"
                  >
                    <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 rounded-[2rem] p-12 text-center group hover:border-indigo-300 hover:bg-indigo-50/20 transition-all duration-300">
                      <div className="bg-white w-20 h-20 rounded-3xl shadow-lg border border-slate-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                        <Plus className="w-10 h-10 text-slate-300 group-hover:text-indigo-500" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Build your form</h3>
                      <p className="text-slate-500 font-medium mb-8 max-w-[280px] mx-auto italic">Start by adding your first dynamic input field to collect data.</p>
                      <Button 
                        onClick={addField}
                        size="lg"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100 rounded-2xl h-14 px-10 font-black tracking-tight"
                      >
                        Add Your First Question
                      </Button>
                    </Card>
                  </motion.div>
                ) : (
                  fields.map((field, index) => (
                    <Reorder.Item
                      key={field.id}
                      value={field}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card className="border-none shadow-lg shadow-slate-200/50 rounded-3xl overflow-hidden bg-white group hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-0">
                          <div className="flex items-stretch min-h-[160px]">
                            {/* Drag Handle Area */}
                            <div className="w-12 bg-slate-50 flex flex-col items-center py-6 border-r border-slate-100 cursor-grab active:cursor-grabbing hover:bg-indigo-50/50 group/drag transition-colors">
                              <GripVertical className="h-5 w-5 text-slate-300 group-hover/drag:text-indigo-400" />
                              <div className="mt-auto items-center flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={index === 0}
                                  onClick={() => moveField(index, 'up')}
                                  className="h-6 w-6 rounded-md hover:bg-indigo-100 text-slate-400 disabled:opacity-20"
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={index === fields.length - 1}
                                  onClick={() => moveField(index, 'down')}
                                  className="h-6 w-6 rounded-md hover:bg-indigo-100 text-slate-400 disabled:opacity-20"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Main Editor Area */}
                            <div className="flex-1 p-6 md:p-8 space-y-6">
                              <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Question Label</Label>
                                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase">Question {index + 1}</span>
                                  </div>
                                  <Input
                                    value={field.label}
                                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                                    placeholder="Enter your question here..."
                                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all rounded-xl font-bold text-slate-900 border-none shadow-inner"
                                  />
                                </div>
                                <div className="md:w-48 space-y-2">
                                  <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Input Type</Label>
                                  <Select
                                    value={field.type}
                                    onValueChange={(value: FieldType) => updateField(field.id, { type: value })}
                                  >
                                    <SelectTrigger className="h-12 bg-slate-50 border-none shadow-inner rounded-xl font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500/10">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-200 shadow-2xl p-2">
                                      <SelectItem value="text" className="rounded-xl py-2.5 font-bold"><div className="flex items-center gap-2"><Type className="w-4 h-4" /> Text</div></SelectItem>
                                      <SelectItem value="email" className="rounded-xl py-2.5 font-bold"><div className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email</div></SelectItem>
                                      <SelectItem value="phone" className="rounded-xl py-2.5 font-bold"><div className="flex items-center gap-2"><Phone className="w-4 h-4" /> Phone</div></SelectItem>
                                      <SelectItem value="number" className="rounded-xl py-2.5 font-bold"><div className="flex items-center gap-2"><Hash className="w-4 h-4" /> Number</div></SelectItem>
                                      <SelectItem value="textarea" className="rounded-xl py-2.5 font-bold"><div className="flex items-center gap-2"><AlignLeft className="w-4 h-4" /> Comment</div></SelectItem>
                                      <SelectItem value="select" className="rounded-xl py-2.5 font-bold"><div className="flex items-center gap-2"><Layout className="w-4 h-4" /> Dropdown</div></SelectItem>
                                      <SelectItem value="checkbox" className="rounded-xl py-2.5 font-bold"><div className="flex items-center gap-2"><Check className="w-4 h-4" /> Toggle</div></SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-6 items-end">
                                <div className="space-y-2">
                                  <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Hint / Placeholder (Optional)</Label>
                                  <Input
                                    value={field.placeholder || ''}
                                    onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                    placeholder="Placeholder text..."
                                    className="h-10 bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-slate-500/10 transition-all rounded-xl text-xs font-medium"
                                  />
                                </div>

                                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100 shadow-sm">
                                  <div className="flex items-center gap-3">
                                    <Switch
                                      id={`required-${field.id}`}
                                      checked={field.required}
                                      onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                                      className="data-[state=checked]:bg-indigo-600"
                                    />
                                    <Label htmlFor={`required-${field.id}`} className="text-xs font-black uppercase text-slate-500 cursor-pointer">Required</Label>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeField(field.id)}
                                    className="h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold group/del"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-1.5 group-hover/del:scale-110 transition-transform" />
                                    Delete
                                  </Button>
                                </div>
                              </div>

                              {field.type === 'select' && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="space-y-2 pt-2"
                                >
                                  <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                    Dropdown Options
                                    <Badge className="bg-amber-50 text-amber-600 border-amber-100 text-[9px] hover:bg-amber-100">Comma Separated</Badge>
                                  </Label>
                                  <Input
                                    value={field.options?.join(', ') || ''}
                                    onChange={(e) => updateField(field.id, { 
                                      options: e.target.value.split(',').map(o => o.trim()).filter(o => o) 
                                    })}
                                    placeholder="Apple, Banana, Orange..."
                                    className="h-11 bg-white border-slate-200 focus:ring-2 focus:ring-amber-500/20 rounded-xl font-medium"
                                  />
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Reorder.Item>
                  ))
                )}
              </AnimatePresence>
            </Reorder.Group>
            
            {fields.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-4 flex justify-center"
              >
                <Button 
                  onClick={addField}
                  variant="ghost"
                  className="h-12 px-8 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all font-bold group"
                >
                  <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                  Add Another Question
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Floating Save Reminder for Mobile (Optional) */}
        <div className="h-20" /> {/* Spacer */}
      </div>
    </div>
  );
}
