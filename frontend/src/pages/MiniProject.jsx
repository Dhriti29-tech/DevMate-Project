import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PageWrapper from '../components/PageWrapper'
import { apiRequest } from '../utils/api'

function levelBadge(l = '') {
  const v = l.toLowerCase()
  if (v === 'beginner') return 'badge-green'
  if (v === 'advanced') return 'badge-purple'
  return 'badge-cyan'
}
function diffBadge(d = '') {
  const v = d.toLowerCase()
  if (v === 'easy') return 'badge-green'
  if (v === 'hard') return 'badge-orange'
  return 'badge-cyan'
}

export default function MiniProject() {
  const navigate   = useNavigate()
  const { language: langParam } = useParams()

  // ── User's roadmap languages ──────────────────────────────────────────────
  const [roadmapLangs, setRoadmapLangs] = useState([])
  const [roadmapLoading, setRoadmapLoading] = useState(true)

  useEffect(() => {
    apiRequest('/roadmap')
      .then((res) => {
        // Use custom order if available, else roadmap entries
        const langs = res.customLanguages?.length
          ? res.customLanguages
          : (res.roadmap || []).map(r => r.language)
        setRoadmapLangs([...new Set(langs)].filter(Boolean))
      })
      .catch(() => setRoadmapLangs([]))
      .finally(() => setRoadmapLoading(false))
  }, [])

  // Active language — from URL param or first roadmap language
  const activeLang = langParam || (roadmapLangs[0] ?? '')

  // ── Projects for active language ──────────────────────────────────────────
  const [projects, setProjects]   = useState([])
  const [projLoading, setProjLoading] = useState(false)
  const [projError, setProjError] = useState('')
  const [selected, setSelected]   = useState(null)

  // Submission form state
  const [repoUrl, setRepoUrl]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')

  // More projects
  const [moreLoading, setMoreLoading] = useState(false)

  // Auto-save debounce ref
  const saveTimer = useRef(null)

  const loadProjects = (lang) => {
    if (!lang) return
    setProjLoading(true)
    setProjError('')
    setSelected(null)
    setRepoUrl('')
    setSubmitMsg('')
    apiRequest(`/mini-projects/user/${encodeURIComponent(lang)}`)
      .then((res) => {
        setProjects(res.projects || [])
        setSelected(res.projects?.[0] || null)
      })
      .catch((e) => { setProjError(e.message || 'Failed to load projects'); setProjects([]) })
      .finally(() => setProjLoading(false))
  }

  useEffect(() => {
    if (activeLang) loadProjects(activeLang)
  }, [activeLang]) // eslint-disable-line react-hooks/exhaustive-deps

  const switchLang = (lang) => navigate(`/mini-project/${encodeURIComponent(lang)}`)

  // ── Open in Code Editor ───────────────────────────────────────────────────
  const openEditor = (project) => {
    const ctx = {
      taskId:          null,
      videoId:         null,
      language:        activeLang,
      taskTitle:       project.title,
      taskDescription: project.description,
      difficulty:      project.difficulty?.toLowerCase() || 'medium',
      hints:           project.requirements || [],
      starterCode:     project.savedCode || `// ${project.title}\n// Language: ${activeLang}\n\n// Write your solution here\n`,
      problemDescription: [
        project.description,
        project.requirements?.length ? `Requirements:\n${project.requirements.map((r,i) => `${i+1}. ${r}`).join('\n')}` : '',
        project.expectedOutput ? `Expected output:\n${project.expectedOutput}` : '',
      ].filter(Boolean).join('\n\n'),
      // Extra fields so we can save back
      miniProjectId:   project.projectId,
      miniProjectLang: activeLang,
    }
    localStorage.setItem('dm-code-eval-context', JSON.stringify(ctx))
    navigate('/code-editor')
  }

  // ── Submit project ────────────────────────────────────────────────────────
  const handleSubmit = async (project) => {
    setSubmitting(true)
    setSubmitMsg('')
    try {
      const res = await apiRequest('/mini-projects/submit', {
        method: 'POST',
        body: JSON.stringify({
          language:      activeLang,
          projectId:     project.projectId,
          submittedRepo: repoUrl.trim(),
        }),
      })
      // Update local state
      setProjects(prev => prev.map(p => p.projectId === project.projectId ? { ...p, ...res.project } : p))
      setSelected(prev => prev?.projectId === project.projectId ? { ...prev, ...res.project } : prev)
      setSubmitMsg('✅ Project submitted successfully!')
    } catch (e) {
      setSubmitMsg(`❌ ${e.message || 'Submission failed'}`)
    } finally {
      setSubmitting(false)
    }
  }

  // ── More projects ─────────────────────────────────────────────────────────
  const handleMore = async () => {
    setMoreLoading(true)
    setSubmitMsg('')
    try {
      const res = await apiRequest('/mini-projects/more', {
        method: 'POST',
        body: JSON.stringify({ language: activeLang }),
      })
      setProjects(res.projects || [])
      if (res.aiUnavailable) {
        setSubmitMsg('AI is not configured. Set OPENROUTER_API_KEY in backend/.env to generate more projects.')
      } else if (res.added === 0) {
        setSubmitMsg('All generated projects are already in your list. Try again for new ones.')
      } else {
        setSubmitMsg(`✅ ${res.added} new project${res.added !== 1 ? 's' : ''} added!`)
      }
    } catch (e) {
      setSubmitMsg(e.message || 'Failed to load more projects')
    } finally {
      setMoreLoading(false)
    }
  }

  // Group by level
  const byLevel = projects.reduce((acc, p) => {
    const key = p.level || 'Beginner'
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {})
  const levelOrder = ['Beginner', 'Intermediate', 'Advanced']

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <PageWrapper>
          <h1 className="page-title">Mini Projects 🧪</h1>
          <p className="page-subtitle">Build real projects to solidify your skills.</p>

          {/* Language tabs — from user's roadmap */}
          {roadmapLoading ? (
            <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>Loading languages...</div>
          ) : (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {roadmapLangs.map((lang) => {
                const isActive = lang === activeLang
                return (
                  <button key={lang} onClick={() => switchLang(lang)} style={{
                    padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                    background: isActive ? 'var(--accent)' : 'var(--bg3)',
                    color: isActive ? '#fff' : 'var(--text3)',
                    border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border2)'}`,
                    cursor: 'pointer', transition: 'background 0.18s',
                  }}>
                    {lang}
                  </button>
                )
              })}
              {roadmapLangs.length === 0 && (
                <span style={{ fontSize: 13, color: 'var(--text3)' }}>No languages in your roadmap yet.</span>
              )}
            </div>
          )}

          {projLoading && <div className="card" style={{ padding: 14 }}>Loading mini projects...</div>}
          {!projLoading && projError && (
            <div style={{ padding: 14, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#b91c1c' }}>{projError}</div>
          )}
          {!projLoading && !projError && projects.length === 0 && activeLang && (
            <div className="card" style={{ padding: 14 }}>No projects available for {activeLang}.</div>
          )}

          {!projLoading && !projError && projects.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>

              {/* ── Left: project list grouped by level ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {levelOrder.filter(lv => byLevel[lv]).map(lv => (
                  <div key={lv}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: 0.5, marginBottom: 8 }}>
                      {lv.toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {byLevel[lv].map(p => (
                        <div key={p.projectId}
                          onClick={() => { setSelected(p); setRepoUrl(p.submittedRepo || ''); setSubmitMsg('') }}
                          style={{
                            padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                            background: selected?.projectId === p.projectId ? 'rgba(124,58,237,0.12)' : 'var(--card)',
                            border: `1px solid ${selected?.projectId === p.projectId ? 'rgba(124,58,237,0.4)' : 'var(--border)'}`,
                            transition: 'all 0.2s',
                          }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>{p.title}</div>
                            {p.status === 'submitted'
                              ? <span className="badge badge-green" style={{ fontSize: 9, flexShrink: 0 }}>✅ Done</span>
                              : <span className={`badge ${diffBadge(p.difficulty)}`} style={{ fontSize: 9, flexShrink: 0 }}>{p.difficulty}</span>
                            }
                          </div>
                          {p.savedCode && p.status !== 'submitted' && (
                            <div style={{ fontSize: 10, color: 'var(--accent)', marginTop: 2 }}>💾 Draft saved</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* More projects button */}
                <button className="btn-secondary" style={{ marginTop: 4, fontSize: 13 }}
                  onClick={handleMore} disabled={moreLoading}>
                  {moreLoading ? 'Loading...' : '+ More Projects'}
                </button>
              </div>

              {/* ── Right: project detail ── */}
              {selected && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Header */}
                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{selected.title}</h2>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span className="badge badge-cyan">{activeLang}</span>
                          <span className={`badge ${levelBadge(selected.level)}`}>{selected.level}</span>
                          <span className={`badge ${diffBadge(selected.difficulty)}`}>{selected.difficulty}</span>
                          {selected.status === 'submitted' && (
                            <span className="badge badge-green">✅ Submitted</span>
                          )}
                        </div>
                      </div>
                      {selected.aiScore != null && (
                        <div style={{ textAlign: 'center', padding: '10px 16px', background: 'rgba(16,185,129,0.1)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.3)' }}>
                          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)' }}>{selected.aiScore}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Score</div>
                        </div>
                      )}
                    </div>
                    <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7 }}>{selected.description}</p>
                  </div>

                  {/* Requirements + Expected Output */}
                  <div className="grid-2">
                    <div className="card">
                      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>📋 Requirements</h3>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {(selected.requirements || []).map((r, i) => (
                          <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text2)', alignItems: 'flex-start' }}>
                            <span style={{ color: 'var(--accent)', fontSize: 11, marginTop: 2 }}>◆</span>{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="card">
                      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>🎯 Expected Output</h3>
                      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{selected.expectedOutput}</p>
                      {selected.estimatedTime && (
                        <div style={{ marginTop: 14, padding: 10, borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 3 }}>Estimated time</div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{selected.estimatedTime}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action card */}
                  <div className="card">
                    {selected.status === 'submitted' ? (
                      // Already submitted
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)', marginBottom: 10 }}>
                          ✅ Project Submitted
                        </div>
                        {selected.submittedRepo && (
                          <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 12 }}>
                            Repo: <a href={selected.submittedRepo} target="_blank" rel="noreferrer"
                              style={{ color: 'var(--accent)' }}>{selected.submittedRepo}</a>
                          </div>
                        )}
                        <button className="btn-secondary" style={{ fontSize: 13 }}
                          onClick={() => openEditor(selected)}>
                          Show Code 💻
                        </button>
                      </div>
                    ) : (
                      // Not yet submitted
                      <div>
                        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📤 Submit Your Project</h3>
                        <input type="text" placeholder="Paste your GitHub repo or live demo URL..."
                          value={repoUrl} onChange={e => setRepoUrl(e.target.value)}
                          style={{
                            width: '100%', padding: '10px 14px', borderRadius: 8, boxSizing: 'border-box',
                            background: 'var(--bg3)', border: '1px solid var(--border)',
                            color: 'var(--text)', fontSize: 14, outline: 'none', marginBottom: 12,
                          }}
                          onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
                          onBlur={e  => { e.target.style.borderColor = 'var(--border)'  }}
                        />
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          <button className="btn-primary"
                            onClick={() => handleSubmit(selected)}
                            disabled={submitting || !repoUrl.trim()}
                            style={{ opacity: submitting ? 0.75 : 1 }}>
                            {submitting ? 'Submitting...' : 'Submit Project →'}
                          </button>
                          <button className="btn-secondary" style={{ fontSize: 13 }}
                            onClick={() => openEditor(selected)}>
                            Open Editor 💻
                          </button>
                        </div>
                      </div>
                    )}

                    {submitMsg && (
                      <div style={{
                        marginTop: 12, padding: 12, borderRadius: 8, fontSize: 13,
                        background: submitMsg.startsWith('✅') ? 'rgba(16,185,129,0.1)' : '#fef2f2',
                        border: `1px solid ${submitMsg.startsWith('✅') ? 'rgba(16,185,129,0.3)' : '#fecaca'}`,
                        color: submitMsg.startsWith('✅') ? '#15803d' : '#b91c1c',
                      }}>
                        {submitMsg}
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
