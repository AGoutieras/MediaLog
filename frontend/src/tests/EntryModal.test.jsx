import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import EntryModal from '../components/EntryModal'

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ token: 'mock-token' }),
}))

global.fetch = jest.fn()

const mockGameMedia = {
  external_id: '1942',
  title: 'The Witcher 3',
  year: '2015',
  cover_url: 'https://example.com/cover.jpg',
  media_type: 'game',
  slug: 'the-witcher-3',
  platforms: [
    { id: 6, name: 'PC', abbreviation: 'PC' },
    { id: 167, name: 'PlayStation 5', abbreviation: 'PS5' },
  ],
}

const mockMovieMedia = {
  external_id: '550',
  title: 'Fight Club',
  year: '1999',
  cover_url: 'https://example.com/cover.jpg',
  media_type: 'movie',
}

const mockSeriesMedia = {
  external_id: '1396',
  title: 'Breaking Bad',
  year: '2008',
  cover_url: 'https://example.com/cover.jpg',
  media_type: 'series',
}

const defaultProps = {
  media: mockGameMedia,
  onClose: jest.fn(),
  onAdd: jest.fn(),
  selectedStatus: 'Planned',
}

beforeEach(() => {
  jest.clearAllMocks()
  fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ providers: [] }),
  })
})

describe('EntryModal — rendering', () => {
  test('renders the media title', () => {
    render(<EntryModal {...defaultProps} />)
    expect(screen.getByText('The Witcher 3')).toBeInTheDocument()
  })

  test('renders the media year', () => {
    render(<EntryModal {...defaultProps} />)
    expect(screen.getByText('2015')).toBeInTheDocument()
  })

  test('renders the note textarea', () => {
    render(<EntryModal {...defaultProps} />)
    expect(screen.getByPlaceholderText('Add a note...')).toBeInTheDocument()
  })

  test('shows "Add to" header in add mode', () => {
    render(<EntryModal {...defaultProps} isEditing={false} />)
    expect(screen.getByText("Add to 'Planned'")).toBeInTheDocument()
  })

  test('shows "Edit entry" header in edit mode', () => {
    render(<EntryModal {...defaultProps} isEditing={true} />)
    expect(screen.getByText('Edit entry')).toBeInTheDocument()
  })

  test('pre-fills note in edit mode', () => {
    render(
      <EntryModal {...defaultProps} isEditing={true} initialNote="My note" />
    )
    expect(screen.getByPlaceholderText('Add a note...').value).toBe('My note')
  })
})

describe('EntryModal — date labels per status', () => {
  test('shows "Planned for" when status is Planned', () => {
    render(<EntryModal {...defaultProps} selectedStatus="Planned" />)
    expect(screen.getByText('Planned for')).toBeInTheDocument()
  })

  test('shows "Started on" for game when status is In Progress', () => {
    render(<EntryModal {...defaultProps} selectedStatus="In Progress" />)
    expect(screen.getByText('Started on')).toBeInTheDocument()
  })

  test('hides "Finished on" when status is Planned', () => {
    render(<EntryModal {...defaultProps} selectedStatus="Planned" />)
    expect(screen.queryByText('Finished on')).not.toBeInTheDocument()
  })

  test('hides "Finished on" when status is In Progress', () => {
    render(<EntryModal {...defaultProps} selectedStatus="In Progress" />)
    expect(screen.queryByText('Finished on')).not.toBeInTheDocument()
  })

  test('shows "Finished on" for game when status is Done', () => {
    render(<EntryModal {...defaultProps} selectedStatus="Done" />)
    expect(screen.getByText('Finished on')).toBeInTheDocument()
  })
})

