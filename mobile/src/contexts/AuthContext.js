import { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { login as apiLogin, getMe } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    AsyncStorage.getItem('token').then((token) => {
      if (token) {
        getMe()
          .then((res) => setUser(res.data))
          .catch(() => AsyncStorage.removeItem('token'))
          .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })
  }, [])

  const login = async (email, password) => {
    const res = await apiLogin({ email, password })
    await AsyncStorage.setItem('token', res.data.access_token)
    const me = await getMe()
    setUser(me.data)
  }

  const logout = async () => {
    await AsyncStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)