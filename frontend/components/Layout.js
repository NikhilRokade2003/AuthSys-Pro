import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import Navbar from './Navbar'

const Layout = ({ children, title = 'SecureAuth Pro', user, onLogout }) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])
  
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Professional authentication system with modern security features" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0a0a0a" />
      </Head>

      {/* Professional Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-dark"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full filter blur-3xl"></div>
        </div>
      </div>

      <div className="min-h-screen flex flex-col relative">
        <Navbar user={user} onLogout={onLogout} />
        
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.main>

        {/* Professional Footer */}
        <footer className="footer mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-dark-300 text-sm">
                © 2025 SecureAuth Pro. All rights reserved.
              </div>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-dark-300 hover:text-neon-blue transition-colors duration-300">
                  Privacy Policy
                </a>
                <a href="#" className="text-dark-300 hover:text-neon-blue transition-colors duration-300">
                  Terms of Service
                </a>
                <a href="#" className="text-dark-300 hover:text-neon-blue transition-colors duration-300">
                  Security
                </a>
                <a href="#" className="text-dark-300 hover:text-neon-blue transition-colors duration-300">
                  Support
                </a>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-dark-600/50">
              <div className="text-center text-dark-400 text-xs">
                Secured with enterprise-grade encryption and multi-factor authentication
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export default Layout