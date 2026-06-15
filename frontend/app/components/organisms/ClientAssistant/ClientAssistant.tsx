// @AI-HINT: Agentic AI Client Assistant Widget — floating chatbot for clients only.
// Uses backend AI endpoint (llama3.3-70b via DigitalOcean) with tool calling for real actions.
// Features: freelancer search cards, cost estimates, scope planning, platform guidance.
// Renders rich tool results inline. Persists open/close state in localStorage.
"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent,
} from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api/core";
import { useAuth } from "@/hooks/useAuth";
import {
  X,
  Send,
  Bot,
  Minus,
  Star,
  Sparkles,
  ChevronRight,
} from "lucide-react";

import commonStyles from "./ClientAssistant.common.module.css";
import lightStyles from "./ClientAssistant.light.module.css";
import darkStyles from "./ClientAssistant.dark.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActionButton {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
}

interface ToolResult {
  tool_name: string;
  data: Record<string, unknown>;
  display_type:
    | "freelancer_cards"
    | "cost_estimate"
    | "market_rates"
    | "scope_plan"
    | "account_overview"
    | "my_projects"
    | "proposals_received"
    | "my_proposals"
    | "my_contracts"
    | "wallet_summary"
    | "confirm_post_project"
    | "text";
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolResults?: ToolResult[];
  suggestions?: string[];
  actionButtons?: ActionButton[];
  timestamp: Date;
  isLoading?: boolean;
}

interface WelcomeResponse {
  message: string;
  suggestions?: string[];
}

interface ChatResponse {
  message: string;
  tool_results?: ToolResult[];
  suggestions?: string[];
  action_buttons?: ActionButton[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className={commonStyles.typingDots} aria-label="Megi is thinking">
      <span />
      <span />
      <span />
    </div>
  );
}

