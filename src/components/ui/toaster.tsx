"use client";

import { useToast } from "./use-toast";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto animate-in slide-in-from-top-full"
        >
          <Alert
            variant={toast.variant}
            className={cn(
              "relative shadow-lg cursor-pointer transition-all hover:shadow-xl",
              "border-2"
            )}
            onClick={() => removeToast(toast.id)}
          >
            {toast.title && <AlertTitle>{toast.title}</AlertTitle>}
            {toast.description && (
              <AlertDescription>{toast.description}</AlertDescription>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="absolute top-2 right-2 rounded-md p-1 text-foreground/50 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </Alert>
        </div>
      ))}
    </div>
  );
}
