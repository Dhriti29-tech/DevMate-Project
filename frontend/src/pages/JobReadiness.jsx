import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PageWrapper from '../components/PageWrapper'
import { apiRequest } from '../utils/api'

// Score → colour band
function scoreMeta(score) {
  if (score >= 85) return { color: 'var(--green)',  label: 'Strong candidate' }
  if (score >= 65) return { color: 'var(--accent)', label: 'Junior-ready'     }
  if (score >= 40) return { color: 'var(--orange)', label: 'Building foundation' }
  return               { color: 'var(--red)',    label: 'Getting started'    }
}

const EMPTY_REPORT = {
  overallScore: 0, band: 'Getting started',
  levelLabel: 'Learner', nextLabel: 'Junior Dev',
  strengths: [], weaknesses: [], suggestions: [],
  projectsSubmitted: 0,
}

export default function JobReadiness() {
  const navigate = useNavigate()
  const [report, setReport]   = useState(EMPTY_REPORT)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    let mounted = true
    apiRequest('/job-readiness/report')
      .then((res) => { if (mounted) setReport(res.report || EMPTY_REPORT) })
      .catch((e)  => { if (mounted) setError(e.message || 'Failed to load job readiness') })
      .finally(()  => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const { overallScore, band, levelLabel, nextLabel, strengths, weaknesses, suggestions } = report
  const meta = scoreMeta(overallScore)

  // Motivational message based on score
  const motivationMsg =
    overallScore >= 85 ? "You're a strong candidate. Keep building your portfolio."
    : overallScore >= 65 ? "You're ready for junior roles. A few more improvements and you'll hit 90%+."
    : overallScore >= 40 ? "You're building a solid foundation. Keep completing tasks and projects."
    : "You're just getting started. Complete tasks and projects to boost your score."

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <PageWrapper>
          <h1 className="page-title">Job Readiness</h1>
          <p className="page-subtitle">See how ready you are and what to improve to land your first role.</p>

          {error && (
            <div style={{ padding: 12, marginBottom: 16, borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13 }}>
              {error}
            </div>
          )}

          {loading ? (
            <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--text3)' }}>
              Calculating readiness...
            </div>
          ) : (
            <>
              {/* ── Score card ── */}
              <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 32, borderLeft: `3px solid ${meta.color}` }}>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 52, fontWeight: 700, color: meta.color, lineHeight: 1 }}>{overallScore}%</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>Job ready</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="progress-bar" style={{ height: 10, marginBottom: 12 }}>
                    <div className="progress-fill" style={{ width: `${overallScore}%`, background: meta.color }} />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{band}</div>
                  <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{motivationMsg}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  <div style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>{levelLabel}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>Current level</div>
                  </div>
                  <div style={{ padding: '8px 16px', borderRadius: 8, background: '#e0f2fe', border: '1px solid #bae6fd', textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0369a1' }}>{nextLabel}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>Next target</div>
                  </div>
                </div>
              </div>

              <div className="grid-2" style={{ marginBottom: 20 }}>
                {/* ── Strengths ── */}
                <div className="card">
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#15803d' }}>Strengths</div>
                  {strengths.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'var(--text3)' }}>
                      Complete more videos to see your strengths.
                    </div>
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

                {/* ── Needs improvement ── */}
                <div className="card">
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--orange)' }}>Needs improvement</div>
                  {weaknesses.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'var(--text3)' }}>
                      {strengths.length > 0
                        ? '🎉 All active languages are above 60% — great work!'
                        : 'Start learning to see areas for improvement.'}
                    </div>
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
                          {w.action && (
                            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>→ {w.action}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Suggestions ── */}
              <div className="card">
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>What to improve next</div>
                {suggestions.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'var(--text3)' }}>Keep up the great work!</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {suggestions.map((s, i) => (
                      <div
                        key={i}
                        onClick={() => navigate('/roadmap')}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 14px', borderRadius: 8, background: 'var(--bg)',
                          border: '1px solid var(--border)', cursor: 'pointer',
                          transition: 'border-color 0.15s, box-shadow 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(37,99,235,0.1)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)';  e.currentTarget.style.boxShadow = 'none' }}
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
                )}
              </div>
            </>
          )}
        </PageWrapper>
      </main>
    </div>
  )
}
