import React, { useEffect } from 'react';

const Google = () => {
  return <>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-Z5SNV3YVHE"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
  
    gtag('config', 'G-Z5SNV3YVHE');
  </script>
  </>;
};

export default Google;
