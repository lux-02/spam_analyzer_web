"use client";

import React, {
  useRef,
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
  useCallback,
} from "react";
import {
  handleMediaError,
  handleWebGLContextLoss,
} from "../utils/errorHandler";

import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import {
  Text,
  ScrollControls,
  useScroll,
  Billboard,
  Center,
  Float,
  Html,
  PerspectiveCamera,
} from "@react-three/drei";
import { easing, geometry } from "maath";
import * as THREE from "three";
import styles from "../styles/Profile.module.css";

// 필요한 확장 기능 추가
extend(geometry);

// 클릭 상태를 공유하기 위한 컨텍스트
const ClickContext = createContext(false);

// 포트폴리오 데이터
// - 이미지: Google Cloud Storage URL
// - 비디오: Google Drive Sharing URL
// - 오디오: Google Drive Sharing URL

//
const portfolioData = [
  {
    title: "OYE 인트로 영상",
    description:
      "브랜드 소개를 위한 인터랙티브 인트로 영상입니다. 모던한 디자인과 부드러운 애니메이션이 특징입니다.",
    mediaFiles: [
      {
        type: "image",
        url: "https://storage.googleapis.com/designarc/portfolio/2882bceb-78c1-4914-82de-11a728313276.webp",
        alt: "OYE 인트로 이미지",
        originalName: "oye_intro.webp",
        size: 303564,
      },
    ],
  },
  {
    title: "오디오 작품",
    description:
      "음악 및 사운드 디자인 작품입니다. 고품질 오디오 파일을 안정적으로 스트리밍할 수 있습니다.",
    mediaFiles: [
      {
        type: "audio",
        url: "https://drive.google.com/file/d/1MLggkRkICqZav9Apb_hxCki6e6THc4Ub/view?usp=sharing", // 예시 ID
        alt: "barren.wav",
        originalName: "barren.wav",
        size: 31424708,
      },
    ],
  },
  {
    title: "프로젝트 데모 영상",
    description:
      "실제 프로젝트 작동 모습을 보여주는 데모 영상입니다. Google Drive에 업로드된 영상을 임베드로 표시합니다.",
    mediaFiles: [
      {
        type: "video",
        url: "https://drive.google.com/file/d/1CzlPCi9nwntaKspJImp7Ar6ZYIE1EwG5/view?usp=sharing",
        alt: "프로젝트 데모 영상",
        originalName: "demo-video.mp4",
        size: 50000000, // 50MB
      },
    ],
  },
];

// 미디어 파일 타입 확인 함수
const getMediaType = (url) => {
  const extension = url.split(".").pop().toLowerCase().split("?")[0];
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(extension)) return "image";
  if (["mp4", "webm", "ogg"].includes(extension)) return "video";
  if (["mp3", "m4a", "wav", "ogg"].includes(extension)) return "audio";
  return "unknown";
};

// Google Drive 공유 링크를 직접 접근 가능한 URL로 변환하는 함수
const convertGoogleDriveUrl = (url, mediaType = "image") => {
  // Google Drive 공유 링크 패턴: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    const fileId = driveMatch[1];

    if (mediaType === "video" || mediaType === "audio") {
      // 비디오/오디오의 경우 임베드 URL 사용 (더 안정적)
      return `https://drive.google.com/file/d/${fileId}/preview`;
    } else {
      // 이미지의 경우 직접 다운로드 URL
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
  }
  return url;
};

// 미디어 URL을 적절한 형태로 변환하는 함수
const getMediaUrl = (originalUrl, mediaType = "image") => {
  // Google Drive URL 처리
  if (originalUrl.includes("drive.google.com")) {
    return convertGoogleDriveUrl(originalUrl, mediaType);
  }

  // GCS URL 처리 (이미지와 오디오)
  if (
    originalUrl.includes("storage.googleapis.com") &&
    (mediaType === "image" || mediaType === "audio")
  ) {
    const urlParts = originalUrl.split("/");
    const bucketIndex =
      urlParts.findIndex((part) => part === "storage.googleapis.com") + 1;
    if (bucketIndex > 0 && urlParts.length > bucketIndex + 1) {
      const path = urlParts.slice(bucketIndex + 1).join("/");
      return `/api/gcs-image?path=${encodeURIComponent(path)}`;
    }
  }

  return originalUrl;
};

