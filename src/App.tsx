import { useState } from 'react'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { ConvertDialog } from './components/ConvertDialog'
import { HomePage } from './components/HomePage'
import './App.css'

export type CommandHistoryItem = {
  command: string
  createdAt: string
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1d5b79' },
    secondary: { main: '#f97316' },
    background: { default: '#f6f4ef', paper: '#ffffff' },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: '"Sora", "Segoe UI", sans-serif',
    h1: { fontFamily: '"Sora", "Segoe UI", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Sora", "Segoe UI", sans-serif', fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
})

function App() {
  const [convertOpen, setConvertOpen] = useState(false)
  const [history, setHistory] = useState<CommandHistoryItem[]>([
    {
      command: 'ffmpeg -i "sample.mov" -c:v libx264 -c:a copy sample.mp4',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      command: 'ffmpeg -i "demo.mkv" -c:v libvpx-vp9 -c:a libopus demo.webm',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    },
  ])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HomePage history={history} onOpenConvert={() => setConvertOpen(true)} />
      <ConvertDialog
        open={convertOpen}
        onClose={() => setConvertOpen(false)}
        onComplete={(command) =>
          setHistory((prev) =>
            [
              { command, createdAt: new Date().toISOString() },
              ...prev,
            ].slice(0, 10),
          )
        }
      />
    </ThemeProvider>
  )
}

export default App
