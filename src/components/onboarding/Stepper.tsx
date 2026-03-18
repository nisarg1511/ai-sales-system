"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { OnboardingStep } from "@/types";

const STEPS = [
  { number: 1, label: "Business Info" },
  { number: 2, label: "Knowledge" },
  { number: 3, label: "AI Analysis" },
  { number: 4, label: "Questions" },
  { number: 5, label: "Agent Setup" },
  { number: 6, label: "Deploy" },
];

interface StepperProps {
  currentStep: OnboardingStep;
}

export function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex items-center gap-0">
        {STEPS.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;
          const isUpcoming = step.number > currentStep;

          return (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                    isCompleted && "bg-blue-600 text-white",
                    isActive && "bg-zinc-900 text-white ring-4 ring-zinc-100",
                    isUpcoming && "bg-zinc-100 text-zinc-400"
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    isActive && "text-zinc-900",
                    isCompleted && "text-blue-600",
                    isUpcoming && "text-zinc-400"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-px w-12 mx-2 mb-4 transition-all",
                    index + 1 < currentStep ? "bg-blue-600" : "bg-zinc-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
