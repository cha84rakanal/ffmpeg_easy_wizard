import { useEffect, useMemo, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'

type EditDialogProps = {
  open: boolean
  onClose: () => void
  onComplete: (command: string) => void
}

const getFileDisplayName = (file: File | null) => {
  if (!file) return ''
  const maybePath =
    (file as File & { path?: string }).path ||
    (file as File & { webkitRelativePath?: string }).webkitRelativePath
  if (maybePath) return maybePath
  return file.name
}

const normalizeTime = (value: string) => value.trim()

export function EditDialog({ open, onClose, onComplete }: EditDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [duration, setDuration] = useState(0)
  const [range, setRange] = useState<[number, number]>([0, 0])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

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
    onClose()
    setSelectedFile(null)
    setStartTime('')
    setEndTime('')
    setDuration(0)
    setRange([0, 0])
    setIsDragging(false)
  }

  useEffect(() => {
    if (!selectedFile) {
      setDuration(0)
      setRange([0, 0])
      return
    }

    const url = URL.createObjectURL(selectedFile)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = url

    const handleLoaded = () => {
      const nextDuration = Number.isFinite(video.duration)
        ? Math.max(0, video.duration)
        : 0
      setDuration(nextDuration)
      const clampedEnd = nextDuration > 0 ? nextDuration : 0
      setRange([0, clampedEnd])
      setStartTime('0')
      setEndTime(clampedEnd.toFixed(2))
      URL.revokeObjectURL(url)
    }

    const handleError = () => {
      setDuration(0)
      setRange([0, 0])
      URL.revokeObjectURL(url)
    }

    video.addEventListener('loadedmetadata', handleLoaded, { once: true })
    video.addEventListener('error', handleError, { once: true })

    return () => {
      video.removeEventListener('loadedmetadata', handleLoaded)
      video.removeEventListener('error', handleError)
      URL.revokeObjectURL(url)
    }
  }, [selectedFile])

  useEffect(() => {
    if (!duration) return
    const [start, end] = range
    setStartTime(start.toFixed(2))
    setEndTime(end.toFixed(2))
  }, [duration, range])

  const previewCommand = useMemo(() => {
    if (!selectedFile || !startTime || !endTime) return ''
    const inputName = getFileDisplayName(selectedFile)
    const start = normalizeTime(startTime)
    const end = normalizeTime(endTime)
    return `ffmpeg -i "${inputName}" -ss ${start} -to ${end} -c copy "trim_${inputName}"`
  }, [endTime, selectedFile, startTime])

  const canComplete = Boolean(selectedFile && startTime && endTime)

  return (
    <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth="sm">
      <DialogTitle>動画を加工する（トリム）</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
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

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="開始時刻 (hh:mm:ss または 秒)"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              fullWidth
            />
            <TextField
              label="終了時刻 (hh:mm:ss または 秒)"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              fullWidth
            />
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle2">トリム範囲</Typography>
            <Slider
              value={range}
              onChange={(_, value) =>
                Array.isArray(value) && setRange([value[0], value[1]])
              }
              min={0}
              max={duration || 0}
              step={0.01}
              valueLabelDisplay="auto"
              disabled={!duration}
            />
            <Typography variant="caption" color="text.secondary">
              再生時間: {duration ? `${duration.toFixed(2)}s` : '未取得'}
            </Typography>
          </Stack>

          {previewCommand && (
            <Stack spacing={1}>
              <Typography variant="subtitle2">生成コマンド</Typography>
              <Paper className="command-preview" elevation={0}>
                <Typography variant="body2" className="mono">
                  {previewCommand}
                </Typography>
              </Paper>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>キャンセル</Button>
        <Button
          variant="contained"
          onClick={() => {
            if (!previewCommand) return
            onComplete(previewCommand)
            handleDialogClose()
          }}
          disabled={!canComplete}
        >
          完了
        </Button>
      </DialogActions>
    </Dialog>
  )
}
