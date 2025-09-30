import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { suppressHydrationWarning } from '../utils/suppressHydrationWarning'

export default function App({ Component, pageProps: { session, ...pageProps }, router }) {
  useEffect(() => {
    // Suppress hydration warnings from browser extensions
    suppressHydrationWarning();
  }, []);
  return (
    <SessionProvider session={session}>
      <AnimatePresence mode="wait" initial={false}>
        <Component key={router.route} {...pageProps} />
      </AnimatePresence>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(0, 0, 0, 0.9)',
            color: '#00ff7f',
            border: '1px solid #00ff7f',
            fontFamily: 'Source Code Pro, monospace',
          },
          success: {
            iconTheme: {
              primary: '#00ff7f',
              secondary: '#000000',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff0040',
              secondary: '#000000',
            },
            style: {
              border: '1px solid #ff0040',
              color: '#ff0040',
            },
          },
        }}
      />
    </SessionProvider>
  )
}