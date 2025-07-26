import { describe, test, expect } from 'bun:test'
import { render, screen } from '@testing-library/react'
import '../test-setup'
import { TodoItem } from './TodoItem'

describe('TodoItem', () => {
  const mockTodo = {
    id: '1',
    text: 'Test todo',
    completed: false
  }

  test('should render todo text', () => {
    render(<TodoItem todo={mockTodo} />)
    expect(screen.getByText('Test todo')).toBeInTheDocument()
  })

  test('should show completed state', () => {
    const completedTodo = { ...mockTodo, completed: true }
    render(<TodoItem todo={completedTodo} />)
    
    const todoText = screen.getByText('Test todo')
    expect(todoText).toHaveClass('line-through')
  })
})