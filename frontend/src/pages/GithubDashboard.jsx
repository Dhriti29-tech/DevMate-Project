import { useEffect, useState, useMemo } from 'react'
import Sidebar from '../components/Sidebar'
import PageWrapper from '../components/PageWrapper'
import RepoCard from '../components/RepoCard'
import { apiRequest } from '../utils/api'

const GITHUB_AUTH_URL = 'http://localhost:5000/auth/github'

export default function GithubDashboard() {
  const [profile, setProfile]   = useState(null)
  const [repos, setRepos]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')
  const [langFilter, setLangFilter] = useState('All')

  // Review state
  const [repoUrl, setRepoUrl]         = useState('')
  const [projTitle, setProjTitle]     = useState('')
  const [projDesc, setProjDesc]       = useState('')
  const [reviewing, setReviewing]     = useState(false)
  const [reviewResult, setReviewResult] = useState(null)
  const [reviewError, setReviewError] = useState('')

  // Streak sync state
  const [syncing, setSyncing]         = useState(false)
  const [streakResult, setStreakResult] = useState(null)

  // Achievements state
  const [achievements, setAchievements] = useState([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const [profileRes, reposRes] = await Promise.all([
          apiRequest('/github/profile'),
          apiRequest('/github/repos'),
        ])
        if (mounted) {
          setProfile(profileRes.profile)
          setRepos(reposRes.repos)
          // Pull GitHub achievements from full profile
          try {
            const profileFull = await apiRequest('/auth/profile/me')
            const ghAchievements = (profileFull.achievements || []).filter(a => a.category === 'github')
            setAchievements(ghAchievements)
          } catch { /* non-fatal */ }
        }
      } catch (e) {
        if (mounted) setError(e.message)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  // Derived stats
  const languages = useMemo(() => {
    const counts = {}
    repos.forEach(r => { if (r.language) counts[r.language] = (counts[r.language] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [repos])

  const totalStars = useMemo(() => repos.reduce((s, r) => s + r.stars, 0), [repos])

  const langOptions = ['All', ...languages.map(([l]) => l)]

  const handleSyncStreak = async () => {
    setSyncing(true)
    setStreakResult(null)
    try {
      const data = await apiRequest('/github/sync-streak', { method: 'POST' })
      setStreakResult(data)
    } catch (err) {
      setStreakResult({ message: err.message, hasCommitToday: false })
    } finally {
      setSyncing(false)
    }
  }

  const handleReview = async (e) => {
    e.preventDefault()
    setReviewing(true)
    setReviewResult(null)
    setReviewError('')
    try {
      const data = await apiRequest('/github/review', {
        method: 'POST',
        body: JSON.stringify({ repoUrl, projectTitle: projTitle, projectDescription: projDesc }),
      })
      setReviewResult(data)
    } catch (err) {
      setReviewError(err.message)
    } finally {
      setReviewing(false)
    }
  }

  const filtered = useMemo(() => repos.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(search.toLowerCase())
    const matchLang = langFilter === 'All' || r.language === langFilter
    return matchSearch && matchLang
  }), [repos, search, langFilter])

  // Not connected state
  if (!loading && error?.includes('GitHub not connected')) {
    return (
      <div className="page-layout">
        <Sidebar />
        <main className="main-content">
          <PageWrapper>
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="var(--text2)" style={{ margin: '0 auto', display: 'block' }}>
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
                </svg>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Connect your GitHub</h2>
              <p style={{ color: 'var(--text2)', marginBottom: 28, fontSize: 14 }}>
                Link your GitHub account to view repos, track commits, and boost your job readiness score.
              </p>
              <a
                href={GITHUB_AUTH_URL}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '12px 28px', borderRadius: 10,
                  background: '#24292e', color: '#fff',
                  fontWeight: 600, fontSize: 15, textDecoration: 'none',
                  transition: 'background 0.18s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#1a1f24'}
                onMouseLeave={e => e.currentTarget.style.background = '#24292e'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
                </svg>
                Connect GitHub
              </a>
            </div>
          </PageWrapper>
        </main>
      </div>
    )
  }

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <PageWrapper>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{
              fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4,
              background: 'linear-gradient(135deg, var(--text), var(--accent))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              GitHub Dashboard
            </h1>
            <p className="page-subtitle">Your repositories, activity and stats</p>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gap: 16 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />
              ))}
            </div>
          ) : error ? (
            <div style={{ padding: 16, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#b91c1c' }}>
              {error}
            </div>
          ) : (
            <>
              {/* Profile + Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, marginBottom: 24 }}>
                {/* Profile card */}
                <div className="card" style={{ gridColumn: '1', display: 'flex', alignItems: 'center', gap: 14, padding: 18 }}>
                  <img src={profile?.avatar} alt={profile?.username}
                    style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid var(--accent)' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{profile?.name || profile?.username}</div>
                    <a href={profile?.profileUrl} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, color: 'var(--accent)' }}>@{profile?.username}</a>
                    {profile?.bio && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3 }}>{profile.bio}</div>}
                  </div>
                </div>

                {/* Stat cards */}
                {[
                  { label: 'Repositories', value: repos.length, color: 'var(--accent)', icon: '📁' },
                  { label: 'Total Stars',  value: totalStars,   color: 'var(--orange)', icon: '⭐' },
                  { label: 'Languages',    value: languages.length, color: 'var(--green)', icon: '💻' },
                ].map(s => (
                  <div key={s.label} className="card card-3d" style={{ borderTop: `2px solid ${s.color}`, padding: 18 }}>
                    <div style={{ fontSize: 22 }}>{s.icon}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: s.color, marginTop: 6 }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Commit Streak Sync */}
              <div className="card" style={{ marginBottom: 24, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>🔥 Commit Streak Tracker</div>
                  <p style={{ fontSize: 13, color: 'var(--text2)', margin: 0 }}>
                    Pushed code today? Sync your GitHub commits to boost your streak.
                  </p>
                  {streakResult && (
                    <div style={{
                      marginTop: 10, fontSize: 13, fontWeight: 600,
                      color: streakResult.hasCommitToday ? 'var(--green)' : 'var(--orange)',
                    }}>
                      {streakResult.hasCommitToday ? '✅' : '⚠️'} {streakResult.message}
                      {streakResult.hasCommitToday && (
                        <span style={{ marginLeft: 10, color: 'var(--text3)', fontWeight: 400 }}>
                          Current streak: {streakResult.streakCount} days
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  className="btn-primary"
                  onClick={handleSyncStreak}
                  disabled={syncing}
                  style={{ padding: '10px 22px', flexShrink: 0 }}
                >
                  {syncing ? 'Checking...' : 'Sync Commits'}
                </button>
              </div>

              {/* GitHub Achievements */}
              {achievements.length > 0 && (
                <div className="card" style={{ marginBottom: 24, padding: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>🏆 GitHub Achievements</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                    {achievements.map((a, i) => (
                      <div key={i} style={{
                        padding: 14, borderRadius: 10, textAlign: 'center',
                        background: 'var(--bg3)', border: '1px solid var(--border2)',
                        animation: `fadeUp 0.2s ease ${i * 60}ms both`,
                      }}>
                        <div style={{ fontSize: 26, marginBottom: 6 }}>{a.icon}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{a.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{a.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages breakdown */}
              {languages.length > 0 && (
                <div className="card" style={{ marginBottom: 24, padding: 20 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Languages Used</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {languages.map(([lang, count]) => (
                      <div key={lang} style={{
                        padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                        background: 'var(--bg3)', border: '1px solid var(--border2)',
                        color: 'var(--text)', cursor: 'pointer',
                        borderColor: langFilter === lang ? 'var(--accent)' : 'var(--border2)',
                        color: langFilter === lang ? 'var(--accent)' : 'var(--text2)',
                      }}
                        onClick={() => setLangFilter(langFilter === lang ? 'All' : lang)}
                      >
                        {lang} <span style={{ color: 'var(--text3)', fontSize: 11 }}>({count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search + filter bar */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
                <input
                  className="input-field"
                  placeholder="Search repositories..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ maxWidth: 320 }}
                />
                <select
                  value={langFilter}
                  onChange={e => setLangFilter(e.target.value)}
                  style={{
                    padding: '10px 13px', borderRadius: 8, fontSize: 14,
                    background: 'var(--bg3)', border: '1px solid var(--border2)',
                    color: 'var(--text)', outline: 'none', cursor: 'pointer',
                  }}
                >
                  {langOptions.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <span style={{ fontSize: 13, color: 'var(--text3)', marginLeft: 4 }}>
                  {filtered.length} repo{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* AI Repo Review */}
              <div className="card" style={{ marginBottom: 28, padding: 22 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>🤖 AI Project Review</div>
                <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
                  Paste any public GitHub repo URL and get an AI code review with score and feedback.
                </p>
                <form onSubmit={handleReview} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input
                    className="input-field"
                    placeholder="https://github.com/username/repo"
                    value={repoUrl}
                    onChange={e => setRepoUrl(e.target.value)}
                    required
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <input
                      className="input-field"
                      placeholder="Project title (optional)"
                      value={projTitle}
                      onChange={e => setProjTitle(e.target.value)}
                    />
                    <input
                      className="input-field"
                      placeholder="What does this project do? (optional)"
                      value={projDesc}
                      onChange={e => setProjDesc(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={reviewing}
                    style={{ alignSelf: 'flex-start', padding: '10px 24px' }}
                  >
                    {reviewing ? 'Reviewing...' : 'Review with AI'}
                  </button>
                </form>

                {/* Review result */}
                {reviewError && (
                  <div style={{ marginTop: 16, padding: 14, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#b91c1c', fontSize: 13 }}>
                    {reviewError}
                  </div>
                )}
                {reviewResult && (
                  <div style={{ marginTop: 20, animation: 'fadeUp 0.25s ease both' }}>
                    {/* Score */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                      <div style={{
                        width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
                        background: `conic-gradient(${reviewResult.score >= 70 ? 'var(--green)' : reviewResult.score >= 50 ? 'var(--orange)' : 'var(--red)'} ${reviewResult.score * 3.6}deg, var(--bg3) 0deg)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>
                          {reviewResult.score}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{reviewResult.repo}</div>
                        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                          Files reviewed: {reviewResult.filesReviewed?.join(', ')}
                        </div>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 14, lineHeight: 1.7 }}>
                      {reviewResult.feedback}
                    </div>

                    {/* Errors */}
                    {reviewResult.errors?.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', marginBottom: 6 }}>Issues found</div>
                        {reviewResult.errors.map((e, i) => (
                          <div key={i} style={{ fontSize: 13, color: 'var(--text2)', padding: '4px 0 4px 12px', borderLeft: '2px solid var(--red)' }}>
                            {e}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suggestions */}
                    {reviewResult.suggestions?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)', marginBottom: 6 }}>Suggestions</div>
                        {reviewResult.suggestions.map((s, i) => (
                          <div key={i} style={{ fontSize: 13, color: 'var(--text2)', padding: '4px 0 4px 12px', borderLeft: '2px solid var(--green)' }}>
                            {s}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Repo grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                {filtered.length === 0 ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
                    No repositories found
                  </div>
                ) : (
                  filtered.map(repo => <RepoCard key={repo.id} repo={repo} />)
                )}
              </div>
            </>
          )}
        </PageWrapper>
      </main>
    </div>
  )
}
