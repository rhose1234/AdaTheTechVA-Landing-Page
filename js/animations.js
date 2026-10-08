// Initialize AOS (Animate On Scroll) library
// Scroll to top on page refresh
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAnimations);
} else {
  initializeAnimations();
}

function initializeAnimations() {
  // Scroll to top immediately
  window.scrollTo(0, 0);
  
  // Check if AOS is loaded
  if (typeof AOS === 'undefined') {
    console.error('AOS library not loaded. Please check your internet connection.');
    return;
  }
  
  // Initialize AOS
  try {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100,
      disable: false,
      startEvent: 'DOMContentLoaded',
    });
    
    // Refresh AOS after a short delay to ensure all elements are ready
    setTimeout(function() {
      AOS.refresh();
    }, 100);
    
    console.log('AOS initialized successfully');
  } catch (error) {
    console.error('Error initializing AOS:', error);
  }
}
