import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import InputBox from '../core/InputBox'
import { UserContext } from '../../context/UserContext'

type Role = 'worker' | 'contractor'

export default function Login() {
  const [role, setRole] = useState<Role>('worker')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { login, user } = useContext(UserContext)!;

  React.useEffect(() => {
    if (user) {
      navigate(user.role === 'worker' ? '/dashboard/worker' : '/dashboard/contractor');
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const userData = await login({ email, password })

      // Redirect based on real role returned from the server
      navigate(userData.role === 'worker' ? '/dashboard/worker' : '/dashboard/contractor')
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 md:p-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">RZ</div>
          <h1 className="ml-3 text-2xl font-bold">RozgarSetu</h1>
        </div>

        <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">Log in</h2>
        <p className="text-center text-gray-600 text-sm mb-6">Access to RozgarSetu</p>

        {/* Role Tabs */}
        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setRole('worker')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              role === 'worker'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Worker
          </button>
          <button
            onClick={() => setRole('contractor')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              role === 'contractor'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Contractor
          </button>
        </div>

        {/* Error Message */}
        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

        {/* Form */}
        <InputBox
          type="email"
          name="email"
          value={email}
          placeholder="Enter your email"
          label="Email"
          handler={(e) => setEmail(e.target.value)}
        />
        <InputBox
          type="password"
          name="password"
          value={password}
          placeholder="Enter your password"
          label="Password"
          handler={(e) => setPassword(e.target.value)}
        />

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        {/* Sign Up Link */}
        <p className="mt-4 text-center text-gray-600 text-sm">
          Don't have an account?{' '}
          <button onClick={() => navigate('/signup')} className="text-blue-600 font-semibold hover:underline">
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}
