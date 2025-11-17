/**
 * Vite Configuration for JoinUs Frontend Project
 * 
 * This file defines the Vite bundler configuration used for
 * development and production builds of the project.
 * 
 * @see https://vite.dev/config/
 */

import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

/**
 * Exports Vite configuration
 * 
 * @property {Array} plugins - List of Vite plugins to use
 * - react: React plugin with SWC for fast compilation
 */
export default defineConfig({
  plugins: [react()],
})
