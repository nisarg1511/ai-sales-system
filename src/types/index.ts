export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface BusinessInfo {
  companyName: string;
  website: string;
  industry: string;
  companySize: string;
  salesChannel: "B2B" | "B2C" | "Hybrid" | "";
}

export interface KnowledgeSource {
  id: string;
  type: "url" | "pdf" | "gdrive" | "notion" | "text";
  value: string;
  fileName?: string;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
}

export interface ExtractedBusinessData {
  businessDescription: string;
  businessModel: string;
  confidenceScore: number;
  products: Product[];
  services: Service[];
  targetCustomers: TargetCustomer[];
  idealCustomerProfile: ICP;
  valuePropositions: string[];
  pricingStructure: PricingStructure;
  salesProcess: SalesProcess;
  typicalDealSize: string;
  salesCycle: string;
  objections: Objection[];
  faqs: FAQ[];
  brandTone: string;
  keyMessages: string[];
}

export interface Product {
  name: string;
  description: string;
  price?: string;
  features?: string[];
}

export interface Service {
  name: string;
  description: string;
  deliverables?: string[];
}

export interface TargetCustomer {
  segment: string;
  description: string;
  painPoints?: string[];
}

export interface ICP {
  industry?: string;
  companySize?: string;
  role?: string;
  budget?: string;
  needs?: string[];
}

export interface PricingStructure {
  model?: string; // subscription, one-time, usage-based, etc.
  tiers?: PricingTier[];
  customPricing?: boolean;
  trialAvailable?: boolean;
}

export interface PricingTier {
  name: string;
  price: string;
  features: string[];
}

export interface SalesProcess {
  stages?: string[];
  averageCycle?: string;
  decisionMakers?: string[];
}

export interface Objection {
  objection: string;
  response: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface DynamicFormField {
  id: string;
  type: "text" | "textarea" | "select" | "multiselect" | "radio" | "checkbox" | "number";
  label: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  helpText?: string;
}

export interface DynamicFormSection {
  id: string;
  section: string;
  description?: string;
  fields: DynamicFormField[];
}

export interface AgentPersonality {
  name?: string;
  tone?: string; // professional, friendly, consultative, direct
  approach?: string;
  avatar?: string;
}

export interface AgentConfiguration {
  id?: string;
  name: string;
  personality: AgentPersonality;
  salesGoals: string[];
  qualificationRules: QualificationRule[];
  offerStrategy: OfferStrategy;
  upsellLogic: UpsellRule[];
  followUpCadence: FollowUpCadence;
  salesScripts: SalesScripts;
  leadQualificationRubric: LeadRubric;
}

export interface QualificationRule {
  criterion: string;
  weight: number;
  required: boolean;
}

export interface OfferStrategy {
  primaryOffer: string;
  entryOffer?: string;
  conditions?: string[];
}

export interface UpsellRule {
  trigger: string;
  offer: string;
  timing: string;
}

export interface FollowUpCadence {
  initialResponse?: string;
  followUpIntervals?: string[];
  maxFollowUps?: number;
  channel?: string[];
}

export interface SalesScripts {
  opener?: string;
  qualificationScript?: string;
  pitchScript?: string;
  objectionHandling?: Record<string, string>;
  closingScript?: string;
}

export interface LeadRubric {
  criteria: RubricCriterion[];
  minimumScore: number;
  scoringSystem: string;
}

export interface RubricCriterion {
  name: string;
  maxScore: number;
  description: string;
}

export interface OnboardingState {
  sessionId: string;
  currentStep: OnboardingStep;
  businessInfo: Partial<BusinessInfo>;
  knowledgeSources: KnowledgeSource[];
  extractedData: Partial<ExtractedBusinessData> | null;
  dynamicFormSections: DynamicFormSection[];
  dynamicAnswers: Record<string, string | string[]>;
  agentConfig: Partial<AgentConfiguration> | null;
  isProcessing: boolean;
  processingStatus: string;
}
