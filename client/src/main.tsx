import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import UserDataProvider from './context/UserContext'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <UserDataProvider>
      <App />
    </UserDataProvider>
  </BrowserRouter>
)
