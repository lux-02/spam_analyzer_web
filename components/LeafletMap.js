import React, { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { countryCodeToFlag } from "../utils/emailAnalyzer";

const LeafletMap = ({ locations }) => {
  // 맵 고유 ID를 메모이제이션하여 재렌더링 시에도 유지
  const mapId = useMemo(
    () => `map-${Math.random().toString(36).substring(2, 10)}`,
    []
  );

  // Leaflet 마커 아이콘 이슈 해결을 위한 코드
  useEffect(() => {
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
    }

    // 컴포넌트 언마운트 시 맵 요소 정리
    return () => {
      // 맵 컨테이너 ID로 요소를 찾아 초기화 플래그 제거
      if (typeof window !== "undefined") {
        const mapElement = document.getElementById(mapId);
        if (mapElement && mapElement._leaflet_id) {
          delete mapElement._leaflet_id;
        }
      }
    };
  }, [mapId]);

  if (!locations || locations.length === 0) {
    return <p>위치 데이터가 없습니다.</p>;
  }

  // 지도 중심 위치 계산 (첫 번째 유효한 위치)
  const centerPosition = [locations[0].latitude, locations[0].longitude];

  // 경로 라인 좌표
  const pathCoordinates = locations.map((loc) => [loc.latitude, loc.longitude]);

  return (
    <MapContainer
      center={centerPosition}
      zoom={2}
      minZoom={1}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
      id={mapId}
      key={mapId}
      className="z-0"
      whenCreated={(mapInstance) => {
        // 맵 인스턴스 생성 후 처리
        mapInstance.on("error", (e) => {
          console.log("Leaflet 오류 처리:", e);
        });
      }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {locations.map((loc, idx) => (
        <CircleMarker
          key={`marker-${idx}-${loc.ip}`}
          center={[loc.latitude, loc.longitude]}
          radius={6}
          pathOptions={{
            color: "#f0f0f2",
            weight: 2,
            fillColor: "#ff304a",
            fillOpacity: 0.92,
          }}
        >
          <Popup>
            <div>
              <p>
                <strong>IP:</strong> {loc.ip}
              </p>
              <p>
                <strong>위치:</strong> {countryCodeToFlag(loc.countryCode)}{" "}
                {loc.country}
                {loc.city && `, ${loc.city}`}
              </p>
              {loc.isp && (
                <p>
                  <strong>ISP:</strong> {loc.isp}
                </p>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {pathCoordinates.length > 1 && (
        <>
          <Polyline
            positions={pathCoordinates}
            color="#ff304a"
            weight={3.5}
            opacity={0.9}
          />
          <Polyline
            positions={pathCoordinates}
            color="#d5d5da"
            weight={1.4}
            opacity={0.84}
            dashArray="6 8"
          />
        </>
      )}
    </MapContainer>
  );
};

export default LeafletMap;
