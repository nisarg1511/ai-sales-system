import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  OnboardingStep,
  BusinessInfo,
  KnowledgeSource,
  ExtractedBusinessData,
  DynamicFormSection,
  AgentConfiguration,
} from "@/types";

interface OnboardingStore {
  sessionId: string | null;
  currentStep: OnboardingStep;
  businessInfo: Partial<BusinessInfo>;
  knowledgeSources: KnowledgeSource[];
  extractedData: Partial<ExtractedBusinessData> | null;
  dynamicFormSections: DynamicFormSection[];
  dynamicAnswers: Record<string, string | string[]>;
  agentConfig: Partial<AgentConfiguration> | null;
  isProcessing: boolean;
  processingStatus: string;
  processingProgress: number;
  organizationId: string | null;

  // Actions
  setSessionId: (id: string) => void;
  setOrganizationId: (id: string) => void;
  setCurrentStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  setBusinessInfo: (info: Partial<BusinessInfo>) => void;
  addKnowledgeSource: (source: KnowledgeSource) => void;
  updateKnowledgeSource: (id: string, updates: Partial<KnowledgeSource>) => void;
  removeKnowledgeSource: (id: string) => void;
  setExtractedData: (data: Partial<ExtractedBusinessData>) => void;
  updateExtractedData: (updates: Partial<ExtractedBusinessData>) => void;
  setDynamicFormSections: (sections: DynamicFormSection[]) => void;
  setDynamicAnswer: (fieldId: string, value: string | string[]) => void;
  setAgentConfig: (config: Partial<AgentConfiguration>) => void;
  updateAgentConfig: (updates: Partial<AgentConfiguration>) => void;
  setIsProcessing: (value: boolean) => void;
  setProcessingStatus: (status: string) => void;
  setProcessingProgress: (progress: number) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  currentStep: 1 as OnboardingStep,
  businessInfo: {},
  knowledgeSources: [],
  extractedData: null,
  dynamicFormSections: [],
  dynamicAnswers: {},
  agentConfig: null,
  isProcessing: false,
  processingStatus: "",
  processingProgress: 0,
  organizationId: null,
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSessionId: (id) => set({ sessionId: id }),
      setOrganizationId: (id) => set({ organizationId: id }),

      setCurrentStep: (step) => set({ currentStep: step }),

      nextStep: () => {
        const current = get().currentStep;
        if (current < 6) set({ currentStep: (current + 1) as OnboardingStep });
      },

      prevStep: () => {
        const current = get().currentStep;
        if (current > 1) set({ currentStep: (current - 1) as OnboardingStep });
      },

      setBusinessInfo: (info) =>
        set((state) => ({ businessInfo: { ...state.businessInfo, ...info } })),

      addKnowledgeSource: (source) =>
        set((state) => ({ knowledgeSources: [...state.knowledgeSources, source] })),

      updateKnowledgeSource: (id, updates) =>
        set((state) => ({
          knowledgeSources: state.knowledgeSources.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      removeKnowledgeSource: (id) =>
        set((state) => ({
          knowledgeSources: state.knowledgeSources.filter((s) => s.id !== id),
        })),

      setExtractedData: (data) => set({ extractedData: data }),

      updateExtractedData: (updates) =>
        set((state) => ({
          extractedData: state.extractedData ? { ...state.extractedData, ...updates } : updates,
        })),

      setDynamicFormSections: (sections) => set({ dynamicFormSections: sections }),

      setDynamicAnswer: (fieldId, value) =>
        set((state) => ({
          dynamicAnswers: { ...state.dynamicAnswers, [fieldId]: value },
        })),

      setAgentConfig: (config) => set({ agentConfig: config }),

      updateAgentConfig: (updates) =>
        set((state) => ({
          agentConfig: state.agentConfig ? { ...state.agentConfig, ...updates } : updates,
        })),

      setIsProcessing: (value) => set({ isProcessing: value }),
      setProcessingStatus: (status) => set({ processingStatus: status }),
      setProcessingProgress: (progress) => set({ processingProgress: progress }),

      reset: () => set(initialState),
    }),
    {
      name: "ai-sales-onboarding",
      partialize: (state) => ({
        sessionId: state.sessionId,
        organizationId: state.organizationId,
        currentStep: state.currentStep,
        businessInfo: state.businessInfo,
        knowledgeSources: state.knowledgeSources,
        extractedData: state.extractedData,
        dynamicFormSections: state.dynamicFormSections,
        dynamicAnswers: state.dynamicAnswers,
        agentConfig: state.agentConfig,
      }),
    }
  )
);
