import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { colors } from '../theme'

export default function LoginScreen({ navigation }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()

  const handleLogin = async () => {
    if (!email || !password) { setError('Preencha todos os campos'); return }
    setError('')
    setLoading(true)
    try {
      await login(email.trim().toLowerCase(), password)
    } catch (err) {
      setError(err.response?.data?.detail || 'Email ou senha incorretos')
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
          <Text style={styles.subtitle}>Entre na sua conta</Text>
        </View>

        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

        <View style={styles.form}>
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor={colors.textDim}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>SENHA</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={colors.textDim}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Entrar</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.switchText}>
            Não tem conta? <Text style={styles.switchLink}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 28,
  },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 4,
  },
  logoAccent: { color: colors.red },
  subtitle: { color: colors.textMuted, marginTop: 8, fontSize: 15 },

  errorBox: {
    backgroundColor: '#2a1a1a',
    borderWidth: 1,
    borderColor: colors.redDim,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  errorText: { color: '#ff8a8a', fontSize: 13 },

  form: { gap: 4, marginBottom: 32 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    color: colors.text,
    padding: 14,
    fontSize: 15,
  },
  btn: {
    backgroundColor: colors.red,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 24,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  switchText: { textAlign: 'center', color: colors.textMuted, fontSize: 14 },
  switchLink: { color: colors.red, fontWeight: '700' },
})