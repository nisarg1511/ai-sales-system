"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOnboardingStore } from "@/store/onboarding";
import { DynamicFormField } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

function DynamicField({
  field,
  value,
  onChange,
}: {
  field: DynamicFormField;
  value: string | string[];
  onChange: (val: string | string[]) => void;
}) {
  const stringValue = Array.isArray(value) ? value.join(", ") : (value ?? "");

  switch (field.type) {
    case "textarea":
      return (
        <Textarea
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
        />
      );

    case "select":
      return (
        <Select value={stringValue} onValueChange={(val) => onChange(val)}>
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder ?? `Select ${field.label}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "radio":
      return (
        <div className="grid grid-cols-2 gap-2">
          {field.options?.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(
                "px-3 py-2 rounded-lg border text-sm text-left transition-all",
                stringValue === opt
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      );

    case "multiselect":
      const selectedValues = Array.isArray(value) ? value : [];
      return (
        <div className="flex flex-wrap gap-2">
          {field.options?.map((opt) => {
            const selected = selectedValues.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  if (selected) {
                    onChange(selectedValues.filter((v) => v !== opt));
                  } else {
                    onChange([...selectedValues, opt]);
                  }
                }}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-sm transition-all",
                  selected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );

    default:
      return (
        <Input
          type={field.type === "number" ? "number" : "text"}
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      );
  }
}

export function Step4DynamicQuestions({ onNext, onBack }: Props) {
  const {
    dynamicFormSections,
    dynamicAnswers,
    setDynamicAnswer,
    nextStep,
    prevStep,
    extractedData,
  } = useOnboardingStore();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    for (const section of dynamicFormSections) {
      for (const field of section.fields) {
        if (field.required && !dynamicAnswers[field.id]) {
          newErrors[field.id] = "This field is required";
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      nextStep();
      onNext();
    }
  };

  // If no dynamic sections available, show a simple default form
  const sections =
    dynamicFormSections.length > 0
      ? dynamicFormSections
      : [
          {
            id: "sales_process",
            section: "Sales Process",
            description: "Help us understand your sales process better",
            fields: [
              {
                id: "deal_size",
                type: "select" as const,
                label: "Typical deal size",
                options: ["< $500", "$500–$5k", "$5k–$20k", "$20k–$100k", "$100k+"],
                required: true,
              },
              {
                id: "sales_cycle",
                type: "select" as const,
                label: "Average sales cycle",
                options: ["Same day", "1–7 days", "1–4 weeks", "1–3 months", "3+ months"],
                required: true,
              },
              {
                id: "main_objection",
                type: "textarea" as const,
                label: "What's the #1 objection your sales team faces?",
                placeholder: "e.g. Price is too high, already have a solution...",
                required: false,
              },
            ],
          },
          {
            id: "qualification",
            section: "Lead Qualification",
            description: "Define what makes an ideal customer",
            fields: [
              {
                id: "ideal_customer",
                type: "textarea" as const,
                label: "Describe your ideal customer in 1-2 sentences",
                placeholder: "e.g. VP of Sales at B2B SaaS with 50-500 employees...",
                required: true,
              },
              {
                id: "disqualifiers",
                type: "textarea" as const,
                label: "What automatically disqualifies a lead?",
                placeholder: "e.g. Budget under $500/mo, not a decision-maker...",
                required: false,
              },
            ],
          },
        ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-zinc-900">A few more questions</h2>
        <p className="text-zinc-500">
          AI-generated questions tailored to your{" "}
          <span className="font-medium text-zinc-700">
            {extractedData?.businessModel ?? "business"}
          </span>
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-500" />
                {section.section}
              </CardTitle>
              {section.description && (
                <p className="text-xs text-zinc-400">{section.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <Label>
                    {field.label}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                  </Label>
                  <DynamicField
                    field={field}
                    value={dynamicAnswers[field.id] ?? ""}
                    onChange={(val) => setDynamicAnswer(field.id, val)}
                  />
                  {field.helpText && (
                    <p className="text-xs text-zinc-400">{field.helpText}</p>
                  )}
                  {errors[field.id] && (
                    <p className="text-xs text-red-500">{errors[field.id]}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => { prevStep(); onBack(); }}>
          Back
        </Button>
        <Button variant="primary" size="lg" onClick={handleNext}>
          Generate Agent Configuration
        </Button>
      </div>
    </div>
  );
}
