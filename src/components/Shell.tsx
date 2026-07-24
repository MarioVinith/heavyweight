import { NavLink, Outlet } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'Calendar' },
  { to: '/progress', label: 'Progress' },
  { to: '/setup', label: 'Setup' },
]

export default function Shell() {
  return (
    <div className="shell">
      <header className="topbar">
        <span className="display wordmark">
          HEAVY<span className="gold">WEIGHT</span>
        </span>
      </header>
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
