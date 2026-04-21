import { useState } from 'react'
import { updateEntry, removeFromList } from '../api'
import './MangaCard.css'

const STATUS_LABELS = {
  READING: 'Lendo',
  COMPLETED: 'Completo',
  PAUSED: 'Pausado',
  PLANNED: 'Planejado',
  DROPPED: 'Abandonado',
}

const STATUS_OPTIONS = Object.entries(STATUS_LABELS)

export default function MangaCard({ entry, mediaInfo, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [chapter, setChapter] = useState(entry.current_chapter)
  const [status, setStatus] = useState(entry.status)
  const [score, setScore] = useState(entry.score ?? '')
  const [loading, setLoading] = useState(false)

  const title =
    mediaInfo?.title?.english ||
    mediaInfo?.title?.romaji ||
    `ID ${entry.anilist_id}`

  const cover = mediaInfo?.coverImage?.large

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await updateEntry(entry.id, {
        current_chapter: Number(chapter),
        status,
        score: score === '' ? null : Number(score),
      })
      onUpdate(res.data)
      setEditing(false)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!confirm(`Remover "${title}" da lista?`)) return
    await removeFromList(entry.id)
    onRemove(entry.id)
  }

  const badgeClass = `badge badge-${entry.status.toLowerCase()}`

  return (
    <div className={`manga-card ${editing ? 'manga-card--editing' : ''}`}>
      <div className="manga-card__cover">
        {cover ? (
          <img src={cover} alt={title} loading="lazy" />
        ) : (
          <div className="manga-card__cover-placeholder">?</div>
        )}
        <span className={badgeClass}>{STATUS_LABELS[entry.status]}</span>
      </div>

      <div className="manga-card__body">
        <h3 className="manga-card__title">{title}</h3>

        <div className="manga-card__meta">
          <span className="manga-card__type">{entry.media_type}</span>
          {entry.score && (
            <span className="manga-card__score">★ {entry.score}</span>
          )}
        </div>

        <div className="manga-card__chapter">
          Cap. {entry.current_chapter}
          {mediaInfo?.chapters ? ` / ${mediaInfo.chapters}` : ''}
        </div>

        {editing ? (
          <div className="manga-card__edit">
            <div className="form-group">
              <label>Capítulo atual</label>
              <input
                type="number"
                min="0"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Nota (0–10)</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={score}
                placeholder="—"
                onChange={(e) => setScore(e.target.value)}
              />
            </div>
            <div className="manga-card__edit-actions">
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                {loading ? 'Salvando…' : 'Salvar'}
              </button>
              <button className="btn btn-ghost" onClick={() => setEditing(false)}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="manga-card__actions">
            <button className="btn btn-ghost" onClick={() => setEditing(true)}>
              Editar
            </button>
            <button className="btn btn-danger" onClick={handleRemove}>
              Remover
            </button>
          </div>
        )}
      </div>
    </div>
  )
}