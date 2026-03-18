"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Globe, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOnboardingStore } from "@/store/onboarding";
import { BusinessInfo } from "@/types";

const schema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  website: z.string().url("Please enter a valid URL").or(z.string().length(0)),
  industry: z.string().min(1, "Industry is required"),
  companySize: z.string().min(1, "Company size is required"),
  salesChannel: z.enum(["B2B", "B2C", "Hybrid", ""]),
});

type FormData = z.infer<typeof schema>;

const INDUSTRIES = [
  "SaaS / Software",
  "E-commerce / Retail",
  "Agency / Consulting",
  "Professional Services",
  "Healthcare",
  "Finance / Fintech",
  "Education / EdTech",
  "Real Estate",
  "Manufacturing",
  "Other",
];

const COMPANY_SIZES = [
  "Solo / Freelancer",
  "2–10 employees",
  "11–50 employees",
  "51–200 employees",
  "201–1000 employees",
  "1000+ employees",
];

interface Props {
  onNext: () => void;
}

export function Step1BusinessInfo({ onNext }: Props) {
  const { businessInfo, setBusinessInfo, nextStep } = useOnboardingStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: businessInfo.companyName ?? "",
      website: businessInfo.website ?? "",
      industry: businessInfo.industry ?? "",
      companySize: businessInfo.companySize ?? "",
      salesChannel: (businessInfo.salesChannel as FormData["salesChannel"]) ?? "",
    },
  });

  const onSubmit = (data: FormData) => {
    setBusinessInfo(data as Partial<BusinessInfo>);
    nextStep();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-zinc-900">Tell us about your business</h2>
        <p className="text-zinc-500">
          We&apos;ll use this to personalize your AI sales agent setup.
        </p>
      </div>

      <div className="grid gap-5">
        {/* Company Name */}
        <div className="space-y-1.5">
          <Label htmlFor="companyName">
            <span className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-zinc-400" />
              Company name
            </span>
          </Label>
          <Input
            id="companyName"
            placeholder="Acme Inc."
            error={errors.companyName?.message}
            {...register("companyName")}
          />
        </div>

        {/* Website */}
        <div className="space-y-1.5">
          <Label htmlFor="website">
            <span className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              Website URL
            </span>
          </Label>
          <Input
            id="website"
            placeholder="https://yourcompany.com"
            error={errors.website?.message}
            {...register("website")}
          />
          <p className="text-xs text-zinc-400">
            We&apos;ll automatically extract information from your website
          </p>
        </div>

        {/* Industry & Company Size */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>
              <span className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
                Industry
              </span>
            </Label>
            <Select
              defaultValue={businessInfo.industry}
              onValueChange={(val) => setValue("industry", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.industry && (
              <p className="text-xs text-red-500">{errors.industry.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>
              <span className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                Company size
              </span>
            </Label>
            <Select
              defaultValue={businessInfo.companySize}
              onValueChange={(val) => setValue("companySize", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {COMPANY_SIZES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.companySize && (
              <p className="text-xs text-red-500">{errors.companySize.message}</p>
            )}
          </div>
        </div>

        {/* Sales Channel */}
        <div className="space-y-2">
          <Label>Primary sales channel</Label>
          <div className="grid grid-cols-3 gap-3">
            {(["B2B", "B2C", "Hybrid"] as const).map((channel) => {
              const selected = watch("salesChannel") === channel;
              return (
                <button
                  key={channel}
                  type="button"
                  onClick={() => setValue("salesChannel", channel)}
                  className={`rounded-lg border-2 p-3 text-sm font-medium transition-all text-center ${
                    selected
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  <div className="font-semibold">{channel}</div>
                  <div className="text-xs opacity-70 mt-0.5">
                    {channel === "B2B" && "Business customers"}
                    {channel === "B2C" && "Consumers"}
                    {channel === "Hybrid" && "Both"}
                  </div>
                </button>
              );
            })}
          </div>
          {errors.salesChannel && (
            <p className="text-xs text-red-500">{errors.salesChannel.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" size="lg">
          Continue
        </Button>
      </div>
    </form>
  );
}
