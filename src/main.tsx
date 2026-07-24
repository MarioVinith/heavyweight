import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import '@fontsource/anton'
import '@fontsource/oswald/400.css'
import '@fontsource/oswald/500.css'
import '@fontsource/oswald/600.css'
import './theme.css'
import Shell from './components/Shell'
import Calendar from './screens/Calendar'
import Progress from './screens/Progress'
import Setup from './screens/Setup'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Calendar />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/setup" element={<Setup />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
