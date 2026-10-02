import { useMemo, useState, type ReactNode } from "react";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import {
  AceDropdownMenu,
  type AceDropdownMenuEntry,
} from "@ace-ds/components/molecules/AceDropdownMenu/AceDropdownMenu";
import { ThemeProvider } from "../context/ThemeContext";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { ScreeningStatusBadge } from "./ScreeningStatusBadge";
import { ReviewFlowSiteHeader } from "./ReviewFlowSiteHeader";
import { cn } from "./ui/utils";

const widgetIconButtonClass = cn(
  "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)]",
  "border border-solid border-[var(--screening-border-strong)] bg-[var(--screening-surface)]",
  "text-[var(--screening-text-secondary)]",
  "transition-[background-color,color] duration-[var(--ace-motion-duration-fast)]",
  "[transition-timing-function:var(--ace-motion-ease-standard)]",
  "hover:bg-[var(--screening-surface-hover)] hover:text-[var(--screening-text-primary)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--screening-primary-ring-offset)]",
);

const ANALYST_OPTIONS = [
  { value: "all", label: "All analysts" },
  { value: "me", label: "Assigned to me" },
  { value: "unassigned", label: "Unassigned" },
] as const;

const WORKFLOW_OPTIONS = [
  { value: "all", label: "All workflows" },
  { value: "my-work", label: "My Work" },
  { value: "compliance", label: "Compliance" },
  { value: "ai", label: "AI Workbench" },
] as const;

const STEP_OPTIONS = [
  { value: "all", label: "All steps" },
  { value: "open", label: "Open" },
  { value: "in-review", label: "In Review" },
  { value: "pending-docs", label: "Pending Documents" },
] as const;

type FilterOption = { value: string; label: string };

const QUEUE_KPIS = [
  {
    id: "open",
    label: "Open alerts",
    value: "248",
    hint: "Across selected workflows",
    tone: "default" as const,
  },
  {
    id: "aging",
    label: "Aging 7+ days",
    value: "36",
    hint: "Needs triage soon",
    tone: "warn" as const,
  },
  {
    id: "ai",
    label: "AI awaiting review",
    value: "19",
    hint: "Escalate + Suspected Safe",
    tone: "default" as const,
  },
  {
    id: "cleared",
    label: "Cleared today",
    value: "54",
    hint: "Safe / False Positive",
    tone: "positive" as const,
  },
] as const;

const QUEUE_MIX = [
  { id: "my-work", label: "My Work", count: 142, color: "var(--ace-button-blue-500)" },
  { id: "compliance", label: "Compliance", count: 61, color: "var(--ace-status-pill-orange-dot)" },
  { id: "ai", label: "AI Workbench", count: 45, color: "var(--ace-secondary-teal-500)" },
] as const;

const ATTENTION_ROWS = [
  {
    id: "1",
    client: "Muammar Qadhafi",
    alerts: 7,
    age: "12d",
    workflow: "My Work",
    status: "New",
  },
  {
    id: "2",
    client: "Bank of Iran",
    alerts: 3,
    age: "9d",
    workflow: "Compliance",
    status: "Documents Required",
  },
  {
    id: "3",
    client: "John Smith",
    alerts: 110,
    age: "4d",
    workflow: "AI Workbench",
    status: "AI-Escalate",
  },
  {
    id: "4",
    client: "Mr. Jose A Gonzalez",
    alerts: 8,
    age: "6d",
    workflow: "My Work",
    status: "New",
  },
  {
    id: "5",
    client: "Jane Doe",
    alerts: 5,
    age: "3d",
    workflow: "AI Workbench",
    status: "AI-Suspected Safe",
  },
] as const;

function WidgetFilterSelect({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string;
  value: string;
  options: readonly FilterOption[];
  onValueChange: (value: string) => void;
}) {
  const triggerLabel = options.find((option) => option.value === value)?.label ?? value;
  const items = useMemo((): AceDropdownMenuEntry[] => {
    return [
      {
        type: "radioGroup",
        value,
        onValueChange,
        options: options.map((option) => ({
          value: option.value,
          label: option.label,
        })),
      },
    ];
  }, [onValueChange, options, value]);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className={cn(
          aceTypography(ACE_TYPE.p1Regular),
          "shrink-0 text-[var(--screening-text-primary)]",
        )}
      >
        {label}
      </span>
      <AceDropdownMenu
        triggerLabel={triggerLabel}
        triggerMode="field"
        size="sm"
        panelWidth="wide"
        align="start"
        className="!min-w-[9.5rem]"
        items={items}
      />
    </div>
  );
}

