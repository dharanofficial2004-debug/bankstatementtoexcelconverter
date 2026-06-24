"use client";

import React, { useEffect, useState, createContext, useContext, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Check, X, AlertCircle } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onRemove, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = {
    success: <Check size={16} className="text-success-600" />,
    error: <AlertCircle size={16} className="text-error-600" />,
    info: <AlertCircle size={16} className="text-primary-600" />,
  };

  const bgColors = {
    success: "bg-success-50 border-success-200",
    error: "bg-error-50 border-error-200",
    info: "bg-primary-50 border-primary-200",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg",
        "transition-all duration-300 ease-out min-w-[280px]",
        bgColors[toast.type],
        isVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
      )}
    >
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <span className="text-sm font-medium text-slate-700 flex-1">
        {toast.message}
      </span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onRemove, 300);
        }}
        className="flex-shrink-0 text-slate-400 hover:text-slate-600"
      >
        <X size={14} />
      </button>
    </div>
  );
}
