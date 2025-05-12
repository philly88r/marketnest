export type QuestionType = 
  | 'text' 
  | 'email' 
  | 'phone'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'range'
  | 'date'
  | 'file'
  | 'color';

export type QuestionOption = {
  value: string;
  label: string;
};

export type Question = {
  id: string;
  type: QuestionType;
  question: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  step?: number;
  validation?: RegExp;
  errorMessage?: string;
};

export type QuestionGroup = {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
};

export type QuestionnaireData = {
  [key: string]: any;
};

export const initialQuestionnaireData: QuestionnaireData = {};
