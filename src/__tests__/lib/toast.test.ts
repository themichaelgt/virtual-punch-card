import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock sonner - create mocks inside the factory to avoid hoisting issues
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(),
    promise: vi.fn(),
  },
}))

// Import after mocking
import { toast } from 'sonner'
import { showSuccess, showError, showInfo, showWarning, showLoading, showPromise } from '@/lib/toast'

// Get reference to mocked functions
const mockToast = toast as unknown as {
  success: ReturnType<typeof vi.fn>
  error: ReturnType<typeof vi.fn>
  info: ReturnType<typeof vi.fn>
  warning: ReturnType<typeof vi.fn>
  loading: ReturnType<typeof vi.fn>
  promise: ReturnType<typeof vi.fn>
}

describe('Toast Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('showSuccess', () => {
    it('should call toast.success', () => {
      showSuccess('Operation successful')
      expect(mockToast.success).toHaveBeenCalled()
    })

    it('should pass message to toast', () => {
      showSuccess('Test message')
      const calls = mockToast.success.mock.calls
      expect(calls.length).toBeGreaterThan(0)
      expect(calls[0][0]).toBe('Test message')
    })
  })

  describe('showError', () => {
    it('should call toast.error', () => {
      showError('Something went wrong')
      expect(mockToast.error).toHaveBeenCalled()
    })
  })

  describe('showInfo', () => {
    it('should call toast.info', () => {
      showInfo('Information')
      expect(mockToast.info).toHaveBeenCalled()
    })
  })

  describe('showWarning', () => {
    it('should call toast.warning', () => {
      showWarning('Warning')
      expect(mockToast.warning).toHaveBeenCalled()
    })
  })

  describe('showLoading', () => {
    it('should call toast.loading', () => {
      showLoading('Loading...')
      expect(mockToast.loading).toHaveBeenCalled()
    })
  })

  describe('showPromise', () => {
    it('should call toast.promise', async () => {
      const promise = Promise.resolve('data')
      const messages = {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error!',
      }

      showPromise(promise, messages)

      expect(mockToast.promise).toHaveBeenCalledWith(promise, messages)
    })
  })
})
