
// Import Sonner toaster directly
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster 
      position="bottom-right"
      toastOptions={{
        className: "border-border",
        style: {
          background: "var(--background)",
          color: "var(--foreground)",
          border: "1px solid var(--border)"
        }
      }}
    />
  );
}