describe('EntryModal — date labels per media type', () => {
  test('shows "Watched on" for movies', () => {
    render(
      <EntryModal
        {...defaultProps}
        media={mockMovieMedia}
        selectedStatus="Done"
      />
    )
    expect(screen.getByText('Watched on')).toBeInTheDocument()
  })

  test('hides "Finished on" for movies', () => {
    render(
      <EntryModal
        {...defaultProps}
        media={mockMovieMedia}
        selectedStatus="Done"
      />
    )
    expect(screen.queryByText('Finished on')).not.toBeInTheDocument()
  })

  test('shows "Started watching" for series', () => {
    render(
      <EntryModal
        {...defaultProps}
        media={mockSeriesMedia}
        selectedStatus="Done"
      />
    )
    expect(screen.getByText('Started watching')).toBeInTheDocument()
  })

  test('shows "Finished watching" for series when Done', () => {
    render(
      <EntryModal
        {...defaultProps}
        media={mockSeriesMedia}
        selectedStatus="Done"
      />
    )
    expect(screen.getByText('Finished watching')).toBeInTheDocument()
  })
})

describe('EntryModal — game-specific fields', () => {
  test('shows Playtime when not Planned', () => {
    render(<EntryModal {...defaultProps} selectedStatus="In Progress" />)
    expect(screen.getByText('Playtime')).toBeInTheDocument()
  })

  test('hides Playtime when status is Planned', () => {
    render(<EntryModal {...defaultProps} selectedStatus="Planned" />)
    expect(screen.queryByText('Playtime')).not.toBeInTheDocument()
  })

  test('shows Completion when not Planned', () => {
    render(<EntryModal {...defaultProps} selectedStatus="Done" />)
    expect(screen.getByText('Completion')).toBeInTheDocument()
  })

  test('hides Completion when status is Planned', () => {
    render(<EntryModal {...defaultProps} selectedStatus="Planned" />)
    expect(screen.queryByText('Completion')).not.toBeInTheDocument()
  })

  test('hides Playtime for movies', () => {
    render(
      <EntryModal
        {...defaultProps}
        media={mockMovieMedia}
        selectedStatus="Done"
      />
    )
    expect(screen.queryByText('Playtime')).not.toBeInTheDocument()
  })
})

describe('EntryModal — rating', () => {
  test('shows rating only when status is Done', () => {
    render(<EntryModal {...defaultProps} selectedStatus="Done" />)
    expect(screen.getByText('Rating')).toBeInTheDocument()
  })

  test('hides rating when status is not Done', () => {
    render(<EntryModal {...defaultProps} selectedStatus="In Progress" />)
    expect(screen.queryByText('Rating')).not.toBeInTheDocument()
  })
})

describe('EntryModal — watched before', () => {
  test('shows "Watched before" for movies', () => {
    render(
      <EntryModal
        {...defaultProps}
        media={mockMovieMedia}
        selectedStatus="Done"
      />
    )
    expect(screen.getByText('Watched before')).toBeInTheDocument()
  })

  test('shows "Watched before" for series', () => {
    render(
      <EntryModal
        {...defaultProps}
        media={mockSeriesMedia}
        selectedStatus="Done"
      />
    )
    expect(screen.getByText('Watched before')).toBeInTheDocument()
  })

  test('hides "Watched before" for games', () => {
    render(<EntryModal {...defaultProps} selectedStatus="Done" />)
    expect(screen.queryByText('Watched before')).not.toBeInTheDocument()
  })
})

describe('EntryModal — interactions', () => {
  test('calls onAdd with fields object when Confirm is clicked', () => {
    const onAdd = jest.fn()
    render(<EntryModal {...defaultProps} onAdd={onAdd} />)
    fireEvent.click(screen.getByText('Confirm'))
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        note: expect.any(String),
        platform: null,
      })
    )
  })

  test('updates note when textarea changes', () => {
    render(<EntryModal {...defaultProps} />)
    const textarea = screen.getByPlaceholderText('Add a note...')
    fireEvent.change(textarea, { target: { value: 'Great game!' } })
    expect(textarea.value).toBe('Great game!')
  })
})
