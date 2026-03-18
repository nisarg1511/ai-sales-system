"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Globe,
  FileText,
  Link,
  Plus,
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useOnboardingStore } from "@/store/onboarding";
import { KnowledgeSource } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const SOURCE_TYPES = [
  { type: "url" as const, label: "Web URL", icon: Link, placeholder: "https://docs.yoursite.com" },
  {
    type: "gdrive" as const,
    label: "Google Drive",
    icon: FileText,
    placeholder: "https://drive.google.com/...",
  },
  {
    type: "notion" as const,
    label: "Notion Page",
    icon: FileText,
    placeholder: "https://notion.so/...",
  },
];

export function Step2KnowledgeSources({ onNext, onBack }: Props) {
  const { businessInfo, knowledgeSources, addKnowledgeSource, removeKnowledgeSource, nextStep, prevStep } =
    useOnboardingStore();

  const [urlInput, setUrlInput] = useState("");
  const [urlType, setUrlType] = useState<"url" | "gdrive" | "notion">("url");
  const [isUploading, setIsUploading] = useState(false);

  const websiteSource = businessInfo.website
    ? {
        id: "website-auto",
        type: "url" as const,
        value: businessInfo.website,
        fileName: "Company Website",
        status: "pending" as const,
      }
    : null;

  const addUrl = () => {
    if (!urlInput.trim()) return;
    const source: KnowledgeSource = {
      id: `src_${Date.now()}`,
      type: urlType,
      value: urlInput.trim(),
      status: "pending",
    };
    addKnowledgeSource(source);
    setUrlInput("");
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsUploading(true);
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const tempId = `src_${Date.now()}_${Math.random().toString(36).slice(2)}`;

        addKnowledgeSource({
          id: tempId,
          type: "pdf",
          value: "",
          fileName: file.name,
          status: "pending",
        });

        try {
          const res = await fetch("/api/documents/upload", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          // Update with real URL
          useOnboardingStore.getState().updateKnowledgeSource(tempId, {
            value: data.url ?? file.name,
            status: "pending",
          });
        } catch {
          useOnboardingStore.getState().updateKnowledgeSource(tempId, { status: "failed" });
        }
      }
      setIsUploading(false);
    },
    [addKnowledgeSource]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 50 * 1024 * 1024,
  });

  const allSources = websiteSource
    ? [websiteSource, ...knowledgeSources]
    : knowledgeSources;

  const canContinue = allSources.length > 0;

  const handleNext = () => {
    nextStep();
    onNext();
  };

  const statusIcon = (status: KnowledgeSource["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case "processing":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-zinc-300" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-zinc-900">Add knowledge sources</h2>
        <p className="text-zinc-500">
          Our AI will extract business information to configure your sales agent.
        </p>
      </div>

      {/* Auto-detected website */}
      {websiteSource && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 flex items-center gap-3">
          <Globe className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-900">Company Website</p>
            <p className="text-xs text-blue-600 truncate">{websiteSource.value}</p>
          </div>
          <Badge variant="primary" className="shrink-0">Auto-detected</Badge>
        </div>
      )}

      {/* URL Input */}
      <div className="space-y-3">
        <div className="flex gap-2">
          {SOURCE_TYPES.map((st) => (
            <button
              key={st.type}
              onClick={() => setUrlType(st.type)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                urlType === st.type
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
              )}
            >
              <st.icon className="w-3.5 h-3.5" />
              {st.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={
              SOURCE_TYPES.find((st) => st.type === urlType)?.placeholder ?? "Enter URL"
            }
            onKeyDown={(e) => e.key === "Enter" && addUrl()}
            className="flex-1"
          />
          <Button variant="outline" onClick={addUrl} disabled={!urlInput.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* File Upload */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
          isDragActive
            ? "border-blue-400 bg-blue-50"
            : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-zinc-700">
          {isDragActive ? "Drop files here" : "Drop files or click to upload"}
        </p>
        <p className="text-xs text-zinc-400 mt-1">PDF, DOC, DOCX, TXT — up to 50MB each</p>
        {isUploading && (
          <div className="flex items-center justify-center gap-2 mt-3 text-sm text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            Uploading...
          </div>
        )}
      </div>

      {/* Sources List */}
      {knowledgeSources.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
            Added sources
          </p>
          <div className="space-y-2">
            {knowledgeSources.map((source) => (
              <div
                key={source.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-zinc-100 bg-zinc-50"
              >
                {statusIcon(source.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-800 truncate">
                    {source.fileName ?? source.value}
                  </p>
                  {source.fileName && source.value && (
                    <p className="text-xs text-zinc-400 truncate">{source.value}</p>
                  )}
                </div>
                <Badge variant="default" className="capitalize text-xs shrink-0">
                  {source.type}
                </Badge>
                <button
                  onClick={() => removeKnowledgeSource(source.id)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => { prevStep(); onBack(); }}>
          Back
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleNext}
          disabled={!canContinue}
        >
          Analyze with AI
        </Button>
      </div>
    </div>
  );
}
