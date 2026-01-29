import { render, screen, fireEvent } from '@testing-library/react'
import { CategoryFilters } from '@/app/(routes)/directory/[category]/_components/category-filters'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock Next.js navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    toString: () => '',
    get: () => null,
  }),
}))

describe('CategoryFilters', () => {
  const defaultProps = {
    initialSearch: '',
    initialSort: 'newest',
    initialPricing: '',
    categorySlug: 'genomics',
  }

  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders correctly', () => {
    render(<CategoryFilters {...defaultProps} />)
    expect(screen.getByPlaceholderText('Search tools...')).toBeDefined()
    expect(screen.getByText('Newest First')).toBeDefined()
  })

  it('updates sort order on change', () => {
    render(<CategoryFilters {...defaultProps} />)
    const sortSelect = screen.getByTitle('Sort tools')
    
    fireEvent.change(sortSelect, { target: { value: 'oldest' } })
    
    expect(mockPush).toHaveBeenCalledWith('/directory/genomics?sort=oldest')
  })

  it('updates pricing filter on change', () => {
    render(<CategoryFilters {...defaultProps} />)
    const pricingSelect = screen.getByTitle('Filter by pricing')
    
    fireEvent.change(pricingSelect, { target: { value: 'free' } })
    
    expect(mockPush).toHaveBeenCalledWith('/directory/genomics?pricing=free')
  })
  
  it('updates search on enter key', () => {
    render(<CategoryFilters {...defaultProps} />)
    const searchInput = screen.getByPlaceholderText('Search tools...')
    
    fireEvent.keyDown(searchInput, { key: 'Enter', target: { value: 'blast' } })
    
    expect(mockPush).toHaveBeenCalledWith('/directory/genomics?q=blast')
  })
})