// 하위 호환성을 위한 별칭
const getImageUrl = (originalUrl) => getMediaUrl(originalUrl, "image");

// 미디어 컴포넌트
const MediaComponent = React.memo(({ media, containerWidth }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => setIsLoading(false);
  const handleError = (error) => {
    setIsLoading(false);
    setHasError(true);
    // 구조화된 에러 처리
    handleMediaError(media.type, media.url, error);
  };

  const mediaStyle = {
    width: "100%",
    maxWidth: "100%",
    height: "auto",
    marginBottom: "0",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
  };

  if (hasError) {
    return (
      <div
        style={{
          ...mediaStyle,
          height: "200px",
          backgroundColor: "#333",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#999",
          fontSize: "14px",
        }}
      >
        미디어를 로드할 수 없습니다
      </div>
    );
  }

  switch (media.type) {
    case "image":
      return (
        <div>
          <div style={{ position: "relative" }}>
            {isLoading && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "200px",
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "12px",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    border: "4px solid rgba(232, 176, 89, 0.3)",
                    borderTop: "4px solid #E8B059",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    marginBottom: "10px",
                  }}
                />
                <span style={{ color: "#E8B059", fontSize: "14px" }}>
                  이미지 로딩 중...
                </span>
              </div>
            )}
            <img
              src={getMediaUrl(media.url, media.type)}
              alt={media.alt}
              style={{
                ...mediaStyle,
                display: isLoading ? "none" : "block",
                borderRadius: "12px",
              }}
              onLoad={handleLoad}
              onError={handleError}
            />
          </div>
        </div>
      );
    case "video":
      const videoUrl = getMediaUrl(media.url, "video");
      const isGoogleDrive = media.url.includes("drive.google.com");

      return (
        <div>
          {/* 로딩 스피너 */}
          {isLoading && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: isGoogleDrive ? "300px" : "200px",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                borderRadius: "12px",
                marginBottom: "10px",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  border: "4px solid rgba(232, 176, 89, 0.3)",
                  borderTop: "4px solid #E8B059",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginBottom: "10px",
                }}
              />
              <span style={{ color: "#E8B059", fontSize: "14px" }}>
                비디오 로딩 중...
              </span>
            </div>
          )}

          {/* 비디오 플레이어 */}
          <div style={{ display: isLoading ? "none" : "block" }}>
            {isGoogleDrive ? (
              // Google Drive 비디오는 iframe으로 임베드
              <div
                style={{
                  position: "relative",
                  paddingBottom: "56.25%",
                  height: 0,
                }}
              >
                <iframe
                  src={videoUrl}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: "12px",
                  }}
                  allow="autoplay"
                  onLoad={handleLoad}
                  onError={handleError}
                />
              </div>
            ) : (
              // 일반 비디오는 video 태그 사용
              <video
                src={videoUrl}
                controls
                style={{
                  ...mediaStyle,
                  borderRadius: "12px",
                }}
                onLoadedData={handleLoad}
                onError={handleError}
              >
                브라우저가 비디오를 지원하지 않습니다.
              </video>
            )}
          </div>
        </div>
      );
    case "audio":
      const audioUrl = getMediaUrl(media.url, "audio");
      const isGoogleDriveAudio = media.url.includes("drive.google.com");

      return (
        <div
          style={{
            padding: "20px",
          }}
        >
          {/* 로딩 스피너 */}
          {isLoading && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "60px",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  border: "3px solid rgba(232, 176, 89, 0.3)",
                  borderTop: "3px solid #E8B059",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginRight: "10px",
                }}
              />
              <span style={{ color: "#E8B059", fontSize: "14px" }}>
                오디오 로딩 중...
              </span>
            </div>
          )}

          {/* 오디오 플레이어 */}
          <div style={{ display: isLoading ? "none" : "block" }}>
            {isGoogleDriveAudio ? (
              // Google Drive 오디오는 iframe으로 임베드
              <div style={{ width: "100%", height: "60px" }}>
                <iframe
                  src={audioUrl}
                  style={{
                    width: "100%",
                    height: "60px",
                    border: "none",
                    borderRadius: "8px",
                  }}
                  allow="autoplay"
                  onLoad={handleLoad}
                  onError={handleError}
                />
              </div>
            ) : (
              // 일반 오디오는 audio 태그 사용
              <audio
                src={audioUrl}
                controls
                style={{
                  width: "100%",
                  height: "40px",
                  borderRadius: "8px",
                }}
                onLoadedData={handleLoad}
                onError={handleError}
                crossOrigin="anonymous"
              >
                브라우저가 오디오를 지원하지 않습니다.
              </audio>
            )}
          </div>

          {/* 오류 발생 시 안내 메시지 */}
          {hasError && (
            <div
              style={{
                marginTop: "10px",
                padding: "15px",
                backgroundColor: "rgba(255, 107, 107, 0.1)",
                border: "1px solid rgba(255, 107, 107, 0.3)",
                borderRadius: "8px",
                fontSize: "13px",
                color: "#FF6B6B",
              }}
            >
              <div style={{ fontWeight: "600", marginBottom: "5px" }}>
                ⚠️ 오디오 로드 실패
              </div>
              <div
                style={{ fontSize: "11px", color: "rgba(255, 107, 107, 0.8)" }}
              >
                {media.url.includes("storage.googleapis.com")
                  ? "GCS 403 오류: Google Drive 사용을 권장합니다"
                  : "Google Drive 사용을 권장합니다"}
              </div>
            </div>
          )}
        </div>
      );
    default:
      return (
        <div
          style={{
            ...mediaStyle,
            height: "100px",
            backgroundColor: "#333",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#999",
          }}
        >
          지원하지 않는 파일 형식입니다
        </div>
      );
  }
});

