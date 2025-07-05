import React from 'react'
import { Box, Typography } from '@mui/material'

export const Terminal: React.FC = () => {
  return (
    <Box sx={{ height: '100%', p: 2, bgcolor: 'background.default' }}>
      <Typography variant="h6">Terminal</Typography>
      <Typography variant="body2" color="text.secondary">
        Terminal will be implemented here
      </Typography>
    </Box>
  )
}