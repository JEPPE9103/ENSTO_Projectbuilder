"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AppShellContextValue = {
  rightPanel: ReactNode | null;
  setRightPanel: (node: ReactNode | null) => void;
};

const AppShellContext = createContext<AppShellContextValue | null>(null);

export function AppShellProvider({ children }: { children: ReactNode }) {
  const [rightPanel, setRightPanelState] = useState<ReactNode | null>(null);
  const setRightPanel = useCallback((node: ReactNode | null) => {
    setRightPanelState(node);
  }, []);

  const value = useMemo(
    () => ({ rightPanel, setRightPanel }),
    [rightPanel, setRightPanel],
  );

  return (
    <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>
  );
}

export function useAppShell() {
  const ctx = useContext(AppShellContext);
  if (!ctx) {
    throw new Error("useAppShell must be used within AppShellProvider");
  }
  return ctx;
}
