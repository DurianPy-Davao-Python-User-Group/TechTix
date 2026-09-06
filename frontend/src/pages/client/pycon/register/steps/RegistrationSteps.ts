import { Step } from '@/components/Stepper';

export type RegisterStepId = 'EventDetails' | 'BasicInfo' | 'TicketSelection' | 'Miscellaneous' | 'Summary' | 'Payment&Verification' | 'Success';

export interface RegisterStep extends Step {
  id: RegisterStepId;
  category?: string;
  description?: string;
}

export const STEP_EVENT_DETAILS: RegisterStep = {
  id: 'EventDetails'
};

export const STEP_BASIC_INFO: RegisterStep = {
  id: 'BasicInfo',
  title: 'Basic Information',
  category: 'REGISTRATION',
  description: 'Tell us a bit about yourself. Fields marked * are required.'
};

export const STEP_TICKET_SELECTION: RegisterStep = {
  id: 'TicketSelection',
  title: 'Ticket Selection',
  category: 'REGISTRATION',
  description: 'Choose the ticket tier that fits you best.'
};

export const STEP_MISCELLANEOUS: RegisterStep = {
  id: 'Miscellaneous',
  title: 'Miscellaneous',
  category: 'REGISTRATION',
  description: 'A few more things to help us make the event better for you.'
};

export const STEP_PAYMENT: RegisterStep = {
  id: 'Payment&Verification',
  title: 'Promotions & Verification',
  category: 'REGISTRATION',
  description: 'Apply a discount code and verify your identity.'
};

export const STEP_SUMMARY: RegisterStep = {
  id: 'Summary',
  title: 'Confirm Details',
  category: 'REGISTRATION',
  description: 'Review your information before submitting.'
};

export const STEP_SUCCESS: RegisterStep = {
  id: 'Success',
  title: 'Registration Successful!'
};

export const RegisterSteps: RegisterStep[] = [
  STEP_EVENT_DETAILS,
  STEP_BASIC_INFO,
  STEP_TICKET_SELECTION,
  STEP_MISCELLANEOUS,
  STEP_SUMMARY,
  STEP_SUCCESS
] as const;
export const RegisterStepsWithPayment: RegisterStep[] = [
  STEP_EVENT_DETAILS,
  STEP_BASIC_INFO,
  STEP_TICKET_SELECTION,
  STEP_MISCELLANEOUS,
  STEP_PAYMENT,
  STEP_SUMMARY,
  STEP_SUCCESS
] as const;

export const CURRENT_STEP = STEP_TICKET_SELECTION;
