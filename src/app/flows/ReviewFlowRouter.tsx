import { Level1ReviewInterface } from "./level-1/Level1ReviewInterface";
import { Level2ReviewInterface } from "./level-2/Level2ReviewInterface";
import { useUserFlow } from "./FlowContext";

export function ReviewFlowRouter() {
  const { flowId } = useUserFlow();

  switch (flowId) {
    case "level-2":
      return <Level2ReviewInterface key="level-2" />;
    case "level-1":
    default:
      return <Level1ReviewInterface key="level-1" />;
  }
}
