import { AppBar, Box, Toolbar } from '@mui/material'
import React from 'react'
import TimeTabs from './TimeTabs'

function RegistrationsBar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <TimeTabs />
          </Toolbar>
        </AppBar>
      </Box>
  )
}

export default RegistrationsBar