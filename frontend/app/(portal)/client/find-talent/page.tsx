"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface WizardStep {
  id: string;
  title: string;
  description: string;
}

const STEPS: WizardStep[] = [
  {
    id: "category",
    title: "Project Category",
    description: "What type of project do you need?",
  },
  {
    id: "description",
    title: "Project Details",
    description: "Describe your project",
  },
  {
    id: "skills",
    title: "Required Skills",
    description: "What skills are needed?",
  },
  {
    id: "budget",
    title: "Budget & Timeline",
    description: "Set your budget and timeline",
  },
  {
    id: "review",
    title: "Review & AI Brief",
    description: "Review AI-enhanced project brief",
  },
  {
    id: "match",
    title: "AI Matching",
    description: "Finding your perfect freelancer",
  },
];

const CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Data Science",
  "Content Writing",
  "Digital Marketing",
  "Video & Animation",
  "DevOps",
  "Blockchain",
  "AI & Machine Learning",
  "Other",
];

const TIMELINE_OPTIONS = [
  "Less than 1 week",
  "1-2 weeks",
  "2-4 weeks",
  "1-2 months",
  "3+ months",
];

const COMPLEXITY_OPTIONS = [
  { value: "simple", label: "Simple", desc: "Basic task, clear requirements" },
  {
    value: "moderate",
    label: "Moderate",
    desc: "Standard project with some complexity",
  },
  {
    value: "complex",
    label: "Complex",
    desc: "Advanced project, multiple components",
  },
];

import Micro1TalentHub from "@/app/components/organisms/Micro1TalentHub/Micro1TalentHub";
import InstantMatchingWizard from "@/app/components/AI/InstantMatchingWizard";
import { Sparkles, FileText, Zap } from "lucide-react";

