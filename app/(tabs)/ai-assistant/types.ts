import { ScoredGuide } from '@/data/guideContent';

export type Message = {
  id: string;
  role: 'user' | 'ai';
  text?: string;
  guides?: ScoredGuide[];
  photoUri?: string;
};

export type ExtractedEntity = {
  category: string | null;
  object: string | null;
  symptom: string | null;
  severity: 'low' | 'medium' | 'high' | null;
  urgency: 'low' | 'medium' | 'high' | null;
};

export type Intent =
  | 'greeting' | 'thanks' | 'goodbye' | 'capabilities' | 'identity' | 'joke' | 'offtopic'
  | 'profanity'
  | 'symptom_describe' | 'diagnosis' | 'step_by_step' | 'quick_fix' | 'tools_needed'
  | 'difficulty' | 'time_estimate' | 'cost_estimate' | 'safety_check' | 'replace_vs_fix'
  | 'compare_solutions' | 'follow_up' | 'clarification' | 'rephrase' | 'repeat' | 'expand'
  | 'summarize' | 'find_parts' | 'brand_specific' | 'model_specific' | 'location_help'
  | 'emergency' | 'preventive' | 'multi_issue' | 'confidence_check' | 'alternative_solution'
  | 'developer' | 'expert';
