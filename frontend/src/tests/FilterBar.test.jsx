import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import FilterBar from '../components/FilterBar'

const defaultProps = {
  statusFilter: 'all',
  setStatusFilter: jest.fn(),
  typeFilters: ['all'],
  toggleTypeFilter: jest.fn(),
}

beforeEach(() => jest.clearAllMocks())

describe('FilterBar — rendering', () => {
  test('renders all status filter buttons', () => {
    render(<FilterBar {...defaultProps} />)
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Planned')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  test('renders all type filter buttons', () => {
    render(<FilterBar {...defaultProps} />)
    expect(screen.getByText('Games')).toBeInTheDocument()
    expect(screen.getByText('Films')).toBeInTheDocument()
    expect(screen.getByText('Series')).toBeInTheDocument()
  })

  test('renders two "All" buttons (one per axis)', () => {
    render(<FilterBar {...defaultProps} />)
    expect(screen.getAllByText('All')).toHaveLength(2)
  })
})

describe('FilterBar — active styles', () => {
  test('active status filter has accent style', () => {
    render(<FilterBar {...defaultProps} statusFilter="Done" />)
    expect(screen.getByText('Done')).toHaveClass('bg-accent')
  })

  test('inactive status filter does not have accent style', () => {
    render(<FilterBar {...defaultProps} statusFilter="Done" />)
    expect(screen.getByText('Planned')).not.toHaveClass('bg-accent')
  })

  test('active type filter has accent style', () => {
    render(<FilterBar {...defaultProps} typeFilters={['game']} />)
    expect(screen.getByText('Games')).toHaveClass('bg-accent')
  })

  test('inactive type filter does not have accent style', () => {
    render(<FilterBar {...defaultProps} typeFilters={['game']} />)
    expect(screen.getByText('Films')).not.toHaveClass('bg-accent')
  })
})

describe('FilterBar — interactions', () => {
  test('calls setStatusFilter with correct value when status button clicked', () => {
    const setStatusFilter = jest.fn()
    render(<FilterBar {...defaultProps} setStatusFilter={setStatusFilter} />)
    fireEvent.click(screen.getByText('Done'))
    expect(setStatusFilter).toHaveBeenCalledWith('Done')
  })

  test('calls setStatusFilter with "all" when All status button clicked', () => {
    const setStatusFilter = jest.fn()
    render(<FilterBar {...defaultProps} setStatusFilter={setStatusFilter} />)
    fireEvent.click(screen.getAllByText('All')[0])
    expect(setStatusFilter).toHaveBeenCalledWith('all')
  })

  test('calls toggleTypeFilter with "game" when Games button clicked', () => {
    const toggleTypeFilter = jest.fn()
    render(<FilterBar {...defaultProps} toggleTypeFilter={toggleTypeFilter} />)
    fireEvent.click(screen.getByText('Games'))
    expect(toggleTypeFilter).toHaveBeenCalledWith('game')
  })

  test('calls toggleTypeFilter with "movie" when Films button clicked', () => {
    const toggleTypeFilter = jest.fn()
    render(<FilterBar {...defaultProps} toggleTypeFilter={toggleTypeFilter} />)
    fireEvent.click(screen.getByText('Films'))
    expect(toggleTypeFilter).toHaveBeenCalledWith('movie')
  })

  test('calls toggleTypeFilter with "series" when Series button clicked', () => {
    const toggleTypeFilter = jest.fn()
    render(<FilterBar {...defaultProps} toggleTypeFilter={toggleTypeFilter} />)
    fireEvent.click(screen.getByText('Series'))
    expect(toggleTypeFilter).toHaveBeenCalledWith('series')
  })
})
