import type { SweetAlertIcon, SweetAlertOptions } from "sweetalert2";

export type AlertOptions = {
  description?: string;
} & Omit<SweetAlertOptions, "title" | "text" | "icon">;

const baseOptions: Pick<SweetAlertOptions, "confirmButtonColor" | "cancelButtonColor"> = {
  confirmButtonColor: "#f97316",
  cancelButtonColor: "#94a3b8",
};

const getSwal = async () => {
  const { default: Swal } = await import("sweetalert2");
  return Swal;
};

const showAlert = async (icon: SweetAlertIcon, title: string, options?: AlertOptions) => {
  const { description, ...rest } = options ?? {};
  const Swal = await getSwal();

  return Swal.fire({
    icon,
    title,
    text: description,
    ...baseOptions,
    ...rest,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
};

export const alert = {
  success: (title: string, options?: AlertOptions) =>
    showAlert("success", title, { timer: 2200, showConfirmButton: false, ...options }),
  error: (title: string, options?: AlertOptions) =>
    showAlert("error", title, { showConfirmButton: true, ...options }),
  info: (title: string, options?: AlertOptions) =>
    showAlert("info", title, { timer: 2200, showConfirmButton: false, ...options }),
  warning: (title: string, options?: AlertOptions) =>
    showAlert("warning", title, { showConfirmButton: true, ...options }),
  confirm: async (
    title: string,
    options?: AlertOptions & { confirmText?: string; cancelText?: string }
  ) => {
    const Swal = await getSwal();
    return Swal.fire({
      icon: "warning",
      title,
      text: options?.description,
      showCancelButton: true,
      confirmButtonText: options?.confirmText ?? "ยืนยัน",
      cancelButtonText: options?.cancelText ?? "ยกเลิก",
      focusCancel: true,
      ...baseOptions,
      ...options,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  },
};
