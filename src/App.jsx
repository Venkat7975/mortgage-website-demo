import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import PageViewTracker from './components/PageViewTracker'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import HomeLoan from './pages/HomeLoan'
import LandLoan from './pages/LandLoan'
import VehicleLoan from './pages/VehicleLoan'
import CommercialLoan from './pages/CommercialLoan'
import Applications from './pages/Applications'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

function NotFound() {
  return (
    <Box sx={{ py: 12, textAlign: 'center' }}>
      <h2>Page not found</h2>
    </Box>
  )
}

export default function App() {
  return (
    <>
      <Navbar />
      <PageViewTracker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/loans/home" element={<HomeLoan />} />
        <Route path="/loans/land" element={<LandLoan />} />
        <Route path="/loans/vehicle" element={<VehicleLoan />} />
        <Route path="/loans/commercial" element={<CommercialLoan />} />
        <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
