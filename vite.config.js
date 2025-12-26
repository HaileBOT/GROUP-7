import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite uses Rollup for its build process. 
// You can customize Rollup options inside the build.rollupOptions object.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        // This is a Rollup feature to split code into smaller chunks.
        // It helps with caching and performance by separating stable libraries 
        // from your frequently changing application code.
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          icons: ['lucide-react']
        }
      }
    }
  }
})