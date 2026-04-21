import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView,
} from 'react-native'
import { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { getMyList, getAnilistDetail } from '../api'
import { useAuth } from '../contexts/AuthContext'
import MangaCard from '../components/MangaCard'
import { colors } from '../theme'

const FILTERS = [
  { label: 'Tudo',      value: '' },
  { label: 'Lendo',     value: 'READING' },
  { label: 'Completo',  value: 'COMPLETED' },
  { label: 'Planejado', value: 'PLANNED' },
  { label: 'Pausado',   value: 'PAUSED' },
  { label: 'Abandonado',value: 'DROPPED' },
]

export default function DashboardScreen() {
  const [entries, setEntries]   = useState([])
  const [mediaMap, setMediaMap] = useState({})
  const [filter, setFilter]     = useState('')
  const [loading, setLoading]   = useState(true)
  const { user, logout }        = useAuth()

  // Recarrega a lista toda vez que a aba recebe foco
  useFocusEffect(
    useCallback(() => { loadList() }, [filter])
  )

  const loadList = async () => {
    setLoading(true)
    try {
      const res  = await getMyList(filter)
      const list = res.data
      setEntries(list)

      // Busca detalhes da AniList em paralelo
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

  const handleUpdate = (updated) =>
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))

  const handleRemove = (entryId) =>
    setEntries((prev) => prev.filter((e) => e.id !== entryId))

  const renderItem = ({ item }) => (
    <MangaCard
      entry={item}
      mediaInfo={mediaMap[item.anilist_id]}
      onUpdate={handleUpdate}
      onRemove={handleRemove}
    />
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Minha Lista</Text>
          <Text style={styles.subtitle}>@{user?.username} · {entries.length} obras</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContent}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterBtn, filter === f.value && styles.filterBtnActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.red} size="large" />
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Nenhuma obra aqui ainda.</Text>
          <Text style={styles.emptyHint}>Use a aba Buscar para adicionar!</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: 1 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  logoutBtn: {
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7,
  },
  logoutText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },

  filtersScroll: { maxHeight: 52 },
  filtersContent: {
    paddingHorizontal: 20, paddingVertical: 10, gap: 8,
    flexDirection: 'row',
  },
  filterBtn: {
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: colors.border,
  },
  filterBtnActive: { backgroundColor: colors.red, borderColor: colors.red },
  filterText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#fff' },

  row: { justifyContent: 'space-between', paddingHorizontal: 20 },
  listContent: { paddingTop: 16, paddingBottom: 20 },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyText: { color: colors.textMuted, fontSize: 15 },
  emptyHint: { color: colors.textDim, fontSize: 13 },
})