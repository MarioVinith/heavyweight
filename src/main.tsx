import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/anton'
import '@fontsource/oswald/400.css'
import '@fontsource/oswald/500.css'
import '@fontsource/oswald/600.css'
import './theme.css'
import App from './App'
import { StoreProvider } from './store/Store'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StoreProvider>
  </React.StrictMode>,
)
