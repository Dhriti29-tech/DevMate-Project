import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ThemeToggle from '../components/ThemeToggle'
import CodeBackground from '../components/CodeBackground'
import { apiRequest, readUser } from '../utils/api'

const LANG_COLORS = {
  HTML: '#e34c26', CSS: '#06b6d4', JavaScript: '#f7df1e',
  React: '#61dafb', Node: '#68a063', Express: '#7c3aed', MongoDB: '#10b981',
}
const LANG_ICONS = {
  HTML: '🌐', CSS: '🎨', JavaScript: '⚡', React: '⚛️',
  Node: '🟢', Express: '🚂', MongoDB: '🍃',
}

function TopBar({ name, onUpgrade }) {
  const [search, setSearch] = useState('')
  const [showBell, setShowBell] = useState(false)
  const navigate = useNavigate()
  const initials = name ? name.slice(0, 2).toUpperCase() : 'DV'

  const notifications = [
    { icon: '🔥', text: "Keep your streak going — log in daily!", time: 'Just now' },
    { icon: '🎯', text: "You're close to 70% job readiness", time: '2h ago' },
    { icon: '📚', text: 'New mini projects available for React', time: '1d ago' },
  ]

  return (
    <div style={{
      height: 56, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 32px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg2)', backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 10,
      transition: 'background 0.3s, border-color 0.3s',
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
        Good morning, <span style={{ color: 'var(--cyan)' }}>{name || 'Developer'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search resources..."
            style={{
              padding: '7px 12px 7px 32px', borderRadius: 8, fontSize: 13,
              background: 'var(--bg3)', border: '1px solid var(--border2)',
              color: 'var(--text2)', outline: 'none', width: 200,
              transition: 'background 0.3s, border-color 0.3s',
            }}
          />
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notification bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowBell(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 4, position: 'relative' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <div style={{
              position: 'absolute', top: 2, right: 2, width: 7, height: 7,
              borderRadius: '50%', background: 'var(--red)',
              border: '1.5px solid var(--bg2)',
            }} />
          </button>

          {showBell && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 19 }} onClick={() => setShowBell(false)} />
              <div style={{
                position: 'absolute', right: 0, top: 36, width: 300, zIndex: 20,
                background: 'var(--card)', border: '1px solid var(--border2)',
                borderRadius: 12, boxShadow: 'var(--shadow)',
                overflow: 'hidden', animation: 'fadeUp 0.15s ease both',
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                  Notifications
                </div>
                {notifications.map((n, i) => (
                  <div key={i} style={{
                    padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start',
                    borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-l)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: 18 }}>{n.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{n.text}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Avatar */}
        <div onClick={() => navigate('/profile')} style={{
          width: 34, height: 34, borderRadius: '50%', cursor: 'pointer',
          background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#fff',
          border: '2px solid var(--accent)',
        }}>
          {initials}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const user = readUser()

  useEffect(() => {
    let mounted = true
    apiRequest('/dashboard')
      .then(d => { if (mounted) setData(d) })
      .catch(e => { if (mounted) setError(e.message) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const roadmaps         = data?.roadmaps         || []
  const recentProjects   = data?.recentProjects   || []
  const continueLearning = data?.continueLearning || null
  const topicsDone       = data?.topicsDone       ?? 0
  const projectsBuilt    = data?.projectsBuilt    ?? 0
  const tasksSubmitted   = data?.tasksSubmitted   ?? 0
  const jobReadiness     = data?.jobReadiness     ?? 0
  const streak           = data?.streak           ?? 0
  const xpPoints         = data?.xpPoints         ?? 0
  const currentLanguage  = data?.currentLanguage  || null

  const maxProgress = useMemo(() =>
    roadmaps.length ? Math.max(...roadmaps.map(r => r.progress || 0)) : 0
  , [roadmaps])

  const card = {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 14, transition: 'background 0.3s, border-color 0.3s',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
      <CodeBackground />
      <Sidebar onUpgrade={() => setShowUpgrade(true)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
        <TopBar name={user?.name} onUpgrade={() => setShowUpgrade(true)} />

        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', background: 'var(--bg)' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 6, letterSpacing: -0.5 }}>
                Good morning 👋
              </h1>
              {currentLanguage && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--cyan)' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' }} />
                  Currently learning: <strong>{currentLanguage}</strong>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ ...card, padding: '10px 16px', minWidth: 80, textAlign: 'center', borderTop: '2px solid var(--red)' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--red)' }}>{streak}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>DAY STREAK 🔥</div>
              </div>
              <div style={{ ...card, padding: '10px 16px', minWidth: 80, textAlign: 'center', borderTop: '2px solid var(--orange)' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--orange)' }}>{xpPoints}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>XP POINTS ⭐</div>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ padding: 14, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, marginBottom: 20, color: '#b91c1c', fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* Progress banner */}
          <div style={{ ...card, padding: '20px 24px', marginBottom: 20, borderLeft: '3px solid var(--accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }} />
                  Your Learning Progress
                </div>
                <div style={{ display: 'flex', gap: 32 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Videos completed</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>{topicsDone}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tasks completed</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--cyan)' }}>{tasksSubmitted}</div>
                  </div>
                </div>
              </div>
              <button onClick={() => navigate('/video-task')} className="btn-primary" style={{ padding: '10px 22px' }}>
                Resume →
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 6, borderRadius: 99, background: 'var(--bg3)' }}>
                <div style={{
                  height: '100%', borderRadius: 99, width: `${maxProgress}%`,
                  background: 'linear-gradient(90deg, var(--accent), var(--cyan))',
                  transition: 'width 0.8s ease',
                }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', minWidth: 36 }}>{maxProgress}%</span>
            </div>
          </div>

          {/* 4 stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'TOPICS DONE',     value: topicsDone,          sub: '/∞',  color: 'var(--green)'  },
              { label: 'PROJECTS BUILT',  value: projectsBuilt,       sub: '/10', color: 'var(--cyan)'   },
              { label: 'TASKS SUBMITTED', value: tasksSubmitted,      sub: '',    color: 'var(--accent)' },
              { label: 'JOB READINESS',   value: `${jobReadiness}%`,  sub: '',    color: 'var(--orange)' },
            ].map((s, i) => (
              <div key={i} style={{ ...card, padding: '18px 20px', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1, marginBottom: 10, fontWeight: 600 }}>{s.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 30, fontWeight: 800, color: s.color }}>{s.value}</span>
                  {s.sub && <span style={{ fontSize: 13, color: 'var(--text3)' }}>{s.sub}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Roadmaps + Recent projects */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

            {/* Roadmaps */}
            <div style={{ ...card, padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Your roadmaps</span>
                <button onClick={() => navigate('/roadmap')} style={{ background: 'none', border: 'none', color: 'var(--cyan)', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>View all →</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {loading ? (
                  [...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 36, borderRadius: 8 }} />)
                ) : roadmaps.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: '20px 0' }}>No roadmap yet.</div>
                ) : roadmaps.map(r => (
                  <div key={r.language}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                          background: `${LANG_COLORS[r.language] || 'var(--accent)'}18`,
                          border: `1px solid ${LANG_COLORS[r.language] || 'var(--accent)'}33`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                        }}>
                          {LANG_ICONS[r.language] || '📘'}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{r.language}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{r.progress}% complete</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: LANG_COLORS[r.language] || 'var(--accent)' }}>{r.progress}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 99, background: 'var(--bg3)' }}>
                      <div style={{
                        height: '100%', borderRadius: 99, width: `${r.progress}%`,
                        background: LANG_COLORS[r.language] || 'var(--accent)',
                        transition: 'width 0.7s ease',
                        boxShadow: `0 0 8px ${LANG_COLORS[r.language] || 'var(--accent)'}66`,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent projects */}
            <div style={{ ...card, padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Recent projects</span>
                <button onClick={() => navigate('/mini-project')} style={{ background: 'none', border: 'none', color: 'var(--cyan)', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>View All →</button>
              </div>
              {recentProjects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                  <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>🚀</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>No projects built yet</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 18, lineHeight: 1.6 }}>
                    Complete your first few tasks to unlock guided project builds and start building your portfolio.
                  </div>
                  <button onClick={() => navigate('/mini-project')} style={{
                    padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: 'var(--accent-l)', border: '1px solid var(--accent)',
                    color: 'var(--accent)', cursor: 'pointer',
                  }}>Browse Ideas</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {recentProjects.map((p, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px', borderRadius: 10,
                      background: 'var(--bg3)', border: '1px solid var(--border)',
                      cursor: 'pointer', transition: 'border-color 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{p.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{p.language}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="badge badge-green">{p.status}</span>
                        {typeof p.score === 'number' && (
                          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{p.score}/100</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Continue Learning */}
          {continueLearning && (
            <div style={{ ...card, padding: '20px 22px' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Continue Learning</div>
              <div style={{
                display: 'flex', gap: 20, alignItems: 'center',
                background: 'var(--bg3)', borderRadius: 12,
                border: '1px solid var(--border)', overflow: 'hidden',
              }}>
                {/* Thumbnail */}
                <div style={{
                  width: 180, height: 110, flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--bg2), var(--bg3))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: 'var(--accent-l)', border: '2px solid var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }} onClick={() => navigate('/video-task')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent)">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </div>
                </div>
                {/* Info */}
                <div style={{ flex: 1, padding: '16px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span className="badge badge-cyan" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {continueLearning.type}
                    </span>
                    {continueLearning.duration && (
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>⏱ {continueLearning.duration} duration</span>
                    )}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', lineHeight: 1.5, marginBottom: 8, maxWidth: 480 }}>
                    {continueLearning.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>🕐 Last viewed recently</div>
                </div>
                {/* Resume */}
                <div style={{ padding: '0 22px', flexShrink: 0 }}>
                  <button onClick={() => navigate('/video-task')} className="btn-primary" style={{ padding: '10px 22px' }}>
                    Resume →
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Upgrade to Pro Modal */}
      {showUpgrade && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={() => setShowUpgrade(false)}>
          <div style={{
            background: 'var(--card)', border: '1px solid var(--accent)',
            borderRadius: 18, padding: 32, maxWidth: 420, width: '100%',
            animation: 'fadeUp 0.2s ease both', boxShadow: 'var(--shadow)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Upgrade to Pro</div>
              <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>
                Unlock unlimited AI reviews, advanced projects, and priority support.
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {['Unlimited AI code reviews', 'Advanced mini projects', 'Priority job readiness report', 'GitHub deep analysis', 'Certificate generation'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text2)' }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--accent-l)', border: '1px solid var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, color: 'var(--accent)',
                  }}>✓</div>
                  {f}
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{ width: '100%', padding: '13px', fontSize: 15 }}>
              Coming Soon 🚀
            </button>
            <button onClick={() => setShowUpgrade(false)} className="btn-secondary" style={{ width: '100%', marginTop: 10, padding: '10px' }}>
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
