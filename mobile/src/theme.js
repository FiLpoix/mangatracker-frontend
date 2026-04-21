export const colors = {
  bg:         '#0d0d0f',
  bgCard:     '#141417',
  bgHover:    '#1c1c21',
  border:     '#2a2a30',
  red:        '#e63946',
  redDim:     '#a0252f',
  text:       '#f0f0f0',
  textMuted:  '#7a7a8a',
  textDim:    '#4a4a58',
  yellow:     '#f0c04c',
  green:      '#4cde8f',
  blue:       '#4caaff',
  purple:     '#b06cff',
}

export const STATUS_COLORS = {
  READING:   { bg: '#1a3a2a', text: '#4cde8f' },
  COMPLETED: { bg: '#1a2a3a', text: '#4caaff' },
  PAUSED:    { bg: '#3a3a1a', text: '#f0c04c' },
  PLANNED:   { bg: '#2a1a3a', text: '#b06cff' },
  DROPPED:   { bg: '#3a1a1a', text: '#ff6c6c' },
}

export const STATUS_LABELS = {
  READING:   'Lendo',
  COMPLETED: 'Completo',
  PAUSED:    'Pausado',
  PLANNED:   'Planejado',
  DROPPED:   'Abandonado',
}

export const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(
  ([value, label]) => ({ value, label })
)