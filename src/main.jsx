import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// G360 Engine Assets
import '@assets/engine/g360-theme.css'
import './core/g360-skill.js'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
