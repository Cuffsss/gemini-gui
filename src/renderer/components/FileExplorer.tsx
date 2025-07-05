import React from 'react'
import { Box, Typography } from '@mui/material'

export const FileExplorer: React.FC = () => {
  return (
    <Box sx={{ height: '100%', p: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6">File Explorer</Typography>
      <Typography variant="body2" color="text.secondary">
        File tree will be implemented here
      </Typography>
    </Box>
  )
}