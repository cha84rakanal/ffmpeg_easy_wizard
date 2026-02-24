import type { RefObject, SyntheticEvent } from 'react'
import {
  IconButton,
  Paper,
  Slider,
  Stack,
  Typography,
} from '@mui/material'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'

type EditDialogPreviewProps = {
  videoUrl: string
  videoRef: RefObject<HTMLVideoElement>
  playbackTime: number
  playbackDuration: number
  isPlaying: boolean
  frameRate: number
  onTogglePlay: () => void
  onSeek: (value: number) => void
  onLoadedMetadata: (event: SyntheticEvent<HTMLVideoElement>) => void
  onTimeUpdate: (event: SyntheticEvent<HTMLVideoElement>) => void
  onPlay: () => void
  onPause: () => void
  onEnded: () => void
  onError: () => void
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '0:00'
  const total = Math.max(0, Math.floor(seconds))
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatTimecode = (seconds: number, frameRate: number) => {
  if (!Number.isFinite(seconds)) return '00:00:00:00'
  const totalFrames = Math.floor(seconds * frameRate)
  const frames = totalFrames % frameRate
  const totalSeconds = Math.floor(totalFrames / frameRate)
  const s = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const m = totalMinutes % 60
  const h = Math.floor(totalMinutes / 60)
  return `${h.toString().padStart(2, '0')}:${m
    .toString()
    .padStart(2, '0')}:${s.toString().padStart(2, '0')}:${frames
    .toString()
    .padStart(2, '0')}`
}

const formatFrames = (seconds: number, frameRate: number) => {
  if (!Number.isFinite(seconds)) return '0'
  return Math.floor(seconds * frameRate).toString()
}

export function EditDialogPreview({
  videoUrl,
  videoRef,
  playbackTime,
  playbackDuration,
  isPlaying,
  frameRate,
  onTogglePlay,
  onSeek,
  onLoadedMetadata,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  onError,
}: EditDialogPreviewProps) {
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">プレビュー</Typography>
      <Paper className="command-preview" elevation={0}>
        <video
          src={videoUrl}
          ref={videoRef}
          controls={false}
          preload="metadata"
          style={{ display: 'block', width: '100%', height: 'auto' }}
          onLoadedMetadata={onLoadedMetadata}
          onTimeUpdate={onTimeUpdate}
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
          onError={onError}
        />
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
          <IconButton onClick={onTogglePlay} aria-label="再生/一時停止">
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <Stack spacing={0.25}>
            <Typography variant="caption">
              {formatTime(playbackTime)} / {formatTime(playbackDuration)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              TC {formatTimecode(playbackTime, frameRate)} · Frame{' '}
              {formatFrames(playbackTime, frameRate)}
            </Typography>
          </Stack>
          <Slider
            value={playbackTime}
            min={0}
            max={playbackDuration || 0}
            step={0.01}
            onChange={(_, value) => {
              if (typeof value !== 'number') return
              onSeek(value)
            }}
          />
        </Stack>
      </Paper>
    </Stack>
  )
}
