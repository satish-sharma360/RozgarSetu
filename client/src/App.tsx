import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './components/Pages/Landing'
import Login from './components/Pages/Login'
import Register from './components/Pages/Register'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        {/* Placeholder routes for dashboards */}
        <Route path="/dashboard/worker" element={<div className="min-h-screen flex items-center justify-center"><h1>Worker Dashboard (Coming Soon)</h1></div>} />
        <Route path="/dashboard/contractor" element={<div className="min-h-screen flex items-center justify-center"><h1>Contractor Dashboard (Coming Soon)</h1></div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
