import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Landing from './components/Pages/Landing'
import Login from './components/Pages/Login'
import Register from './components/Pages/Register'
import ContractorDashboard from './components/Pages/ContractorDashboard'
import WorkerDashboard from './components/Pages/WorkerDashboard'
import WorkerJobBoard from './components/Pages/WorkerJobBoard'
import CreateJob from './components/Pages/CreateJob'
import JobDetails from './components/Pages/JobDetails'
import Navbar from './components/core/Navbar'
import ProtectedRoute from './components/core/ProtectedRoute'
import ReviewsPage from './components/Pages/ReviewsPage'
import ProfilePage from './components/Pages/ProfilePage'

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />

        <Route path="/dashboard/worker"
          element={<ProtectedRoute><WorkerDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/contractor"
          element={<ProtectedRoute><ContractorDashboard /></ProtectedRoute>} />

        {/* Worker: browse all open jobs and apply */}
        <Route path="/jobs/browse"
          element={<ProtectedRoute><WorkerJobBoard /></ProtectedRoute>} />

        <Route path="/jobs/create"
          element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
        <Route path="/jobs/:jobId"
          element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
        <Route path="/profile"
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/reviews/user/:userId" element={<ReviewsPage />} />
      </Routes>
    </>
  )
}

export default App