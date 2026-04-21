import { useState, useEffect } from 'react'
import { getMyList, getAnilistDetail } from '../api'
import MangaCard from '../components/MangaCard'
import './DashboardPage.css'

const FILTERS = [
  { label: 'Tudo', value: '' },
  { label: 'Lendo', value: 'READING' },
  { label: 'Completo', value: 'COMPLETED' },
  { label: 'Planejado', value: 'PLANNED' },
  { label: 'Pausado', value: 'PAUSED' },
  { label: 'Abandonado', value: 'DROPPED' },
]

export default function DashboardPage() {
  const [entries, setEntries] = useState([])
  const [mediaMap, setMediaMap] = useState({})
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadList()
  }, [filter])

  const loadList = async () => {
    setLoading(true)
    try {
      const res = await getMyList(filter)
      const list = res.data
      setEntries(list)

      // Busca os detalhes da AniList para cada obra (em paralelo)
      const details = await Promise.allSettled(
        list.map((e) => getAnilistDetail(e.anilist_id))
      )

      const map = {}
      details.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          map[list[i].anilist_id] = result.value.data
        }
      })
      setMediaMap(map)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = (updated) => {
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
  }

  const handleRemove = (entryId) => {
    setEntries((prev) => prev.filter((e) => e.id !== entryId))
  }

  return (
    <div className="page">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Minha Lista</h1>
        <span className="dashboard-count">{entries.length} obra{entries.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="dashboard-filters">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`filter-btn ${filter === f.value ? 'active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="dashboard-loading">
          <div className="spinner" />
          <p>Carregando lista…</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="dashboard-empty">
          <p>Nenhuma obra aqui ainda.</p>
          <a href="/search" className="btn btn-primary">Buscar obras</a>
        </div>
      ) : (
        <div className="manga-grid">
          {entries.map((entry) => (
            <MangaCard
              key={entry.id}
              entry={entry}
              mediaInfo={mediaMap[entry.anilist_id]}
              onUpdate={handleUpdate}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  )
}