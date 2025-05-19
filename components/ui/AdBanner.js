import { useEffect, useRef } from "react";

const AdBanner = ({ slot, format = "auto", responsive = true, style = {} }) => {
  const adRef = useRef(null);

  useEffect(() => {
    // AdSense가 로드된 후 광고 로드
    if (window.adsbygoogle && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdSense 오류:", err);
      }
    }
  }, []);

  return (
    <div className="ad-container my-4">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client="ca-pub-YOUR_ADSENSE_CLIENT_ID"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
};

export default AdBanner;
