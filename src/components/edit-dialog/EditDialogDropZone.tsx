import { useRef } from 'react'
import type { DragEvent } from 'react'
import { Box, Button, Typography } from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'

type EditDialogDropZoneProps = {
  isDragging: boolean
  selectedFileName: string
  onFileSelect: (file: File | null) => void
  onDragOver: (event: DragEvent<HTMLDivElement>) => void
  onDragLeave: () => void
  onDrop: (event: DragEvent<HTMLDivElement>) => void
}

export function EditDialogDropZone({
  isDragging,
  selectedFileName,
  onFileSelect,
  onDragOver,
  onDragLeave,
  onDrop,
}: EditDialogDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  return (
    <Box
      className={`drop-zone ${isDragging ? 'is-dragging' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <UploadFileIcon fontSize="large" />
      <Typography variant="h6">ファイルをドラッグ&ドロップ</Typography>
      <Typography className="drop-sub">
        またはファイルブラウザから選択してください。
      </Typography>
      <Button variant="outlined" onClick={() => fileInputRef.current?.click()}>
        ファイルを選択
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={(event) => onFileSelect(event.target.files?.[0] ?? null)}
      />
      {selectedFileName && (
        <Box className="file-preview">
          <Typography variant="body2">選択中:</Typography>
          <Typography variant="subtitle2">{selectedFileName}</Typography>
          <Typography variant="caption" color="text.secondary">
            ブラウザではフルパスが取得できない場合があります。
          </Typography>
        </Box>
      )}
    </Box>
  )
}
