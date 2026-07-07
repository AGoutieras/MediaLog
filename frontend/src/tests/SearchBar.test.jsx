import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import SearchBar from '../components/SearchBar'

const defaultProps = {
  query: '',
  setQuery: jest.fn(),
  type: 'all',
  setType: jest.fn(),
  isSearching: false,
}

beforeEach(() => jest.clearAllMocks())

describe('SearchBar — rendering', () => {
  test('renders the search input', () => {
    render(<SearchBar {...defaultProps} />)
    expect(
      screen.getByPlaceholderText('Search games, films, series...')
    ).toBeInTheDocument()
  })

  test('renders all type filter buttons', () => {
    render(<SearchBar {...defaultProps} />)
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Games')).toBeInTheDocument()
    expect(screen.getByText('Films')).toBeInTheDocument()
    expect(screen.getByText('Series')).toBeInTheDocument()
  })

  test('does not show spinner when not searching', () => {
    render(<SearchBar {...defaultProps} isSearching={false} />)
    expect(document.querySelector('.animate-spin')).not.toBeInTheDocument()
  })

  test('shows spinner when searching', () => {
    render(<SearchBar {...defaultProps} isSearching={true} />)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  test('displays the current query value', () => {
    render(<SearchBar {...defaultProps} query="zelda" />)
    expect(screen.getByDisplayValue('zelda')).toBeInTheDocument()
  })
})

describe('SearchBar — interactions', () => {
  test('calls setQuery when input changes', () => {
    const setQuery = jest.fn()
    render(<SearchBar {...defaultProps} setQuery={setQuery} />)
    fireEvent.change(
      screen.getByPlaceholderText('Search games, films, series...'),
      {
        target: { value: 'zelda' },
      }
    )
    expect(setQuery).toHaveBeenCalledWith('zelda')
  })

  test('calls setType with "game" when Games button clicked', () => {
    const setType = jest.fn()
    render(<SearchBar {...defaultProps} setType={setType} />)
    fireEvent.click(screen.getByText('Games'))
    expect(setType).toHaveBeenCalledWith('game')
  })

  test('calls setType with "movie" when Films button clicked', () => {
    const setType = jest.fn()
    render(<SearchBar {...defaultProps} setType={setType} />)
    fireEvent.click(screen.getByText('Films'))
    expect(setType).toHaveBeenCalledWith('movie')
  })

  test('calls setType with "series" when Series button clicked', () => {
    const setType = jest.fn()
    render(<SearchBar {...defaultProps} setType={setType} />)
    fireEvent.click(screen.getByText('Series'))
    expect(setType).toHaveBeenCalledWith('series')
  })

  test('calls setType with "all" when All button clicked', () => {
    const setType = jest.fn()
    render(<SearchBar {...defaultProps} setType={setType} />)
    fireEvent.click(screen.getByText('All'))
    expect(setType).toHaveBeenCalledWith('all')
  })
})

describe('SearchBar — active styles', () => {
  test('active type button has accent style', () => {
    render(<SearchBar {...defaultProps} type="game" />)
    expect(screen.getByText('Games')).toHaveClass('bg-accent')
  })

  test('inactive type button does not have accent style', () => {
    render(<SearchBar {...defaultProps} type="game" />)
    expect(screen.getByText('Films')).not.toHaveClass('bg-accent')
  })
})
