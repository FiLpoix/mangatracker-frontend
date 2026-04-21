import {
  View, Text, TextInput, FlatList, Image,
  TouchableOpacity, StyleSheet, ActivityIndicator,
  Dimensions,
} from 'react-native'
import { useState } from 'react'
import { searchAnilist, addToList } from '../api'
import { colors } from '../theme'

const COUNTRY_TYPE = { JP: 'MANGA', KR: 'MANHWA', CN: 'MANHUA' }
const CARD_WIDTH = (Dimensions.get('window').width - 48 - 12) / 2

export default function SearchScreen() {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [pageInfo, setPageInfo] = useState(null)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [adding, setAdding]   = useState(null)
  const [added, setAdded]     = useState(new Set())
  const [error, setError]     = useState('')

  const handleSearch = async (newPage = 1) => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await searchAnilist(query, newPage)
      if (newPage === 1) {
        setResults(res.data.media || [])
      } else {
        setResults((prev) => [...prev, ...(res.data.media || [])])
      }
      setPageInfo(res.data.pageInfo)
      setPage(newPage)
    } catch {
      setError('Erro ao buscar. Tente novamente.')
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
      }
    } finally {
      setAdding(null)
    }
  }

  const renderItem = ({ item }) => {
    const type    = COUNTRY_TYPE[item.countryOfOrigin] || 'MANGA'
    const title   = item.title.english || item.title.romaji
    const isAdded = added.has(item.id)
    const score   = item.averageScore ? (item.averageScore / 10).toFixed(1) : null

    return (
      <View style={styles.card}>
        <View style={styles.cover}>
          {item.coverImage?.large
            ? <Image source={{ uri: item.coverImage.large }} style={styles.coverImg} />
            : <Text style={styles.coverPlaceholder}>?</Text>}
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{type}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
          <View style={styles.cardMeta}>
            {score && <Text style={styles.cardScore}>★ {score}</Text>}
            {item.genres?.[0] && (
              <Text style={styles.cardGenre} numberOfLines={1}>{item.genres[0]}</Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.addBtn, isAdded && styles.addBtnDone]}
            onPress={() => !isAdded && handleAdd(item)}
            disabled={adding === item.id || isAdded}
          >
            {adding === item.id
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.addBtnText}>{isAdded ? '✓ Na lista' : '+ Adicionar'}</Text>}
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Buscar Obras</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="Solo Leveling, Berserk…"
            placeholderTextColor={colors.textDim}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch(1)}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => handleSearch(1)}
            disabled={loading}
          >
            <Text style={styles.searchBtnText}>Buscar</Text>
          </TouchableOpacity>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      {/* Resultados */}
      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          pageInfo?.hasNextPage ? (
            <TouchableOpacity
              style={styles.loadMoreBtn}
              onPress={() => handleSearch(page + 1)}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={colors.red} />
                : <Text style={styles.loadMoreText}>Carregar mais</Text>}
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: colors.border, gap: 14,
  },
  title: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: 1 },
  searchRow: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1, backgroundColor: colors.bgCard, borderWidth: 1,
    borderColor: colors.border, borderRadius: 10,
    color: colors.text, padding: 12, fontSize: 14,
  },
  searchBtn: {
    backgroundColor: colors.red, borderRadius: 10,
    paddingHorizontal: 18, justifyContent: 'center',
  },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  errorText: { color: '#ff8a8a', fontSize: 13 },

  row: { justifyContent: 'space-between', paddingHorizontal: 20 },
  listContent: { paddingTop: 16, paddingBottom: 30 },

  card: {
    width: CARD_WIDTH, backgroundColor: colors.bgCard,
    borderRadius: 10, borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden', marginBottom: 12,
  },
  cover: {
    aspectRatio: 2 / 3, backgroundColor: colors.bgHover,
    justifyContent: 'center', alignItems: 'center',
  },
  coverImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  coverPlaceholder: { fontSize: 32, color: colors.textDim },
  typeBadge: {
    position: 'absolute', top: 6, left: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 4, paddingHorizontal: 7, paddingVertical: 3,
  },
  typeText: { fontSize: 9, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.8 },
  cardBody: { padding: 10, gap: 6 },
  cardTitle: { fontSize: 12, fontWeight: '600', color: colors.text, lineHeight: 17 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardScore: { fontSize: 11, color: colors.yellow, fontWeight: '600' },
  cardGenre: { fontSize: 11, color: colors.textDim, flex: 1 },
  addBtn: {
    backgroundColor: colors.red, borderRadius: 8,
    padding: 8, alignItems: 'center', marginTop: 2,
  },
  addBtnDone: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  loadMoreBtn: {
    margin: 20, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, padding: 14, alignItems: 'center',
  },
  loadMoreText: { color: colors.textMuted, fontWeight: '600' },
})