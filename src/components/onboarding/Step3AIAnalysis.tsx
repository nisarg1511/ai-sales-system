"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Edit3,
  TrendingUp,
  Users,
  DollarSign,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useOnboardingStore } from "@/store/onboarding";
import { ExtractedBusinessData } from "@/types";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

interface EditableCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  initialOpen?: boolean;
}

function EditableCard({ title, icon, children, initialOpen = false }: EditableCardProps) {
  const [open, setOpen] = useState(initialOpen);

  return (
    <Card>
      <CardHeader className="py-4 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-sm">{title}</CardTitle>
          </div>
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

export function Step3AIAnalysis({ onNext, onBack }: Props) {
  const {
    businessInfo,
    knowledgeSources,
    extractedData,
    setExtractedData,
    updateExtractedData,
    setDynamicFormSections,
    setIsProcessing,
    isProcessing,
    processingStatus,
    setProcessingStatus,
    processingProgress,
    setProcessingProgress,
    nextStep,
    prevStep,
  } = useOnboardingStore();

  const [hasAnalyzed, setHasAnalyzed] = useState(!!extractedData?.businessDescription);
  const [editingDescription, setEditingDescription] = useState(false);

  useEffect(() => {
    if (!hasAnalyzed) {
      runAnalysis();
    }
  }, []);

  const runAnalysis = async () => {
    setIsProcessing(true);
    setHasAnalyzed(false);

    try {
      // Step 1: Crawl website
      setProcessingStatus("Crawling website...");
      setProcessingProgress(10);

      const sources = [
        ...(businessInfo.website
          ? [{ type: "url", value: businessInfo.website }]
          : []),
        ...knowledgeSources.map((s) => ({ type: s.type, value: s.value })),
      ];

      // Step 2: Extract data
      setProcessingStatus("Extracting business information...");
      setProcessingProgress(40);

      const res = await fetch("/api/extract/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sources,
          businessContext: `Company: ${businessInfo.companyName}, Industry: ${businessInfo.industry}, Sales Channel: ${businessInfo.salesChannel}`,
        }),
      });

      setProcessingProgress(70);
      setProcessingStatus("Generating business insights...");

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json();

      setProcessingProgress(85);
      setProcessingStatus("Generating follow-up questions...");

      // Generate dynamic questions
      const questionsRes = await fetch("/api/extract/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessModel: data.businessModel,
          businessDescription: data.businessDescription,
        }),
      });

      if (questionsRes.ok) {
        const questionsData = await questionsRes.json();
        setDynamicFormSections(questionsData.sections ?? []);
      }

      setExtractedData(data);
      setProcessingProgress(100);
      setProcessingStatus("Analysis complete!");
      setHasAnalyzed(true);
    } catch (err) {
      setProcessingStatus("Analysis failed. Using defaults.");
      console.error(err);
      // Set minimal default data so user can proceed
      setExtractedData({
        businessDescription: `${businessInfo.companyName ?? "Your company"} provides products and services to customers.`,
        businessModel: businessInfo.industry?.includes("SaaS") ? "SaaS" : "Other",
        confidenceScore: 0.3,
        products: [],
        services: [],
        targetCustomers: [],
        idealCustomerProfile: {},
        valuePropositions: [],
        pricingStructure: { model: "custom" },
        salesProcess: {},
        typicalDealSize: "",
        salesCycle: "",
        objections: [],
        faqs: [],
        brandTone: "professional",
        keyMessages: [],
      });
      setHasAnalyzed(true);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2 text-center">
          <h3 className="text-lg font-semibold text-zinc-900">Analyzing your business</h3>
          <p className="text-sm text-zinc-500 max-w-sm">{processingStatus}</p>
        </div>
        <div className="w-64">
          <Progress value={processingProgress} />
          <p className="text-xs text-zinc-400 text-center mt-2">{processingProgress}%</p>
        </div>
      </div>
    );
  }

  const data = extractedData as Partial<ExtractedBusinessData> | null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-zinc-900">AI Business Analysis</h2>
          <p className="text-zinc-500">Review and edit the extracted information below.</p>
        </div>
        <div className="flex items-center gap-3">
          {data?.confidenceScore !== undefined && (
            <div className="text-right">
              <p className="text-xs text-zinc-400">Confidence</p>
              <p className="text-lg font-semibold text-zinc-900">
                {Math.round((data.confidenceScore ?? 0) * 100)}%
              </p>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={runAnalysis}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Re-analyze
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Business Description */}
        <EditableCard
          title="Business Overview"
          icon={<TrendingUp className="w-4 h-4 text-blue-500" />}
          initialOpen
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="primary">{data?.businessModel ?? "Unknown"}</Badge>
              <button
                onClick={() => setEditingDescription(!editingDescription)}
                className="text-xs text-zinc-400 hover:text-zinc-600 flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
            </div>
            {editingDescription ? (
              <Textarea
                defaultValue={data?.businessDescription ?? ""}
                className="text-sm"
                rows={4}
                onBlur={(e) => {
                  updateExtractedData({ businessDescription: e.target.value });
                  setEditingDescription(false);
                }}
                autoFocus
              />
            ) : (
              <p className="text-sm text-zinc-600 leading-relaxed">
                {data?.businessDescription || "No description extracted."}
              </p>
            )}
          </div>
        </EditableCard>

        {/* Products & Services */}
        {((data?.products?.length ?? 0) > 0 || (data?.services?.length ?? 0) > 0) && (
          <EditableCard
            title={`Products & Services (${(data?.products?.length ?? 0) + (data?.services?.length ?? 0)})`}
            icon={<Sparkles className="w-4 h-4 text-purple-500" />}
          >
            <div className="space-y-2">
              {data?.products?.map((product, i) => (
                <div key={i} className="p-3 rounded-lg bg-zinc-50">
                  <p className="text-sm font-medium text-zinc-800">{product.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{product.description}</p>
                  {product.price && (
                    <Badge variant="outline" className="mt-1.5 text-xs">
                      {product.price}
                    </Badge>
                  )}
                </div>
              ))}
              {data?.services?.map((service, i) => (
                <div key={i} className="p-3 rounded-lg bg-zinc-50">
                  <p className="text-sm font-medium text-zinc-800">{service.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{service.description}</p>
                </div>
              ))}
            </div>
          </EditableCard>
        )}

        {/* Target Customers */}
        {(data?.targetCustomers?.length ?? 0) > 0 && (
          <EditableCard
            title={`Target Customers (${data?.targetCustomers?.length})`}
            icon={<Users className="w-4 h-4 text-green-500" />}
          >
            <div className="space-y-2">
              {data?.targetCustomers?.map((customer, i) => (
                <div key={i} className="p-3 rounded-lg bg-zinc-50">
                  <p className="text-sm font-medium text-zinc-800">{customer.segment}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{customer.description}</p>
                  {customer.painPoints && customer.painPoints.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {customer.painPoints.slice(0, 3).map((pain, j) => (
                        <Badge key={j} variant="warning" className="text-xs">
                          {pain}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </EditableCard>
        )}

        {/* Value Props */}
        {(data?.valuePropositions?.length ?? 0) > 0 && (
          <EditableCard
            title="Value Propositions"
            icon={<TrendingUp className="w-4 h-4 text-amber-500" />}
          >
            <ul className="space-y-2">
              {data?.valuePropositions?.map((vp, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-600">
                  <span className="text-blue-600 mt-0.5">•</span>
                  {vp}
                </li>
              ))}
            </ul>
          </EditableCard>
        )}

        {/* Pricing */}
        {data?.pricingStructure?.model && (
          <EditableCard
            title="Pricing Structure"
            icon={<DollarSign className="w-4 h-4 text-green-500" />}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="success" className="capitalize">
                  {data.pricingStructure.model}
                </Badge>
                {data.pricingStructure.trialAvailable && (
                  <Badge variant="primary">Free trial available</Badge>
                )}
              </div>
              {(data.pricingStructure.tiers?.length ?? 0) > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {data.pricingStructure.tiers?.map((tier, i) => (
                    <div key={i} className="p-3 rounded-lg bg-zinc-50 text-center">
                      <p className="text-xs font-medium text-zinc-700">{tier.name}</p>
                      <p className="text-sm font-bold text-zinc-900 mt-1">{tier.price}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </EditableCard>
        )}

        {/* Objections & FAQs */}
        {((data?.objections?.length ?? 0) > 0 || (data?.faqs?.length ?? 0) > 0) && (
          <EditableCard
            title={`Objections & FAQs (${(data?.objections?.length ?? 0) + (data?.faqs?.length ?? 0)})`}
            icon={<MessageSquare className="w-4 h-4 text-zinc-500" />}
          >
            <div className="space-y-3">
              {data?.objections?.slice(0, 3).map((obj, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-xs font-medium text-red-600">
                    Objection: {obj.objection}
                  </p>
                  <p className="text-xs text-zinc-600 pl-3">→ {obj.response}</p>
                </div>
              ))}
              {data?.faqs?.slice(0, 3).map((faq, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-xs font-medium text-zinc-700">Q: {faq.question}</p>
                  <p className="text-xs text-zinc-500 pl-3">A: {faq.answer}</p>
                </div>
              ))}
            </div>
          </EditableCard>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => { prevStep(); onBack(); }}>
          Back
        </Button>
        <Button variant="primary" size="lg" onClick={() => { nextStep(); onNext(); }}>
          Continue to Questions
        </Button>
      </div>
    </div>
  );
}
