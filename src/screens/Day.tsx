import { useParams } from 'react-router-dom'
import { formatDay } from '../lib/dates'

export default function Day() {
  const { date } = useParams<{ date: string }>()
  return (
    <div>
      <h1 className="display h1">{date ? formatDay(date) : 'Day'}</h1>
      <p className="muted">Round 6 — under construction.</p>
    </div>
  )
}
