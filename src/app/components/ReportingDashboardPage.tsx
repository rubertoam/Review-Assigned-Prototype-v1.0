import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import {
  useSidebarGroupActions,
  type SidebarGroupData,
} from "../lib/useSidebarGroupActions";
import { ReportingWorkspaceShell } from "./ReportingWorkspaceShell";
import { SidebarGroupActionModals } from "./SidebarGroupActionModals";
import { cn } from "./ui/utils";

const DASHBOARD_GROUPS: readonly SidebarGroupData[] = [
  {
    id: "kyc",
    label: "KYC",
    expanded: false,
    items: [
      { id: "kyc-media", label: "Media Classification" },
      { id: "kyc-overrides", label: "Client Overrides" },
      { id: "kyc-status", label: "Status Distribution" },
      { id: "kyc-referral", label: "Referral Resolution" },
    ],
  },
  {
    id: "watchlist",
    label: "Watchlist",
    expanded: false,
    items: [
      { id: "wl-rules", label: "Watchlist Screening Rules" },
      { id: "wl-cases", label: "Cases & Matches" },
      { id: "wl-age", label: "Open Matches by Age" },
      { id: "wl-load", label: "Load Summary" },
      { id: "wl-screening", label: "Screening Summary" },
    ],
  },
  {
    id: "payments",
    label: "Payments",
    expanded: false,
    items: [
      { id: "pay-resolution", label: "Average Resolution Time" },
      { id: "pay-rules", label: "Rules Generating Results" },
      { id: "pay-screened", label: "Screened Transactions" },
      { id: "pay-history", label: "Payment History" },
      { id: "pay-status", label: "Payment Status" },
    ],
  },
  {
    id: "general",
    label: "General",
    expanded: false,
    items: [
      { id: "gen-media", label: "Media Classification" },
      { id: "gen-overrides", label: "Client Overrides" },
      { id: "gen-status", label: "Status Distribution" },
      { id: "gen-referral", label: "Referral Resolution" },
    ],
  },
];

type MetricCardData = {
  id: string;
  label: string;
  value: string;
  points: readonly number[];
  filled: boolean;
};

type BarPoint = { month: string; open: number; cleared: number };
type DonutSegment = { id: string; label: string; value: number; color: string };

type DashboardWidgets = {
  metrics: readonly MetricCardData[];
  barTitle: string;
  barSeries: readonly BarPoint[];
  barLegend: readonly [string, string];
  donutTitle: string;
  donutSegments: readonly DonutSegment[];
};

const DEFAULT_BAR_SERIES: readonly BarPoint[] = [
  { month: "J", open: 42, cleared: 58 },
  { month: "F", open: 55, cleared: 48 },
  { month: "M", open: 38, cleared: 62 },
  { month: "A", open: 62, cleared: 52 },
  { month: "M", open: 48, cleared: 66 },
  { month: "J", open: 70, cleared: 44 },
  { month: "J", open: 58, cleared: 60 },
  { month: "A", open: 66, cleared: 50 },
  { month: "S", open: 52, cleared: 68 },
  { month: "O", open: 74, cleared: 46 },
  { month: "N", open: 60, cleared: 58 },
  { month: "D", open: 68, cleared: 54 },
];

const MEDIA_WIDGETS: DashboardWidgets = {
  metrics: [
    {
      id: "articles-reviewed",
      label: "Articles Reviewed",
      value: "2,148",
      points: [40, 44, 48, 52, 50, 58, 62, 60, 66, 72],
      filled: false,
    },
    {
      id: "flagged-media",
      label: "Flagged Media",
      value: "386",
      points: [18, 22, 20, 28, 26, 32, 30, 36, 34, 40],
      filled: false,
    },
    {
      id: "cleared-media",
      label: "Cleared Media",
      value: "1,762",
      points: [30, 34, 38, 42, 40, 48, 52, 50, 56, 60],
      filled: true,
    },
  ],
  barTitle: "Monthly Media Volume",
  barSeries: DEFAULT_BAR_SERIES,
  barLegend: ["Flagged Media", "Cleared Media"],
  donutTitle: "Media Classification Mix",
  donutSegments: [
    { id: "adverse", label: "Adverse", value: 34, color: "var(--ace-error-500)" },
    { id: "neutral", label: "Neutral", value: 28, color: "var(--ace-button-blue-400)" },
    { id: "positive", label: "Positive", value: 16, color: "var(--ace-secondary-teal-500)" },
    { id: "pep-related", label: "PEP-related", value: 14, color: "var(--ace-status-pill-orange-dot)" },
    { id: "unclassified", label: "Unclassified", value: 8, color: "var(--ace-button-purple-500)" },
  ],
};