// 라운드 코너 쉐이더 정의
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform vec3 color;
  uniform float radius;
  
  float roundedRectangle(vec2 uv, vec2 size, float radius) {
    vec2 q = abs(uv) - size + radius;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
  }
  
  void main() {
    vec2 halfSize = vec2(0.5, 0.5);
    float d = roundedRectangle(vUv - 0.5, halfSize, radius);
    
    float alpha = 1.0 - smoothstep(-0.01, 0.01, d);
    if (alpha < 0.1) discard;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

export default function Scene3D() {
  const [isCardActive, setIsCardActive] = useState(false);
  const [activeCard, setActiveCard] = useState(null);

  const handleCardClick = (item) => {
    setActiveCard(item);
    setIsCardActive(true);
  };

  const handleClosePopup = () => {
    setActiveCard(null);
    setIsCardActive(false);
  };

  return (
    <ClickContext.Provider
      value={{
        isCardActive,
        setIsCardActive,
        activeCard,
        onCardClick: handleCardClick,
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 20], fov: 50 }}
          gl={{
            preserveDrawingBuffer: true,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl }) => {
            // WebGL 컨텍스트 손실 처리
            handleWebGLContextLoss(gl.domElement);
          }}
        >
          <color attach="background" args={["#121212"]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <ScrollControls
            pages={4}
            infinite
            damping={0.4}
            enabled={!isCardActive}
          >
            <Scene position={[0, 1.5, 0]} />
          </ScrollControls>
          <OverlayEffect />
        </Canvas>

        {/* HTML 팝업 - 3D 환경과 완전히 분리 */}
        {isCardActive && activeCard && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(10px)",
              padding: "10px",
              boxSizing: "border-box",
            }}
            onClick={handleClosePopup}
          >
            <div
              style={{
                width: "95%",
                maxWidth: "800px",
                maxHeight: "95%",
                backgroundColor: "#1a1a1a",
                borderRadius: "20px",
                padding: "0",
                boxShadow:
                  "0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(232, 176, 89, 0.2)",
                border: "2px solid rgba(232, 176, 89, 0.3)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div
                style={{
                  padding: "25px 30px",
                  borderBottom: "2px solid rgba(232, 176, 89, 0.2)",
                  position: "relative",
                  background:
                    "linear-gradient(135deg, rgba(232, 176, 89, 0.1), rgba(232, 176, 89, 0.05))",
                }}
              >
                <button
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    width: "35px",
                    height: "35px",
                    borderRadius: "50%",
                    background: "rgba(232, 176, 89, 0.2)",
                    border: "1px solid rgba(232, 176, 89, 0.5)",
                    color: "white",
                    fontSize: "18px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    transition: "all 0.3s ease",
                  }}
                  onClick={handleClosePopup}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background =
                      "rgba(232, 176, 89, 0.8)";
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background =
                      "rgba(232, 176, 89, 0.2)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  ✕
                </button>
                <h2
                  style={{
                    color: "white",
                    fontSize: "28px",
                    margin: "0",
                    paddingRight: "60px",
                    fontWeight: "600",
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  {activeCard.title}
                </h2>
              </div>

              {/* 스크롤 가능한 콘텐츠 영역 */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "30px",
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(232, 176, 89, 0.5) transparent",
                }}
              >
                {/* 설명 텍스트 */}
                <div
                  style={{
                    color: "#e0e0e0",
                    fontSize: "18px",
                    lineHeight: "1.7",
                    marginBottom: "30px",
                    padding: "20px",
                  }}
                >
                  {activeCard.description}
                </div>

                {/* 미디어 파일들 */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  {activeCard.mediaFiles &&
                    activeCard.mediaFiles.map((media, index) => (
                      <div
                        key={index}
                        style={{
                          transition: "all 0.3s ease",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(232, 176, 89, 0.1)";
                          e.currentTarget.style.borderColor =
                            "rgba(232, 176, 89, 0.3)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(255, 255, 255, 0.03)";
                          e.currentTarget.style.borderColor =
                            "rgba(255, 255, 255, 0.1)";
                        }}
                      >
                        <MediaComponent
                          media={media}
                          containerWidth={740} // 최대 너비에서 패딩을 뺀 값
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClickContext.Provider>
  );
}

// 배경 블러 오버레이 효과
function OverlayEffect() {
  const { isCardActive } = useContext(ClickContext);

  return (
    <mesh visible={isCardActive} position={[0, 0, -10]} renderOrder={-1}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial color="black" transparent opacity={0.4} />
    </mesh>
  );
}

function Scene({ children, ...props }) {
  const ref = useRef();
  const scroll = useScroll();
  const [hovered, setHovered] = useState(null);
  const { isCardActive, onCardClick } = useContext(ClickContext);
  const [initialRotationY, setInitialRotationY] = useState(0);

  useFrame((state, delta) => {
    // 항상 스크롤에 따라 회전 (클릭 상태에서도)
    ref.current.rotation.y = -scroll.offset * (Math.PI * 2);

    // 마우스 포인터에 따라 카메라 이동
    state.events.update();
    easing.damp3(
      state.camera.position,
      [-state.pointer.x * 2, state.pointer.y * 2 + 4.5, 9],
      0.3,
      delta
    );
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={ref} {...props}>
      <Cards
        items={portfolioData}
        from={0}
        len={Math.PI * 2}
        position={[0, 0, 0]}
        onCardHover={setHovered}
        onCardClick={onCardClick}
        hoveredCard={hovered}
        isAnyCardActive={isCardActive}
      />
    </group>
  );
}

function Cards({
  items,
  from = 0,
  len = Math.PI * 2,
  radius = 5.25,
  onCardHover,
  onCardClick,
  hoveredCard,
  isAnyCardActive,
  ...props
}) {
  const amount = items.length;

  return (
    <group {...props}>
      {items.map((item, i) => {
        const angle = from + (i / amount) * len;
        return (
          <Card
            key={angle}
            item={item}
            onPointerOver={(e) => {
              if (isAnyCardActive) return; // 이미 활성화된 카드가 있으면 무시
              e.stopPropagation();
              onCardHover(item);
            }}
            onPointerOut={() => {
              onCardHover(null);
            }}
            onClick={(e) => {
              if (isAnyCardActive) return; // 이미 활성화된 카드가 있으면 무시
              e.stopPropagation();
              // Three.js 이벤트에는 preventDefault가 없음
              onCardClick(item);
            }}
            position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
            rotation={[0, Math.PI / 2 + angle, 0]}
            hovered={hoveredCard === item}
            isAnyCardActive={isAnyCardActive}
            angle={angle}
          />
        );
      })}
    </group>
  );
}

function Card({ item, hovered, isAnyCardActive, angle, onClick, ...props }) {
  const ref = useRef();
  const materialRef = useRef();
  const { camera } = useThree();
  const [thumbnailTexture, setThumbnailTexture] = useState(null);

  // 첫 번째 이미지 파일을 썸네일로 사용
  const thumbnailImage = item.mediaFiles?.find(
    (media) => media.type === "image"
  );

  useEffect(() => {
    if (thumbnailImage) {
      const loader = new THREE.TextureLoader();

      // 이미지 로딩 처리
      const loadImage = async () => {
        try {
          loader.load(
            getMediaUrl(thumbnailImage.url, thumbnailImage.type),
            (texture) => {
              texture.wrapS = THREE.ClampToEdgeWrapping;
              texture.wrapT = THREE.ClampToEdgeWrapping;
              texture.minFilter = THREE.LinearFilter;
              texture.magFilter = THREE.LinearFilter;
              setThumbnailTexture(texture);
            },
            undefined,
            (error) => {
              console.warn("썸네일 로드 실패, 기본 이미지 사용:", error);
              // 기본 이미지로 대체
              createDefaultTexture();
            }
          );
        } catch (error) {
          console.warn("이미지 로드 중 오류:", error);
          createDefaultTexture();
        }
      };

      // 기본 텍스처 생성 함수
      const createDefaultTexture = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext("2d");

        // 그라데이션 배경 생성
        const gradient = context.createLinearGradient(0, 0, 256, 256);
        gradient.addColorStop(0, "#E8B059");
        gradient.addColorStop(1, "#D4A043");

        context.fillStyle = gradient;
        context.fillRect(0, 0, 256, 256);

        // 텍스트 추가
        context.fillStyle = "#FFFFFF";
        context.font = "24px Arial";
        context.textAlign = "center";
        context.fillText("Portfolio", 128, 120);
        context.fillText("Image", 128, 150);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        setThumbnailTexture(texture);
      };

      loadImage();
    }
  }, [thumbnailImage]);

  useFrame((state, delta) => {
    if (!ref.current) return;

    const f = hovered ? 1.3 : 1;

    // 활성화된 카드가 없을 때만 애니메이션 적용
    if (!isAnyCardActive) {
      easing.damp3(ref.current.position, [0, hovered ? 0.2 : 0, 0], 0.1, delta);
      easing.damp3(ref.current.scale, [1.618 * f, 1 * f, 1], 0.15, delta);
    }

    // 호버 시 색상 변화 애니메이션
    if (materialRef.current) {
      easing.damp3(
        materialRef.current.uniforms.color.value,
        hovered
          ? new THREE.Color("#E8B059").toArray()
          : new THREE.Color("#333333").toArray(),
        0.2,
        delta
      );
    }
  });

  return (
    <group {...props} onClick={onClick}>
      <Float
        speed={2}
        rotationIntensity={0.2}
        floatIntensity={0.2}
        enabled={!isAnyCardActive} // 활성화 시 Float 효과 중지
      >
        <group ref={ref} position={[0, 0, 0]} scale={[1.618, 1, 1]}>
          <mesh>
            <planeGeometry args={[1, 1, 32, 32]} />
            <shaderMaterial
              ref={materialRef}
              vertexShader={vertexShader}
              fragmentShader={fragmentShader}
              transparent
              uniforms={{
                color: {
                  value: new THREE.Color(
                    hovered ? "#E8B059" : "#333333"
                  ).toArray(),
                },
                radius: { value: 0.2 },
              }}
            />
          </mesh>

          {/* 썸네일 이미지 */}
          {thumbnailTexture && (
            <mesh position={[0, 0.1, 0.01]}>
              <planeGeometry args={[0.7, 0.4]} />
              <meshBasicMaterial
                map={thumbnailTexture}
                transparent
                opacity={0.9}
              />
            </mesh>
          )}

          {/* 제목 */}
          <Text
            position={[0, thumbnailTexture ? -0.15 : 0.2, 0.01]}
            fontSize={0.08}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.9}
          >
            {item.title}
          </Text>

          {/* 미디어 타입 표시 */}
          <Text
            position={[0, thumbnailTexture ? -0.3 : -0.2, 0.01]}
            fontSize={0.05}
            color="#aaaaaa"
            anchorX="center"
            anchorY="middle"
          >
            {item.mediaFiles && item.mediaFiles.length > 0
              ? `${item.mediaFiles.length}개 파일`
              : "파일 없음"}
          </Text>

          {/* 카드 테두리 효과 */}
          <mesh position={[0, 0, -0.005]}>
            <planeGeometry args={[1.03, 1.03, 32, 32]} />
            <shaderMaterial
              vertexShader={vertexShader}
              fragmentShader={fragmentShader}
              transparent
              uniforms={{
                color: { value: new THREE.Color("#444444").toArray() },
                radius: { value: 0.2 },
              }}
            />
          </mesh>
        </group>
      </Float>
    </group>
  );
}
