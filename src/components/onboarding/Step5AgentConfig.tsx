"use client";

import { useEffect, useState } from "react";
import { Bot, Sparkles, Edit3, ChevronDown, ChevronUp, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useOnboardingStore } from "@/store/onboarding";
import { AgentConfiguration } from "@/types";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card>
      <CardHeader
        className="py-4 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{title}</CardTitle>
          {open ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </div>
      </CardHeader>
      {open && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}

export function Step5AgentConfig({ onNext, onBack }: Props) {
  const {
    extractedData,
    dynamicAnswers,
    agentConfig,
    setAgentConfig,
    updateAgentConfig,
    setIsProcessing,
    isProcessing,
    setProcessingStatus,
    processingStatus,
    setProcessingProgress,
    processingProgress,
    nextStep,
    prevStep,
  } = useOnboardingStore();

  const [showJson, setShowJson] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(!!agentConfig?.name);

  useEffect(() => {
    if (!hasGenerated) {
      generateConfig();
    }
  }, []);

  const generateConfig = async () => {
    setIsProcessing(true);
    setProcessingStatus("Generating AI sales agent configuration...");
    setProcessingProgress(20);

    try {
      setProcessingProgress(50);

      const res = await fetch("/api/agent/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extractedData,
          dynamicAnswers,
        }),
      });

      setProcessingProgress(80);

      if (!res.ok) throw new Error("Generation failed");

      const data = await res.json();
      setAgentConfig(data.config);
      setProcessingProgress(100);
      setProcessingStatus("Configuration ready!");
      setHasGenerated(true);
    } catch (err) {
      console.error(err);
      // Use a default config
      setAgentConfig({
        name: "AI Sales Agent",
        personality: {
          name: "Alex",
          tone: "professional",
          approach: "Consultative approach focused on understanding customer needs",
        },
        salesGoals: [
          "Qualify leads within 2 hours",
          "Schedule discovery calls",
          "Convert 30% of qualified leads",
        ],
        qualificationRules: [
          { criterion: "Has budget authority", weight: 25, required: true },
          { criterion: "Has relevant need", weight: 30, required: true },
          { criterion: "Has purchase timeline", weight: 20, required: false },
          { criterion: "Fits ideal customer profile", weight: 25, required: false },
        ],
        offerStrategy: {
          primaryOffer: extractedData?.products?.[0]?.name ?? "Primary service",
          entryOffer: "Free demo or consultation",
        },
        upsellLogic: [],
        followUpCadence: {
          initialResponse: "Within 1 hour",
          followUpIntervals: ["Day 1", "Day 3", "Day 7", "Day 14"],
          maxFollowUps: 4,
          channel: ["email"],
        },
        salesScripts: {
          opener: "Hi! I noticed you expressed interest in our solution. I'd love to learn more about your needs.",
          qualificationScript: "What's driving you to look for a solution now? What does success look like for you?",
          pitchScript: "Based on what you've shared, here's how we can help...",
          objectionHandling: {
            price: "Let me show you the ROI our customers typically see...",
            timing: "What would need to be true to move forward sooner?",
            competition: "The key difference between us is...",
          },
          closingScript: "Would you like to schedule a next step call to discuss implementation?",
        },
        leadQualificationRubric: {
          criteria: [
            { name: "Budget", maxScore: 25, description: "Has appropriate budget" },
            { name: "Authority", maxScore: 25, description: "Can make buying decision" },
            { name: "Need", maxScore: 25, description: "Has the problem we solve" },
            { name: "Timeline", maxScore: 25, description: "Buying within 3 months" },
          ],
          minimumScore: 60,
          scoringSystem: "BANT",
        },
      });
      setHasGenerated(true);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center">
          <Bot className="w-8 h-8 text-white animate-pulse" />
        </div>
        <div className="space-y-2 text-center">
          <h3 className="text-lg font-semibold text-zinc-900">Building your AI agent</h3>
          <p className="text-sm text-zinc-500">{processingStatus}</p>
        </div>
        <div className="w-64">
          <Progress value={processingProgress} />
        </div>
      </div>
    );
  }

  const config = agentConfig as Partial<AgentConfiguration> | null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-zinc-900">Agent Configuration</h2>
          <p className="text-zinc-500">Review and customize your AI sales agent setup.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowJson(!showJson)}
          >
            <Code className="w-3.5 h-3.5 mr-1.5" />
            {showJson ? "Visual" : "JSON"}
          </Button>
          <Button variant="outline" size="sm" onClick={generateConfig}>
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Regenerate
          </Button>
        </div>
      </div>

      {showJson ? (
        <div className="rounded-xl bg-zinc-950 p-4 overflow-auto max-h-[500px]">
          <pre className="text-xs text-green-400 font-mono">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Agent Identity */}
          <Section title="Agent Identity" defaultOpen>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {config?.personality?.name?.[0] ?? "A"}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Agent name</Label>
                      <Input
                        value={config?.personality?.name ?? ""}
                        onChange={(e) =>
                          updateAgentConfig({
                            personality: {
                              ...(config?.personality ?? {}),
                              name: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tone</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {["professional", "friendly", "consultative", "direct"].map((tone) => (
                          <button
                            key={tone}
                            onClick={() =>
                              updateAgentConfig({
                                personality: {
                                  ...(config?.personality ?? {}),
                                  tone,
                                },
                              })
                            }
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all capitalize ${
                              config?.personality?.tone === tone
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-zinc-200 text-zinc-600"
                            }`}
                          >
                            {tone}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Approach</Label>
                    <Textarea
                      value={config?.personality?.approach ?? ""}
                      rows={2}
                      onChange={(e) =>
                        updateAgentConfig({
                          personality: {
                            ...(config?.personality ?? {}),
                            approach: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Sales Goals */}
          <Section title="Sales Goals">
            <div className="space-y-2">
              {config?.salesGoals?.map((goal, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-blue-600 text-sm mt-0.5 shrink-0">
                    {i + 1}.
                  </span>
                  <Input
                    value={goal}
                    onChange={(e) => {
                      const newGoals = [...(config.salesGoals ?? [])];
                      newGoals[i] = e.target.value;
                      updateAgentConfig({ salesGoals: newGoals });
                    }}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          </Section>

          {/* Qualification Rules */}
          <Section title="Lead Qualification Rules">
            <div className="space-y-2">
              {config?.qualificationRules?.map((rule, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-800">{rule.criterion}</p>
                    <p className="text-xs text-zinc-400">Weight: {rule.weight}%</p>
                  </div>
                  {rule.required && <Badge variant="destructive">Required</Badge>}
                </div>
              ))}
            </div>
          </Section>

          {/* Scripts */}
          <Section title="Sales Scripts">
            <div className="space-y-4">
              {[
                { key: "opener", label: "Opening message" },
                { key: "pitchScript", label: "Pitch script" },
                { key: "closingScript", label: "Closing script" },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Textarea
                    value={(config?.salesScripts as unknown as Record<string, string>)?.[key] ?? ""}
                    rows={3}
                    onChange={(e) =>
                      updateAgentConfig({
                        salesScripts: {
                          ...(config?.salesScripts ?? {}),
                          [key]: e.target.value,
                        },
                      })
                    }
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          </Section>

          {/* Follow-up Cadence */}
          <Section title="Follow-up Cadence">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Initial response time</Label>
                <Input
                  value={config?.followUpCadence?.initialResponse ?? ""}
                  onChange={(e) =>
                    updateAgentConfig({
                      followUpCadence: {
                        ...(config?.followUpCadence ?? {}),
                        initialResponse: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label>Follow-up schedule</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {config?.followUpCadence?.followUpIntervals?.map((interval, i) => (
                    <Badge key={i} variant="outline">
                      {interval}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Lead Rubric */}
          <Section title="Lead Scoring Rubric">
            <div className="space-y-2">
              {config?.leadQualificationRubric?.criteria?.map((criterion, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50">
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{criterion.name}</p>
                    <p className="text-xs text-zinc-400">{criterion.description}</p>
                  </div>
                  <Badge variant="default">{criterion.maxScore} pts</Badge>
                </div>
              ))}
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                <p className="text-xs text-zinc-500">Minimum qualifying score</p>
                <Badge variant="primary">
                  {config?.leadQualificationRubric?.minimumScore ?? 60} / 100
                </Badge>
              </div>
            </div>
          </Section>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => { prevStep(); onBack(); }}>
          Back
        </Button>
        <Button variant="primary" size="lg" onClick={() => { nextStep(); onNext(); }}>
          Review & Deploy
        </Button>
      </div>
    </div>
  );
}
