import Link from "next/link";
import { Bot, Zap, Brain, BarChart3, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Brain,
    title: "AI Business Intelligence",
    description:
      "Automatically extracts company info, products, pricing, and customer profiles from your website and documents.",
  },
  {
    icon: Zap,
    title: "Zero Manual Setup",
    description:
      "Our AI reads your website, PDFs, and docs to pre-fill everything. You just review and approve.",
  },
  {
    icon: Bot,
    title: "Custom Sales Agent",
    description:
      "Generates a fully-configured AI agent with personality, scripts, qualification rules, and follow-up cadence.",
  },
  {
    icon: BarChart3,
    title: "Lead Scoring System",
    description:
      "Automatically scores and qualifies leads using BANT criteria tailored to your specific business model.",
  },
];

const STEPS = [
  { number: "01", title: "Enter your business info", desc: "Company name, website, industry" },
  { number: "02", title: "Add knowledge sources", desc: "Website, PDFs, Google Docs, Notion" },
  { number: "03", title: "AI analyzes everything", desc: "Extracts products, ICP, pricing, FAQs" },
  { number: "04", title: "Answer a few questions", desc: "AI-generated based on your business" },
  { number: "05", title: "Review agent config", desc: "Personality, scripts, qualification rules" },
  { number: "06", title: "Deploy your agent", desc: "Live in seconds, ready to qualify leads" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <span className="text-sm font-semibold text-zinc-900">AI Sales System</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/onboarding" className="text-sm text-zinc-600 hover:text-zinc-900">
              Sign in
            </Link>
            <Link href="/onboarding">
              <Button variant="primary" size="sm">
                Get started free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <Zap className="w-3.5 h-3.5" />
          Setup in under 10 minutes
        </div>
        <h1 className="text-5xl font-bold text-zinc-900 tracking-tight leading-tight mb-6">
          Deploy an AI sales agent
          <br />
          <span className="text-blue-600">configured for your business</span>
        </h1>
        <p className="text-lg text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          We analyze your website, documents, and knowledge sources to automatically build a
          fully-configured AI sales agent that understands your business, qualifies leads, and
          books meetings.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/onboarding">
            <Button variant="primary" size="xl">
              Start onboarding
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Button variant="outline" size="xl">
            Watch demo
          </Button>
        </div>
        <p className="text-xs text-zinc-400 mt-5">
          No credit card required · Free to try · Deploy in minutes
        </p>
      </section>

      {/* Social proof */}
      <section className="border-y border-zinc-100 bg-zinc-50 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-4 gap-8 text-center">
            {[
              { value: "2 min", label: "Average setup time" },
              { value: "94%", label: "Extraction accuracy" },
              { value: "3.2x", label: "More leads qualified" },
              { value: "40%", label: "Higher conversion rate" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
                <p className="text-xs text-zinc-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">Everything automated</h2>
          <p className="text-zinc-500 max-w-xl mx-auto">
            No more manually filling out lengthy forms. Our AI does the heavy lifting.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-2xl border border-zinc-100 hover:border-zinc-200 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-zinc-50 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 mb-4">How it works</h2>
            <p className="text-zinc-500">Six steps to a fully-deployed AI sales agent</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.number} className="relative">
                {i < STEPS.length - 1 && i % 3 !== 2 && (
                  <div className="absolute top-5 left-[calc(100%-8px)] w-6 h-px bg-zinc-200 z-10" />
                )}
                <div className="p-5 rounded-xl bg-white border border-zinc-100">
                  <span className="text-xs font-mono font-bold text-blue-600 block mb-3">
                    {step.number}
                  </span>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-1">{step.title}</h3>
                  <p className="text-xs text-zinc-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Ready to deploy your AI sales agent?
        </h2>
        <p className="text-zinc-500 mb-8">
          Join hundreds of companies using AI to automate lead qualification and sales.
        </p>
        <div className="flex items-center justify-center gap-3 mb-6">
          {[
            "No credit card required",
            "Setup in minutes",
            "Cancel anytime",
          ].map((item) => (
            <span key={item} className="flex items-center gap-1.5 text-sm text-zinc-500">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {item}
            </span>
          ))}
        </div>
        <Link href="/onboarding">
          <Button variant="primary" size="xl">
            Start free onboarding
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-zinc-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <span className="text-xs text-zinc-500">AI Sales System</span>
          </div>
          <p className="text-xs text-zinc-400">© 2024 AI Sales System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
