import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native'
import { useState } from 'react'
import { register } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { colors } from '../theme'

export default function RegisterScreen({ navigation }) {
  const [form, setForm]       = useState({ username: '', email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const set = (field) => (val) => setForm({ ...form, [field]: val })

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password) {
      setError('Preencha todos os campos')
      return
    }
    setError('')
    setLoading(true)
    try {
      await register({ ...form, email: form.email.trim().toLowerCase() })
      await login(form.email.trim().toLowerCase(), form.password)
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>
            MANGA<Text style={styles.logoAccent}>TRACKER</Text>
          </Text>
          <Text style={styles.subtitle}>Crie sua conta grátis</Text>
        </View>

        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

        <View style={styles.form}>
          <Text style={styles.label}>USERNAME</Text>
          <TextInput
            style={styles.input}
            placeholder="seunick"
            placeholderTextColor={colors.textDim}
            value={form.username}
            onChangeText={set('username')}
            autoCapitalize="none"
          />

          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor={colors.textDim}
            value={form.email}
            onChangeText={set('email')}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>SENHA</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={colors.textDim}
            value={form.password}
            onChangeText={set('password')}
            secureTextEntry
          />

          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Criar conta</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.switchText}>
            Já tem conta? <Text style={styles.switchLink}>Entrar</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 32, fontWeight: '900', color: colors.text, letterSpacing: 4 },
  logoAccent: { color: colors.red },
  subtitle: { color: colors.textMuted, marginTop: 8, fontSize: 15 },
  errorBox: {
    backgroundColor: '#2a1a1a', borderWidth: 1,
    borderColor: colors.redDim, borderRadius: 10,
    padding: 12, marginBottom: 20,
  },
  errorText: { color: '#ff8a8a', fontSize: 13 },
  form: { gap: 4, marginBottom: 32 },
  label: {
    fontSize: 11, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 1, marginBottom: 6, marginTop: 16,
  },
  input: {
    backgroundColor: colors.bgCard, borderWidth: 1,
    borderColor: colors.border, borderRadius: 10,
    color: colors.text, padding: 14, fontSize: 15,
  },
  btn: {
    backgroundColor: colors.red, borderRadius: 10,
    padding: 15, alignItems: 'center', marginTop: 24,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  switchText: { textAlign: 'center', color: colors.textMuted, fontSize: 14 },
  switchLink: { color: colors.red, fontWeight: '700' },
})