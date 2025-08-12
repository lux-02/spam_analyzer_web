import { useEffect, useRef } from "react";

const AdBanner = ({ slot, format = "auto", responsive = true, style = {} }) => {
  const adRef = useRef(null);

  useEffect(() => {
    // 개발 환경에서는 AdSense 로드하지 않음 (403 오류 방지)
    if (process.env.NODE_ENV === "development") {
      return;
    }

    // AdSense가 로드된 후 광고 로드
    if (window.adsbygoogle && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdSense 오류:", err);
      }
    }
  }, []);

  // 개발 환경에서는 광고 대신 플레이스홀더 표시
  if (process.env.NODE_ENV === "development") {
    return (
      <div className="ad-container my-4 p-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg text-center">
        <p className="text-gray-500">
          📢 개발 환경 - AdSense 광고 플레이스홀더
          <br />
          <small>프로덕션에서는 실제 광고가 표시됩니다</small>
        </p>
      </div>
    );
  }

  return (
    <div className="ad-container my-4">
      {/* 
        AdSense 광고 삽입
        - YOUR_ADSENSE_CLIENT_ID: AdSense 계정의 pub ID로 교체 필요
        - slot: 광고 유닛별 고유 ID (AdSense 관리자에서 생성한 광고 유닛 ID)
       
      */}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client="ca-pub-1884359786783237"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
};

export default AdBanner;
