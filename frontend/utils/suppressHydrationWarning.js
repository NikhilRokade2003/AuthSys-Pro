// Utility to suppress hydration warnings caused by browser extensions
export const suppressHydrationWarning = () => {
  if (typeof window !== 'undefined') {
    // Override console.error to filter out hydration warnings from browser extensions
    const originalError = console.error;
    console.error = (...args) => {
      const message = args[0];
      
      // Filter out hydration warnings related to browser extensions and MetaMask errors
      if (
        typeof message === 'string' &&
        (
          message.includes('Extra attributes from the server') ||
          message.includes('fdprocessedid') ||
          message.includes('Hydration failed because the initial UI does not match') ||
          message.includes('Failed to connect to MetaMask') ||
          message.includes('MetaMask extension not found')
        )
      ) {
        // Suppress these warnings in development
        if (process.env.NODE_ENV === 'development') {
          return;
        }
      }
      
      // Log all other errors normally
      originalError.apply(console, args);
    };
  }
};

// Function to clean up attributes added by browser extensions
export const cleanBrowserExtensionAttributes = (element) => {
  if (element && typeof window !== 'undefined') {
    // Remove common browser extension attributes
    const extensionAttributes = [
      'fdprocessedid',
      'data-lastpass-icon-root',
      'data-dashlane-rid',
      'data-dashlane-label',
      'data-form-type'
    ];
    
    extensionAttributes.forEach(attr => {
      if (element.hasAttribute(attr)) {
        element.removeAttribute(attr);
      }
    });
  }
};