export default function FindTalentPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"instant" | "vetted" | "wizard">("instant");
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [timeline, setTimeline] = useState("");
  const [complexity, setComplexity] = useState("moderate");
  const [aiBrief, setAiBrief] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<any>(null);
  const [hireSuccess, setHireSuccess] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [budgetSuggesting, setBudgetSuggesting] = useState(false);
  const [budgetSuggestion, setBudgetSuggestion] = useState<{
    min: number;
    max: number;
    confidence: number;
    message: string;
  } | null>(null);

  const suggestBudget = async () => {
    setBudgetSuggesting(true);
    try {
      const params = new URLSearchParams();
      params.append("title", category || "Project");
      params.append("description", description || category || "Project");
      if (category) params.append("category", category);
      const res = (await apiFetch(`/ai/project/estimate?${params}`)) as {
        budget_range?: { min: number; max: number };
        confidence?: number;
        message?: string;
      };
      const min = Math.round(res.budget_range?.min ?? 0);
      const max = Math.round(res.budget_range?.max ?? 0);
      setBudgetSuggestion({ min, max, confidence: res.confidence ?? 0, message: res.message || "" });
      if (min > 0) setBudgetMin(String(min));
      if (max > 0) setBudgetMax(String(max));
    } catch {
      /* non-fatal — user can still enter a budget manually */
    } finally {
      setBudgetSuggesting(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const getAiBrief = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/ai/project-brief", {
        method: "POST",
        body: JSON.stringify({
          category,
          description,
          skills,
          budget_min: Number(budgetMin) || null,
          budget_max: Number(budgetMax) || null,
          timeline,
          complexity,
          industry: null,
          deliverables: null,
          additional_notes: null,
        }),
      });
      setAiBrief(data);
    } catch (e) {
      console.error("AI brief failed:", e);
    } finally {
      setLoading(false);
    }
  }, [
    category,
    description,
    skills,
    budgetMin,
    budgetMax,
    timeline,
    complexity,
  ]);

  const getMatches = useCallback(async () => {
    setLoading(true);
    setMatchError(null);

    try {
      // Level 1: POST /ai/smart-match (AI-powered matching)
      try {
        console.log("[FindTalent] Trying Level 1: AI smart-match");
        const data = await apiFetch("/ai/smart-match", {
          method: "POST",
          body: JSON.stringify({
            category,
            skills,
            budget_min: Number(budgetMin) || 500,
            budget_max: Number(budgetMax) || 2000,
            timeline,
            complexity,
            industry: null,
            deliverables: null,
            preferences: null,
          }),
        });
        const results = (data as any)?.matches || [];
        if (results.length > 0) {
          console.log("[FindTalent] Level 1 succeeded:", results.length, "matches");
          setMatches(results);
          return;
        }
      } catch (e) {
        console.warn("[FindTalent] Level 1 failed:", e);
      }

      // Level 2: GET /users/freelancers (list freelancers)
      try {
        console.log("[FindTalent] Trying Level 2: users/freelancers");
        const data = await apiFetch("/users/freelancers");
        const users: any[] = (data as any)?.users || (data as any)?.freelancers || (Array.isArray(data) ? data : []);
        if (users.length > 0) {
          console.log("[FindTalent] Level 2 succeeded:", users.length, "freelancers");
          setMatches(
            users.map((u: any, i: number) => ({
              freelancer_id: u.id || i + 1,
              display_name:
                u.name || u.full_name || u.display_name || u.email || `Freelancer ${i + 1}`,
              headline: u.title || u.headline || "Professional Freelancer",
              fit_score: Math.max(60, 90 - i * 5),
              skill_match: 0.8,
              hourly_rate: u.hourly_rate ?? null,
              rating: u.rating ?? null,
            })),
          );
          return;
        }
      } catch (e) {
        console.warn("[FindTalent] Level 2 failed:", e);
      }

      setMatches([]);
      setMatchError("No verified freelancers matched these requirements. Adjust the skills or budget and try again.");
    } finally {
      setLoading(false);
    }
  }, [category, skills, budgetMin, budgetMax, timeline, complexity]);

  const handleHire = async (freelancerId: number) => {
    setLoading(true);
    try {
      await apiFetch("/ai/hire/confirm", {
        method: "POST",
        body: JSON.stringify({
          freelancer_id: freelancerId,
          project_brief: {
            title: `${category} Project`,
            description,
            category,
            skills,
            experience_level: complexity,
            timeline,
          },
          agreed_amount: Number(budgetMax) || 1000,
          milestone_plan: [],
          message_to_freelancer: null,
        }),
      });
      setHireSuccess(true);
      setSelectedFreelancer(
        matches.find((m) => m.freelancer_id === freelancerId),
      );
      // Redirect to client projects after 2 seconds
      setTimeout(() => {
        router.push("/client/projects");
      }, 2000);
    } catch (e) {
      console.error("Hire failed:", e);
      setMatchError("The invitation could not be sent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    if (step === 3) {
      await getAiBrief();
    }
    if (step === 4) {
      await getMatches();
    }
    setStep(Math.min(step + 1, STEPS.length - 1));
  };

  const prevStep = () => setStep(Math.max(step - 1, 0));

  const canProceed = () => {
    switch (step) {
      case 0:
        return !!category;
      case 1:
        return description.length >= 20;
      case 2:
        return skills.length > 0;
      case 3:
        return !!timeline;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Talent Sourcing & AI Matching Hub
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Discover pre-vetted Micro1 autonomous engineers or post an AI-assisted project brief.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl self-start md:self-auto border border-gray-200 dark:border-gray-700 flex-wrap gap-1">
          <button
            onClick={() => setViewMode("instant")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "instant"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Zap size={14} className={viewMode === "instant" ? "text-amber-300 fill-amber-300" : "text-amber-500"} /> ⚡ 60-Second Instant Match
          </button>
          <button
            onClick={() => setViewMode("vetted")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "vetted"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Sparkles size={14} className={viewMode === "vetted" ? "text-amber-300" : ""} /> Micro1 Vetted Talent Market
          </button>
          <button
            onClick={() => setViewMode("wizard")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "wizard"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <FileText size={14} /> Guided Project Brief Wizard
          </button>
        </div>
      </div>

      {viewMode === "instant" ? (
        <div className="py-2">
          <InstantMatchingWizard />
        </div>
      ) : viewMode === "vetted" ? (
        <Micro1TalentHub />
      ) : (
        <div>
          {/* Progress Bar */}
          <div className="flex gap-1 mb-8">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`flex-1 h-1 rounded-sm ${i <= step ? "bg-indigo-500" : "bg-gray-200 dark:bg-gray-700"}`}
              />
            ))}
          </div>

      <div className="mb-4 text-gray-500 dark:text-gray-400 text-sm">
        Step {step + 1} of {STEPS.length}: {STEPS[step].title}
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">
        {step === 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              What type of project do you need?
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-4 rounded-lg text-left font-medium transition-colors ${
                    category === cat
                      ? "border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-gray-900 dark:text-white"
                      : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Describe your project
            </h2>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you need built, designed, or delivered. Be as specific as possible for better AI matching..."
              className="w-full min-h-[200px] p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-[15px] resize-vertical focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-gray-400 dark:text-gray-500 text-[13px] mt-2">
              {description.length} characters (minimum 20)
            </p>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Required Skills
            </h2>
            <div className="flex gap-2 mb-4">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSkill())
                }
                placeholder="Type a skill and press Enter..."
                className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={addSkill}
                className="px-5 py-2.5 rounded-lg bg-indigo-500 text-white border-none cursor-pointer font-medium hover:bg-indigo-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="bg-transparent border-none cursor-pointer text-indigo-500 text-lg leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Budget & Timeline
            </h2>
            <div className="mb-4 flex items-center justify-between gap-3 flex-wrap rounded-lg border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/60 dark:bg-indigo-900/10 px-4 py-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                ✨ Not sure what to budget? Let AI estimate from similar projects.
              </span>
              <button
                type="button"
                onClick={suggestBudget}
                disabled={budgetSuggesting}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 disabled:opacity-60"
              >
                {budgetSuggesting ? "Estimating…" : "Suggest budget"}
              </button>
            </div>
            {budgetSuggestion && (
              <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
                <strong>
                  Suggested: ${budgetSuggestion.min.toLocaleString()}–$
                  {budgetSuggestion.max.toLocaleString()}
                </strong>{" "}
                <span
                  className={
                    budgetSuggestion.confidence >= 0.7
                      ? "text-green-600"
                      : budgetSuggestion.confidence >= 0.45
                        ? "text-amber-600"
                        : "text-gray-500"
                  }
                >
                  ({Math.round(budgetSuggestion.confidence * 100)}% confidence)
                </span>
                {budgetSuggestion.message && (
                  <span className="text-gray-500"> — {budgetSuggestion.message}</span>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block mb-1.5 font-medium text-gray-900 dark:text-white">
                  Min Budget (USD)
                </label>
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="500"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-medium text-gray-900 dark:text-white">
                  Max Budget (USD)
                </label>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="2000"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block mb-1.5 font-medium text-gray-900 dark:text-white">
                Timeline
              </label>
              <div className="flex flex-wrap gap-2">
                {TIMELINE_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeline(t)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      timeline === t
                        ? "border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-gray-900 dark:text-white"
                        : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block mb-1.5 font-medium text-gray-900 dark:text-white">
                Project Complexity
              </label>
              <div className="flex gap-3">
                {COMPLEXITY_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setComplexity(c.value)}
                    className={`flex-1 p-3 rounded-lg text-left transition-colors ${
                      complexity === c.value
                        ? "border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                        : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="font-semibold text-gray-900 dark:text-white">{c.label}</div>
                    <div className="text-[13px] text-gray-500 dark:text-gray-400">
                      {c.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              AI-Enhanced Project Brief
            </h2>
            {loading ? (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                <div className="text-2xl mb-2">🤖</div>
                AI is analyzing your project...
              </div>
            ) : aiBrief ? (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <div className="mb-4">
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                    Enriched Description
                  </h3>
                  <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                    {aiBrief.enriched_description}
                  </p>
                </div>
                {aiBrief.suggested_skills?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                      Suggested Skills
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {aiBrief.suggested_skills.map((s: string) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[13px]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-[13px] text-gray-500 dark:text-gray-400">
                      Estimated Budget
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      ${aiBrief.estimated_budget_min} - $
                      {aiBrief.estimated_budget_max}
                    </div>
                  </div>
                  <div>
                    <div className="text-[13px] text-gray-500 dark:text-gray-400">
                      Timeline
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {aiBrief.estimated_timeline}
                    </div>
                  </div>
                  <div>
                    <div className="text-[13px] text-gray-500 dark:text-gray-400">
                      AI Confidence
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {Math.round(aiBrief.ai_confidence * 100)}%
                    </div>
                  </div>
                </div>
                {aiBrief.missing_info?.length > 0 && (
                  <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-sm text-gray-800 dark:text-gray-200">
                    <strong>AI Suggestions:</strong>{" "}
                    {aiBrief.missing_info.join(", ")}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Click &quot;Next&quot; to generate AI brief
              </p>
            )}
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Your Matched Freelancers
            </h2>
            {hireSuccess ? (
              <div className="text-center py-10 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="text-[48px] mb-3">✅</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Invitation Sent
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {selectedFreelancer?.display_name} can review the project. No contract starts until they accept.
                </p>
              </div>
            ) : loading ? (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                <div className="text-2xl mb-2">🔍</div>
                AI is finding the best matches...
              </div>
            ) : matches.length > 0 ? (
              <div className="flex flex-col gap-4">
                {matches.map((m, i) => (
                  <div
                    key={m.freelancer_id}
                    className="flex gap-4 p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 items-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center font-bold text-indigo-500 dark:text-indigo-400 text-lg">
                      #{i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[16px] text-gray-900 dark:text-white">
                        {m.display_name}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-sm">
                        {m.headline || m.highlight}
                      </div>
                      <div className="flex gap-4 mt-2 text-[13px] text-gray-500 dark:text-gray-400">
                        <span>
                          Fit:{" "}
                          <strong className="text-indigo-500 dark:text-indigo-400">
                            {Math.round(m.fit_score)}%
                          </strong>
                        </span>
                        <span>
                          Skills:{" "}
                          <strong>{Math.round(m.skill_match * 100)}%</strong>
                        </span>
                        {m.hourly_rate && <span>${m.hourly_rate}/hr</span>}
                        {m.rating && <span>⭐ {m.rating}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleHire(m.freelancer_id)}
                      className="px-6 py-2.5 rounded-lg bg-indigo-500 text-white border-none cursor-pointer font-semibold text-sm hover:bg-indigo-600"
                    >
                      Invite
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p role="alert" className="text-gray-500 dark:text-gray-400 text-center py-10">
                {matchError || "No matches found. Try adjusting your requirements."}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={prevStep}
          disabled={step === 0}
          className="px-6 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Back
        </button>
        {step < STEPS.length - 1 && (
          <button
            onClick={nextStep}
            disabled={!canProceed() || loading}
            className="px-6 py-2.5 rounded-lg bg-indigo-500 text-white border-none cursor-pointer font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:bg-indigo-600"
          >
            {loading ? "Processing..." : step === 4 ? "Find Matches" : "Next"}
          </button>
        )}
      </div>
        </div>
      )}
    </div>
  );
}
