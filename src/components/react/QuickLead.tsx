import React, { useEffect, useState } from "react";

declare global {
  interface Window {
    dataLayer?: any[];
  }
}

const QuickLead: React.FC = () => {
  const [iframeSrc, setIframeSrc] = useState<string>("");
  const domainUrl = "https://cherokeeautosalestn.neoverify.com";
  const baseUrl = `${domainUrl}/quick_lead`;

  // List of parameters you want to forward
  const KNOWN_PARAMS = [
    "utm_medium",
    "utm_source",
    "utm_campaign",
    "utm_term",
    "gclid",
    "gbraid",
    "wbraid",
  ];

  useEffect(() => {
    // 1) Parse query params from the current URL
    const urlParams = new URLSearchParams(window.location.search);

    // 2) Check if the user arrived with any known param
    let hasRelevantParams = false;
    for (const param of KNOWN_PARAMS) {
      if (urlParams.has(param)) {
        hasRelevantParams = true;
        break;
      }
    }

    // 3) Build final query string to pass
    let finalSrc = baseUrl; // Default: no params
    if (hasRelevantParams) {
      // Example: Force utm_source = "Google" if found in the URL
      const newParams = new URLSearchParams();
      for (const param of KNOWN_PARAMS) {
        if (urlParams.has(param)) {
          let val = urlParams.get(param) || "";
          newParams.set(param, val);
        }
      }
      finalSrc += "?" + newParams.toString();
    }

    setIframeSrc(finalSrc);

    // 4) Listen for the "neoApplicationSubmitted" message
    // const handleMessage = (event: MessageEvent) => {
    //   if (event.origin !== domainUrl) return;
    //   if (event.data === "neoApplicationSubmitted") {
    //     window.dataLayer = window.dataLayer || [];
    //     window.dataLayer.push({
    //       event: "neoApplicationSubmitted",
    //     });
    //   }
    // };

    function receiveMessage(event: MessageEvent) {
      if (event.origin !== "https://cherokeeautosalestn.neoverify.com") {
        return;
      }
      if (/neoLeadSubmitted/.test(event.data)) {
        let arr = event.data.split(": ");
        let event_type = arr[0];
        let neo_id = arr[1];
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "neoApplicationSubmitted",
        });
      }
    }
    window.addEventListener("message", receiveMessage);

    return () => {
      window.removeEventListener("message", receiveMessage);
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "650px", position: "relative" }}>
      <iframe
        style={{
          position: "absolute",
          left: 0,
          width: "100%",
          height: "100%",
          border: "none",
          overflow: "hidden",
        }}
        src={iframeSrc}
      />
    </div>
  );
};

export default QuickLead;
