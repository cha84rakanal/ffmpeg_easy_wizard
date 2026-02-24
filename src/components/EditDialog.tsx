import { useEffect, useMemo, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { EditDialogDropZone } from './edit-dialog/EditDialogDropZone'
import { EditDialogPreview } from './edit-dialog/EditDialogPreview'
import { EditDialogTrimRange } from './edit-dialog/EditDialogTrimRange'

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
const previewFixedTimeSeconds = 0.08

export function EditDialog({ open, onClose, onComplete }: EditDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [duration, setDuration] = useState(0)
  const [range, setRange] = useState<[number, number]>([0, 0])
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [previewTime, setPreviewTime] = useState(0)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [playbackDuration, setPlaybackDuration] = useState(0)
  const [frameRate, setFrameRate] = useState(30)
  const [isDragging, setIsDragging] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const previewRequestRef = useRef(0)
  const previousUrlRef = useRef<string | null>(null)

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
    setVideoUrl(null)
    setIsScrubbing(false)
    setPreviewTime(0)
    setPreviewImage(null)
    setIsPlaying(false)
    setPlaybackTime(0)
    setPlaybackDuration(0)
    setIsDragging(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
    if (previousUrlRef.current) {
      URL.revokeObjectURL(previousUrlRef.current)
      previousUrlRef.current = null
    }
  }

  useEffect(() => {
    if (previousUrlRef.current) {
      URL.revokeObjectURL(previousUrlRef.current)
      previousUrlRef.current = null
    }

    if (!selectedFile) {
      setDuration(0)
      setRange([0, 0])
      setVideoUrl(null)
      return
    }

    const url = URL.createObjectURL(selectedFile)
    previousUrlRef.current = url
    setVideoUrl(url)
    setPreviewImage(null)
    setIsScrubbing(false)
    setPreviewTime(previewFixedTimeSeconds)
    setIsPlaying(false)
    setPlaybackTime(0)
    setPlaybackDuration(0)
  }, [selectedFile])

  useEffect(() => {
    if (!duration) return
    const [start, end] = range
    setStartTime(start.toFixed(2))
    setEndTime(end.toFixed(2))
  }, [duration, range])

  const requestPreviewFrame = (
    time: number,
    onResult: (dataUrl: string) => void,
  ) => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const effectiveDuration = Number.isFinite(video.duration)
      ? Math.max(0, video.duration)
      : duration
    if (!effectiveDuration) return
    const clamped = Math.min(Math.max(time, 0), effectiveDuration)
    const requestId = previewRequestRef.current + 1
    previewRequestRef.current = requestId

    const handleSeeked = () => {
      if (previewRequestRef.current !== requestId) return
      const context = canvas.getContext('2d')
      if (!context) return
      const width = 320
      const height = 180
      canvas.width = width
      canvas.height = height
      const sourceWidth = video.videoWidth || width
      const sourceHeight = video.videoHeight || height
      const sourceRatio = sourceWidth / sourceHeight
      const targetRatio = width / height
      let sx = 0
      let sy = 0
      let sWidth = sourceWidth
      let sHeight = sourceHeight

      if (sourceRatio > targetRatio) {
        sWidth = Math.round(sourceHeight * targetRatio)
        sx = Math.round((sourceWidth - sWidth) / 2)
      } else if (sourceRatio < targetRatio) {
        sHeight = Math.round(sourceWidth / targetRatio)
        sy = Math.round((sourceHeight - sHeight) / 2)
      }

      context.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, width, height)
      onResult(canvas.toDataURL('image/jpeg', 0.9))
    }

    if (Math.abs(video.currentTime - clamped) < 0.01 && video.readyState >= 2) {
      handleSeeked()
      return
    }

    video.addEventListener('seeked', handleSeeked, { once: true })
    try {
      video.currentTime = clamped
    } catch {
      video.removeEventListener('seeked', handleSeeked)
    }
  }

  const previewCommand = useMemo(() => {
    if (!selectedFile || !startTime || !endTime) return ''
    const inputName = getFileDisplayName(selectedFile)
    const start = normalizeTime(startTime)
    const end = normalizeTime(endTime)
    return `ffmpeg -i "${inputName}" -ss ${start} -to ${end} -c copy "trim_${inputName}"`
  }, [endTime, selectedFile, startTime])

  const canComplete = Boolean(selectedFile && startTime && endTime)

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      void video.play()
    } else {
      video.pause()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { overflow: 'visible' } }}
    >
      <DialogTitle>動画を加工する（トリム）</DialogTitle>
      <DialogContent dividers sx={{ overflow: 'visible' }}>
        <Stack spacing={3}>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <EditDialogDropZone
            isDragging={isDragging}
            selectedFileName={getFileDisplayName(selectedFile)}
            onFileSelect={handleFileSelect}
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          />

          {videoUrl && (
            <EditDialogPreview
              videoUrl={videoUrl}
              videoRef={videoRef}
              playbackTime={playbackTime}
              playbackDuration={playbackDuration}
              isPlaying={isPlaying}
              frameRate={frameRate}
              onTogglePlay={togglePlay}
              onSeek={(value) => {
                setPlaybackTime(value)
                const video = videoRef.current
                if (video) {
                  video.currentTime = value
                }
              }}
              onLoadedMetadata={(event) => {
                const target = event.currentTarget
                const nextDuration = Number.isFinite(target.duration)
                  ? Math.max(0, target.duration)
                  : 0
                setDuration(nextDuration)
                setPlaybackDuration(nextDuration)
                setFrameRate(30)
                const clampedEnd = nextDuration > 0 ? nextDuration : 0
                setRange([0, clampedEnd])
                setStartTime('0')
                setEndTime(clampedEnd.toFixed(2))
                setPreviewTime(previewFixedTimeSeconds)
              }}
              onTimeUpdate={(event) =>
                setPlaybackTime(event.currentTarget.currentTime)
              }
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onError={() => {
                setDuration(0)
                setRange([0, 0])
                setPlaybackDuration(0)
              }}
            />
          )}

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
            <EditDialogTrimRange
              duration={duration}
              range={range}
              isScrubbing={isScrubbing}
              previewImage={previewImage}
              previewTime={previewTime}
              onRangeChange={(nextRange, activeThumb) => {
                setRange(nextRange)
                setIsScrubbing(true)
                const nextTime = nextRange[activeThumb]
                setPreviewTime(nextTime)
                requestPreviewFrame(nextTime, setPreviewImage)
              }}
              onChangeCommitted={() => setIsScrubbing(false)}
              onScrubStart={() => setIsScrubbing(true)}
              onScrubEnd={() => setIsScrubbing(false)}
            />
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
