import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import EntryDetailModal from '../components/EntryDetailModal'

const mockGameEntry = {
  id: 'uuid-1',
  external_id: '1942',
  slug: 'the-witcher-3',
  title: 'The Witcher 3',
  year: '2015',
  cover_url: 'https://example.com/cover.jpg',
  media_type: 'game',
  status: 'Done',
  rating: 4.5,
  note: 'Amazing game',
  platform: 'PS5',
  start_date: '2026-01-01',
  end_date: '2026-02-01',
  playtime_hours: 80,
  completion_percentage: 90,
  watched_before: false,
}

const mockMovieEntry = {
  ...mockGameEntry,
  external_id: '550',
  slug: null,
  title: 'Fight Club',
  year: '1999',
  media_type: 'movie',
  end_date: null,
  playtime_hours: null,
  completion_percentage: null,
}

const mockSeriesEntry = {
  ...mockGameEntry,
  external_id: '1396',
  slug: null,
  title: 'Breaking Bad',
  year: '2008',
  media_type: 'series',
  end_date: '2026-04-01',
  playtime_hours: null,
  completion_percentage: null,
}

const defaultProps = {
  onClose: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
}

beforeEach(() => jest.clearAllMocks())

describe('EntryDetailModal — game', () => {
  test('renders the media title', () => {
    render(<EntryDetailModal entry={mockGameEntry} {...defaultProps} />)
    expect(screen.getByText('The Witcher 3')).toBeInTheDocument()
  })

  test('renders the media year', () => {
    render(<EntryDetailModal entry={mockGameEntry} {...defaultProps} />)
    expect(screen.getByText('2015')).toBeInTheDocument()
  })

  test('renders the media type badge', () => {
    render(<EntryDetailModal entry={mockGameEntry} {...defaultProps} />)
    expect(screen.getByText('game')).toBeInTheDocument()
  })

  test('renders the platform', () => {
    render(<EntryDetailModal entry={mockGameEntry} {...defaultProps} />)
    expect(screen.getByText('PS5')).toBeInTheDocument()
  })

  test('renders "Started on" label', () => {
    render(<EntryDetailModal entry={mockGameEntry} {...defaultProps} />)
    expect(screen.getByText('Started on')).toBeInTheDocument()
  })

  test('renders "Finished on" label', () => {
    render(<EntryDetailModal entry={mockGameEntry} {...defaultProps} />)
    expect(screen.getByText('Finished on')).toBeInTheDocument()
  })

  test('renders playtime', () => {
    render(<EntryDetailModal entry={mockGameEntry} {...defaultProps} />)
    expect(screen.getByText('Playtime')).toBeInTheDocument()
  })

  test('renders completion percentage', () => {
    render(<EntryDetailModal entry={mockGameEntry} {...defaultProps} />)
    expect(screen.getByText('Completion')).toBeInTheDocument()
  })

  test('renders the note', () => {
    render(<EntryDetailModal entry={mockGameEntry} {...defaultProps} />)
    expect(screen.getByText('Amazing game')).toBeInTheDocument()
  })

  test('renders IGDB external link', () => {
    render(<EntryDetailModal entry={mockGameEntry} {...defaultProps} />)
    const link = screen.getByText('View details')
    expect(link.closest('a')).toHaveAttribute(
      'href',
      'https://www.igdb.com/games/the-witcher-3'
    )
  })

  test('does not render external link if no slug', () => {
    render(
      <EntryDetailModal
        entry={{ ...mockGameEntry, slug: null }}
        {...defaultProps}
      />
    )
    expect(screen.queryByText('View details')).not.toBeInTheDocument()
  })

  test('calls onClose when close button is clicked', () => {
    render(<EntryDetailModal entry={mockGameEntry} {...defaultProps} />)
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  test('does not render note section when note is empty', () => {
    render(
      <EntryDetailModal
        entry={{ ...mockGameEntry, note: null }}
        {...defaultProps}
      />
    )
    expect(screen.queryByText('Note')).not.toBeInTheDocument()
  })

  test('does not render rating section when rating is null', () => {
    render(
      <EntryDetailModal
        entry={{ ...mockGameEntry, rating: null }}
        {...defaultProps}
      />
    )
    expect(screen.queryByText('Rating')).not.toBeInTheDocument()
  })
})

describe('EntryDetailModal — movie', () => {
  test('renders "Watched on" label', () => {
    render(<EntryDetailModal entry={mockMovieEntry} {...defaultProps} />)
    expect(screen.getByText('Watched on')).toBeInTheDocument()
  })

  test('does not render "Finished on" for movie', () => {
    render(<EntryDetailModal entry={mockMovieEntry} {...defaultProps} />)
    expect(screen.queryByText('Finished on')).not.toBeInTheDocument()
  })

  test('does not render Playtime for movie', () => {
    render(<EntryDetailModal entry={mockMovieEntry} {...defaultProps} />)
    expect(screen.queryByText('Playtime')).not.toBeInTheDocument()
  })

  test('does not render Completion for movie', () => {
    render(<EntryDetailModal entry={mockMovieEntry} {...defaultProps} />)
    expect(screen.queryByText('Completion')).not.toBeInTheDocument()
  })

  test('renders TMDB external link for movie', () => {
    render(<EntryDetailModal entry={mockMovieEntry} {...defaultProps} />)
    expect(screen.getByText('View details').closest('a')).toHaveAttribute(
      'href',
      'https://www.themoviedb.org/movie/550'
    )
  })
})

describe('EntryDetailModal — series', () => {
  test('renders "Started watching" label', () => {
    render(<EntryDetailModal entry={mockSeriesEntry} {...defaultProps} />)
    expect(screen.getByText('Started watching')).toBeInTheDocument()
  })

  test('renders "Finished watching" label', () => {
    render(<EntryDetailModal entry={mockSeriesEntry} {...defaultProps} />)
    expect(screen.getByText('Finished watching')).toBeInTheDocument()
  })

  test('renders TMDB external link for series', () => {
    render(<EntryDetailModal entry={mockSeriesEntry} {...defaultProps} />)
    expect(screen.getByText('View details').closest('a')).toHaveAttribute(
      'href',
      'https://www.themoviedb.org/tv/1396'
    )
  })

  test('does not render Playtime for series', () => {
    render(<EntryDetailModal entry={mockSeriesEntry} {...defaultProps} />)
    expect(screen.queryByText('Playtime')).not.toBeInTheDocument()
  })
})
