import { beforeEach, afterEach } from 'bun:test'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Global test setup
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}