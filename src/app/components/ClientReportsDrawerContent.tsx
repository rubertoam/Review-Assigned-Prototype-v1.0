import { AceDescriptiveButton } from "@ace-ds/components/molecules/AceDescriptiveButton";

/** Iconography catalog: “Export and preview” → `file_export`. */
const REPORT_ICON_NAME = "file_export";

const CLIENT_REPORTS = [
  {
    id: "list-profile",
    title: "List Profile Report",
    description: "Displays the full compliance list details for the selected matches.",
  },
  {
    id: "review-matches",
    title: "Review Matches Report",
    description: "Displays the client, status, and list details for the selected matches.",
  },
  {
    id: "match-history",
    title: "Match History Report",
    description: "Displays the full history for the selected match.",
  },
] as const;

export function ClientReportsDrawerContent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
      {CLIENT_REPORTS.map((report) => (
        <AceDescriptiveButton
          key={report.id}
          title={report.title}
          description={report.description}
          iconName={REPORT_ICON_NAME}
          className="!w-full max-w-none"
          onClick={() => {
            // Prototype: report download / generation wired later.
          }}
        />
      ))}
    </div>
  );
}
