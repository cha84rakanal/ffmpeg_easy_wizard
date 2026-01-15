export type CodecOption = {
  id: string
  label: string
  ffmpeg: string
  extensions: string[]
}

export const codecOptions: CodecOption[] = [
  {
    id: 'h264',
    label: 'H.264 (libx264)',
    ffmpeg: 'libx264',
    extensions: ['mp4', 'mkv', 'mov', 'ts', 'm2ts', '3gp'],
  },
  {
    id: 'h265',
    label: 'H.265 (libx265)',
    ffmpeg: 'libx265',
    extensions: ['mp4', 'mkv', 'mov', 'ts', 'm2ts'],
  },
  {
    id: 'mpeg4',
    label: 'MPEG-4 Part 2 (mpeg4)',
    ffmpeg: 'mpeg4',
    extensions: ['mp4', 'mov', 'avi'],
  },
  {
    id: 'mpeg2',
    label: 'MPEG-2 (mpeg2video)',
    ffmpeg: 'mpeg2video',
    extensions: ['mpg', 'mpeg', 'm2v', 'ts', 'm2ts'],
  },
  {
    id: 'mpeg1',
    label: 'MPEG-1 (mpeg1video)',
    ffmpeg: 'mpeg1video',
    extensions: ['mpg', 'mpeg'],
  },
  {
    id: 'vp9',
    label: 'VP9 (libvpx-vp9)',
    ffmpeg: 'libvpx-vp9',
    extensions: ['webm', 'mkv'],
  },
  {
    id: 'vp8',
    label: 'VP8 (libvpx)',
    ffmpeg: 'libvpx',
    extensions: ['webm', 'mkv'],
  },
  {
    id: 'av1',
    label: 'AV1 (libaom-av1)',
    ffmpeg: 'libaom-av1',
    extensions: ['webm', 'mkv', 'mp4'],
  },
  {
    id: 'av1-svt',
    label: 'AV1 (libsvtav1)',
    ffmpeg: 'libsvtav1',
    extensions: ['webm', 'mkv', 'mp4'],
  },
  {
    id: 'theora',
    label: 'Theora (libtheora)',
    ffmpeg: 'libtheora',
    extensions: ['ogv'],
  },
  {
    id: 'prores',
    label: 'ProRes (prores_ks)',
    ffmpeg: 'prores_ks',
    extensions: ['mov', 'mxf'],
  },
  {
    id: 'dnxhd',
    label: 'DNxHD (dnxhd)',
    ffmpeg: 'dnxhd',
    extensions: ['mov', 'mxf'],
  },
  {
    id: 'cineform',
    label: 'CineForm (cfhd)',
    ffmpeg: 'cfhd',
    extensions: ['mov', 'avi'],
  },
  {
    id: 'mjpeg',
    label: 'MJPEG (mjpeg)',
    ffmpeg: 'mjpeg',
    extensions: ['avi', 'mov'],
  },
  {
    id: 'h263',
    label: 'H.263 (h263)',
    ffmpeg: 'h263',
    extensions: ['3gp'],
  },
  {
    id: 'flv1',
    label: 'FLV1 (flv1)',
    ffmpeg: 'flv1',
    extensions: ['flv'],
  },
  {
    id: 'ffv1',
    label: 'FFV1 (ffv1)',
    ffmpeg: 'ffv1',
    extensions: ['mkv'],
  },
  {
    id: 'huffyuv',
    label: 'HuffYUV (huffyuv)',
    ffmpeg: 'huffyuv',
    extensions: ['avi'],
  },
  {
    id: 'utvideo',
    label: 'UtVideo (utvideo)',
    ffmpeg: 'utvideo',
    extensions: ['avi', 'mkv'],
  },
]
