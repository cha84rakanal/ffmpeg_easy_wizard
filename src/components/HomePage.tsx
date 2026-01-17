import {
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import MovieFilterIcon from '@mui/icons-material/MovieFilter'
import TerminalIcon from '@mui/icons-material/Terminal'
import HistoryIcon from '@mui/icons-material/History'

type HomePageProps = {
  history: string[]
  onOpenConvert: () => void
}

export function HomePage({ history, onOpenConvert }: HomePageProps) {
  return (
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
          <Button variant="contained" onClick={onOpenConvert}>
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
  )
}
