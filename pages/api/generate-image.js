export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    text = "Portfolio",
    color = "E8B059",
    width = 800,
    height = 600,
  } = req.query;

  // SVG 이미지 생성
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#${adjustBrightness(
            color,
            -20
          )};stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      
      <!-- 배경 -->
      <rect width="100%" height="100%" fill="url(#grad1)" />
      
      <!-- 장식적 요소들 -->
      <circle cx="100" cy="100" r="30" fill="rgba(255,255,255,0.1)" />
      <circle cx="${
        width - 100
      }" cy="100" r="25" fill="rgba(255,255,255,0.1)" />
      <circle cx="100" cy="${
        height - 100
      }" r="35" fill="rgba(255,255,255,0.1)" />
      <circle cx="${width - 100}" cy="${
    height - 100
  }" r="20" fill="rgba(255,255,255,0.1)" />
      
      <!-- 중앙 텍스트 -->
      <text x="50%" y="45%" 
            text-anchor="middle" 
            dominant-baseline="middle" 
            font-family="Arial, sans-serif" 
            font-size="48" 
            font-weight="bold" 
            fill="white" 
            filter="url(#shadow)">
        ${decodeURIComponent(text).replace(/\+/g, " ")}
      </text>
      
      <!-- 부제목 -->
      <text x="50%" y="60%" 
            text-anchor="middle" 
            dominant-baseline="middle" 
            font-family="Arial, sans-serif" 
            font-size="24" 
            fill="rgba(255,255,255,0.8)">
        Portfolio Project
      </text>
      
      <!-- 하단 라인 -->
      <line x1="20%" y1="80%" x2="80%" y2="80%" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    </svg>
  `;

  // CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=86400"); // 24시간 캐시

  res.status(200).send(svg);
}

// 색상 밝기 조절 함수
function adjustBrightness(hex, percent) {
  // hex에서 # 제거
  hex = hex.replace("#", "");

  // RGB 값 추출
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // 밝기 조절
  const newR = Math.max(0, Math.min(255, r + (r * percent) / 100));
  const newG = Math.max(0, Math.min(255, g + (g * percent) / 100));
  const newB = Math.max(0, Math.min(255, b + (b * percent) / 100));

  // 다시 hex로 변환
  return (
    Math.round(newR).toString(16).padStart(2, "0") +
    Math.round(newG).toString(16).padStart(2, "0") +
    Math.round(newB).toString(16).padStart(2, "0")
  );
}