function WorkbenchWidgetShell({
  title,
  subtitle,
  filters,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  filters?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden",
        "rounded-[var(--radius-md)] border border-solid border-[var(--screening-border-strong)]",
        "bg-[var(--screening-surface)]",
        className,
      )}
      aria-label={title}
    >
      <header className="flex shrink-0 items-start justify-between gap-3 px-4 pb-2 pt-4">
        <div className="min-w-0">
          <h2
            className={cn(
              aceTypography(ACE_TYPE.h6Bold),
              "m-0 text-[var(--screening-text-primary)]",
            )}
          >
            {title}
          </h2>
          {subtitle ? (
            <p
              className={cn(
                aceTypography(ACE_TYPE.captionSemiBold),
                "m-0 mt-0.5 text-[var(--screening-text-muted)]",
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" aria-label={`Refresh ${title}`} className={widgetIconButtonClass}>
            <MaterialSymbol name="refresh" size="md" className="text-current" />
          </button>
          <button type="button" aria-label={`${title} options`} className={widgetIconButtonClass}>
            <MaterialSymbol name="more_horiz" size="md" className="text-current" />
          </button>
        </div>
      </header>

      {filters != null ? (
        <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-3 px-4 pb-3">
          {filters}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 px-4 pb-4">{children}</div>
    </section>
  );
}

function QueueSnapshotWidget() {
  const [analyst, setAnalyst] = useState(ANALYST_OPTIONS[0].value);
  const [workflow, setWorkflow] = useState(WORKFLOW_OPTIONS[0].value);

  return (
    <WorkbenchWidgetShell
      title="Queue Snapshot"
      subtitle="Volume at a glance"
      filters={
        <>
          <WidgetFilterSelect
            label="Analyst:"
            value={analyst}
            options={ANALYST_OPTIONS}
            onValueChange={setAnalyst}
          />
          <WidgetFilterSelect
            label="Workflow:"
            value={workflow}
            options={WORKFLOW_OPTIONS}
            onValueChange={setWorkflow}
          />
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        {QUEUE_KPIS.map((kpi) => (
          <div
            key={kpi.id}
            className="flex min-w-0 flex-col gap-1 rounded-[var(--radius-sm)] border border-[var(--screening-border-row)] px-3 py-2.5"
          >
            <p
              className={cn(
                aceTypography(ACE_TYPE.captionBold),
                "m-0 text-[var(--screening-text-secondary)]",
              )}
            >
              {kpi.label}
            </p>
            <p
              className={cn(
                aceTypography(ACE_TYPE.p1Bold),
                "m-0 text-[1.375rem] leading-none tabular-nums",
                kpi.tone === "warn" && "text-[var(--ace-error-500)]",
                kpi.tone === "positive" && "text-[var(--ace-secondary-teal-600,#0f766e)]",
                kpi.tone === "default" && "text-[var(--screening-text-primary)]",
              )}
            >
              {kpi.value}
            </p>
            <p
              className={cn(
                aceTypography(ACE_TYPE.captionSemiBold),
                "m-0 text-[var(--screening-text-muted)]",
              )}
            >
              {kpi.hint}
            </p>
          </div>
        ))}
      </div>
    </WorkbenchWidgetShell>
  );
}

function WorkflowMixWidget() {
  const [analyst, setAnalyst] = useState(ANALYST_OPTIONS[0].value);
  const total = QUEUE_MIX.reduce((sum, part) => sum + part.count, 0);

  return (
    <WorkbenchWidgetShell
      title="Open by Workflow"
      subtitle="Where open alerts sit today"
      filters={
        <WidgetFilterSelect
          label="Analyst:"
          value={analyst}
          options={ANALYST_OPTIONS}
          onValueChange={setAnalyst}
        />
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-3">
          <p
            className={cn(
              aceTypography(ACE_TYPE.p1SemiBold),
              "m-0 text-[var(--screening-text-primary)]",
            )}
          >
            Distribution
          </p>
          <p
            className={cn(
              aceTypography(ACE_TYPE.captionSemiBold),
              "m-0 tabular-nums text-[var(--screening-text-muted)]",
            )}
          >
            {total} alerts
          </p>
        </div>
        <div
          className="flex h-3 w-full overflow-hidden rounded-full bg-[var(--screening-surface-muted)]"
          role="img"
          aria-label={QUEUE_MIX.map((part) => `${part.label} ${part.count}`).join(", ")}
        >
          {QUEUE_MIX.map((part) => (
            <div
              key={part.id}
              className="h-full min-w-[4px]"
              style={{
                width: `${(part.count / total) * 100}%`,
                backgroundColor: part.color,
              }}
              title={`${part.label}: ${part.count}`}
            />
          ))}
        </div>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {QUEUE_MIX.map((part) => (
            <li
              key={part.id}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--screening-border-row)] px-3 py-2"
            >
              <span
                className={cn(
                  aceTypography(ACE_TYPE.p1Regular),
                  "inline-flex min-w-0 items-center gap-2 text-[var(--screening-text-primary)]",
                )}
              >
                <span
                  className="size-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: part.color }}
                  aria-hidden
                />
                {part.label}
              </span>
              <span
                className={cn(
                  aceTypography(ACE_TYPE.p1Bold),
                  "tabular-nums text-[var(--screening-text-primary)]",
                )}
              >
                {part.count}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </WorkbenchWidgetShell>
  );
}

function NeedsAttentionWidget() {
  const [analyst, setAnalyst] = useState(ANALYST_OPTIONS[0].value);
  const [workflow, setWorkflow] = useState(WORKFLOW_OPTIONS[0].value);
  const [step, setStep] = useState(STEP_OPTIONS[0].value);

  return (
    <WorkbenchWidgetShell
      title="Needs Attention"
      subtitle="Oldest / highest volume first · jump into Workbench"
      className="lg:col-span-2"
      filters={
        <>
          <WidgetFilterSelect
            label="Analyst:"
            value={analyst}
            options={ANALYST_OPTIONS}
            onValueChange={setAnalyst}
          />
          <WidgetFilterSelect
            label="Workflow:"
            value={workflow}
            options={WORKFLOW_OPTIONS}
            onValueChange={setWorkflow}
          />
          <WidgetFilterSelect
            label="Step:"
            value={step}
            options={STEP_OPTIONS}
            onValueChange={setStep}
          />
        </>
      }
    >
      <div className="overflow-hidden rounded-[var(--radius-sm)] border border-[var(--screening-border-row)]">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[var(--screening-surface-muted)]">
            <tr>
              {["Client", "Alerts", "Age", "Workflow", "Status"].map((heading) => (
                <th
                  key={heading}
                  className={cn(
                    aceTypography(ACE_TYPE.captionBold),
                    "px-3 py-2 text-[var(--screening-text-secondary)]",
                    heading === "Alerts" || heading === "Age" ? "text-right" : "text-left",
                  )}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ATTENTION_ROWS.map((row) => (
              <tr
                key={row.id}
                className="border-t border-[var(--screening-border-row)] bg-[var(--screening-surface)]"
              >
                <td className="px-3 py-2.5">
                  <button
                    type="button"
                    className={cn(
                      aceTypography(ACE_TYPE.p1Regular),
                      "cursor-pointer border-0 bg-transparent p-0 text-left text-[var(--screening-primary)]",
                      "hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)]",
                    )}
                  >
                    {row.client}
                  </button>
                </td>
                <td
                  className={cn(
                    aceTypography(ACE_TYPE.p1Regular),
                    "px-3 py-2.5 text-right tabular-nums text-[var(--screening-text-primary)]",
                  )}
                >
                  {row.alerts}
                </td>
                <td
                  className={cn(
                    aceTypography(ACE_TYPE.p1Regular),
                    "px-3 py-2.5 text-right tabular-nums",
                    row.age.endsWith("d") && Number.parseInt(row.age, 10) >= 7
                      ? "text-[var(--ace-error-500)]"
                      : "text-[var(--screening-text-primary)]",
                  )}
                >
                  {row.age}
                </td>
                <td
                  className={cn(
                    aceTypography(ACE_TYPE.p1Regular),
                    "px-3 py-2.5 text-[var(--screening-text-secondary)]",
                  )}
                >
                  {row.workflow}
                </td>
                <td className="px-3 py-2.5">
                  <ScreeningStatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WorkbenchWidgetShell>
  );
}

/** Scratch space for ideating Workbench dashboard widgets. */
export function DashboardsIdeationPage() {
  return (
    <ThemeProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-[var(--screening-surface-muted)] text-[var(--screening-text-primary)]">
        <ReviewFlowSiteHeader />

        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-4 py-3 md:px-8">
          <h1
            className={cn(
              aceTypography(ACE_TYPE.h6Bold),
              "m-0 text-base leading-[1.65] text-[var(--screening-text-primary)]",
            )}
          >
            Dashboards
          </h1>
        </div>

        <main className="min-h-0 flex-1 overflow-auto px-4 py-5 md:px-8 md:py-6">
          <div className="mx-auto flex w-full max-w-[72rem] flex-col gap-4">
            <p
              className={cn(
                aceTypography(ACE_TYPE.p1Regular),
                "m-0 text-[var(--screening-text-secondary)]",
              )}
            >
              Ideation v2 — same content split into three widgets so each has one job: snapshot KPIs,
              workflow mix, and an actionable attention list.
            </p>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <QueueSnapshotWidget />
              <WorkflowMixWidget />
              <NeedsAttentionWidget />
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
