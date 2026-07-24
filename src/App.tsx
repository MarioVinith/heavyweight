import { Route, Routes } from 'react-router-dom'
import Shell from './components/Shell'
import Calendar from './screens/Calendar'
import Day from './screens/Day'
import Login from './screens/Login'
import Progress from './screens/Progress'
import Setup from './screens/Setup'
import { useStore } from './store/Store'

function Splash() {
  return (
    <div className="center-wrap">
      <span className="display wordmark">
        HEAVY<span className="gold">WEIGHT</span>
      </span>
    </div>
  )
}

function NotConfigured() {
  return (
    <div className="center-wrap">
      <div className="card center-card">
        <h1 className="display h1">
          NO CORNER <span className="red">CREW</span> YET
        </h1>
        <p className="muted">
          The backend isn't wired up. Put <code>VITE_SUPABASE_URL</code> and{' '}
          <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env.local</code>, then
          restart the dev server.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const { configured, authReady, session, dataReady } = useStore()

  if (!configured) return <NotConfigured />
  if (!authReady) return <Splash />
  if (!session) return <Login />
  if (!dataReady) return <Splash />

  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Calendar />} />
        <Route path="/day/:date" element={<Day />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/setup" element={<Setup />} />
      </Route>
    </Routes>
  )
}
