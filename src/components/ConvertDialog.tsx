import { useEffect, useMemo, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import { codecOptions } from '../codecOptions'

type ConvertDialogProps = {
  open: boolean
  onClose: () => void
  onComplete: (command: string) => void
}

type PixelFormatOption = {
  id: string
  label: string
}

const steps = ['ファイル選択', 'コーデック指定', '拡張子指定']
const pixelFormatOptions: PixelFormatOption[] = [
  { id: 'yuv420p', label: 'yuv420p (汎用)' },
  { id: 'yuv422p', label: 'yuv422p' },
  { id: 'yuv444p', label: 'yuv444p' },
  { id: 'yuv420p10le', label: 'yuv420p10le (10-bit)' },
  { id: 'yuv422p10le', label: 'yuv422p10le (10-bit)' },
  { id: 'yuv444p10le', label: 'yuv444p10le (10-bit)' },
  { id: 'yuv420p12le', label: 'yuv420p12le (12-bit)' },
  { id: 'yuv422p12le', label: 'yuv422p12le (12-bit)' },
  { id: 'yuv444p12le', label: 'yuv444p12le (12-bit)' },
  { id: 'yuv410p', label: 'yuv410p' },
  { id: 'yuv411p', label: 'yuv411p' },
  { id: 'yuv440p', label: 'yuv440p' },
  { id: 'nv12', label: 'nv12' },
  { id: 'p010le', label: 'p010le (10-bit)' },
  { id: 'rgb24', label: 'rgb24' },
  { id: 'rgba', label: 'rgba' },
  { id: 'bgr24', label: 'bgr24' },
  { id: 'bgra', label: 'bgra' },
  { id: 'rgb444', label: 'rgb444' },
  { id: 'bgr444', label: 'bgr444' },
  { id: 'gbrp', label: 'gbrp' },
  { id: 'gbrp10le', label: 'gbrp10le (10-bit)' },
  { id: 'gbrp12le', label: 'gbrp12le (12-bit)' },
  { id: 'gbrap', label: 'gbrap' },
  { id: 'gray', label: 'gray' },
  { id: 'gray10le', label: 'gray10le (10-bit)' },
  { id: 'gray12le', label: 'gray12le (12-bit)' },
  { id: 'ya8', label: 'ya8 (grayscale + alpha)' },
]
const commonPixelFormatIds = [
  'yuv420p',
  'yuv422p',
  'yuv444p',
  'yuv420p10le',
  'nv12',
  'p010le',
  'rgb24',
  'rgba',
  'gray',
]
const moreOptionValue = '__more__'

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

export function ConvertDialog({ open, onClose, onComplete }: ConvertDialogProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedCodecId, setSelectedCodecId] = useState('')
  const [selectedExtension, setSelectedExtension] = useState('')
  const [selectedPixelFormat, setSelectedPixelFormat] = useState('')
  const [targetWidth, setTargetWidth] = useState('')
  const [targetHeight, setTargetHeight] = useState('')
  const [showAllPixelFormats, setShowAllPixelFormats] = useState(false)
  const [pixelMenuOpen, setPixelMenuOpen] = useState(false)
  const [suppressPixelMenuClose, setSuppressPixelMenuClose] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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

  const visiblePixelFormats = useMemo(() => {
    if (showAllPixelFormats) return pixelFormatOptions
    const common = pixelFormatOptions.filter((fmt) =>
      commonPixelFormatIds.includes(fmt.id),
    )
    if (
      selectedPixelFormat &&
      !common.some((fmt) => fmt.id === selectedPixelFormat)
    ) {
      const selected = pixelFormatOptions.find(
        (fmt) => fmt.id === selectedPixelFormat,
      )
      return selected ? [selected, ...common] : common
    }
    return common
  }, [selectedPixelFormat, showAllPixelFormats])

  const keepPixelMenuOpen = () => {
    setSuppressPixelMenuClose(true)
    setPixelMenuOpen(true)
    setTimeout(() => {
      setPixelMenuOpen(true)
    }, 0)
  }

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

  const handlePixelFormatChange = (value: string) => {
    if (value === moreOptionValue) {
      setShowAllPixelFormats(true)
      keepPixelMenuOpen()
      return
    }
    setSelectedPixelFormat(value)
    setPixelMenuOpen(false)
  }

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
    setActiveStep(0)
    setSelectedFile(null)
    setSelectedCodecId('')
    setSelectedExtension('')
    setSelectedPixelFormat('')
    setTargetWidth('')
    setTargetHeight('')
    setShowAllPixelFormats(false)
    setPixelMenuOpen(false)
    setSuppressPixelMenuClose(false)
    setIsDragging(false)
  }

  const currentCodec = codecOptions.find((item) => item.id === selectedCodecId)

  const previewCommand = useMemo(() => {
    if (!selectedFile || !currentCodec || !selectedExtension) return ''
    const inputName = getFileDisplayName(selectedFile)
    const outputName = getOutputName(inputName, selectedExtension)
    const pixFmt = selectedPixelFormat ? ` -pix_fmt ${selectedPixelFormat}` : ''
    const size =
      targetWidth && targetHeight ? ` -s ${targetWidth}x${targetHeight}` : ''
    return `ffmpeg -i "${inputName}" -c:v ${currentCodec.ffmpeg}${pixFmt}${size} -c:a copy "${outputName}"`
  }, [
    currentCodec,
    selectedExtension,
    selectedFile,
    selectedPixelFormat,
    targetHeight,
    targetWidth,
  ])

  const stepValidations = [
    Boolean(selectedFile),
    Boolean(selectedCodecId),
    Boolean(selectedExtension),
  ]

  const isLastStep = activeStep === steps.length - 1
  const canProceed = stepValidations[activeStep]

  return (
    <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth="sm">
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
            <Stack spacing={2}>
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
              <FormControl fullWidth>
                <InputLabel id="pixfmt-label">ピクセルフォーマット</InputLabel>
                <Select
                  labelId="pixfmt-label"
                  label="ピクセルフォーマット"
                  value={selectedPixelFormat}
                  open={pixelMenuOpen}
                  onOpen={() => setPixelMenuOpen(true)}
                  onClose={() => {
                    if (suppressPixelMenuClose) {
                      setSuppressPixelMenuClose(false)
                      setPixelMenuOpen(true)
                      return
                    }
                    setPixelMenuOpen(false)
                  }}
                  onChange={(event) =>
                    handlePixelFormatChange(event.target.value as string)
                  }
                >
                  {visiblePixelFormats.map((fmt) => (
                    <MenuItem key={fmt.id} value={fmt.id}>
                      {fmt.label}
                    </MenuItem>
                  ))}
                  {!showAllPixelFormats && (
                    <MenuItem
                      value={moreOptionValue}
                      onMouseDown={(event) => {
                        event.preventDefault()
                        keepPixelMenuOpen()
                      }}
                      onClick={() => {
                        setShowAllPixelFormats(true)
                        keepPixelMenuOpen()
                      }}
                    >
                      More...
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="幅 (px)"
                  type="number"
                  value={targetWidth}
                  inputProps={{ min: 1 }}
                  onChange={(event) => setTargetWidth(event.target.value)}
                  fullWidth
                />
                <TextField
                  label="高さ (px)"
                  type="number"
                  value={targetHeight}
                  inputProps={{ min: 1 }}
                  onChange={(event) => setTargetHeight(event.target.value)}
                  fullWidth
                />
              </Stack>
            </Stack>
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
              onComplete(previewCommand)
              handleDialogClose()
            }}
            disabled={!canProceed}
          >
            完了
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
