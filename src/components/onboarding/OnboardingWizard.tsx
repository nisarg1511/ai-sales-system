"use client";

import { useEffect } from "react";
import { Stepper } from "./Stepper";
import { Step1BusinessInfo } from "./Step1BusinessInfo";
import { Step2KnowledgeSources } from "./Step2KnowledgeSources";
import { Step3AIAnalysis } from "./Step3AIAnalysis";
import { Step4DynamicQuestions } from "./Step4DynamicQuestions";
import { Step5AgentConfig } from "./Step5AgentConfig";
import { Step6ReviewDeploy } from "./Step6ReviewDeploy";
import { useOnboardingStore } from "@/store/onboarding";
import { Progress } from "@/components/ui/progress";

export function OnboardingWizard() {
  const { currentStep, setSessionId, sessionId } = useOnboardingStore();

  useEffect(() => {
    if (!sessionId) {
      const id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      setSessionId(id);
    }
  }, [sessionId, setSessionId]);

  const progressPercent = ((currentStep - 1) / 5) * 100;

  const renderStep = () => {
    const props = {
      onNext: () => {},
      onBack: () => {},
      onDeploy: () => {},
    };

    switch (currentStep) {
      case 1:
        return <Step1BusinessInfo onNext={props.onNext} />;
      case 2:
        return <Step2KnowledgeSources onNext={props.onNext} onBack={props.onBack} />;
      case 3:
        return <Step3AIAnalysis onNext={props.onNext} onBack={props.onBack} />;
      case 4:
        return <Step4DynamicQuestions onNext={props.onNext} onBack={props.onBack} />;
      case 5:
        return <Step5AgentConfig onNext={props.onNext} onBack={props.onBack} />;
      case 6:
        return <Step6ReviewDeploy onBack={props.onBack} onDeploy={props.onDeploy} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-zinc-100">
        <Progress value={progressPercent} className="rounded-none h-0.5" />
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <span className="text-sm font-semibold text-zinc-900">AI Sales System</span>
            </div>
            <span className="text-xs text-zinc-400">
              Step {currentStep} of 6
            </span>
          </div>
          <Stepper currentStep={currentStep} />
        </div>
      </div>

      {/* Content */}
      <div className="pt-48 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <div
            key={currentStep}
            className="animate-in fade-in-0 slide-in-from-right-4 duration-300"
          >
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
}
