// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('renders as a button element by default', () => {
    render(<Button>test</Button>)
    expect(screen.getByRole('button').tagName).toBe('BUTTON')
  })

  it('accepts a custom className', () => {
    render(<Button className="extra-class">test</Button>)
    expect(screen.getByRole('button')).toHaveClass('extra-class')
  })

  it('can be disabled', () => {
    render(<Button disabled>test</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('bg-destructive')
  })

  it('applies size classes', () => {
    render(<Button size="sm">Small</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('h-9')
  })
})
