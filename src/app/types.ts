export type FieldType = 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'checkbox';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // for select fields
  placeholder?: string;
}

export interface Form {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  createdAt: string;
  createdBy: string;
}

export interface Submission {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: string;
}
