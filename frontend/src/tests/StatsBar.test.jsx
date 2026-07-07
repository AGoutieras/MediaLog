import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import StatsBar from '../components/StatsBar'

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { username: 'testuser' }, token: 'mock-token' }),
}))

jest.mock('../components/Avatar', () => ({
  __esModule: true,
  default: ({ username }) => <div data-testid="avatar">{username}</div>,
}))

const mockEntries = [
  { status: 'In Progress', media_type: 'game' },
  { status: 'In Progress', media_type: 'movie' },
  { status: 'Planned', media_type: 'series' },
  { status: 'Done', media_type: 'game' },
  { status: 'Done', media_type: 'movie' },
  { status: 'Done', media_type: 'game' },
]

describe('StatsBar', () => {
  test('displays the username', () => {
    render(<StatsBar entries={mockEntries} />)
    expect(screen.getAllByText('testuser').length).toBeGreaterThanOrEqual(1)
  })

  test('renders avatar with correct username', () => {
    render(<StatsBar entries={mockEntries} />)
    expect(screen.getByTestId('avatar')).toHaveTextContent('testuser')
  })

  test('displays the correct total entry count', () => {
    render(<StatsBar entries={mockEntries} />)
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  test('displays the correct In Progress count', () => {
    render(<StatsBar entries={mockEntries} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  test('displays the correct Planned count', () => {
    render(<StatsBar entries={mockEntries} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  test('displays the correct Done count', () => {
    render(<StatsBar entries={mockEntries} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  test('displays all stat labels', () => {
    render(<StatsBar entries={mockEntries} />)
    expect(screen.getByText('Total entries')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Planned')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  test('displays zeros when entries list is empty', () => {
    render(<StatsBar entries={[]} />)
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(4)
  })

  test('total count updates when entries change', () => {
    const { rerender } = render(<StatsBar entries={mockEntries} />)
    expect(screen.getByText('6')).toBeInTheDocument()
    rerender(<StatsBar entries={[{ status: 'Done', media_type: 'game' }]} />)
    expect(screen.getAllByText('1')).toHaveLength(2) // total=1 et done=1
  })
})
