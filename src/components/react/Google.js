import React, { useEffect } from 'react';

const GooglePixel = () => {
  useEffect(() => {
    // Dynamically load the Google gtag script
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      const f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = `https://www.googletagmanager.com/gtag/js?id=${i}${dl}`;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', 'AW-11003569068');

    // Initialize Google Analytics tracking
    window.dataLayer = window.dataLayer || [];
    function gtag(...args) {
      dataLayer.push(args);
    }

    gtag('js', new Date());
    gtag('config', 'AW-11003569068');

    // Optional: Include the noscript part as well, although typically not needed in React apps
  }, []);

  return null;
};

export default GooglePixel;
