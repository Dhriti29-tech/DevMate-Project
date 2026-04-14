import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import CodeBackground from '../components/CodeBackground'
import { apiRequest } from '../utils/api'

const LANGUAGE_ORDER = ['HTML', 'CSS', 'JavaScript', 'React', 'Node', 'Express', 'MongoDB']

const LANG_META = {
  HTML:       { label: 'HTML Mastery',        category: 'FOUNDATIONS',  desc: 'Semantic structures, accessibility patterns, and SEO fundamentals.', color: '#e34c26', modules: ['Semantic Elements', 'Forms & Inputs', 'Accessibility'] },
  CSS:        { label: 'CSS Architecture',    category: 'IN PROGRESS',  desc: 'Flexbox, Grid, Design Systems, and CSS-in-JS methodologies.',         color: '#06b6d4', modules: ['Flex & Grid', 'Design Tokens', 'Responsive Logic'] },
  JavaScript: { label: 'JavaScript Core',     category: 'NEXT',         desc: 'Functional programming, async patterns, and DOM manipulation.',        color: '#f7df1e', modules: ['ES6+ Syntax', 'Async/Await', 'DOM APIs'] },
  React:      { label: 'React & Frameworks',  category: 'NEXT',         desc: 'Component lifecycles, state management, and modern hooks.',            color: '#61dafb', modules: ['Components', 'Hooks', 'State Mgmt'] },
  Node:       { label: 'Node.js Backend',     category: 'ADVANCED',     desc: 'Server-side JavaScript, REST APIs, and file system operations.',       color: '#68a063', modules: ['Express Setup', 'REST APIs', 'Middleware'] },
  Express:    { label: 'Express.js',          category: 'ADVANCED',     desc: 'Routing, middleware chains, authentication, and error handling.',      color: '#7c3aed', modules: ['Routing', 'Auth', 'Error Handling'] },
  MongoDB:    { label: 'MongoDB & Databases', category: 'ADVANCED',     desc: 'Document modeling, aggregation pipelines, and indexing strategies.',   color: '#10b981', modules: ['Schema Design', 'Aggregation', 'Indexes'] },
}

const DISPLAY_LABEL = { Node: 'Node.js', Express: 'Express.js' }
function label(lang) { return DISPLAY_LABEL[lang] || lang }

