import { chatCompletion } from "./openai";
import { ExtractedBusinessData } from "@/types";

const EXTRACTION_PROMPT = `You are an expert business analyst. Analyze the provided content from a company's website and documents, then extract structured business information.

Return ONLY valid JSON matching this exact structure:
{
  "businessDescription": "2-3 sentence description of what the company does",
  "businessModel": "SaaS | Ecommerce | Agency | Marketplace | Professional Services | Healthcare | Finance | Education | Other",
  "confidenceScore": 0.85,
  "products": [
    { "name": "Product name", "description": "What it does", "price": "optional price", "features": ["feature1", "feature2"] }
  ],
  "services": [
    { "name": "Service name", "description": "What it offers", "deliverables": ["deliverable1"] }
  ],
  "targetCustomers": [
    { "segment": "Customer segment", "description": "Who they are", "painPoints": ["pain1", "pain2"] }
  ],
  "idealCustomerProfile": {
    "industry": "Target industry",
    "companySize": "e.g. 10-500 employees",
    "role": "Primary decision maker role",
    "budget": "Typical budget range",
    "needs": ["need1", "need2"]
  },
  "valuePropositions": ["value prop 1", "value prop 2", "value prop 3"],
  "pricingStructure": {
    "model": "subscription | one-time | usage-based | custom | freemium",
    "tiers": [{ "name": "Tier name", "price": "Price", "features": ["feature1"] }],
    "customPricing": false,
    "trialAvailable": true
  },
  "salesProcess": {
    "stages": ["Stage 1", "Stage 2", "Stage 3"],
    "averageCycle": "e.g. 2-4 weeks",
    "decisionMakers": ["CTO", "CEO"]
  },
  "typicalDealSize": "e.g. $500-$5000/month",
  "salesCycle": "e.g. 2-6 weeks",
  "objections": [
    { "objection": "Common objection", "response": "How to address it" }
  ],
  "faqs": [
    { "question": "Common question", "answer": "Answer" }
  ],
  "brandTone": "professional | friendly | technical | consultative | casual",
  "keyMessages": ["key message 1", "key message 2", "key message 3"]
}

If information is not found, use reasonable defaults or empty arrays. The confidenceScore should reflect how much information was found (0.0-1.0).`;

