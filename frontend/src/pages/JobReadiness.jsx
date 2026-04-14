import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PageWrapper from '../components/PageWrapper'
import { apiRequest } from '../utils/api'

const BAND_META = {
  'Strong candidate': { color: 'var(--green)',  bg: '#dcfce7', border: '#bbf7d0', text: '#15803d' },
  'Junior-ready':     { color: 'var(--accent)', bg: '#ede9fe', border: '#c4b5fd', text: '#5b21b6' },
  'Building foundation': { color: 'var(--orange)', bg: '#fef3c7', border: '#fde68a', text: '#92400e' },
  'Getting started':  { color: 'var(--red)',    bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' },
}

const DIMS = [
  { key: 'codingScore',      label: 'Coding & Concepts',    color: 'var(--accent)' },
  { key: 'debuggingScore',   label: 'Debugging & Delivery', color: 'var(--cyan)'   },
  { key: 'projectScore',     label: 'Projects & Portfolio', color: 'var(--green)'  },
  { key: 'consistencyScore', label: 'Consistency',          color: 'var(--orange)' },
  { key: 'githubScore',      label: 'GitHub Activity',      color: '#24292e'       },
]

export default function JobReadiness() {
  const navigate = useNavigate()
  const [report, setReport]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    apiRequest('/job-readiness/report')
      .then(res => setReport(res.report))
      .catch(e  => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content"><PageWrapper>
        <h1 className="page-title">Job Readiness</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
        </div>
      </PageWrapper></main>
    </div>
  )

  if (error) return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content"><PageWrapper>
        <h1 className="page-title">Job Readiness</h1>
        <div style={{ padding: 16, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#b91c1c' }}>{error}</div>
      </PageWrapper></main>
    </div>
  )

  const score      = report?.overallScore ?? 0
  const band       = report?.band ?? 'Getting started'
  const breakdown  = report?.breakdown ?? {}
  const strengths  = report?.strengths ?? []
  const weaknesses = report?.weaknesses ?? []
  const suggestions = report?.suggestions ?? []
  const bandMeta   = BAND_META[band] || BAND_META['Getting started']

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content"><PageWrapper>
        <h1 className="page-title">Job Readiness</h1>
        <p className="page-subtitle">See how ready you are and what to improve to land your first role.</p>

        {/* Overall score */}
        <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 32, borderLeft: '3px solid var(--accent)' }}>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 52, fontWeight: 700, color: 'var(--orange)', lineHeight: 1 }}>{score}%</div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>Job ready</div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="progress-bar" style={{ height: 10, marginBottom: 12 }}>
              <div className="progress-fill" style={{ width: `${score}%`, background: 'var(--orange)' }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{band}</div>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>
              {score >= 85 ? "You're ready for professional roles. Keep building your portfolio."
                : score >= 65 ? "You're ready for junior roles. A few more improvements and you'll hit 90%+."
                : score >= 40 ? "You're building a solid foundation. Keep completing tasks and projects."
                : "You're just getting started. Complete more tasks and submit code to boost your score."}
            </p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <div style={{ padding: '10px 18px', borderRadius: 8, background: bandMeta.bg, border: `1px solid ${bandMeta.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: bandMeta.text }}>{band}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Current level</div>
            </div>
          </div>
        </div>

        {/* Dimension breakdown */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Score Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {DIMS.map(d => {
              const val = Math.round(breakdown?.[d.key] ?? 0)
              return (
                <div key={d.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{d.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: d.color }}>{val}%</span>
                  </div>
                  <div className="progress-bar">
                    <div style={{ height: '100%', borderRadius: 99, width: `${val}%`, background: d.color, transition: 'width 0.7s ease' }} />
                  </div>
                  {d.key === 'githubScore' && val === 0 && (
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
                      → <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/github-dashboard')}>
                        Connect GitHub to boost this score
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: 20 }}>
          {/* Strengths */}
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--green)' }}>Strengths</div>
            {strengths.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>Complete more tasks to identify strengths.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {strengths.map((s, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{s.skill}</span>
                      <span style={{ fontSize: 13, color: 'var(--green)' }}>{s.score}%</span>
                    </div>
                    <div className="progress-bar">
                      <div style={{ height: '100%', borderRadius: 99, width: `${s.score}%`, background: 'var(--green)' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weaknesses */}
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--orange)' }}>Needs improvement</div>
            {weaknesses.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>No weak areas detected yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {weaknesses.map((w, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{w.skill}</span>
                      <span style={{ fontSize: 13, color: 'var(--orange)' }}>{w.score}%</span>
                    </div>
                    <div className="progress-bar">
                      <div style={{ height: '100%', borderRadius: 99, width: `${w.score}%`, background: 'var(--orange)' }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>→ {w.action}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Suggestions */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>What to improve next</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {suggestions.map((s, i) => (
              <div key={i} onClick={() => navigate('/roadmap')} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: 8, background: 'var(--bg)',
                border: '1px solid var(--border)', cursor: 'pointer',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(99,102,241,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.title}</div>
                  <span className={`badge ${s.priority === 'High' ? 'badge-orange' : 'badge-cyan'}`} style={{ fontSize: 11, marginTop: 4 }}>
                    {s.priority}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>{s.xp}</div>
              </div>
            ))}
          </div>
        </div>

      </PageWrapper></main>
    </div>
  )
}
