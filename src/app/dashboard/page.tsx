import Link from "next/link";
import { Bot, BarChart3, Users, TrendingUp, Plus, Settings, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Dashboard — AI Sales System",
};

const MOCK_STATS = [
  { label: "Leads Processed", value: "1,284", change: "+12%", icon: Users },
  { label: "Qualified Leads", value: "387", change: "+8%", icon: TrendingUp },
  { label: "Meetings Booked", value: "64", change: "+23%", icon: BarChart3 },
  { label: "Conversion Rate", value: "16.5%", change: "+3.2%", icon: Bot },
];

const MOCK_AGENTS = [
  {
    id: "agent_abc123",
    name: "Alex",
    company: "Your Company",
    status: "active",
    leadsToday: 24,
    conversionRate: "18%",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <span className="text-sm font-semibold text-zinc-900">AI Sales System</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/onboarding">
              <Button variant="primary" size="sm">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                New Agent
              </Button>
            </Link>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4 text-zinc-500" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Monitor your AI sales agents and track performance.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {MOCK_STATS.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className="w-4 h-4 text-zinc-400" />
                  <Badge variant="success" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
                <p className="text-xs text-zinc-400 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Agents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI Sales Agents</CardTitle>
              <Link href="/onboarding">
                <Button variant="outline" size="sm">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Deploy New Agent
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {MOCK_AGENTS.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-zinc-700 mb-2">No agents deployed yet</h3>
                <p className="text-xs text-zinc-400 mb-6">
                  Set up your first AI sales agent to start qualifying leads automatically.
                </p>
                <Link href="/onboarding">
                  <Button variant="primary">
                    Deploy your first agent
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {MOCK_AGENTS.map((agent) => (
                  <div key={agent.id} className="py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {agent.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-zinc-900">{agent.name}</p>
                        <Badge variant={agent.status === "active" ? "success" : "default"}>
                          {agent.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-400">{agent.company}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6 text-right">
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">{agent.leadsToday}</p>
                        <p className="text-xs text-zinc-400">Leads today</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">
                          {agent.conversionRate}
                        </p>
                        <p className="text-xs text-zinc-400">Conversion</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
