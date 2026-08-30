// Function to report web performance metrics (Core Web Vitals) to a callback
const reportWebVitals = onPerfEntry => {
  // Only proceed if a callback function is provided
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Dynamically import the web-vitals library to get performance metrics
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // Report Cumulative Layout Shift (visual stability)
      getCLS(onPerfEntry);
      // Report First Input Delay (interactivity)
      getFID(onPerfEntry);
      // Report First Contentful Paint (loading performance)
      getFCP(onPerfEntry);
      // Report Largest Contentful Paint (loading performance)
      getLCP(onPerfEntry);
      // Report Time to First Byte (backend/network performance)
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
