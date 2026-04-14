const LANG_COLORS = {
  JavaScript: '#f59e0b', TypeScript: '#3b82f6', Python: '#10b981',
  HTML: '#ef4444', CSS: '#06b6d4', React: '#61dafb', Java: '#f97316',
  'C++': '#8b5cf6', Go: '#00add8', Rust: '#f74c00', default: '#6366f1',
}

export default function RepoCard({ repo }) {
  const langColor = LANG_COLORS[repo.language] || LANG_COLORS.default
  const updated = new Date(repo.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card card-click"
      style={{ display: 'block', textDecoration: 'none', padding: 18 }}
    >
      {/* Repo name + private badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="var(--accent)">
            <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>
          </svg>
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--accent)' }}>{repo.name}</span>
        </div>
        {repo.isPrivate && (
          <span className="badge badge-orange" style={{ fontSize: 11 }}>Private</span>
        )}
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14, minHeight: 36,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {repo.description || 'No description'}
      </p>

      {/* Footer: language, stars, forks, updated */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        {repo.language && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: langColor }} />
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>{repo.language}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text2)' }}>
          ⭐ {repo.stars}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text2)' }}>
          🍴 {repo.forks}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text3)' }}>
          Updated {updated}
        </div>
      </div>
    </a>
  )
}
