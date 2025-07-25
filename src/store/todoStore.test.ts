import { describe, test, expect, beforeEach } from 'bun:test'
import { useTodoStore } from './todoStore'

describe('Todo Store', () => {
  beforeEach(() => {
    useTodoStore.setState({ todos: [] })
  })

  test('should add a new todo', () => {
    const { addTodo, todos } = useTodoStore.getState()
    
    addTodo('Buy groceries')
    
    const state = useTodoStore.getState()
    expect(state.todos).toHaveLength(1)
    expect(state.todos[0]).toMatchObject({
      text: 'Buy groceries',
      completed: false
    })
    expect(state.todos[0].id).toBeDefined()
  })

  test('should toggle todo completion', () => {
    const { addTodo, toggleTodo } = useTodoStore.getState()
    
    addTodo('Study TypeScript')
    const state = useTodoStore.getState()
    const todoId = state.todos[0].id
    
    toggleTodo(todoId)
    
    const updatedState = useTodoStore.getState()
    expect(updatedState.todos[0].completed).toBe(true)
    
    toggleTodo(todoId)
    const finalState = useTodoStore.getState()
    expect(finalState.todos[0].completed).toBe(false)
  })

  test('should delete a todo', () => {
    useTodoStore.getState().addTodo('Task 1')
    useTodoStore.getState().addTodo('Task 2')
    
    const state = useTodoStore.getState()
    const todoId = state.todos[0].id
    
    useTodoStore.getState().deleteTodo(todoId)
    
    const updatedState = useTodoStore.getState()
    expect(updatedState.todos).toHaveLength(1)
    expect(updatedState.todos[0].text).toBe('Task 2')
  })
})