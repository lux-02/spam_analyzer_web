import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

// Leaflet 컴포넌트들을 클라이언트 사이드에서만 로드하도록 동적 임포트
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false, // 서버 사이드 렌더링 비활성화
  loading: () => <p>지도를 로딩중입니다...</p>,
});

const ReceivedPathMap = ({ ipLocations = [] }) => {
  const [mounted, setMounted] = useState(false);
  // 맵 컴포넌트를 위한 ref
  const mapContainerRef = useRef(null);
  // 고유 키 유지
  const mapKey = useRef(`map-${Date.now()}`).current;

  useEffect(() => {
    // 클라이언트 사이드에서만 마운트 상태 업데이트
    if (typeof window !== "undefined") {
      setMounted(true);
    }

    return () => {
      // 언마운트 시 처리
      setMounted(false);

      // 맵 컨테이너 요소의 Leaflet ID 제거
      if (mapContainerRef.current) {
        const element = mapContainerRef.current;
        if (element._leaflet_id) {
          delete element._leaflet_id;
        }
      }
    };
  }, []);

  // 유효한 위치 데이터만 필터링
  const validLocations = ipLocations.filter(
    (loc) => loc && loc.latitude !== undefined && loc.longitude !== undefined
  );

  if (!mounted || validLocations.length === 0) {
    return <p>유효한 위치 데이터가 없습니다.</p>;
  }

  return (
    <div ref={mapContainerRef} className="h-full w-full">
      <LeafletMap key={mapKey} locations={validLocations} />
    </div>
  );
};

export default ReceivedPathMap;
