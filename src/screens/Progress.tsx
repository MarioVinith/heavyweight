import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatDay } from '../lib/dates'
import { exerciseHistory } from '../lib/stats'
import { useStore } from '../store/Store'

const GOLD = '#e8b93b'
const RED = '#b3202a'
const LINE = '#2a231d'
const MUTED = '#9c8f7a'

type Metric = 'top' | 'volume'

export default function Progress() {
  const { exercises, workouts } = useStore()
  const [pickedId, setPickedId] = useState<string>(
    () => sessionStorage.getItem('hw-progress-ex') ?? '',
  )
  const [metric, setMetric] = useState<Metric>('top')

  const exerciseId = exercises.some((e) => e.id === pickedId)
    ? pickedId
    : exercises[0]?.id ?? ''

  const history = useMemo(
    () => exerciseHistory(workouts, exerciseId),
    [workouts, exerciseId],
  )

  const data = history.map((p) => ({
    date: p.date,
    value: metric === 'top' ? p.top : Math.round(p.volume),
  }))
  const best = data.length ? Math.max(...data.map((d) => d.value)) : 0
  const bestPoint = data.find((d) => d.value === best)
  const last = data.length ? data[data.length - 1].value : 0
  const unit = metric === 'top' ? 'kg' : 'kg vol'

  // All-time best top set per exercise, for the PR wall.
  const prWall = exercises
    .map((e) => {
      const h = exerciseHistory(workouts, e.id)
      return { id: e.id, name: e.name, best: Math.max(0, ...h.map((p) => p.top)) }
    })
    .filter((row) => row.best > 0)

  function pick(id: string) {
    setPickedId(id)
    sessionStorage.setItem('hw-progress-ex', id)
  }

  return (
    <div>
      <h1 className="display h1 progress-title">
        THE ONLY WAY IS <span className="gold">UP</span>
      </h1>

      <select
        className="input progress-pick"
        value={exerciseId}
        onChange={(e) => pick(e.target.value)}
      >
        {exercises.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
          </option>
        ))}
      </select>

      <div className="seg">
        <button
          className={metric === 'top' ? 'active' : ''}
          onClick={() => setMetric('top')}
        >
          TOP SET
        </button>
        <button
          className={metric === 'volume' ? 'active' : ''}
          onClick={() => setMetric('volume')}
        >
          VOLUME
        </button>
      </div>

      {data.length === 0 ? (
        <div className="card center-card progress-empty">
          <p className="display">NO ROUNDS YET</p>
          <p className="muted">Log this exercise once and the line starts here.</p>
        </div>
      ) : (
        <>
          <div className="stat-row">
            <div className="card stat">
              <span className="display stat-value gold">{best}</span>
              <span className="label">BEST {unit}</span>
            </div>
            <div className="card stat">
              <span className="display stat-value">{last}</span>
              <span className="label">LAST {unit}</span>
            </div>
            <div className="card stat">
              <span className="display stat-value">{data.length}</span>
              <span className="label">SESSIONS</span>
            </div>
          </div>

          <div className="chart-wrap card">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data} margin={{ top: 14, right: 14, left: -10, bottom: 0 }}>
                <CartesianGrid stroke={LINE} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: MUTED, fontSize: 11, fontFamily: 'Oswald' }}
                  tickFormatter={(iso: string) =>
                    `${Number(iso.slice(8))}/${Number(iso.slice(5, 7))}`
                  }
                  stroke={LINE}
                />
                <YAxis
                  tick={{ fill: MUTED, fontSize: 11, fontFamily: 'Oswald' }}
                  stroke={LINE}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    background: '#171310',
                    border: `1px solid ${LINE}`,
                    borderRadius: 10,
                    fontFamily: 'Oswald',
                  }}
                  labelStyle={{ color: MUTED }}
                  itemStyle={{ color: GOLD }}
                  formatter={(value: number) => [`${value} ${unit}`, metric === 'top' ? 'Top set' : 'Volume']}
                  labelFormatter={(iso) => formatDay(String(iso))}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={GOLD}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: GOLD, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: GOLD }}
                  isAnimationActive={false} // recharts+StrictMode: draw-in anim freezes at 0
                />
                {bestPoint && (
                  <ReferenceDot
                    x={bestPoint.date}
                    y={bestPoint.value}
                    r={6}
                    fill={RED}
                    stroke="none"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <h2 className="display pr-wall-title">
        PR <span className="red">WALL</span>
      </h2>
      {prWall.length === 0 ? (
        <p className="muted">Nothing on the wall yet. Go earn it.</p>
      ) : (
        <div className="card pr-wall">
          {prWall.map((row) => (
            <button key={row.id} className="pr-row" onClick={() => pick(row.id)}>
              <span className="pr-name">{row.name}</span>
              <span className="display pr-best gold">{row.best} kg</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
