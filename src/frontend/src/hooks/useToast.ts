import { toast } from "sonner";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function showToast(
  message: string,
  type: ToastType = "info",
  options?: ToastOptions,
) {
  const config = {
    description: options?.description,
    duration: options?.duration ?? 4000,
    action: options?.action,
  };

  switch (type) {
    case "success":
      toast.success(message, config);
      break;
    case "error":
      toast.error(message, config);
      break;
    case "warning":
      toast.warning(message, config);
      break;
    default:
      toast.info(message, config);
  }
}

export function dismissToast(toastId: string | number) {
  toast.dismiss(toastId);
}
