import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

/**
 * StatsBar Component
 * Displays the authenticated user's avatar, username, and a summary
 * of their media list broken down by status (total, in progress, planned, done).
 * Counts are derived from the entries array on each render, no separate state needed.
 */
export default function StatsBar({ entries }) {
  const { user } = useAuth()
  const total = entries.length
  const planned = entries.filter(e => e.status === 'Planned').length
  const inProgress = entries.filter(e => e.status === 'In Progress').length
  const done = entries.filter(e => e.status === 'Done').length
  return (
    <div className="flex items-center justify-between px-8 py-6">
      <div className="flex items-center gap-4">
        <Avatar username={user.username} size="w-14 h-14" textSize="text-2xl" />
        <p className="text-white font-semibold ">{user.username}</p>
      </div>
      <div className="flex gap-8">
        <div className="text-center">
          <p className="text-white text-2xl font-bold">{total}</p>
          <p className="text-text-muted text-sm">Total entries</p>
        </div>
        <div className="text-center">
          <p className="text-white text-2xl font-bold">{inProgress}</p>
          <p className="text-text-muted text-sm">In Progress</p>
        </div>
        <div className="text-center">
          <p className="text-white text-2xl font-bold">{planned}</p>
          <p className="text-text-muted text-sm">Planned</p>
        </div>
        <div className="text-center">
          <p className="text-white text-2xl font-bold">{done}</p>
          <p className="text-text-muted text-sm">Done</p>
        </div>
      </div>
    </div>
  )
}
