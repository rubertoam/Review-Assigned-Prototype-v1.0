import { FlowProvider } from "./flows/FlowContext";
import { ReviewFlowRouter } from "./flows/ReviewFlowRouter";
import { ScreeningResultsTable } from "./components/ScreeningResultsTable";

function getView(): "table" | "app" {
  if (typeof window === "undefined") return "app";
  return new URLSearchParams(window.location.search).get("view") === "table" ? "table" : "app";
}

export default function App() {
  if (getView() === "table") {
    return (
      <div className="min-h-screen bg-[#fafafb] p-6 md:p-10 flex flex-col items-stretch">
        <div className="mx-auto w-full max-w-[1100px] shrink-0">
          <ScreeningResultsTable className="w-full" />
        </div>
      </div>
    );
  }

  return (
    <FlowProvider>
      <ReviewFlowRouter />
    </FlowProvider>
  );
}
