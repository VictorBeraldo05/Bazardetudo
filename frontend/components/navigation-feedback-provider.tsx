"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type NavigationFeedbackContextValue = {
  startNavigation: (href?: string) => void;
};

const NavigationFeedbackContext = createContext<NavigationFeedbackContextValue>({
  startNavigation: () => undefined
});

export function NavigationFeedbackProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!pending) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setPending(false);
    }, 1600);

    return () => window.clearTimeout(timeout);
  }, [pending]);

  useEffect(() => {
    setPending(false);
  }, [pathname]);

  const value = useMemo<NavigationFeedbackContextValue>(
    () => ({
      startNavigation: () => setPending(true)
    }),
    []
  );

  return (
    <NavigationFeedbackContext.Provider value={value}>
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] origin-left transition-opacity duration-200",
          pending ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="h-full w-full animate-[navigation-progress_1.1s_ease-out_infinite] bg-[#d95a39]" />
      </div>
      {children}
    </NavigationFeedbackContext.Provider>
  );
}

export function useNavigationFeedback() {
  return useContext(NavigationFeedbackContext);
}
