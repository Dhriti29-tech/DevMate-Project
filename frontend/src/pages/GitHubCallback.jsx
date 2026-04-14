import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setAuthSession, apiRequest } from '../utils/api'

export default function GitHubCallback() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  useEffect(() => {
    const token = params.get('token')
    const error = params.get('error')

    if (error || !token) {
      navigate('/login?error=github_failed')
      return
    }

    // Store token then fetch full session data (user + onboarding)
    localStorage.setItem('dm-token', token)

    apiRequest('/auth/profile')
      .then((res) => {
        setAuthSession({ token, user: res.user, onboarding: res.onboarding })
        const onboarding = res.onboarding || {}
        if (!onboarding.assessmentCompleted && onboarding.skillsSelected) {
          navigate('/onboarding/assessment')
        } else if (!onboarding.assessmentCompleted) {
          navigate('/onboarding/skills')
        } else {
          navigate('/dashboard')
        }
      })
      .catch(() => navigate('/login?error=github_failed'))
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)',
    }}>
      <div style={{ textAlign: 'center', color: 'var(--text)' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
        <p style={{ fontSize: 15, color: 'var(--text3)' }}>Signing you in with GitHub...</p>
      </div>
    </div>
  )
}
