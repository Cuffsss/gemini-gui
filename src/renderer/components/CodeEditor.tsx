import React from 'react'
import { Box, Typography } from '@mui/material'

export const CodeEditor: React.FC = () => {
  return (
    <Box sx={{ height: '100%', p: 2, bgcolor: 'background.default' }}>
      <Typography variant="h6">Code Editor</Typography>
      <Typography variant="body2" color="text.secondary">
        Code editor will be implemented here
      </Typography>
    </Box>
  )
}