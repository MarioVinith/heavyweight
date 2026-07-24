import { NavLink, Outlet } from 'react-router-dom'
import { useStore } from '../store/Store'

const TABS = [
  { to: '/', label: 'Calendar' },
  { to: '/progress', label: 'Progress' },
  { to: '/setup', label: 'Setup' },
]

export default function Shell() {
  const { offline } = useStore()
  return (
    <div className="shell">
      <header className="topbar">
        <span className="display wordmark">
          HEAVY<span className="gold">WEIGHT</span>
        </span>
      </header>
      {offline && (
        <div className="offline-banner">
          OFFLINE — SHOWING LAST SYNCED DATA
        </div>
      )}
      <main className="screen">
        <Outlet />
      </main>
      <nav className="tabbar">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === '/'}
            className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
