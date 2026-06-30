"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckCircle2, Info, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastTone = "success" | "info" | "error";

type ToastItem = {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (toast: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue>({
  showToast: () => undefined
});

const toneStyles: Record<ToastTone, { wrapper: string; icon: typeof CheckCircle2 }> = {
  success: {
    wrapper: "border-[#d5e9d7] bg-[#f4fbf4] text-[#1e5c2c]",
    icon: CheckCircle2
  },
  info: {
    wrapper: "border-[#d8deef] bg-[#f4f7fc] text-[#30559a]",
    icon: Info
  },
  error: {
    wrapper: "border-[#f0d7d2] bg-[#fff3ef] text-[#a14232]",
    icon: TriangleAlert
  }
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(1);

  const showToast = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = nextIdRef.current++;
    setToasts((current) => [...current, { ...toast, id }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 2400);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.6rem)] z-[75] flex justify-center px-4 md:bottom-6 md:justify-end">
        <div className="flex w-full max-w-sm flex-col gap-2">
          {toasts.map((toast) => {
            const Icon = toneStyles[toast.tone].icon;
            return (
              <div
                key={toast.id}
                className={cn(
                  "pointer-events-auto rounded-[1.2rem] border px-4 py-3 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.38)] backdrop-blur-sm animate-[toast-in_240ms_ease-out]",
                  toneStyles[toast.tone].wrapper
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon size={18} className="mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-5">{toast.title}</p>
                    {toast.description ? <p className="mt-0.5 text-xs leading-5 opacity-80">{toast.description}</p> : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
