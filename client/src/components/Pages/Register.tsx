import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import InputBox from '../core/InputBox'
import { UserContext } from '../../context/UserContext'

type Role = 'worker' | 'contractor'

export default function Register() {
  const [role, setRole] = useState<Role>('worker')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register, user } = useContext(UserContext)!;

  React.useEffect(() => {
    if (user) {
      navigate(user.role === 'worker' ? '/dashboard/worker' : '/dashboard/contractor');
    }
  }, [user, navigate]);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Please fill all fields')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (!/^\d{10}$/.test(phone)) {
      setError('Phone number must be exactly 10 digits')
      return
    }

    setLoading(true)
    setError('')

    try {
      const defaultLocation: { type: "Point"; coordinates: [number, number] } = {
        type: 'Point',
        coordinates: [77.2090, 28.6139], // Delhi default — updatable in profile
      };

      const userData = await register({ name, email, phone, password, role, location: defaultLocation })
      navigate(userData.role === 'worker' ? '/dashboard/worker' : '/dashboard/contractor')
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-7">

        {/* Logo */}
        <Link to="/" className="flex items-center justify-center mb-6">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white font-bold text-base shadow-md">
            RZ
          </div>
          <span className="ml-2.5 text-xl font-bold text-gray-900">
            Rozgar<span className="text-teal-600">Setu</span>
          </span>
        </Link>

        <h2 className="text-center text-xl font-bold text-gray-900 mb-0.5">Create an account</h2>
        <p className="text-center text-gray-500 text-sm mb-5">Join RozgarSetu today</p>

        {/* Role Tabs */}
        <div className="mb-5 p-1 bg-gray-100 rounded-xl flex gap-1">
          {(['worker', 'contractor'] as Role[]).map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all capitalize ${
                role === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {r === 'worker' ? '👷 Worker' : '🏗️ Contractor'}
            </button>
          ))}
        </div>

        {/* Role hint */}
        <p className="text-xs text-gray-500 mb-4 px-1">
          {role === 'worker'
            ? 'Workers receive job assignments and complete tasks for contractors.'
            : 'Contractors post jobs and assign workers to complete them.'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <InputBox type="text" name="name" value={name} placeholder="Your full name" label="Full Name" handler={(e) => setName(e.target.value)} />
        <InputBox type="email" name="email" value={email} placeholder="you@email.com" label="Email" handler={(e) => setEmail(e.target.value)} />
        <InputBox type="tel" name="phone" value={phone} placeholder="10-digit mobile number" label="Phone" handler={(e) => setPhone(e.target.value)} />
        <InputBox type="password" name="password" value={password} placeholder="At least 6 characters" label="Password" handler={(e) => setPassword(e.target.value)} />
        <InputBox type="password" name="confirmPassword" value={confirmPassword} placeholder="Re-enter password" label="Confirm Password" handler={(e) => setConfirmPassword(e.target.value)} />

        <p className="text-xs text-gray-400 mb-4 -mt-1">
          📍 Your location will be set to Delhi by default. You can update it in your profile.
        </p>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </span>
          ) : 'Sign up'}
        </button>

        <p className="mt-4 text-center text-gray-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}