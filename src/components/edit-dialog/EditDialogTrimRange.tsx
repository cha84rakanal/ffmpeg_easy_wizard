import { Box, Slider, Typography } from '@mui/material'

type EditDialogTrimRangeProps = {
  duration: number
  range: [number, number]
  isScrubbing: boolean
  previewImage: string | null
  previewTime: number
  onRangeChange: (range: [number, number], activeThumb: number) => void
  onChangeCommitted: () => void
  onScrubStart: () => void
  onScrubEnd: () => void
}

export function EditDialogTrimRange({
  duration,
  range,
  isScrubbing,
  previewImage,
  previewTime,
  onRangeChange,
  onChangeCommitted,
  onScrubStart,
  onScrubEnd,
}: EditDialogTrimRangeProps) {
  return (
    <>
      <Typography variant="subtitle2">トリム範囲</Typography>
      <Box sx={{ position: 'relative', px: 1 }}>
        {isScrubbing && previewImage && duration > 0 && (
          <Box
            sx={{
              position: 'absolute',
              left: `${(previewTime / duration) * 100}%`,
              top: -230,
              transform: 'translateX(-50%)',
              width: 320,
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 12px 24px rgba(0,0,0,0.18)',
              border: '1px solid rgba(15, 23, 42, 0.2)',
              background: '#0f172a',
              zIndex: 2,
            }}
          >
            <img
              src={previewImage}
              alt="preview"
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
          </Box>
        )}
        <Slider
          value={range}
          onChange={(_, value, activeThumb) => {
            if (!Array.isArray(value)) return
            onRangeChange([value[0], value[1]], activeThumb)
          }}
          onChangeCommitted={onChangeCommitted}
          onMouseDown={onScrubStart}
          onMouseUp={onScrubEnd}
          onTouchStart={onScrubStart}
          onTouchEnd={onScrubEnd}
          min={0}
          max={duration || 0}
          step={0.01}
          valueLabelDisplay="auto"
          disabled={!duration}
        />
      </Box>
      <Typography variant="caption" color="text.secondary">
        再生時間: {duration ? `${duration.toFixed(2)}s` : '未取得'}
      </Typography>
    </>
  )
}
