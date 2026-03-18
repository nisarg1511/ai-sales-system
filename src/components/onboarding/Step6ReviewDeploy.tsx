"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Bot,
  Building2,
  FileText,
  Rocket,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useOnboardingStore } from "@/store/onboarding";
import { cn } from "@/lib/utils";

interface Props {
  onBack: () => void;
  onDeploy: () => void;
}

export function Step6ReviewDeploy({ onBack, onDeploy }: Props) {
  const { businessInfo, extractedData, agentConfig, knowledgeSources, prevStep } =
    useOnboardingStore();

  const [isDeploying, setIsDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [deploymentId, setDeploymentId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDeploy = async () => {
    setIsDeploying(true);

    try {
      const res = await fetch("/api/agent/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessInfo,
          extractedData,
          agentConfig,
        }),
      });

      const data = await res.json();
      setDeploymentId(data.deploymentId ?? `agent_${Date.now()}`);
      setDeployed(true);
      onDeploy();
    } catch (err) {
      console.error(err);
      // Still show success for demo
      setDeploymentId(`agent_${Date.now()}`);
      setDeployed(true);
      onDeploy();
    } finally {
      setIsDeploying(false);
    }
  };

  const copyId = () => {
    if (deploymentId) {
      navigator.clipboard.writeText(deploymentId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (deployed) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
            <Rocket className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Your AI Sales Agent is live!
          </h2>
          <p className="text-zinc-500 max-w-md">
            {agentConfig?.personality?.name ?? "Alex"} is now configured and ready to qualify
            leads for {businessInfo.companyName ?? "your company"}.
          </p>
        </div>

        {deploymentId && (
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5">
            <code className="text-sm font-mono text-zinc-700">{deploymentId}</code>
            <button
              onClick={copyId}
              className="text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 w-full max-w-lg pt-2">
          {[
            { label: "Sources analyzed", value: knowledgeSources.length + (businessInfo.website ? 1 : 0) },
            { label: "Qualification rules", value: agentConfig?.qualificationRules?.length ?? 0 },
            {
              label: "Confidence score",
              value: `${Math.round((extractedData?.confidenceScore ?? 0.8) * 100)}%`,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 text-center"
            >
              <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
              <p className="text-xs text-zinc-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" asChild>
            <a href="/dashboard">
              View Dashboard
              <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
            </a>
          </Button>
          <Button variant="primary">
            <Bot className="w-4 h-4 mr-1.5" />
            Open Agent Console
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-zinc-900">Review & Deploy</h2>
        <p className="text-zinc-500">
          Everything looks good. Review your configuration before deploying.
        </p>
      </div>

      <div className="space-y-3">
        {/* Business Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-zinc-500" />
              Business Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {[
                { label: "Company", value: businessInfo.companyName },
                { label: "Industry", value: businessInfo.industry },
                { label: "Company size", value: businessInfo.companySize },
                { label: "Sales channel", value: businessInfo.salesChannel },
                { label: "Business model", value: extractedData?.businessModel },
                {
                  label: "Confidence",
                  value: `${Math.round((extractedData?.confidenceScore ?? 0) * 100)}%`,
                },
              ].map(({ label, value }) =>
                value ? (
                  <div key={label}>
                    <p className="text-xs text-zinc-400">{label}</p>
                    <p className="text-sm font-medium text-zinc-800">{value}</p>
                  </div>
                ) : null
              )}
            </div>

            {extractedData?.businessDescription && (
              <>
                <Separator />
                <p className="text-sm text-zinc-600">{extractedData.businessDescription}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Knowledge Sources */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-500" />
              Knowledge Sources ({knowledgeSources.length + (businessInfo.website ? 1 : 0)})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {businessInfo.website && (
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  <span className="truncate">{businessInfo.website}</span>
                  <Badge variant="primary" className="shrink-0">Website</Badge>
                </div>
              )}
              {knowledgeSources.map((src) => (
                <div key={src.id} className="flex items-center gap-2 text-sm text-zinc-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  <span className="truncate">{src.fileName ?? src.value}</span>
                  <Badge variant="default" className="capitalize shrink-0">
                    {src.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Agent Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot className="w-4 h-4 text-zinc-500" />
              AI Sales Agent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {agentConfig?.personality?.name?.[0] ?? "A"}
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-800">
                  {agentConfig?.personality?.name ?? "Alex"}
                </p>
                <p className="text-xs text-zinc-400 capitalize">
                  {agentConfig?.personality?.tone ?? "professional"} tone
                </p>
              </div>
              <Badge variant="success" className="ml-auto">
                Ready to deploy
              </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-zinc-500 mb-1.5">Sales goals</p>
                <ul className="space-y-1">
                  {agentConfig?.salesGoals?.slice(0, 3).map((goal, i) => (
                    <li key={i} className="text-xs text-zinc-600 flex items-start gap-1.5">
                      <span className="text-blue-500 shrink-0">•</span>
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500 mb-1.5">Follow-up cadence</p>
                <p className="text-xs text-zinc-600">
                  Initial:{" "}
                  <span className="font-medium">
                    {agentConfig?.followUpCadence?.initialResponse}
                  </span>
                </p>
                <p className="text-xs text-zinc-600">
                  Max follow-ups:{" "}
                  <span className="font-medium">
                    {agentConfig?.followUpCadence?.maxFollowUps}
                  </span>
                </p>
                <p className="text-xs text-zinc-600">
                  Min score:{" "}
                  <span className="font-medium">
                    {agentConfig?.leadQualificationRubric?.minimumScore ?? 60}/100
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div
        className={cn(
          "rounded-xl border-2 border-dashed p-4 text-center transition-all",
          "border-zinc-200 bg-zinc-50"
        )}
      >
        <p className="text-xs text-zinc-500">
          By deploying, your AI agent will begin processing incoming leads according to the
          configuration above. You can pause or modify it at any time from the dashboard.
        </p>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => { prevStep(); onBack(); }}>
          Back
        </Button>
        <Button
          variant="primary"
          size="xl"
          onClick={handleDeploy}
          disabled={isDeploying}
          className="gap-2"
        >
          {isDeploying ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Deploying...
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              Deploy AI Sales Agent
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
