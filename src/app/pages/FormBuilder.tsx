import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Plus, Trash2, GripVertical, ArrowLeft, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { storage } from '../utils/storage';
import { Form, FormField, FieldType } from '../types';
import { toast } from 'sonner';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{formId ? 'Edit Form' : 'Create New Form'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="formName">Form Name *</Label>
              <Input
                id="formName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., New Client Intake Form"
              />
            </div>
            <div>
              <Label htmlFor="formDescription">Description (Optional)</Label>
              <Textarea
                id="formDescription"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Brief description of this form"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl">Form Fields</h2>
          <Button onClick={addField}>
            <Plus className="mr-2 h-4 w-4" />
            Add Field
          </Button>
        </div>

        {fields.length === 0 ? (
          <Card className="text-center p-12">
            <p className="text-gray-500 mb-4">No fields added yet</p>
            <Button onClick={addField}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Field
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="pt-6">
                  <div className="grid gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col gap-1 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveField(index, 'up')}
                          disabled={index === 0}
                          className="h-6 w-6 p-0"
                        >
                          <GripVertical className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveField(index, 'down')}
                          disabled={index === fields.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          <GripVertical className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex-1 grid gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Field Label *</Label>
                            <Input
                              value={field.label}
                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                              placeholder="e.g., Full Name"
                            />
                          </div>
                          <div>
                            <Label>Field Type</Label>
                            <Select
                              value={field.type}
                              onValueChange={(value: FieldType) => updateField(field.id, { type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Phone</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="textarea">Text Area</SelectItem>
                                <SelectItem value="select">Dropdown</SelectItem>
                                <SelectItem value="checkbox">Checkbox</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label>Placeholder (Optional)</Label>
                          <Input
                            value={field.placeholder || ''}
                            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                            placeholder="e.g., Enter your full name"
                          />
                        </div>

                        {field.type === 'select' && (
                          <div>
                            <Label>Options (comma-separated)</Label>
                            <Input
                              value={field.options?.join(', ') || ''}
                              onChange={(e) => updateField(field.id, { 
                                options: e.target.value.split(',').map(o => o.trim()).filter(o => o) 
                              })}
                              placeholder="e.g., Option 1, Option 2, Option 3"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`required-${field.id}`}
                              checked={field.required}
                              onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                            />
                            <Label htmlFor={`required-${field.id}`}>Required field</Label>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeField(field.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <Button onClick={() => navigate('/')} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <Save className="mr-2 h-4 w-4" />
            {formId ? 'Update Form' : 'Save Form'}
          </Button>
        </div>
      </div>
    </div>
  );
}