function StarRating({ rating }: { rating?: number }) {
  const score = Math.round(rating ?? 0);
  return (
    <div className={commonStyles.starsRow} aria-label={`${score} stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={10}
          className={
            s <= score ? commonStyles.starFilled : commonStyles.starEmpty
          }
          fill={s <= score ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

interface FreelancerData {
  id?: string | number;
  full_name?: string;
  username?: string;
  title?: string;
  hourly_rate?: number;
  rating?: number;
  avatar_url?: string;
}

function FreelancerCards({
  data,
  themeStyles,
}: {
  data: Record<string, unknown>;
  themeStyles: Record<string, string>;
}) {
  const freelancers = (data.freelancers ?? []) as FreelancerData[];
  if (!freelancers.length) return null;
  return (
    <div
      className={cn(commonStyles.freelancerGrid, themeStyles.freelancerGrid)}
    >
      {freelancers.map((f, idx) => (
        <div
          key={f.id ?? idx}
          className={cn(
            commonStyles.freelancerCard,
            themeStyles.freelancerCard,
          )}
        >
          <div
            className={cn(commonStyles.avatarCircle, themeStyles.avatarCircle)}
          >
            {f.avatar_url ? (
              <img
                src={f.avatar_url}
                alt={f.full_name ?? f.username ?? "Freelancer"}
                className={commonStyles.avatarImg}
              />
            ) : (
              <span className={commonStyles.avatarInitial}>
                {(f.full_name ?? f.username ?? "F")[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className={cn(commonStyles.cardName, themeStyles.cardName)}>
            {f.full_name ?? f.username ?? "Freelancer"}
          </div>
          <div className={cn(commonStyles.cardTitle, themeStyles.cardTitle)}>
            {f.title ?? "Freelancer"}
          </div>
          <div className={cn(commonStyles.rateTag, themeStyles.rateTag)}>
            ${f.hourly_rate ?? "?"}/hr
          </div>
          <StarRating rating={f.rating} />
          <a
            href={`/freelancers/${f.id}`}
            className={cn(commonStyles.viewBtn, themeStyles.viewBtn)}
            aria-label={`View profile of ${f.full_name ?? f.username}`}
          >
            View Profile <ChevronRight size={10} />
          </a>
        </div>
      ))}
    </div>
  );
}

interface PhaseData {
  name?: string;
  cost_min?: number;
  cost_max?: number;
  duration?: string;
}

function CostEstimateCard({
  data,
  themeStyles,
}: {
  data: Record<string, unknown>;
  themeStyles: Record<string, string>;
}) {
  const phases = (data.phases ?? []) as PhaseData[];
  const tips = (data.tips ?? []) as string[];
  const totalMin = (data.total_min as number) ?? 0;
  const totalMax = (data.total_max as number) ?? 0;
  const timeline =
    (data.estimated_timeline as string) ??
    (data.total_weeks ? `${data.total_weeks} weeks` : "TBD");

  return (
    <div className={cn(commonStyles.toolCard, themeStyles.toolCard)}>
      <div
        className={cn(commonStyles.toolCardLabel, themeStyles.toolCardLabel)}
      >
        💰 Cost Estimate
      </div>
      <div className={cn(commonStyles.priceRange, themeStyles.priceRange)}>
        ${totalMin.toLocaleString()} – ${totalMax.toLocaleString()}
      </div>
      <div
        className={cn(commonStyles.timelineLabel, themeStyles.timelineLabel)}
      >
        ⏱ Timeline: {timeline}
      </div>
      {phases.length > 0 && (
        <div className={commonStyles.phaseList}>
          {phases.map((p, i) => (
            <div
              key={i}
              className={cn(commonStyles.phaseRow, themeStyles.phaseRow)}
            >
              <span className={commonStyles.phaseName}>
                {p.name ?? `Phase ${i + 1}`}
              </span>
              <span
                className={cn(commonStyles.phaseCost, themeStyles.phaseCost)}
              >
                {p.cost_min != null
                  ? `$${p.cost_min.toLocaleString()}–$${(p.cost_max ?? 0).toLocaleString()}`
                  : ""}
                {p.duration ? ` · ${p.duration}` : ""}
              </span>
            </div>
          ))}
        </div>
      )}
      {tips.slice(0, 2).map((t, i) => (
        <div key={i} className={cn(commonStyles.tipRow, themeStyles.tipRow)}>
          💡 {t}
        </div>
      ))}
    </div>
  );
}

interface RateEntry {
  role?: string;
  min?: number;
  max?: number;
  avg?: number;
  currency?: string;
}

function MarketRatesCard({
  data,
  themeStyles,
}: {
  data: Record<string, unknown>;
  themeStyles: Record<string, string>;
}) {
  const rates = (data.rates ?? []) as RateEntry[];
  return (
    <div className={cn(commonStyles.toolCard, themeStyles.toolCard)}>
      <div
        className={cn(commonStyles.toolCardLabel, themeStyles.toolCardLabel)}
      >
        📊 Market Rates
      </div>
      <div className={commonStyles.rateTable}>
        {rates.map((r, i) => (
          <div
            key={i}
            className={cn(commonStyles.rateTableRow, themeStyles.rateTableRow)}
          >
            <span className={cn(commonStyles.rateRole, themeStyles.rateRole)}>
              {r.role ?? "Specialist"}
            </span>
            <span
              className={cn(commonStyles.rateValues, themeStyles.rateValues)}
            >
              {r.min != null ? `$${r.min}` : ""}
              {r.max != null ? `–$${r.max}/hr` : ""}
              {r.avg != null ? ` · avg $${r.avg}` : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Milestone {
  title?: string;
  description?: string;
  duration?: string;
  deliverables?: string[];
}

function ScopePlanCard({
  data,
  themeStyles,
}: {
  data: Record<string, unknown>;
  themeStyles: Record<string, string>;
}) {
  const milestones = (data.milestones ?? data.phases ?? []) as Milestone[];
  const projectName = data.project_name as string | undefined;
  return (
    <div className={cn(commonStyles.toolCard, themeStyles.toolCard)}>
      <div
        className={cn(commonStyles.toolCardLabel, themeStyles.toolCardLabel)}
      >
        🗺 Scope Plan{projectName ? `: ${projectName}` : ""}
      </div>
      <div className={commonStyles.milestoneList}>
        {milestones.map((m, i) => (
          <div
            key={i}
            className={cn(commonStyles.milestoneRow, themeStyles.milestoneRow)}
          >
            <div
              className={cn(
                commonStyles.milestoneNumber,
                themeStyles.milestoneNumber,
              )}
            >
              {i + 1}
            </div>
            <div className={commonStyles.milestoneContent}>
              <div
                className={cn(
                  commonStyles.milestoneTitle,
                  themeStyles.milestoneTitle,
                )}
              >
                {m.title ?? `Milestone ${i + 1}`}
              </div>
              {m.description && (
                <div
                  className={cn(
                    commonStyles.milestoneDesc,
                    themeStyles.milestoneDesc,
                  )}
                >
                  {m.description}
                </div>
              )}
              {m.duration && (
                <div
                  className={cn(
                    commonStyles.milestoneDuration,
                    themeStyles.milestoneDuration,
                  )}
                >
                  ⏱ {m.duration}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Account-aware cards ──────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  active: "Active",
  pending: "Pending",
  disputed: "Disputed",
  submitted: "Submitted",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

function StatusBadge({ status }: { status?: string }) {
  const key = (status ?? "").toLowerCase();
  return (
    <span className={cn(commonStyles.statusBadge, commonStyles[`status_${key}`])}>
      {STATUS_LABELS[key] ?? status ?? "—"}
    </span>
  );
}

function money(n: unknown): string {
  const v = typeof n === "number" ? n : Number(n);
  if (!isFinite(v)) return "—";
  return `$${v.toLocaleString()}`;
}

function AccountOverviewCard({
  data,
  themeStyles,
}: {
  data: Record<string, unknown>;
  themeStyles: Record<string, string>;
}) {
  const isFreelancer = data.role === "freelancer";
  const stats: { label: string; value: React.ReactNode }[] = isFreelancer
    ? [
        { label: "Active contracts", value: (data.active_contracts as number) ?? 0 },
        { label: "Proposals sent", value: (data.proposals_submitted as number) ?? 0 },
        { label: "Accepted", value: (data.proposals_accepted as number) ?? 0 },
        { label: "Balance", value: money(data.balance) },
      ]
    : [
        { label: "Open projects", value: (data.open_projects as number) ?? 0 },
        { label: "In progress", value: (data.in_progress_projects as number) ?? 0 },
        { label: "Proposals in", value: (data.proposals_received as number) ?? 0 },
        { label: "Active contracts", value: (data.active_contracts as number) ?? 0 },
        { label: "Balance", value: money(data.balance) },
      ];
  return (
    <div className={cn(commonStyles.toolCard, themeStyles.toolCard)}>
      <div className={cn(commonStyles.toolCardLabel, themeStyles.toolCardLabel)}>
        📊 Account Overview
      </div>
      <div className={commonStyles.statGrid}>
        {stats.map((s, i) => (
          <div key={i} className={cn(commonStyles.statCell, themeStyles.statCell)}>
            <span className={cn(commonStyles.statValue, themeStyles.statValue)}>
              {s.value}
            </span>
            <span className={cn(commonStyles.statLabel, themeStyles.statLabel)}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ListRow {
  id?: string | number;
  title?: string;
  project_title?: string;
  status?: string;
  amount?: number;
  bid_amount?: number;
  budget_min?: number;
  budget_max?: number;
  proposals_count?: number;
  freelancer_name?: string;
  counterparty?: string;
}

function RowListCard({
  label,
  rows,
  themeStyles,
  empty,
  primary,
  secondary,
}: {
  label: string;
  rows: ListRow[];
  themeStyles: Record<string, string>;
  empty: string;
  primary: (r: ListRow) => React.ReactNode;
  secondary: (r: ListRow) => React.ReactNode;
}) {
  return (
    <div className={cn(commonStyles.toolCard, themeStyles.toolCard)}>
      <div className={cn(commonStyles.toolCardLabel, themeStyles.toolCardLabel)}>
        {label}
      </div>
      {rows.length === 0 ? (
        <div className={cn(commonStyles.emptyRow, themeStyles.emptyRow)}>{empty}</div>
      ) : (
        <div className={commonStyles.listRows}>
          {rows.map((r, i) => (
            <div key={r.id ?? i} className={cn(commonStyles.listRow, themeStyles.listRow)}>
              <div className={commonStyles.listRowMain}>
                <span className={cn(commonStyles.listRowTitle, themeStyles.listRowTitle)}>
                  {primary(r)}
                </span>
                <span className={cn(commonStyles.listRowMeta, themeStyles.listRowMeta)}>
                  {secondary(r)}
                </span>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WalletSummaryCard({
  data,
  themeStyles,
}: {
  data: Record<string, unknown>;
  themeStyles: Record<string, string>;
}) {
  const txns = (data.recent_transactions ?? []) as {
    type?: string;
    amount?: number;
    description?: string;
  }[];
  return (
    <div className={cn(commonStyles.toolCard, themeStyles.toolCard)}>
      <div className={cn(commonStyles.toolCardLabel, themeStyles.toolCardLabel)}>
        💳 {(data.label as string) ?? "Wallet"}
      </div>
      <div className={cn(commonStyles.priceRange, themeStyles.priceRange)}>
        {money(data.balance)}
      </div>
      {txns.length > 0 && (
        <div className={commonStyles.listRows}>
          {txns.map((t, i) => (
            <div key={i} className={cn(commonStyles.listRow, themeStyles.listRow)}>
              <span className={cn(commonStyles.listRowTitle, themeStyles.listRowTitle)}>
                {t.description ?? t.type ?? "Transaction"}
              </span>
              <span className={cn(commonStyles.listRowMeta, themeStyles.listRowMeta)}>
                {money(t.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfirmPostProjectCard({
  data,
  themeStyles,
}: {
  data: Record<string, unknown>;
  themeStyles: Record<string, string>;
}) {
  const draft = (data.draft ?? {}) as Record<string, unknown>;
  const endpoint =
    (data.confirm_endpoint as string) ??
    "/ai/client-assistant/actions/post-project";
  const [state, setState] = useState<"idle" | "posting" | "done" | "error">(
    "idle",
  );
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string>("");

  const handleConfirm = async () => {
    setState("posting");
    try {
      const res = await apiFetch<{ url?: string; message?: string }>(endpoint, {
        method: "POST",
        body: JSON.stringify(draft),
      });
      setResultUrl(res?.url ?? "/client/projects");
      setState("done");
    } catch (e) {
      setErrMsg(
        e instanceof Error ? e.message : "Could not post the project.",
      );
      setState("error");
    }
  };

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Title", value: String(draft.title ?? "—") },
    { label: "Category", value: String(draft.category ?? "—") },
    {
      label: "Budget",
      value: `${String(draft.budget_type ?? "Fixed")} · ${money(draft.budget_min)}–${money(draft.budget_max)}`,
    },
    { label: "Experience", value: String(draft.experience_level ?? "—") },
    { label: "Duration", value: String(draft.estimated_duration ?? "—") },
    { label: "Skills", value: String(draft.skills ?? "—") },
  ];

  return (
    <div className={cn(commonStyles.toolCard, themeStyles.toolCard)}>
      <div className={cn(commonStyles.toolCardLabel, themeStyles.toolCardLabel)}>
        📝 Review project before posting
      </div>
      {String(draft.description ?? "") && (
        <p className={cn(commonStyles.confirmDesc, themeStyles.confirmDesc)}>
          {String(draft.description)}
        </p>
      )}
      <div className={commonStyles.listRows}>
        {fields.map((f, i) => (
          <div key={i} className={cn(commonStyles.listRow, themeStyles.listRow)}>
            <span className={cn(commonStyles.listRowMeta, themeStyles.listRowMeta)}>
              {f.label}
            </span>
            <span className={cn(commonStyles.listRowTitle, themeStyles.listRowTitle)}>
              {f.value}
            </span>
          </div>
        ))}
      </div>

      {state === "done" ? (
        <div className={cn(commonStyles.confirmSuccess, themeStyles.confirmSuccess)}>
          ✅ Project posted!{" "}
          <a href={resultUrl ?? "/client/projects"} className={commonStyles.confirmLink}>
            View it →
          </a>
        </div>
      ) : (
        <div className={commonStyles.actionButtonsRow}>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={state === "posting"}
            className={cn(
              commonStyles.actionBtn,
              commonStyles.actionBtnPrimary,
              themeStyles.actionBtnPrimary,
            )}
          >
            {state === "posting" ? "Posting…" : "Confirm & Post"}
          </button>
        </div>
      )}
      {state === "error" && (
        <div className={cn(commonStyles.confirmError, themeStyles.confirmError)}>
          {errMsg}
        </div>
      )}
    </div>
  );
}

function ToolResultRenderer({
  result,
  themeStyles,
}: {
  result: ToolResult;
  themeStyles: Record<string, string>;
}) {
  const data = result.data;
  switch (result.display_type) {
    case "freelancer_cards":
      return <FreelancerCards data={data} themeStyles={themeStyles} />;
    case "cost_estimate":
      return <CostEstimateCard data={data} themeStyles={themeStyles} />;
    case "market_rates":
      return <MarketRatesCard data={data} themeStyles={themeStyles} />;
    case "scope_plan":
      return <ScopePlanCard data={data} themeStyles={themeStyles} />;
    case "account_overview":
      return <AccountOverviewCard data={data} themeStyles={themeStyles} />;
    case "my_projects":
      return (
        <RowListCard
          label="🗂 My Projects"
          rows={(data.projects ?? []) as ListRow[]}
          themeStyles={themeStyles}
          empty="You haven't posted any projects yet."
          primary={(r) => r.title ?? "Project"}
          secondary={(r) =>
            `${money(r.budget_min)}–${money(r.budget_max)} · ${r.proposals_count ?? 0} proposals`
          }
        />
      );
    case "proposals_received":
      return (
        <RowListCard
          label="📨 Proposals Received"
          rows={(data.proposals ?? []) as ListRow[]}
          themeStyles={themeStyles}
          empty="No proposals yet."
          primary={(r) => r.freelancer_name ?? "Freelancer"}
          secondary={(r) => `${r.project_title ?? ""} · bid ${money(r.bid_amount)}`}
        />
      );
    case "my_proposals":
      return (
        <RowListCard
          label="📨 My Proposals"
          rows={(data.proposals ?? []) as ListRow[]}
          themeStyles={themeStyles}
          empty="You haven't submitted any proposals yet."
          primary={(r) => r.project_title ?? "Project"}
          secondary={(r) => `Bid ${money(r.bid_amount)}`}
        />
      );
    case "my_contracts":
      return (
        <RowListCard
          label="📑 My Contracts"
          rows={(data.contracts ?? []) as ListRow[]}
          themeStyles={themeStyles}
          empty="No contracts yet."
          primary={(r) => r.project_title ?? "Contract"}
          secondary={(r) => `${r.counterparty ?? ""} · ${money(r.amount)}`}
        />
      );
    case "wallet_summary":
      return <WalletSummaryCard data={data} themeStyles={themeStyles} />;
    case "confirm_post_project":
      return <ConfirmPostProjectCard data={data} themeStyles={themeStyles} />;
    case "text":
    default:
      return (
        <div className={cn(commonStyles.toolCard, themeStyles.toolCard)}>
          <p
            className={cn(
              commonStyles.toolTextContent,
              themeStyles.toolTextContent,
            )}
          >
            {String(
              result.data.text ??
                result.data.message ??
                JSON.stringify(result.data),
            )}
          </p>
        </div>
      );
  }
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

export default function ClientAssistant() {
  const { resolvedTheme } = useTheme();
  const { user } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // ── Theme ──────────────────────────────────────────────────────────────────
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const themeStyles = (
    resolvedTheme === "light" ? lightStyles : darkStyles
  ) as Record<string, string>;

  // ── Render for clients and freelancers ─────────────────────────────────────
  const userType = user?.user_type ?? user?.role ?? "";
  if (userType !== "client" && userType !== "freelancer") return null;

  return (
    <ClientAssistantInner
      themeStyles={themeStyles}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      hasOpened={hasOpened}
      setHasOpened={setHasOpened}
      messages={messages}
      setMessages={setMessages}
      inputValue={inputValue}
      setInputValue={setInputValue}
      isSending={isSending}
      setIsSending={setIsSending}
      messagesEndRef={messagesEndRef}
      textareaRef={textareaRef}
      panelRef={panelRef}
    />
  );
}

// ─── Inner widget (split to avoid hook-rule violations after early returns) ───

interface InnerProps {
  themeStyles: Record<string, string>;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  hasOpened: boolean;
  setHasOpened: (v: boolean) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  inputValue: string;
  setInputValue: (v: string) => void;
  isSending: boolean;
  setIsSending: (v: boolean) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  panelRef: React.RefObject<HTMLDivElement | null>;
}

function ClientAssistantInner({
  themeStyles,
  isOpen,
  setIsOpen,
  hasOpened,
  setHasOpened,
  messages,
  setMessages,
  inputValue,
  setInputValue,
  isSending,
  setIsSending,
  messagesEndRef,
  textareaRef,
}: InnerProps): React.ReactElement {
  // Restore open/closed state from localStorage on first mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("megi_assistant_open");
      if (saved === "true") setIsOpen(true);
    } catch {
      /* ignore */
    }
  }, [setIsOpen]);

  // Persist open/closed state
  const handleToggle = useCallback(() => {
    const next = !isOpen;
    setIsOpen(next);
    try {
      localStorage.setItem("megi_assistant_open", String(next));
    } catch {
      /* ignore */
    }
  }, [isOpen, setIsOpen]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 60);
  }, [messagesEndRef]);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  // ── Welcome message ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || hasOpened) return;
    setHasOpened(true);

    const loadWelcome = async () => {
      // Optimistic placeholder
      const loadingId = crypto.randomUUID();
      setMessages([
        {
          id: loadingId,
          role: "assistant",
          content: "",
          isLoading: true,
          timestamp: new Date(),
        },
      ]);

      try {
        const data = await apiFetch<WelcomeResponse>(
          "/ai/client-assistant/welcome",
        );
        setMessages([
          {
            id: loadingId,
            role: "assistant",
            content:
              data.message ??
              "Hi! I'm Megi, your AI assistant. How can I help you today?",
            suggestions: data.suggestions ?? [
              "Find me a React developer",
              "Estimate my project cost",
              "Help me write a job post",
              "What's the market rate for UI/UX?",
            ],
            timestamp: new Date(),
          },
        ]);
      } catch {
        setMessages([
          {
            id: loadingId,
            role: "assistant",
            content:
              "Hi! I'm **Megi**, your AI assistant \u{1F916}\n\nI can help you find freelancers, estimate project costs, plan your scope, and navigate MegiLance. What would you like to do?",
            suggestions: [
              "Find me a React developer",
              "Estimate my project cost",
              "Help me write a job post",
              "What's the market rate for UI/UX?",
            ],
            timestamp: new Date(),
          },
        ]);
      }
    };

    loadWelcome();
  }, [isOpen, hasOpened, setHasOpened, setMessages]);

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;

      setInputValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      setIsSending(true);

      const userMsgId = crypto.randomUUID();
      const botMsgId = crypto.randomUUID();

      // Add user message + loading bot message
      setMessages((prev) => [
        ...prev,
        {
          id: userMsgId,
          role: "user",
          content: trimmed,
          timestamp: new Date(),
        },
        {
          id: botMsgId,
          role: "assistant",
          content: "",
          isLoading: true,
          timestamp: new Date(),
        },
      ]);

      // Build conversation history (last 10 messages, excluding the loading one)
      const history = messages
        .filter((m) => !m.isLoading)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const data = await apiFetch<ChatResponse>("/ai/client-assistant/chat", {
          method: "POST",
          body: JSON.stringify({
            message: trimmed,
            conversation_history: history,
            page_context:
              typeof window !== "undefined" ? window.location.pathname : "/",
          }),
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId
              ? {
                  ...m,
                  content:
                    data.message ??
                    "I processed your request. Is there anything else I can help with?",
                  toolResults: data.tool_results,
                  suggestions: data.suggestions,
                  actionButtons: data.action_buttons,
                  isLoading: false,
                }
              : m,
          ),
        );
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId
              ? {
                  ...m,
                  content:
                    "Sorry, I encountered an error. Please try again in a moment.",
                  isLoading: false,
                }
              : m,
          ),
        );
        console.error("[ClientAssistant] Chat error:", err);
      } finally {
        setIsSending(false);
        // Re-focus input
        setTimeout(() => textareaRef.current?.focus(), 100);
      }
    },
    [
      isSending,
      messages,
      setInputValue,
      setIsSending,
      setMessages,
      textareaRef,
    ],
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  // ── Render a single message bubble ────────────────────────────────────────
  const renderMessage = (msg: Message) => {
    const isUser = msg.role === "user";

    return (
      <div
        key={msg.id}
        className={cn(
          commonStyles.messageWrapper,
          isUser
            ? commonStyles.messageWrapperUser
            : commonStyles.messageWrapperBot,
        )}
      >
        {/* Avatar for bot */}
        {!isUser && (
          <div className={cn(commonStyles.botAvatar, themeStyles.botAvatar)}>
            <Bot size={14} />
          </div>
        )}

        <div className={commonStyles.messageBubbleGroup}>
          {/* Main bubble */}
          <div
            className={cn(
              commonStyles.messageBubble,
              isUser
                ? cn(commonStyles.userBubble, themeStyles.userBubble)
                : cn(commonStyles.botBubble, themeStyles.botBubble),
            )}
          >
            {msg.isLoading ? (
              <TypingDots />
            ) : (
              <p
                className={commonStyles.bubbleText}
                style={{ whiteSpace: "pre-wrap" }}
              >
                {renderMarkdown(msg.content)}
              </p>
            )}
          </div>

          {/* Tool results */}
          {!msg.isLoading && msg.toolResults && msg.toolResults.length > 0 && (
            <div className={commonStyles.toolResultsArea}>
              {msg.toolResults.map((result, i) => (
                <ToolResultRenderer
                  key={i}
                  result={result}
                  themeStyles={themeStyles}
                />
              ))}
            </div>
          )}

          {/* Action buttons */}
          {!msg.isLoading &&
            msg.actionButtons &&
            msg.actionButtons.length > 0 && (
              <div className={commonStyles.actionButtonsRow}>
                {msg.actionButtons.map((btn, i) => (
                  <a
                    key={i}
                    href={btn.href}
                    className={cn(
                      commonStyles.actionBtn,
                      btn.variant === "secondary"
                        ? cn(
                            commonStyles.actionBtnSecondary,
                            themeStyles.actionBtnSecondary,
                          )
                        : cn(
                            commonStyles.actionBtnPrimary,
                            themeStyles.actionBtnPrimary,
                          ),
                    )}
                  >
                    {btn.label}
                  </a>
                ))}
              </div>
            )}

          {/* Suggestion chips */}
          {!msg.isLoading && msg.suggestions && msg.suggestions.length > 0 && (
            <div className={commonStyles.suggestionChips}>
              {msg.suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(s)}
                  className={cn(commonStyles.chip, themeStyles.chip)}
                  disabled={isSending}
                  aria-label={`Quick reply: ${s}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Timestamp */}
          {!msg.isLoading && (
            <time
              className={cn(commonStyles.timestamp, themeStyles.timestamp)}
              dateTime={msg.timestamp.toISOString()}
            >
              {msg.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ── Chat Panel ─────────────────────────────────────────────────────── */}
      <div
        className={cn(
          commonStyles.chatPanel,
          themeStyles.chatPanel,
          !isOpen && commonStyles.panelHidden,
        )}
        role="dialog"
        aria-modal="false"
        aria-label="Megi AI Assistant"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className={cn(commonStyles.panelHeader, themeStyles.panelHeader)}>
          <div className={commonStyles.headerLeft}>
            <div
              className={cn(
                commonStyles.headerAvatar,
                themeStyles.headerAvatar,
              )}
            >
              <Bot size={20} />
            </div>
            <div className={commonStyles.headerInfo}>
              <span className={commonStyles.headerTitle}>Megi</span>
              <span
                className={cn(
                  commonStyles.headerSubtitle,
                  themeStyles.headerSubtitle,
                )}
              >
                AI Assistant
              </span>
            </div>
          </div>
          <div className={commonStyles.headerRight}>
            <div
              className={cn(commonStyles.statusDot, themeStyles.statusDot)}
            />
            <span
              className={cn(commonStyles.statusLabel, themeStyles.statusLabel)}
            >
              Online
            </span>
            <button
              onClick={handleToggle}
              className={cn(commonStyles.minimizeBtn, themeStyles.minimizeBtn)}
              aria-label="Minimize AI assistant"
            >
              <Minus size={16} />
            </button>
            <button
              onClick={handleToggle}
              className={cn(commonStyles.closeBtn, themeStyles.closeBtn)}
              aria-label="Close AI assistant"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div
          className={cn(commonStyles.messagesArea, themeStyles.messagesArea)}
          role="log"
          aria-live="polite"
          aria-label="Conversation messages"
        >
          {messages.map((msg) => renderMessage(msg))}
          <div ref={messagesEndRef} aria-hidden="true" />
        </div>

        {/* Input row */}
        <div className={cn(commonStyles.inputRow, themeStyles.inputRow)}>
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask Megi anything…"
            className={cn(commonStyles.inputField, themeStyles.inputField)}
            rows={1}
            disabled={isSending}
            aria-label="Message input"
            aria-multiline="true"
          />
          <button
            onClick={() => sendMessage(inputValue)}
            disabled={isSending || !inputValue.trim()}
            className={cn(
              commonStyles.sendButton,
              themeStyles.sendButton,
              (!inputValue.trim() || isSending) &&
                commonStyles.sendButtonDisabled,
            )}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>

        {/* Footer branding */}
        <div className={cn(commonStyles.panelFooter, themeStyles.panelFooter)}>
          <Sparkles size={10} />
          <span>Powered by MegiLance AI · llama3.3-70b</span>
        </div>
      </div>

      {/* ── Floating trigger button ─────────────────────────────────────────── */}
      <button
        onClick={handleToggle}
        className={cn(
          commonStyles.floatingButton,
          themeStyles.floatingButton,
          isOpen && commonStyles.floatingButtonActive,
        )}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
        aria-expanded={isOpen}
        aria-controls="megi-chat-panel"
      >
        <div
          className={cn(
            commonStyles.floatingIcon,
            isOpen && commonStyles.floatingIconClose,
          )}
        >
          {isOpen ? <X size={26} /> : <Bot size={26} />}
        </div>
        {/* Pulse ring when closed */}
        {!isOpen && <div className={commonStyles.pulseRing} />}
      </button>
    </>
  );
}

// ─── Minimal Markdown renderer ─────────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Split by double newlines for paragraphs, preserve single newlines
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    // Bold: **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      // Inline code: `text`
      const codeParts = part.split(/(`[^`]+`)/g);
      return codeParts.map((cp, k) => {
        if (cp.startsWith("`") && cp.endsWith("`")) {
          return (
            <code
              key={k}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.8em",
                padding: "1px 4px",
                borderRadius: "3px",
                background: "rgba(0,0,0,0.1)",
              }}
            >
              {cp.slice(1, -1)}
            </code>
          );
        }
        return cp;
      });
    });

    nodes.push(<React.Fragment key={i}>{rendered}</React.Fragment>);
    if (i < lines.length - 1) nodes.push(<br key={`br-${i}`} />);
  });

  return nodes;
}
