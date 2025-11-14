// src/lib/toast.ts
import { toast as sonnerToast } from 'sonner'

/**
 * Toast notification utility - wrapper around Sonner
 * Provides consistent toast notifications throughout the app
 */

/**
 * Show a success toast notification
 */
export function showSuccess(message: string, description?: string) {
  return sonnerToast.success(message, {
    description,
    duration: 4000,
  })
}

/**
 * Show an error toast notification
 */
export function showError(message: string, description?: string) {
  return sonnerToast.error(message, {
    description,
    duration: 5000,
  })
}

/**
 * Show an info toast notification
 */
export function showInfo(message: string, description?: string) {
  return sonnerToast.info(message, {
    description,
    duration: 4000,
  })
}

/**
 * Show a warning toast notification
 */
export function showWarning(message: string, description?: string) {
  return sonnerToast.warning(message, {
    description,
    duration: 4000,
  })
}

/**
 * Show a loading toast notification
 * Returns a toast ID that can be used to dismiss or update the toast
 */
export function showLoading(message: string, description?: string) {
  return sonnerToast.loading(message, {
    description,
  })
}

/**
 * Show a promise toast notification
 * Automatically shows loading, success, or error based on promise state
 */
export function showPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string | ((data: T) => string)
    error: string | ((error: unknown) => string)
  }
) {
  return sonnerToast.promise(promise, messages)
}

/**
 * Dismiss a specific toast by ID
 */
export function dismissToast(toastId: string | number) {
  return sonnerToast.dismiss(toastId)
}

/**
 * Dismiss all active toasts
 */
export function dismissAllToasts() {
  return sonnerToast.dismiss()
}

// Export the raw toast object for advanced usage
export const toast = sonnerToast
