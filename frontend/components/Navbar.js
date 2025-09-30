import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const Navbar = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-neon rounded-lg flex items-center justify-center">
                <span className="text-dark-900 font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-semibold text-white group-hover:text-neon-blue transition-colors duration-300">
                SecureAuth Pro
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="text-white hover:text-neon-blue transition-colors duration-300 font-medium"
                >
                  Profile
                </Link>
                <Link
                  href="/two-factor"
                  className="text-white hover:text-neon-blue transition-colors duration-300 font-medium flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>2FA</span>
                  {user?.two_factor_enabled && (
                    <span className="text-success text-xs bg-success/20 px-1.5 py-0.5 rounded-full">
                      ✓
                    </span>
                  )}
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-dark-300">
                    Welcome, <span className="text-neon-blue font-medium">{user.email}</span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-white hover:text-neon-blue transition-colors duration-300 font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary text-sm px-6 py-2"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-neon-blue transition-colors duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-dark-600/50 mt-2"
          >
            <div className="py-4 space-y-4">
              {user ? (
                <>
                  <div className="text-sm text-dark-300 px-4">
                    Welcome, <span className="text-neon-blue font-medium">{user.email}</span>
                  </div>
                  <Link
                    href="/profile"
                    className="block text-white hover:text-neon-blue transition-colors duration-300 font-medium px-4 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/two-factor"
                    className="block text-white hover:text-neon-blue transition-colors duration-300 font-medium px-4 py-2 flex items-center space-x-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Two-Factor Authentication</span>
                    {user?.two_factor_enabled && (
                      <span className="text-success text-xs">✓</span>
                    )}
                  </Link>
                  <button
                    onClick={() => {
                      onLogout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="block w-full text-left text-white hover:text-neon-blue transition-colors duration-300 font-medium px-4 py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block text-white hover:text-neon-blue transition-colors duration-300 font-medium px-4 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="block text-white hover:text-neon-blue transition-colors duration-300 font-medium px-4 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}

export default Navbar