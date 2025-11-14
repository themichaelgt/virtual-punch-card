// src/components/ConfirmDialog.tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'info'
  })
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    setOptions({
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      type: 'info',
      ...opts
    })
    setIsOpen(true)

    return new Promise((resolve) => {
      setResolvePromise(() => resolve)
    })
  }

  const handleConfirm = () => {
    resolvePromise?.(true)
    setIsOpen(false)
  }

  const handleCancel = () => {
    resolvePromise?.(false)
    setIsOpen(false)
  }

  const getButtonColor = () => {
    switch (options.type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700'
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700'
      default:
        return 'bg-blue-600 hover:bg-blue-700'
    }
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            {options.title && (
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {options.title}
              </h3>
            )}
            <p className="text-gray-700 mb-6 whitespace-pre-line">
              {options.message}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors font-medium"
              >
                {options.cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 text-white rounded-md transition-colors font-medium ${getButtonColor()}`}
              >
                {options.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }
  return context.confirm
}
