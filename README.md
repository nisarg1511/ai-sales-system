# AI Sales System — Onboarding Platform

A production-grade AI onboarding application that automatically configures AI sales agents by extracting business intelligence from websites, documents, and knowledge sources.

## Overview

The onboarding flow:
1. **Basic Business Info** — Company name, website, industry, size, sales channel
2. **Knowledge Sources** — Website URLs, PDFs, Google Drive, Notion pages
3. **AI Analysis** — Auto-extracts products, customers, pricing, value propositions
4. **Dynamic Questions** — AI-generated questions specific to your business type
5. **Agent Configuration** — Complete sales agent setup with scripts, rules, and cadence
6. **Review & Deploy** — One-click deployment of your configured AI sales agent

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React, TypeScript, TailwindCSS |
| State | Zustand (with persistence) |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| AI | OpenAI GPT-4o + text-embedding-3-small |
| UI | Custom Shadcn-style components + Radix UI |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and OPENAI_API_KEY

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_sales_system"
OPENAI_API_KEY="sk-..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
MAX_FILE_SIZE_MB=50
CRAWL_MAX_PAGES=20
```

### Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/onboarding` | Multi-step onboarding wizard |
| `/dashboard` | Agent management dashboard |
| `/api/extract/analyze` | POST — Crawl and extract business data |
| `/api/extract/questions` | POST — Generate dynamic form questions |
| `/api/agent/generate` | POST — Generate agent configuration |
| `/api/agent/deploy` | POST — Deploy the agent |
| `/api/documents/upload` | POST — Upload documents |

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx
│   ├── onboarding/page.tsx         # Onboarding wizard
│   ├── dashboard/page.tsx          # Dashboard
│   └── api/
│       ├── extract/analyze/        # Business extraction
│       ├── extract/questions/      # Dynamic question gen
│       ├── agent/generate/         # Config generation
│       ├── agent/deploy/           # Agent deployment
│       ├── documents/upload/       # File upload
│       └── onboarding/session/     # Session management
├── components/
│   ├── ui/                         # Reusable UI components
│   └── onboarding/                 # Step components (1-6)
├── lib/
│   ├── prisma.ts                   # Database client
│   ├── openai.ts                   # OpenAI client
│   ├── crawler.ts                  # Website crawler
│   ├── extractor.ts                # AI extraction + prompts
│   └── utils.ts                    # Utilities
├── store/
│   └── onboarding.ts               # Zustand state
└── types/
    └── index.ts                    # TypeScript types
```

## AI Pipeline

### Business Extraction
1. Crawls website (up to 20 pages, prioritizing key pages like /pricing, /about)
2. Parses uploaded documents (PDF, DOCX, TXT)
3. Combines content and sends to GPT-4o
4. Extracts: business model, products, ICP, pricing, objections, FAQs
5. Returns structured JSON with confidence score

### Dynamic Question Generation
- Detects business model (SaaS, Ecommerce, Agency, etc.)
- Generates 3-5 relevant question sections
- Each section has 2-4 targeted fields
- Form renders automatically from AI-generated JSON schema

### Agent Configuration Generation
- Uses extracted data + dynamic Q&A answers
- Generates: personality, sales scripts, qualification rules
- Creates BANT lead scoring rubric
- Produces follow-up cadence and upsell logic

## Example Agent Configuration Output

```json
{
  "name": "AI Sales Agent",
  "personality": {
    "name": "Alex",
    "tone": "consultative",
    "approach": "Understand customer needs before presenting solutions"
  },
  "salesGoals": [
    "Qualify leads within 1 hour",
    "Achieve 30% lead-to-meeting conversion"
  ],
  "qualificationRules": [
    { "criterion": "Has decision-making authority", "weight": 25, "required": true },
    { "criterion": "Has relevant need", "weight": 30, "required": true }
  ],
  "leadQualificationRubric": {
    "criteria": [
      { "name": "Budget", "maxScore": 25, "description": "Budget aligns with pricing" },
      { "name": "Authority", "maxScore": 25, "description": "Can make buying decision" },
      { "name": "Need", "maxScore": 25, "description": "Has the problem we solve" },
      { "name": "Timeline", "maxScore": 25, "description": "Active evaluation within 3 months" }
    ],
    "minimumScore": 60,
    "scoringSystem": "BANT"
  },
  "salesScripts": {
    "opener": "Hi! I noticed you expressed interest in our solution...",
    "pitchScript": "Based on what you've shared, here's how we can help...",
    "closingScript": "Would you like to schedule a discovery call?"
  },
  "followUpCadence": {
    "initialResponse": "Within 1 hour",
    "followUpIntervals": ["Day 1", "Day 3", "Day 7", "Day 14"],
    "maxFollowUps": 4,
    "channel": ["email"]
  }
}
```

## Database Schema

Key models:
- **Organization** — Company profile
- **OnboardingSession** — Tracks wizard progress
- **Document** — Uploaded/linked knowledge sources
- **DocumentEmbedding** — Vector embeddings for RAG
- **ExtractedBusinessData** — AI-extracted intelligence
- **AgentConfiguration** — Deployed agent config
- **CrawlJob** — Website crawl tracking

## Design

- **Light theme only** — White backgrounds, zinc gray palette
- **Minimalist** — No clutter, task-focused
- **AI-first** — System fills everything, user reviews and edits
- **Progressive disclosure** — Only shows what's needed per step

Design inspiration: Stripe, Vercel, Linear.
