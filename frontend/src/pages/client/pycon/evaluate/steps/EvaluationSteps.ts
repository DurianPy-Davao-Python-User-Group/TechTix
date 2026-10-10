import { Step } from '@/components/Stepper';

export type EvaluateStepId = 'EventDetails' | 'Evaluation_1' | 'Evaluation_2' | 'ClaimCertificate';

export interface EvaluateStep extends Step {
  id: EvaluateStepId;
  category?: string;
  description?: string;
}

export const STEP_EVENT_DETAILS: EvaluateStep = {
  id: 'EventDetails'
};

export const STEP_EVALUATION_1: EvaluateStep = {
  id: 'Evaluation_1',
  title: 'Evaluation',
  category: 'EVALUATION',
  description: 'Help us improve by sharing your feedback on sessions and presentations. Fields marked * are required.'
};

export const STEP_EVALUATION_2: EvaluateStep = {
  id: 'Evaluation_2',
  title: 'Feedback',
  category: 'EVALUATION',
  description: 'Share your thoughts on event organization, logistics, and future PyCons. Fields marked * are required.'
};

export const STEP_CLAIM_CERTIFICATE: EvaluateStep = {
  id: 'ClaimCertificate',
  title: 'Certificate'
};

export const EvaluateSteps: EvaluateStep[] = [STEP_EVENT_DETAILS, STEP_EVALUATION_1, STEP_EVALUATION_2, STEP_CLAIM_CERTIFICATE];

