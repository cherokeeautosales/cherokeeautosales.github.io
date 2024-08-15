import React, { useEffect } from 'react';

const Translate = () => {
  useEffect(() => {
    const loadGoogleTranslateScript = () => {
      const existingScript = document.getElementById('google-translate-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.type = 'text/javascript';
        document.body.appendChild(script);
      }
    };

    const googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        { pageLanguage: 'en', layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE },
        'google_translate_element'
      );
    };

    loadGoogleTranslateScript();
    (window as any).googleTranslateElementInit = googleTranslateElementInit;

    return () => {
      const script = document.getElementById('google-translate-script');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return <div id="google_translate_element"></div>;
};

export default Translate;
