import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE_URL })

// Injeta o token JWT em todas as requisições automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Auth ────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)
export const getMe = () => api.get('/auth/me')

// ── Mangás — AniList ────────────────────────────
export const searchAnilist = (title, page = 1) =>
  api.get('/mangas/search', { params: { title, page, per_page: 18 } })

export const getAnilistDetail = (anilistId) =>
  api.get(`/mangas/anilist/${anilistId}`)

// ── Lista do usuário ────────────────────────────
export const getMyList = (status) =>
  api.get('/mangas/list', { params: status ? { status } : {} })

export const addToList = (data) => api.post('/mangas/list', data)

export const updateEntry = (entryId, data) =>
  api.patch(`/mangas/list/${entryId}`, data)

export const removeFromList = (entryId) =>
  api.delete(`/mangas/list/${entryId}`)