const CASES_WIDGETS: DashboardWidgets = {
  metrics: [
    {
      id: "open-cases",
      label: "Open Cases",
      value: "1,284",
      points: [48, 52, 49, 58, 55, 62, 60, 68, 64, 72],
      filled: false,
    },
    {
      id: "true-matches",
      label: "True Matches",
      value: "326",
      points: [22, 28, 24, 30, 27, 34, 31, 38, 35, 40],
      filled: false,
    },
    {
      id: "cleared",
      label: "Cleared Matches",
      value: "4,912",
      points: [36, 40, 38, 46, 44, 52, 50, 58, 55, 62],
      filled: true,
    },
  ],
  barTitle: "Monthly Case Volume",
  barSeries: DEFAULT_BAR_SERIES,
  barLegend: ["Open Cases", "Cleared Matches"],
  donutTitle: "Match Type Distribution",
  donutSegments: [
    { id: "sanctions", label: "Sanctions", value: 32, color: "var(--ace-secondary-teal-500)" },
    { id: "pep", label: "PEP", value: 24, color: "var(--ace-button-blue-400)" },
    { id: "adverse-media", label: "Adverse Media", value: 18, color: "var(--ace-status-pill-orange-dot)" },
    { id: "watchlist", label: "Watchlist", value: 14, color: "var(--ace-error-500)" },
    { id: "ubo", label: "UBO", value: 12, color: "var(--ace-button-purple-500)" },
  ],
};

const PAYMENTS_WIDGETS: DashboardWidgets = {
  metrics: [
    {
      id: "screened",
      label: "Screened Transactions",
      value: "18,420",
      points: [50, 54, 52, 60, 58, 66, 64, 70, 68, 74],
      filled: false,
    },
    {
      id: "held",
      label: "Held for Review",
      value: "912",
      points: [20, 24, 22, 28, 26, 30, 28, 34, 32, 36],
      filled: false,
    },
    {
      id: "released",
      label: "Released",
      value: "17,508",
      points: [40, 44, 46, 50, 48, 56, 54, 60, 58, 64],
      filled: true,
    },
  ],
  barTitle: "Monthly Payment Volume",
  barSeries: DEFAULT_BAR_SERIES.map((point) => ({
    ...point,
    open: Math.round(point.open * 0.85),
    cleared: Math.round(point.cleared * 1.1),
  })),
  barLegend: ["Held for Review", "Released"],
  donutTitle: "Payment Status Mix",
  donutSegments: [
    { id: "cleared", label: "Cleared", value: 48, color: "var(--ace-secondary-teal-500)" },
    { id: "pending", label: "Pending", value: 22, color: "var(--ace-status-pill-orange-dot)" },
    { id: "blocked", label: "Blocked", value: 12, color: "var(--ace-error-500)" },
    { id: "escalated", label: "Escalated", value: 10, color: "var(--ace-button-purple-500)" },
    { id: "returned", label: "Returned", value: 8, color: "var(--ace-button-blue-400)" },
  ],
};

function widgetsForDashboard(itemId: string): DashboardWidgets {
  if (itemId.includes("media")) return MEDIA_WIDGETS;
  if (itemId.startsWith("pay-")) return PAYMENTS_WIDGETS;
  return CASES_WIDGETS;
}

