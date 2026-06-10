import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_USER_FLOW_ID,
  getUserFlowDefinition,
  readStoredUserFlowId,
  writeStoredUserFlowId,
  type UserFlowDefinition,
  type UserFlowId,
} from "./flowTypes";

type FlowContextValue = {
  flowId: UserFlowId;
  currentFlow: UserFlowDefinition;
  setFlowId: (flowId: UserFlowId) => void;
};

const FlowContext = createContext<FlowContextValue | null>(null);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [flowId, setFlowIdState] = useState<UserFlowId>(() => readStoredUserFlowId());

  const setFlowId = useCallback((nextFlowId: UserFlowId) => {
    setFlowIdState(nextFlowId);
    writeStoredUserFlowId(nextFlowId);
  }, []);

  const value = useMemo(
    () => ({
      flowId,
      currentFlow: getUserFlowDefinition(flowId),
      setFlowId,
    }),
    [flowId, setFlowId],
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useUserFlow() {
  const ctx = useContext(FlowContext);
  if (!ctx) {
    throw new Error("useUserFlow must be used within FlowProvider");
  }
  return ctx;
}

export { DEFAULT_USER_FLOW_ID };
