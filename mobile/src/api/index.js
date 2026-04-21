import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Troque pelo IP da sua máquina quando testar no celular físico
// Ex: 'http://192.168.1.100:8000'
// Em produção: 'https://sua-api.onrender.com'
const BASE_URL = 'http://192.168.0.167:8000' // 10.0.2.2 = localhost no emulador Android

const api = axios.create({ baseURL: BASE_URL })

// Injeta o token JWT automaticamente em todas as requisições
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Auth ────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data)
export const login    = (data) => api.post('/auth/login', data)
export const getMe    = ()     => api.get('/auth/me')

// ── AniList ─────────────────────────────────────
export const searchAnilist   = (title, page = 1) =>
  api.get('/mangas/search', { params: { title, page, per_page: 12 } })

export const getAnilistDetail = (anilistId) =>
  api.get(`/mangas/anilist/${anilistId}`)

// ── Lista do usuário ─────────────────────────────
export const getMyList      = (status) =>
  api.get('/mangas/list', { params: status ? { status } : {} })

export const addToList      = (data)            => api.post('/mangas/list', data)
export const updateEntry    = (entryId, data)   => api.patch(`/mangas/list/${entryId}`, data)
export const removeFromList = (entryId)         => api.delete(`/mangas/list/${entryId}`)