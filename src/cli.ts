#!/usr/bin/env node

import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Get the electron executable path
const electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron')
const appPath = path.join(__dirname, '..')

// Spawn electron with the app
const electron = spawn(electronPath, [appPath], {
  stdio: 'inherit',
  env: { ...process.env }
})

electron.on('close', (code) => {
  process.exit(code || 0)
})

// Handle signals
process.on('SIGINT', () => {
  electron.kill('SIGINT')
})

process.on('SIGTERM', () => {
  electron.kill('SIGTERM')
})