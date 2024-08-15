import React, { useEffect } from "react";

const MetaPixel = () => {
  useEffect(() => {
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      "script",
      "https://connect.facebook.net/en_US/fbevents.js"
    );

    fbq("init", "360921333213461");
    fbq("track", "PageView");

    // Handle the noscript part
    const noscript = document.createElement("noscript");
    noscript.innerHTML =
      '<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=360921333213461&ev=PageView&noscript=1" />';
    document.body.appendChild(noscript);
  }, []);

  return null;
};

export default MetaPixel;
