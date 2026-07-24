import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addMonths, monthGrid, todayISO, type YearMonth } from '../lib/dates'
import { useStore } from '../store/Store'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function Calendar() {
  const { workouts } = useStore()
  const navigate = useNavigate()
  const today = todayISO()
  const [ym, setYm] = useState<YearMonth>(() => ({
    y: Number(today.slice(0, 4)),
    m: Number(today.slice(5, 7)),
  }))

  const grid = useMemo(() => monthGrid(ym.y, ym.m), [ym])

  const logged = useMemo(
    () => new Set(workouts.map((w) => w.workout_date)),
    [workouts],
  )

  const monthPrefix = `${ym.y}-${String(ym.m).padStart(2, '0')}`
  const sessionsThisMonth = workouts.filter((w) =>
    w.workout_date.startsWith(monthPrefix),
  ).length

  return (
    <div>
      <div className="cal-head">
        <button
          className="btn btn-ghost cal-nav"
          aria-label="Previous month"
          onClick={() => setYm(addMonths(ym, -1))}
        >
          ‹
        </button>
        <button
          className="display cal-title"
          title="Jump to current month"
          onClick={() =>
            setYm({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) })
          }
        >
          {MONTH_NAMES[ym.m - 1]} <span className="gold">{ym.y}</span>
        </button>
        <button
          className="btn btn-ghost cal-nav"
          aria-label="Next month"
          onClick={() => setYm(addMonths(ym, 1))}
        >
          ›
        </button>
      </div>

      <div className="cal-grid">
        {DOW.map((d, i) => (
          <span key={`dow-${i}`} className="label cal-dow">
            {d}
          </span>
        ))}
        {grid.map((iso, i) =>
          iso ? (
            <button
              key={iso}
              className={
                'cal-day' +
                (logged.has(iso) ? ' logged' : '') +
                (iso === today ? ' today' : '') +
                (iso > today ? ' future' : '')
              }
              onClick={() => navigate(`/day/${iso}`)}
            >
              <span className="cal-num">{Number(iso.slice(8))}</span>
              {logged.has(iso) && <span className="cal-dot" />}
            </button>
          ) : (
            <div key={`pad-${i}`} className="cal-pad" />
          ),
        )}
      </div>

      <p className="label cal-tally">
        ROUNDS FOUGHT THIS MONTH: <span className="gold">{sessionsThisMonth}</span>
      </p>
    </div>
  )
}
