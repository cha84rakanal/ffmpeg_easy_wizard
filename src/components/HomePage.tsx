import { Fragment } from 'react'
import {
  Button,
  Chip,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import MovieFilterIcon from '@mui/icons-material/MovieFilter'
import TerminalIcon from '@mui/icons-material/Terminal'
import HistoryIcon from '@mui/icons-material/History'
import type { CommandHistoryItem } from '../App'

type HomePageProps = {
  history: CommandHistoryItem[]
  onOpenConvert: () => void
}

export function HomePage({ history, onOpenConvert }: HomePageProps) {
  const handleCopy = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command)
    } catch {
      // Clipboard access can fail on some browsers or insecure contexts.
    }
  }

  const formatCreatedAt = (iso: string) => {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return iso
    return date.toLocaleString()
  }

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
        <List dense disablePadding>
          <ListItem
            className="history-row history-header-row"
            sx={{ pl: 3, pr: 10 }}
          >
            <ListItemText
              primary="Command"
              secondary="Created Time"
              primaryTypographyProps={{ variant: 'subtitle2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
          <Divider component="li" />
          {history.map((item, index) => (
            <Fragment key={`${item.command}-${item.createdAt}-${index}`}>
              <ListItem
                className="history-row"
                sx={{ pl: 3, pr: 10 }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="コマンドをコピー"
                    onClick={() => handleCopy(item.command)}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={item.command}
                  secondary={formatCreatedAt(item.createdAt)}
                  primaryTypographyProps={{ className: 'mono' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
              {index < history.length - 1 && <Divider component="li" />}
            </Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  )
}
