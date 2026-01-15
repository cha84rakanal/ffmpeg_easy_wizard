import { useEffect, useMemo, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import {
  Box,
  Button,
  Chip,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import MovieFilterIcon from '@mui/icons-material/MovieFilter'
import TerminalIcon from '@mui/icons-material/Terminal'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import HistoryIcon from '@mui/icons-material/History'
import { codecOptions } from './codecOptions'
import './App.css'

const steps = ['ファイル選択', 'コーデック指定', '拡張子指定']

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

const getFileDisplayName = (file: File | null) => {
  if (!file) return ''
  const maybePath =
    (file as File & { path?: string }).path ||
    (file as File & { webkitRelativePath?: string }).webkitRelativePath
  if (maybePath) return maybePath
  return file.name
}

const getOutputName = (inputName: string, extension: string) => {
  const base = inputName.split(/[\\/]/).pop() || inputName
  const dotIndex = base.lastIndexOf('.')
  const stem = dotIndex > 0 ? base.slice(0, dotIndex) : base
  return `${stem}.${extension}`
}

function App() {
  const [convertOpen, setConvertOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedCodecId, setSelectedCodecId] = useState('')
  const [selectedExtension, setSelectedExtension] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [history, setHistory] = useState<string[]>([
    'ffmpeg -i "sample.mov" -c:v libx264 -c:a copy sample.mp4',
    'ffmpeg -i "demo.mkv" -c:v libvpx-vp9 -c:a libopus demo.webm',
  ])

  const allowedCodecs = useMemo(() => {
    if (!selectedExtension) return codecOptions
    return codecOptions.filter((codec) =>
      codec.extensions.includes(selectedExtension),
    )
  }, [selectedExtension])

  const allowedExtensions = useMemo(() => {
    if (!selectedCodecId) {
      return Array.from(
        new Set(codecOptions.flatMap((codec) => codec.extensions)),
      )
    }
    const codec = codecOptions.find((item) => item.id === selectedCodecId)
    return codec ? codec.extensions : []
  }, [selectedCodecId])

  useEffect(() => {
    if (
      selectedCodecId &&
      selectedExtension &&
      !allowedExtensions.includes(selectedExtension)
    ) {
      setSelectedExtension('')
    }
  }, [allowedExtensions, selectedCodecId, selectedExtension])

  useEffect(() => {
    if (
      selectedExtension &&
      selectedCodecId &&
      !allowedCodecs.some((codec) => codec.id === selectedCodecId)
    ) {
      setSelectedCodecId('')
    }
  }, [allowedCodecs, selectedCodecId, selectedExtension])

  const handleFileSelect = (file: File | null) => {
    if (!file) return
    setSelectedFile(file)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleDialogClose = () => {
    setConvertOpen(false)
    setActiveStep(0)
    setSelectedFile(null)
    setSelectedCodecId('')
    setSelectedExtension('')
    setIsDragging(false)
  }

  const currentCodec = codecOptions.find((item) => item.id === selectedCodecId)

  const previewCommand = useMemo(() => {
    if (!selectedFile || !currentCodec || !selectedExtension) return ''
    const inputName = getFileDisplayName(selectedFile)
    const outputName = getOutputName(inputName, selectedExtension)
    return `ffmpeg -i "${inputName}" -c:v ${currentCodec.ffmpeg} -c:a copy "${outputName}"`
  }, [currentCodec, selectedExtension, selectedFile])

  const stepValidations = [
    Boolean(selectedFile),
    Boolean(selectedCodecId),
    Boolean(selectedExtension),
  ]

  const isLastStep = activeStep === steps.length - 1
  const canProceed = stepValidations[activeStep]

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="app-shell">
        <Box className="hero">
          <Typography variant="h2">FFmpeg Easy Wizard</Typography>
          <Typography className="hero-sub">
            動画の変換・加工・コマンド構築を、やさしい手順で素早く。
          </Typography>
        </Box>

        <Box className="action-grid">
          <Paper className="action-card tone-convert" elevation={0}>
            <MovieFilterIcon fontSize="large" />
            <Typography variant="h6">動画を形式を変換する</Typography>
            <Typography className="action-copy">
              コーデックと拡張子を選んで、変換コマンドを作成します。
            </Typography>
            <Button
              variant="contained"
              onClick={() => setConvertOpen(true)}
            >
              変換ウィザードを開く
            </Button>
          </Paper>
          <Paper className="action-card tone-edit" elevation={0}>
            <AutoFixHighIcon fontSize="large" />
            <Typography variant="h6">動画を加工する</Typography>
            <Typography className="action-copy">
              切り出し・フィルター・速度調整などを順番に追加します。
            </Typography>
            <Button variant="outlined">準備中</Button>
          </Paper>
          <Paper className="action-card tone-build" elevation={0}>
            <TerminalIcon fontSize="large" />
            <Typography variant="h6">コマンドを構築する</Typography>
            <Typography className="action-copy">
              オプションを組み合わせて、自在にコマンドを組み立てます。
            </Typography>
            <Button variant="outlined">準備中</Button>
          </Paper>
        </Box>

        <Paper className="history-card" elevation={0}>
          <Box className="history-header">
            <Stack direction="row" spacing={1} alignItems="center">
              <HistoryIcon />
              <Typography variant="h6">以前作成したコマンド</Typography>
            </Stack>
            <Chip size="small" label={`${history.length} 件`} />
          </Box>
          <List dense>
            {history.map((item, index) => (
              <ListItem key={`${item}-${index}`}>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>

      <Dialog
        open={convertOpen}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>動画形式を変換する</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {activeStep === 0 && (
              <Box
                className={`drop-zone ${isDragging ? 'is-dragging' : ''}`}
                onDragOver={(event) => {
                  event.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <UploadFileIcon fontSize="large" />
                <Typography variant="h6">ファイルをドラッグ&ドロップ</Typography>
                <Typography className="drop-sub">
                  またはファイルブラウザから選択してください。
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                >
                  ファイルを選択
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  onChange={(event) =>
                    handleFileSelect(event.target.files?.[0] ?? null)
                  }
                />
                {selectedFile && (
                  <Box className="file-preview">
                    <Typography variant="body2">選択中:</Typography>
                    <Typography variant="subtitle2">
                      {getFileDisplayName(selectedFile)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ブラウザではフルパスが取得できない場合があります。
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {activeStep === 1 && (
              <FormControl fullWidth>
                <InputLabel id="codec-label">変換コーデック</InputLabel>
                <Select
                  labelId="codec-label"
                  label="変換コーデック"
                  value={selectedCodecId}
                  onChange={(event) =>
                    setSelectedCodecId(event.target.value as string)
                  }
                >
                  {allowedCodecs.map((codec) => (
                    <MenuItem key={codec.id} value={codec.id}>
                      {codec.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {activeStep === 2 && (
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel id="extension-label">出力拡張子</InputLabel>
                  <Select
                    labelId="extension-label"
                    label="出力拡張子"
                    value={selectedExtension}
                    onChange={(event) =>
                      setSelectedExtension(event.target.value as string)
                    }
                  >
                    {allowedExtensions.map((ext) => (
                      <MenuItem key={ext} value={ext}>
                        .{ext}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {previewCommand && (
                  <Paper className="command-preview" elevation={0}>
                    <Typography variant="subtitle2">生成コマンド</Typography>
                    <Typography variant="body2" className="mono">
                      {previewCommand}
                    </Typography>
                  </Paper>
                )}
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>キャンセル</Button>
          <Button
            onClick={() => setActiveStep((step) => Math.max(step - 1, 0))}
            disabled={activeStep === 0}
          >
            戻る
          </Button>
          {!isLastStep && (
            <Button
              variant="contained"
              onClick={() => setActiveStep((step) => step + 1)}
              disabled={!canProceed}
            >
              次へ
            </Button>
          )}
          {isLastStep && (
            <Button
              variant="contained"
              onClick={() => {
                if (!previewCommand) return
                setHistory((prev) => [previewCommand, ...prev].slice(0, 10))
                handleDialogClose()
              }}
              disabled={!canProceed}
            >
              完了
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  )
}

export default App