function sparklinePath(points: readonly number[], width: number, height: number) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(max - min, 1);
  return points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((point - min) / range) * (height - 4) - 2;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function MetricCard({
  label,
  value,
  points,
  filled,
}: {
  label: string;
  value: string;
  points: readonly number[];
  filled: boolean;
}) {
  const width = 160;
  const height = 40;
  const path = sparklinePath(points, width, height);
  const areaPath = `${path} L${width} ${height} L0 ${height} Z`;

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--screening-border-row)]",
        "bg-[var(--screening-surface)] px-4 py-3 shadow-[var(--ace-drop-shadow-xs)]",
      )}
    >
      <p className={cn(aceTypography(ACE_TYPE.captionBold), "m-0 text-[var(--screening-text-secondary)]")}>
        {label}
      </p>
      <p className={cn(aceTypography(ACE_TYPE.p1Bold), "m-0 text-lg text-[var(--screening-text-primary)]")}>
        {value}
      </p>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-10 w-full" aria-hidden>
        {filled ? (
          <path d={areaPath} fill="var(--ace-button-blue-200)" opacity="0.55" />
        ) : null}
        <path
          d={path}
          fill="none"
          stroke={filled ? "var(--ace-button-blue-500)" : "var(--screening-text-muted)"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function VolumeChart({
  title,
  series,
  legend,
}: {
  title: string;
  series: readonly BarPoint[];
  legend: readonly [string, string];
}) {
  const max = 100;
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--screening-border-row)]",
        "bg-[var(--screening-surface)] p-4 shadow-[var(--ace-drop-shadow-xs)]",
      )}
    >
      <p className={cn(aceTypography(ACE_TYPE.p1SemiBold), "m-0 text-sm text-[var(--screening-text-primary)]")}>
        {title}
      </p>
      <div className="relative flex min-h-[12rem] flex-1 items-end gap-1.5 pt-2">
        <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[calc(100%-1.25rem)] flex-col justify-between">
          {[100, 75, 50, 25, 0].map((tick) => (
            <div key={tick} className="flex items-center gap-2">
              <span className="w-6 text-right text-[10px] text-[var(--screening-text-muted)]">{tick}</span>
              <div className="h-px flex-1 bg-[var(--screening-border-row)]" />
            </div>
          ))}
        </div>
        <div className="relative z-[1] ml-8 flex h-[calc(100%-1.25rem)] w-full items-end gap-1.5">
          {series.map((bar) => (
            <div key={bar.month} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-0.5">
              <div
                className="w-full rounded-t-[2px] bg-[var(--ace-secondary-teal-500)]"
                style={{ height: `${(bar.open / max) * 100}%` }}
              />
              <div
                className="w-full rounded-t-[2px] bg-[var(--ace-button-blue-200)]"
                style={{ height: `${(bar.cleared / max) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 pt-1">
        <span className="inline-flex items-center gap-1.5 text-xs text-[var(--screening-text-secondary)]">
          <span className="size-2.5 rounded-sm bg-[var(--ace-secondary-teal-500)]" />
          {legend[0]}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-[var(--screening-text-secondary)]">
          <span className="size-2.5 rounded-sm bg-[var(--ace-button-blue-200)]" />
          {legend[1]}
        </span>
      </div>
    </div>
  );
}

function DistributionChart({
  title,
  segments,
}: {
  title: string;
  segments: readonly DonutSegment[];
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  let offset = 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--screening-border-row)]",
        "bg-[var(--screening-surface)] p-4 shadow-[var(--ace-drop-shadow-xs)]",
      )}
    >
      <p className={cn(aceTypography(ACE_TYPE.p1SemiBold), "m-0 text-sm text-[var(--screening-text-primary)]")}>
        {title}
      </p>
      <div className="flex min-h-[12rem] flex-1 items-center gap-4">
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {segments.map((segment) => (
            <li
              key={segment.id}
              className="inline-flex items-center gap-2 text-xs text-[var(--screening-text-secondary)]"
            >
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
              {segment.label}
            </li>
          ))}
        </ul>
        <div className="relative mx-auto size-36 shrink-0">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
            {segments.map((segment) => {
              const length = (segment.value / total) * circumference;
              const dasharray = `${length} ${circumference - length}`;
              const dashoffset = -offset;
              offset += length;
              return (
                <circle
                  key={segment.id}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="16"
                  strokeDasharray={dasharray}
                  strokeDashoffset={dashoffset}
                />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

function DashboardWidgetSet({ widgets }: { widgets: DashboardWidgets }) {
  return (
    <section className="flex min-w-0 flex-1 flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {widgets.metrics.map((card) => (
          <MetricCard
            key={card.id}
            label={card.label}
            value={card.value}
            points={card.points}
            filled={card.filled}
          />
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <VolumeChart title={widgets.barTitle} series={widgets.barSeries} legend={widgets.barLegend} />
        <DistributionChart title={widgets.donutTitle} segments={widgets.donutSegments} />
      </div>
    </section>
  );
}

export function ReportingDashboardPage() {
  const actions = useSidebarGroupActions(DASHBOARD_GROUPS, {
    contextLabel: "dashboard group",
    initialSelectedItemId: "kyc-media",
  });
  const widgets = widgetsForDashboard(actions.selectedItemId);
  const pageTitle = actions.selectedItemLabel || "Dashboard";

  return (
    <ReportingWorkspaceShell
      title={pageTitle}
      newGroupLabel="New Dashboard"
      sidebarGroups={actions.sidebarGroups}
      modals={
        <SidebarGroupActionModals
          groupForm={actions.groupForm}
          onGroupNameChange={(name) =>
            actions.setGroupForm((prev) => (prev ? { ...prev, draftName: name } : prev))
          }
          onToggleItemRemoval={(itemId) =>
            actions.setGroupForm((prev) =>
              prev
                ? {
                    ...prev,
                    items: prev.items.map((item) =>
                      item.id === itemId
                        ? { ...item, markedForRemoval: !item.markedForRemoval }
                        : item,
                    ),
                  }
                : prev,
            )
          }
          onCloseGroupForm={actions.closeGroupForm}
          onSubmitGroupForm={actions.submitGroupForm}
          groupFormPrimaryDisabled={actions.groupFormPrimaryDisabled}
          deleteTarget={actions.deleteTarget}
          deleteConfirmText={actions.deleteConfirmText}
          onDeleteConfirmTextChange={actions.setDeleteConfirmText}
          onCloseDelete={actions.closeDeleteModal}
          onConfirmDelete={actions.confirmDelete}
        />
      }
    >
      <div className="bg-[var(--screening-surface-muted)] px-4 py-5 md:px-6 md:py-6">
        <div className="mx-auto w-full max-w-[96rem]">
          <DashboardWidgetSet key={actions.selectedItemId} widgets={widgets} />
        </div>
      </div>
    </ReportingWorkspaceShell>
  );
}
