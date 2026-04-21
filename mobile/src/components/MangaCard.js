import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, TextInput, Modal, Dimensions,
} from 'react-native'
import { useState } from 'react'
import { updateEntry, removeFromList } from '../api'
import { colors, STATUS_LABELS, STATUS_COLORS, STATUS_OPTIONS } from '../theme'

const CARD_WIDTH = (Dimensions.get('window').width - 48 - 12) / 2

export default function MangaCard({ entry, mediaInfo, onUpdate, onRemove }) {
  const [modalVisible, setModalVisible] = useState(false)
  const [chapter, setChapter]           = useState(String(entry.current_chapter))
  const [status, setStatus]             = useState(entry.status)
  const [score, setScore]               = useState(entry.score != null ? String(entry.score) : '')
  const [loading, setLoading]           = useState(false)

  const title =
    mediaInfo?.title?.english ||
    mediaInfo?.title?.romaji ||
    `ID ${entry.anilist_id}`

  const cover = mediaInfo?.coverImage?.large
  const badge = STATUS_COLORS[entry.status] || STATUS_COLORS.PLANNED

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await updateEntry(entry.id, {
        current_chapter: Number(chapter) || 0,
        status,
        score: score === '' ? null : Number(score),
      })
      onUpdate(res.data)
      setModalVisible(false)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    await removeFromList(entry.id)
    onRemove(entry.id)
    setModalVisible(false)
  }

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
        <View style={styles.cover}>
          {cover
            ? <Image source={{ uri: cover }} style={styles.coverImg} />
            : <Text style={styles.coverPlaceholder}>?</Text>}
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>
              {STATUS_LABELS[entry.status]}
            </Text>
          </View>
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.chapter}>Cap. {entry.current_chapter}{mediaInfo?.chapters ? `/${mediaInfo.chapters}` : ''}</Text>
          {entry.score != null && (
            <Text style={styles.score}>★ {entry.score}</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Modal de edição */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle} numberOfLines={2}>{title}</Text>

            <Text style={styles.label}>CAPÍTULO ATUAL</Text>
            <TextInput
              style={styles.input}
              value={chapter}
              onChangeText={setChapter}
              keyboardType="number-pad"
              placeholderTextColor={colors.textDim}
            />

            <Text style={styles.label}>STATUS</Text>
            <View style={styles.statusRow}>
              {STATUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.statusBtn,
                    status === opt.value && styles.statusBtnActive,
                  ]}
                  onPress={() => setStatus(opt.value)}
                >
                  <Text style={[
                    styles.statusBtnText,
                    status === opt.value && styles.statusBtnTextActive,
                  ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>NOTA (0–10)</Text>
            <TextInput
              style={styles.input}
              value={score}
              onChangeText={setScore}
              keyboardType="decimal-pad"
              placeholder="—"
              placeholderTextColor={colors.textDim}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
              <Text style={styles.saveBtnText}>{loading ? 'Salvando…' : 'Salvar'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.removeBtn} onPress={handleRemove}>
              <Text style={styles.removeBtnText}>Remover da lista</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cover: {
    aspectRatio: 2 / 3,
    backgroundColor: colors.bgHover,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  coverPlaceholder: { fontSize: 32, color: colors.textDim },
  badge: {
    position: 'absolute', bottom: 6, left: 6,
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3,
  },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  info: { padding: 10, gap: 4 },
  title: { fontSize: 12, fontWeight: '600', color: colors.text, lineHeight: 17 },
  chapter: { fontSize: 11, color: colors.textMuted },
  score: { fontSize: 11, color: colors.yellow, fontWeight: '600' },

  // Modal
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: 40,
    borderTopWidth: 1, borderColor: colors.border,
  },
  sheetTitle: {
    fontSize: 17, fontWeight: '700', color: colors.text,
    marginBottom: 20, textAlign: 'center',
  },
  label: {
    fontSize: 11, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 1, marginBottom: 8, marginTop: 16,
  },
  input: {
    backgroundColor: colors.bg, borderWidth: 1,
    borderColor: colors.border, borderRadius: 10,
    color: colors.text, padding: 12, fontSize: 15,
  },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: colors.border,
  },
  statusBtnActive: { backgroundColor: colors.red, borderColor: colors.red },
  statusBtnText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  statusBtnTextActive: { color: '#fff' },

  saveBtn: {
    backgroundColor: colors.red, borderRadius: 10,
    padding: 14, alignItems: 'center', marginTop: 24,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  removeBtn: {
    borderWidth: 1, borderColor: colors.redDim,
    borderRadius: 10, padding: 13,
    alignItems: 'center', marginTop: 10,
  },
  removeBtnText: { color: colors.red, fontWeight: '600', fontSize: 14 },
  cancelText: {
    textAlign: 'center', color: colors.textMuted,
    marginTop: 16, fontSize: 14,
  },
})