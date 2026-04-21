import { useState } from 'react'
import { searchAnilist, addToList } from '../api'
import './SearchPage.css'

const COUNTRY_TYPE = { JP: 'MANGA', KR: 'MANHWA', CN: 'MANHUA' }

const STATUS_LABELS = {
  FINISHED: 'Finalizado',
  RELEASING: 'Em lançamento',
  NOT_YET_RELEASED: 'Não lançado',
  CANCELLED: 'Cancelado',
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [pageInfo, setPageInfo] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(null)
  const [added, setAdded] = useState(new Set())
  const [error, setError] = useState('')

  const handleSearch = async (e, newPage = 1) => {
    if (e) e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await searchAnilist(query, newPage)
      setResults(res.data.media || [])
      setPageInfo(res.data.pageInfo)
      setPage(newPage)
    } catch {
      setError('Erro ao buscar na AniList')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (media) => {
    setAdding(media.id)
    try {
      await addToList({ anilist_id: media.id, status: 'PLANNED' })
      setAdded((prev) => new Set([...prev, media.id]))
    } catch (err) {
      const msg = err.response?.data?.detail
      if (msg === 'Essa obra já está na sua lista') {
        setAdded((prev) => new Set([...prev, media.id]))
      } else {
        alert(msg || 'Erro ao adicionar')
      }
    } finally {
      setAdding(null)
    }
  }

  return (
    <div className="page">
      <h1 className="search-title">Buscar Obras</h1>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          className="search-input"
          type="text"
          placeholder="Ex: Solo Leveling, Berserk, Tower of God…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      {error && <div className="error-msg">{error}</div>}

      {results.length > 0 && (
        <>
          <div className="search-grid">
            {results.map((media) => {
              const type = COUNTRY_TYPE[media.countryOfOrigin] || 'MANGA'
              const title = media.title.english || media.title.romaji
              const isAdded = added.has(media.id)
              const isAdding = adding === media.id

              return (
                <div key={media.id} className="search-card">
                  <div className="search-card__cover">
                    {media.coverImage?.large && (
                      <img src={media.coverImage.large} alt={title} loading="lazy" />
                    )}
                    <span className="search-card__type">{type}</span>
                  </div>
                  <div className="search-card__body">
                    <h3 className="search-card__title">{title}</h3>
                    <div className="search-card__meta">
                      {media.averageScore && (
                        <span className="search-card__score">★ {(media.averageScore / 10).toFixed(1)}</span>
                      )}
                      {media.status && (
                        <span className="search-card__status">
                          {STATUS_LABELS[media.status] || media.status}
                        </span>
                      )}
                    </div>
                    {media.genres?.length > 0 && (
                      <div className="search-card__genres">
                        {media.genres.slice(0, 3).map((g) => (
                          <span key={g} className="search-card__genre">{g}</span>
                        ))}
                      </div>
                    )}
                    <button
                      className={`btn ${isAdded ? 'btn-ghost' : 'btn-primary'} search-card__btn`}
                      onClick={() => !isAdded && handleAdd(media)}
                      disabled={isAdding || isAdded}
                    >
                      {isAdding ? 'Adicionando…' : isAdded ? '✓ Na lista' : '+ Adicionar'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {pageInfo && (
            <div className="search-pagination">
              <button
                className="btn btn-ghost"
                onClick={() => handleSearch(null, page - 1)}
                disabled={page === 1 || loading}
              >
                ← Anterior
              </button>
              <span className="search-page-info">
                Página {pageInfo.currentPage} de {pageInfo.lastPage}
              </span>
              <button
                className="btn btn-ghost"
                onClick={() => handleSearch(null, page + 1)}
                disabled={!pageInfo.hasNextPage || loading}
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}