export default function Roadmap() {
  const navigate = useNavigate()
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [resetting, setResetting]     = useState(false)

  const handleReset = async () => {
    setResetting(true)
    try {
      await apiRequest('/roadmap/reset', { method: 'POST' })
      localStorage.removeItem('dm-onboarding')
      localStorage.removeItem('dm-user')
      Object.keys(localStorage).filter(k => k.startsWith('dm-draft-')).forEach(k => localStorage.removeItem(k))
      navigate('/onboarding/skills')
    } catch (e) {
      setError(e.message || 'Reset failed.')
      setShowConfirm(false)
    } finally {
      setResetting(false)
    }
  }

  useEffect(() => {
    let mounted = true
    apiRequest('/roadmap')
      .then(res => { if (mounted) setData(res) })
      .catch(e  => { if (mounted) setError(e.message) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const isCustom = data?.startMode === 'custom'
  const roadmapEntries = (() => {
    if (!data?.roadmap) return []
    const byLang = new Map(data.roadmap.map(r => [r.language, r.status]))
    if (isCustom && Array.isArray(data.customLanguages) && data.customLanguages.length > 0) {
      return data.customLanguages.map(lang => ({
        language: lang,
        status: byLang.get(lang) || (lang === data.currentLanguage ? 'current' : 'locked'),
      }))
    }
    return LANGUAGE_ORDER.map(lang => ({ language: lang, status: byLang.get(lang) || 'locked' }))
  })()

  const currentLanguage  = data?.currentLanguage || null
  const completedCount   = roadmapEntries.filter(r => r.status === 'completed').length
  const streak           = data?.streak ?? 0

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
      <CodeBackground />
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>

        {/* Top bar */}
        <div style={{
          height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', borderBottom: '1px solid var(--border)',
          background: 'rgba(var(--sidebar-rgb),0.85)', backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          {/* Currently learning pill */}
          {currentLanguage && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 14px', borderRadius: 999,
              background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)',
              fontSize: 12, fontWeight: 600, color: '#06b6d4',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 6px #06b6d4' }} />
              CURRENTLY LEARNING: {currentLanguage.toUpperCase()}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setShowConfirm(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: 'transparent', border: '1px solid var(--border2)',
                color: 'var(--text2)', cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text2)' }}
            >
              🔄 RESET PROGRESS
            </button>
          </div>
        </div>

        <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>

          {/* Page title */}
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: 'var(--text)', letterSpacing: -1, marginBottom: 10 }}>
              Technical Roadmap
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text2)', maxWidth: 480, lineHeight: 1.7 }}>
              A curated curriculum designed for high-performance engineering. Track your evolution from foundational syntax to architectural mastery.
            </p>
          </div>

          {error && (
            <div style={{ padding: 14, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, marginBottom: 24, color: '#b91c1c', fontSize: 13 }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {roadmapEntries.map((entry, i) => {
                const { status, language } = entry
                const meta = LANG_META[language] || { label: language, category: 'MODULE', desc: '', color: '#6366f1', modules: [] }
                const isCompleted = status === 'completed'
                const isCurrent   = status === 'current'
                const isLocked    = status === 'locked'
                const accentColor = meta.color

                return (
                  <div key={language} style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 0 }}>

                    {/* Left: timeline */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                      {/* Circle */}
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', flexShrink: 0, zIndex: 2,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isCompleted ? 'rgba(16,185,129,0.15)'
                          : isCurrent ? `${accentColor}20`
                          : 'var(--bg3)',
                        border: `2px solid ${isCompleted ? '#10b981' : isCurrent ? accentColor : 'var(--border2)'}`,
                        boxShadow: isCurrent ? `0 0 16px ${accentColor}44` : 'none',
                        transition: 'all 0.3s',
                      }}>
                        {isCompleted
                          ? <span style={{ fontSize: 16, color: '#10b981' }}>✓</span>
                          : isLocked
                            ? <span style={{ fontSize: 14, color: 'var(--text3)' }}>🔒</span>
                            : <div style={{ width: 10, height: 10, borderRadius: '50%', background: accentColor, boxShadow: `0 0 8px ${accentColor}` }} />
                        }
                      </div>
                      {/* Connector line */}
                      {i < roadmapEntries.length - 1 && (
                        <div style={{
                          width: 2, flex: 1, minHeight: 32, marginTop: 4,
                          background: isCompleted
                            ? 'linear-gradient(180deg, #10b981, rgba(16,185,129,0.2))'
                            : 'var(--border)',
                        }} />
                      )}
                    </div>

                    {/* Right: content */}
                    <div style={{ paddingBottom: 32, paddingLeft: 8, opacity: isLocked ? 0.45 : 1, transition: 'opacity 0.3s' }}>
                      {/* Category label */}
                      <div style={{
                        fontSize: 10, fontWeight: 800, letterSpacing: 2,
                        color: isCompleted ? '#10b981' : isCurrent ? accentColor : 'var(--text3)',
                        marginBottom: 6, marginTop: 8,
                      }}>
                        {isCompleted ? 'COMPLETED' : isCurrent ? 'IN PROGRESS' : meta.category}
                      </div>

                      {/* Language name */}
                      <h2 style={{
                        fontSize: isCurrent ? 28 : 22, fontWeight: 800,
                        color: isLocked ? 'var(--text3)' : 'var(--text)',
                        marginBottom: 8, letterSpacing: -0.5,
                        transition: 'font-size 0.3s',
                      }}>
                        {meta.label}
                      </h2>

                      {/* Description */}
                      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, maxWidth: 340, lineHeight: 1.6 }}>
                        {meta.desc}
                      </p>

                      {/* Tags */}
                      <div style={{ display: 'flex', gap: 8, marginBottom: isCurrent ? 16 : 0, flexWrap: 'wrap' }}>
                        {isCompleted && (
                          <>
                            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 4, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                              ✓ COMPLETED
                            </span>
                            <button
                              onClick={() => navigate(`/video-task?language=${encodeURIComponent(language)}`)}
                              style={{ fontSize: 11, padding: '3px 12px', borderRadius: 4, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', cursor: 'pointer', fontWeight: 600, letterSpacing: 0.5 }}
                            >
                              REVIEW MODULES
                            </button>
                          </>
                        )}
                        {isLocked && (
                          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 4, background: 'var(--bg3)', color: 'var(--text3)', border: '1px solid var(--border)' }}>
                            PREREQUISITE: COMPLETE THE ABOVE FIRST
                          </span>
                        )}
                      </div>

                      {/* Current language expanded panel */}
                      {isCurrent && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: 560 }}>
                          {/* Module cards */}
                          {meta.modules.slice(0, 2).map((mod, mi) => (
                            <div key={mi} style={{
                              padding: '14px 16px', borderRadius: 12,
                              background: 'var(--card)', border: '1px solid var(--border)',
                              transition: 'border-color 0.2s, transform 0.2s',
                              cursor: 'pointer',
                            }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.transform = 'translateY(-2px)' }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
                              onClick={() => navigate(`/video-task?language=${encodeURIComponent(language)}`)}
                            >
                              <div style={{ fontSize: 18, marginBottom: 8 }}>
                                {mi === 0 ? '⊞' : '◈'}
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{mod}</div>
                              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Core module</div>
                              <div style={{ marginTop: 8, width: 8, height: 8, borderRadius: '50%', background: accentColor, boxShadow: `0 0 6px ${accentColor}` }} />
                            </div>
                          ))}

                          {/* Continue card — spans full width */}
                          {meta.modules[2] && (
                            <div style={{
                              gridColumn: '1 / -1', padding: '12px 16px', borderRadius: 12,
                              background: 'var(--card)', border: `1px solid ${accentColor}44`,
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              cursor: 'pointer',
                            }}
                              onClick={() => navigate(`/video-task?language=${encodeURIComponent(language)}`)}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                  width: 28, height: 28, borderRadius: 6,
                                  background: `${accentColor}20`, border: `1px solid ${accentColor}44`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 12, fontWeight: 700, color: accentColor,
                                }}>03</div>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{meta.modules[2]}</div>
                                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>Advanced module</div>
                                </div>
                              </div>
                              <button style={{
                                padding: '7px 18px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                                background: accentColor, color: '#fff', border: 'none', cursor: 'pointer',
                                boxShadow: `0 4px 12px ${accentColor}44`,
                              }}>
                                CONTINUE
                              </button>
                            </div>
                          )}

                          {/* Mini projects button */}
                          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, marginTop: 4 }}>
                            <button
                              onClick={() => navigate(`/mini-project/${language.toLowerCase()}`)}
                              className="btn-secondary"
                              style={{ fontSize: 12, padding: '7px 16px' }}
                            >
                              🧪 Mini Projects
                            </button>
                            <button
                              onClick={() => navigate(`/video-task?language=${encodeURIComponent(language)}`)}
                              className="btn-primary"
                              style={{ fontSize: 12, padding: '7px 16px' }}
                            >
                              Resume Learning →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Bottom stats */}
          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginTop: 40 }}>
              {[
                { value: String(completedCount).padStart(2, '0'), label: 'LANGUAGES COMPLETED', icon: '🎓', color: '#06b6d4' },
                { value: String(streak).padStart(2, '0'),         label: 'DAY LEARNING STREAK', icon: '🔥', color: '#f59e0b' },
                { value: 'Top 5%',                                label: 'USER PERFORMANCE',    icon: '⭐', color: '#6366f1' },
              ].map((s, i) => (
                <div key={i} style={{
                  padding: '22px 24px', borderRadius: 14,
                  background: 'var(--card)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = s.color}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: s.color, letterSpacing: -1, marginBottom: 6 }}>{s.value}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', letterSpacing: 1.5 }}>{s.label}</div>
                  </div>
                  <div style={{ fontSize: 28, opacity: 0.25 }}>{s.icon}</div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>

      {/* Reset Confirmation Modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border2)',
            borderRadius: 16, padding: 28, maxWidth: 420, width: '100%',
            animation: 'fadeUp 0.2s ease both', boxShadow: 'var(--shadow)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 22, marginBottom: 10 }}>⚠️</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>Reset your roadmap?</div>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 14 }}>This will permanently remove:</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {['🗑 All playlists and videos', '🗑 All task and video progress', '🗑 All code submissions and drafts', '🗑 Mini project progress', '🗑 Assessment results', '🗑 Roadmap data'].map((item, i) => (
                <li key={i} style={{ fontSize: 13, color: 'var(--text2)' }}>{item}</li>
              ))}
            </ul>
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>✅ Your XP and streak will remain safe.</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowConfirm(false)} disabled={resetting}>Cancel</button>
              <button style={{
                flex: 1, padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer',
                opacity: resetting ? 0.75 : 1,
              }} onClick={handleReset} disabled={resetting}>
                {resetting ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
