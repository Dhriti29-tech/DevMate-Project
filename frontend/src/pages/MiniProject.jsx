import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PageWrapper from '../components/PageWrapper'
import { apiRequest } from '../utils/api'

const LANGUAGE_ORDER = ['HTML', 'CSS', 'JavaScript', 'React', 'Node', 'Express', 'MongoDB']

const DISPLAY_LABEL = { Node: 'Node.js', Express: 'Express.js' }
const label = (lang) => DISPLAY_LABEL[lang] || lang

// Map URL param (e.g. "node") → canonical key (e.g. "Node")
function resolveLanguage(param) {
  const map = {
    html: 'HTML', css: 'CSS', javascript: 'JavaScript', js: 'JavaScript',
    react: 'React', node: 'Node', nodejs: 'Node',
    express: 'Express', mongodb: 'MongoDB', mongo: 'MongoDB',
  }
  return map[(param || '').toLowerCase().trim()] || null
}

function difficultyBadge(difficulty) {
  if (!difficulty) return 'badge-cyan'
  const d = difficulty.toLowerCase()
  if (d === 'easy') return 'badge-green'
  if (d === 'hard') return 'badge-orange'
  return 'badge-cyan'
}

function levelBadge(level) {
  if (!level) return 'badge-cyan'
  const l = level.toLowerCase()
  if (l === 'beginner') return 'badge-green'
  if (l === 'advanced') return 'badge-purple'
  return 'badge-cyan'
}

export default function MiniProject() {
  const navigate = useNavigate()
  const { language: langParam } = useParams()

  // Resolve canonical language from URL param, fallback to first in order
  const activeLang = resolveLanguage(langParam) || LANGUAGE_ORDER[0]

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [submission, setSubmission] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // Fetch projects whenever the language changes
  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    setSelected(null)
    setSubmission('')
    setSubmitted(false)

    apiRequest(`/mini-projects/${activeLang.toLowerCase()}`)
      .then((res) => {
        if (!mounted) return
        setProjects(res.projects || [])
        setSelected(res.projects?.[0] || null)
      })
      .catch((e) => {
        if (!mounted) return
        setError(e.message || 'Failed to load projects')
        setProjects([])
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => { mounted = false }
  }, [activeLang])

  const switchLanguage = (lang) => {
    navigate(`/mini-project/${lang.toLowerCase()}`)
  }

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <PageWrapper>
          <h1 className="page-title">Mini Projects 🧪</h1>
          <p className="page-subtitle">Build real projects to solidify your skills. Select a language to get started.</p>

          {/* Language selector tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {LANGUAGE_ORDER.map((lang) => {
              const isActive = lang === activeLang
              return (
                <button
                  key={lang}
                  onClick={() => switchLanguage(lang)}
                  style={{
                    padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                    background: isActive ? 'var(--accent)' : 'var(--bg3)',
                    color: isActive ? '#fff' : 'var(--text3)',
                    border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border2)'}`,
                    cursor: 'pointer', transition: 'background 0.18s, border-color 0.18s',
                  }}
                >
                  {label(lang)}
                </button>
              )
            })}
          </div>

          {/* Loading */}
          {loading && (
            <div className="card" style={{ padding: 14 }}>Loading mini projects...</div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ padding: 14, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#b91c1c' }}>
              {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && projects.length === 0 && (
            <div className="card" style={{ padding: 14 }}>
              No projects available for {label(activeLang)}.
            </div>
          )}

          {/* Main layout */}
          {!loading && !error && projects.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>

              {/* Project list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {projects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => { setSelected(p); setSubmission(''); setSubmitted(false) }}
                    style={{
                      padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                      background: selected?.id === p.id ? 'rgba(124,58,237,0.12)' : 'var(--card)',
                      border: `1px solid ${selected?.id === p.id ? 'rgba(124,58,237,0.4)' : 'var(--border)'}`,
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>{label(activeLang)}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span className={`badge ${levelBadge(p.level)}`} style={{ fontSize: 10 }}>{p.level}</span>
                      <span className={`badge ${difficultyBadge(p.difficulty)}`} style={{ fontSize: 10 }}>{p.difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Project detail */}
              {selected && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{selected.title}</h2>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span className="badge badge-cyan">{label(activeLang)}</span>
                          <span className={`badge ${levelBadge(selected.level)}`}>{selected.level}</span>
                          <span className={`badge ${difficultyBadge(selected.difficulty)}`}>{selected.difficulty}</span>
                        </div>
                      </div>
                    </div>
                    <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.7 }}>{selected.description}</p>
                  </div>

                  <div className="grid-2">
                    <div className="card">
                      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>📋 Requirements</h3>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {(selected.requirements || []).map((r, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: 'var(--text2)' }}>
                            <span style={{ color: 'var(--accent)', fontSize: 12, marginTop: 2 }}>◆</span> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="card">
                      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>🎯 Expected Output</h3>
                      <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{selected.expectedOutput}</p>
                      <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Estimated time</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{selected.estimatedTime}</div>
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="card">
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>📤 Submit Your Project</h3>
                    <input
                      type="text"
                      placeholder="Paste your GitHub repo or live demo URL..."
                      value={submission}
                      onChange={(e) => setSubmission(e.target.value)}
                      style={{
                        width: '100%', padding: '11px 14px', borderRadius: 8,
                        background: 'var(--bg3)', border: '1px solid var(--border)',
                        color: 'var(--text)', fontSize: 14, outline: 'none',
                        marginBottom: 12, boxSizing: 'border-box', transition: 'border-color 0.2s',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--accent)' }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
                    />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        className="btn-primary"
                        onClick={() => submission.trim() && setSubmitted(true)}
                      >
                        Submit Project →
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ padding: '10px 18px', fontSize: 14 }}
                        onClick={() => navigate('/code-editor')}
                      >
                        Open Editor 💻
                      </button>
                    </div>
                    {submitted && (
                      <div style={{ marginTop: 14, padding: 14, borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#6ee7b7' }}>🎉 Submitted! AI review in progress...</div>
                        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6 }}>
                          You'll get detailed feedback and a score within moments.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </PageWrapper>
      </main>
    </div>
  )
}
