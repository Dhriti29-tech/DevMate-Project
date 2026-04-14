import { NavLink, useNavigate } from 'react-router-dom'

const links = [
  { to: '/dashboard',        icon: <DashIcon />,    label: 'Dashboard' },
  { to: '/roadmap',          icon: <RoadIcon />,    label: 'Roadmap' },
  { to: '/video-task',       icon: <VideoIcon />,   label: 'Video Tasks' },
  { to: '/code-editor',      icon: <CodeIcon />,    label: 'Code Editor' },
  { to: '/mini-project',     icon: <ProjectIcon />, label: 'Mini Projects' },
  { to: '/simulation',       icon: <SimIcon />,     label: 'Simulation' },
  { to: '/progress',         icon: <ProgressIcon />,label: 'Progress' },
  { to: '/job-readiness',    icon: <JobIcon />,     label: 'Job Readiness' },
  { to: '/github-dashboard', icon: <GithubIcon />,  label: 'GitHub' },
  { to: '/profile',          icon: <ProfileIcon />, label: 'Profile' },
  { to: '/certificate',      icon: <CertIcon />,    label: 'Certificates' },
]

function DashIcon()    { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> }
function RoadIcon()    { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 17l6-12 6 12"/><path d="M9 17h12"/></svg> }
function VideoIcon()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> }
function CodeIcon()    { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> }
function ProjectIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg> }
function SimIcon()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14"/></svg> }
function ProgressIcon(){ return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> }
function JobIcon()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> }
function GithubIcon()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/></svg> }
function ProfileIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function CertIcon()    { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg> }

export default function Sidebar({ onUpgrade }) {
  const navigate = useNavigate()

  return (
    <aside style={{
      width: 220,
      background: '#0a0a12',
      borderRight: '1px solid rgba(99,102,241,0.12)',
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh', position: 'sticky', top: 0, height: '100vh',
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: '#fff' }}>
          Dev<span style={{ color: '#06b6d4' }}>Mate</span>
        </div>
        <div style={{ fontSize: 11, color: '#334155', marginTop: 3, fontFamily: 'JetBrains Mono, monospace' }}>
          // learning platform
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
        {links.map((l) => (
          <NavLink
            key={l.to} to={l.to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8,
              fontSize: 13, fontWeight: isActive ? 600 : 400,
              color: isActive ? '#06b6d4' : '#64748b',
              background: isActive ? 'rgba(6,182,212,0.08)' : 'transparent',
              borderLeft: isActive ? '2px solid #06b6d4' : '2px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.15s',
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.color = '#94a3b8'
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.style.borderLeft.includes('06b6d4')) {
                e.currentTarget.style.color = '#64748b'
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            <span style={{ opacity: 0.8, flexShrink: 0 }}>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* Upgrade to Pro */}
      <div style={{ padding: '12px 12px 0' }}>
        <button style={{
          width: '100%', padding: '10px', borderRadius: 8,
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          color: '#fff', fontWeight: 700, fontSize: 13,
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
          transition: 'opacity 0.18s',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          onClick={onUpgrade}
        >
          ⚡ Upgrade to Pro
        </button>
      </div>

      {/* Bottom */}
      <div style={{ padding: '12px 10px', marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%', padding: '8px 12px', borderRadius: 8,
            background: 'transparent', color: '#334155', fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 9,
            border: 'none', cursor: 'pointer',
            transition: 'color 0.18s, background 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#334155'; e.currentTarget.style.background = 'transparent' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}