export async function extractBusinessData(
  content: string,
  businessContext?: string
): Promise<ExtractedBusinessData> {
  const contextNote = businessContext
    ? `\n\nAdditional context provided by the user:\n${businessContext}`
    : "";

  const prompt = `${EXTRACTION_PROMPT}\n\nContent to analyze:\n${content.slice(0, 15000)}${contextNote}`;

  try {
    const result = await chatCompletion(
      [
        {
          role: "system",
          content:
            "You are a business intelligence analyst. Extract structured data from business content. Always return valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      { response_format: { type: "json_object" } }
    );

    const parsed = JSON.parse(result);
    return parsed as ExtractedBusinessData;
  } catch (error) {
    console.error("Extraction error:", error);
    return getDefaultExtractedData();
  }
}

export function getDefaultExtractedData(): ExtractedBusinessData {
  return {
    businessDescription: "",
    businessModel: "Other",
    confidenceScore: 0,
    products: [],
    services: [],
    targetCustomers: [],
    idealCustomerProfile: {},
    valuePropositions: [],
    pricingStructure: { model: "custom", tiers: [], customPricing: true, trialAvailable: false },
    salesProcess: { stages: [], averageCycle: "", decisionMakers: [] },
    typicalDealSize: "",
    salesCycle: "",
    objections: [],
    faqs: [],
    brandTone: "professional",
    keyMessages: [],
  };
}

const DYNAMIC_QUESTIONS_PROMPT = `You are an expert sales consultant. Based on the business information provided, generate a set of targeted questions to better configure an AI sales agent.

Business Model: {businessModel}
Business Description: {businessDescription}

Generate 3-5 sections of questions, each with 2-4 fields. The questions should be specific to this type of business and help configure the sales agent's behavior.

Return ONLY valid JSON in this format:
[
  {
    "id": "section_id",
    "section": "Section Title",
    "description": "Brief explanation of why these questions matter",
    "fields": [
      {
        "id": "field_id",
        "type": "text | textarea | select | multiselect | radio",
        "label": "Question label",
        "placeholder": "Optional placeholder",
        "options": ["Option 1", "Option 2"],
        "required": true,
        "helpText": "Optional help text"
      }
    ]
  }
]

For SaaS companies, ask about: trial policy, key integrations, expansion revenue strategy, churn prevention.
For Ecommerce, ask about: shipping policy, return policy, best sellers, seasonal promotions.
For Agencies, ask about: typical contract value, project types, lead qualification criteria.
For Professional Services, ask about: engagement model, typical client size, referral importance.

Make questions actionable and specific to this exact business.`;

export async function generateDynamicQuestions(
  businessModel: string,
  businessDescription: string
): Promise<import("@/types").DynamicFormSection[]> {
  const prompt = DYNAMIC_QUESTIONS_PROMPT.replace("{businessModel}", businessModel).replace(
    "{businessDescription}",
    businessDescription
  );

  try {
    const result = await chatCompletion(
      [
        {
          role: "system",
          content:
            "You are a sales consultant generating targeted questions. Return valid JSON arrays only.",
        },
        { role: "user", content: prompt },
      ],
      { response_format: { type: "json_object" } }
    );

    // The model returns a JSON object, we need to find the array
    const parsed = JSON.parse(result);
    const sections = Array.isArray(parsed) ? parsed : parsed.sections ?? parsed.questions ?? [];
    return sections;
  } catch (error) {
    console.error("Dynamic questions error:", error);
    return getDefaultDynamicQuestions(businessModel);
  }
}

function getDefaultDynamicQuestions(businessModel: string): import("@/types").DynamicFormSection[] {
  return [
    {
      id: "sales_process",
      section: "Sales Process",
      description: "Help us understand how your sales process works",
      fields: [
        {
          id: "deal_size",
          type: "select",
          label: "Typical deal size",
          options: ["< $500", "$500–$5k", "$5k–$20k", "$20k–$100k", "$100k+"],
          required: true,
        },
        {
          id: "sales_cycle",
          type: "select",
          label: "Typical sales cycle length",
          options: ["Same day", "1–7 days", "1–4 weeks", "1–3 months", "3+ months"],
          required: true,
        },
        {
          id: "primary_objection",
          type: "textarea",
          label: "Primary objection customers have",
          placeholder: "e.g. Price is too high, we already have a solution...",
          required: false,
        },
      ],
    },
    {
      id: "qualification",
      section: "Lead Qualification",
      description: "Define what makes an ideal lead for your business",
      fields: [
        {
          id: "ideal_lead",
          type: "textarea",
          label: "Describe your ideal customer in 1-2 sentences",
          placeholder: "e.g. VP of Sales at a B2B SaaS company with 50-500 employees...",
          required: true,
        },
        {
          id: "disqualifiers",
          type: "textarea",
          label: "What disqualifies a lead?",
          placeholder: "e.g. Budget under $1k/month, no decision-making authority...",
          required: false,
        },
      ],
    },
  ];
}

const AGENT_CONFIG_PROMPT = `You are an expert AI sales consultant. Generate a complete AI sales agent configuration based on the business data provided.

Business Data:
{businessData}

Dynamic Q&A Answers:
{dynamicAnswers}

Return ONLY valid JSON in this exact format:
{
  "name": "Agent name based on company",
  "personality": {
    "name": "Agent's first name",
    "tone": "professional | friendly | consultative | direct",
    "approach": "Description of how the agent approaches conversations"
  },
  "salesGoals": ["Goal 1", "Goal 2", "Goal 3"],
  "qualificationRules": [
    { "criterion": "Qualification criterion", "weight": 30, "required": true }
  ],
  "offerStrategy": {
    "primaryOffer": "Main product/service to pitch",
    "entryOffer": "Lower barrier entry offer if applicable",
    "conditions": ["Condition for making offer"]
  },
  "upsellLogic": [
    { "trigger": "When to upsell", "offer": "What to upsell", "timing": "When in conversation" }
  ],
  "followUpCadence": {
    "initialResponse": "Within X hours",
    "followUpIntervals": ["Day 1", "Day 3", "Day 7", "Day 14"],
    "maxFollowUps": 4,
    "channel": ["email", "phone"]
  },
  "salesScripts": {
    "opener": "Opening message script",
    "qualificationScript": "Questions to qualify the lead",
    "pitchScript": "Core pitch tailored to this business",
    "objectionHandling": {
      "price": "Response to price objection",
      "timing": "Response to timing objection",
      "competition": "Response to competitor objection"
    },
    "closingScript": "Closing and next steps script"
  },
  "leadQualificationRubric": {
    "criteria": [
      { "name": "Budget fit", "maxScore": 25, "description": "Does their budget match our pricing?" },
      { "name": "Authority", "maxScore": 25, "description": "Can they make the buying decision?" },
      { "name": "Need", "maxScore": 25, "description": "Do they have the problem we solve?" },
      { "name": "Timeline", "maxScore": 25, "description": "Are they looking to buy soon?" }
    ],
    "minimumScore": 60,
    "scoringSystem": "BANT"
  }
}`;

export async function generateAgentConfiguration(
  extractedData: Partial<ExtractedBusinessData>,
  dynamicAnswers: Record<string, unknown>
): Promise<import("@/types").AgentConfiguration> {
  const prompt = AGENT_CONFIG_PROMPT.replace(
    "{businessData}",
    JSON.stringify(extractedData, null, 2).slice(0, 8000)
  ).replace("{dynamicAnswers}", JSON.stringify(dynamicAnswers, null, 2).slice(0, 2000));

  try {
    const result = await chatCompletion(
      [
        {
          role: "system",
          content:
            "You are an expert sales AI configurator. Generate detailed, actionable agent configurations. Return valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      { response_format: { type: "json_object" } }
    );

    const parsed = JSON.parse(result);
    return parsed as import("@/types").AgentConfiguration;
  } catch (error) {
    console.error("Agent config generation error:", error);
    return getDefaultAgentConfig(extractedData);
  }
}

function getDefaultAgentConfig(
  data: Partial<ExtractedBusinessData>
): import("@/types").AgentConfiguration {
  return {
    name: "AI Sales Agent",
    personality: {
      name: "Alex",
      tone: "professional",
      approach:
        "Consultative sales approach focused on understanding customer needs before presenting solutions",
    },
    salesGoals: [
      "Qualify inbound leads within 2 hours",
      "Schedule discovery calls with qualified prospects",
      "Achieve 30% lead-to-meeting conversion rate",
    ],
    qualificationRules: [
      { criterion: "Has a defined budget", weight: 25, required: false },
      { criterion: "Has decision-making authority", weight: 25, required: true },
      { criterion: "Has a clear need for the product", weight: 30, required: true },
      { criterion: "Has a timeline for purchase", weight: 20, required: false },
    ],
    offerStrategy: {
      primaryOffer: data.products?.[0]?.name ?? "Primary product/service",
      entryOffer: "Free trial or demo",
      conditions: ["Lead is qualified", "Budget confirmed"],
    },
    upsellLogic: [
      {
        trigger: "Customer uses primary product for 30+ days",
        offer: "Premium tier or add-on",
        timing: "After initial success",
      },
    ],
    followUpCadence: {
      initialResponse: "Within 1 hour",
      followUpIntervals: ["Day 1", "Day 3", "Day 7", "Day 14"],
      maxFollowUps: 4,
      channel: ["email"],
    },
    salesScripts: {
      opener: `Hi, I'm Alex from the team. I noticed you expressed interest in our solution. I'd love to learn more about your needs and see if we're a good fit. Do you have 15 minutes this week?`,
      qualificationScript:
        "Can you tell me more about your current challenges? What's driving you to look for a solution now? What does your timeline look like?",
      pitchScript: `Based on what you've shared, our solution helps ${data.targetCustomers?.[0]?.segment ?? "businesses like yours"} achieve ${data.valuePropositions?.[0] ?? "better results"}. Here's how we'd approach your specific situation...`,
      objectionHandling: {
        price: "I understand budget is a consideration. Let me show you the ROI our customers typically see within the first 90 days...",
        timing: "Many of our customers felt the same way at first. What would need to be true for you to be ready to move forward?",
        competition: "That's a great point. The key difference between us and [competitor] is...",
      },
      closingScript:
        "Based on our conversation, it sounds like we could help you achieve [specific goal]. I'd like to propose we schedule a technical deep-dive next week. Does Tuesday or Wednesday work for you?",
    },
    leadQualificationRubric: {
      criteria: [
        { name: "Budget fit", maxScore: 25, description: "Budget aligns with pricing" },
        { name: "Authority", maxScore: 25, description: "Can make or influence buying decision" },
        { name: "Need", maxScore: 25, description: "Has the problem we solve" },
        { name: "Timeline", maxScore: 25, description: "Active evaluation within 3 months" },
      ],
      minimumScore: 60,
      scoringSystem: "BANT",
    },
  };
}
