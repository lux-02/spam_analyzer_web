"use client";

import { useRef, useState, useEffect, createContext, useContext } from "react";
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

// 프로필 데이터 샘플
const profileData = [
  {
    category: "CERTIFICATE",
    items: [
      {
        title: "정보처리기사 (필기 합격)",
        organization: "한국산업인력공단",
        date: "2025.03",
      },
      {
        title: "디지털포렌식전문가 2급 (필기 합격)",
        organization: "(사)한국포렌식학회",
        date: "2023.10",
      },
      {
        title: "정보기기운용기능사",
        organization: "한국산업인력공단",
        date: "2022.12",
      },
      {
        title: "멀티미디어콘텐츠제작전문가",
        organization: "한국산업인력공단",
        date: "2022.11",
      },
      {
        title: "유통관리사 2급",
        organization: "대한상공회의소",
        date: "2022.09",
      },
      {
        title: "정보처리산업기사",
        organization: "한국산업인력공단",
        date: "2022.07",
      },
      {
        title: "SMAT 서비스경영 1급 [컨설턴트]",
        organization: "한국생산성본부",
        date: "2021.12",
      },
      {
        title: "Azure Data Fundamentals",
        organization: "Microsoft",
        date: "2021.05",
      },
      {
        title: "Power Platform Fundamentals",
        organization: "Microsoft",
        date: "2021.05",
      },
      {
        title: "Azure AI Fundamentals",
        organization: "Microsoft",
        date: "2021.05",
      },
      {
        title: "메이커교육운용사 2급",
        organization: "한국U러닝연합회",
        date: "2021.01",
      },
      {
        title: "Azure Fundamentals",
        organization: "Microsoft",
        date: "2020.11",
      },
      {
        title: "DSAC 데이터 사이언티스트 자격 2급 [전문가]",
        organization: "한국생산성본부",
        date: "2020.09",
      },
      {
        title: "정보처리기능사",
        organization: "한국산업인력공단",
        date: "2020.07",
      },
      {
        title: "Microsoft Office Specialist 2016 Master",
        organization: "Microsoft",
        date: "2020.06",
      },
      {
        title: "GTQ 그래픽 기술자격 1급",
        organization: "한국생산성본부",
        date: "2020.03",
      },
      {
        title: "컴퓨터그래픽스운용기능사",
        organization: "한국산업인력공단",
        date: "2019.12",
      },
      {
        title: "웹디자인기능사",
        organization: "한국산업인력공단",
        date: "2019.09",
      },
    ],
  },
  {
    category: "Activities",
    items: [
      {
        title: "2025 부산 유엔위크 서포터즈 유엔즈(UNs)",
        organization: "부산글로벌도시재단",
        date: "2025.04 ~ 2025.12",
      },
      {
        title: "유엔평화기념관 제11기 글로벌 서포터즈",
        organization: "유엔평화기념관",
        date: "2025.04 ~ 2026.03",
      },
      {
        title: "Supertone Play AI Contents Partners",
        organization: "SUPERTON",
        date: "2025.04 ~ 2025.06",
      },
      {
        title: "한국장학재단 파란사다리 2유형 필리핀 과정",
        organization: "한국장학재단",
        date: "2024.06 ~ 2024.12",
      },
      {
        title:
          "한이음 ICT 멘토링 <#24_HF048 인공지능을 사용한 홈페이지 자동 제작 플랫폼>",
        organization: "정보통신기획평가원",
        date: "2024.04 ~ 2024.12",
      },
      {
        title: "NAVER Privacy Enhancement Reward",
        organization: "NAVER",
        date: "2024.02 ~ 2025.12",
      },
      {
        title: "RESAT UIUX 디자인 챌린지 8기",
        organization: "RESAT",
        date: "2024.01 ~ 2024.01",
      },
      {
        title: "RESAT 브랜드 마케팅 챌린지 8기",
        organization: "RESAT",
        date: "2024.01 ~ 2024.01",
      },
      {
        title: "RESAT 서비스 기획 챌린지 8기",
        organization: "RESAT",
        date: "2024.01 ~ 2024.01",
      },
      {
        title: "2023 노들컬처아카데미 <무대기술 스태프 아카데미 - 무대조명>",
        organization: "인터파크",
        date: "2023.11 ~ 2023.11",
      },
      {
        title: "상상마당아카데미 - 프로젝션 맵핑의 시작",
        organization: "KT&G상상마당",
        date: "2023.11 ~ 2023.12",
      },
      {
        title: "NAVER AI Rush 2023 Ambassador",
        organization: "NAVER CLOUD",
        date: "2023.09 ~ 2023.12",
      },
      {
        title: "2023 차세대 보안리더 양성 프로그램 화이트햇 스쿨 1기",
        organization: "한국정보기술연구원",
        date: "2023.09 ~ 2024.03",
      },
      {
        title:
          "구름톤 트레이닝 Goorm x S2W - 정보 보호 전문가 양성 마스터 클래스 2회차",
        organization: "주식회사 구름",
        date: "2023.08 ~ 2024.02",
      },
      {
        title: "RESAT 파밍챌린지 프론트엔드 개발자편 1기",
        organization: "RESAT",
        date: "2023.06 ~ 2023.06",
      },
      {
        title:
          "모두의연구소 풀잎스쿨 - '기초부터 시작하는 C언어와 기초수학 (11주)’",
        organization: "모두의연구소",
        date: "2023.06 ~ 2023.08",
      },
      {
        title:
          "한이음 ICT 멘토링 <#23_HF367 메타버스를 활용한 라이프 로깅 서비스 개발>",
        organization: "정보통신기획평가원",
        date: "2023.04 ~ 2023.12",
      },
      {
        title: "BOOSTCOURSE AI BASIC COACHING STUDY : 2023",
        organization: "NAVER BOOSTCOURSE",
        date: "2023.01 ~ 2023.02",
      },
      {
        title: "BOOSTCOURSE DATA SCIENCE COACHING STUDY : 2022",
        organization: "NAVER BOOSTCOURSE",
        date: "2022.10 ~ 2022.11",
      },
      {
        title: "Numble Research - 모바일뱅크 플랫폼 데이터 리서치 프로젝트",
        organization: "NUMBLE",
        date: "2022.07 ~ 2022.09",
      },
      {
        title: "BOOSTCOURSE HTML/CSS COACHING STUDY : 1st",
        organization: "NAVER BOOSTCOURSE",
        date: "2022.05 ~ 2022.06",
      },
      {
        title: "스파르타 디자이너 맴버십 1기",
        organization: "스파르타",
        date: "2022.03 ~ 2022.12",
      },
      {
        title: "BOOSTCOURSE AI BASIC COACHING STUDY : 1st",
        organization: "NAVER BOOSTCOURSE",
        date: "2022.01 ~ 2022.02",
      },
      {
        title: "22 BASIC CHALLENGE - IOS Track",
        organization: "컴공선배",
        date: "2022.01 ~ 2022.01",
      },
      {
        title: "NIPA 정보통신산업진흥원 - 군 인공지능 교육 고급과정(언어)",
        organization: "정보통신산업진흥원",
        date: "2021.10 ~ 2021.11",
      },
      {
        title:
          "NIPA 정보통신산업진흥원 - AI 온라인 실무 응용 교육과정 (60시간 과정)",
        organization: "정보통신산업진흥원",
        date: "2021.09 ~ 2021.10",
      },
      {
        title:
          "NIPA 정보통신산업진흥원 - AI 온라인 실무 기본 교육과정 (60시간 과정)",
        organization: "정보통신산업진흥원",
        date: "2021.09 ~ 2021.09",
      },
      {
        title: "The Republic of Korea's Air Force",
        organization: "대한민국 공군",
        date: "2021.07 ~ 2023.04",
      },
      {
        title: "Kaggle 방구석 머신러닝 스터디잼 with GDG Busan",
        organization: "Google Developer Group Busan",
        date: "2021.04 ~ 2021.04",
      },
      {
        title: "2020 한국제품안전관리원 대학생 제품안전 홍보단",
        organization: "한국제품안전관리원",
        date: "2020.10 ~ 2020.12",
      },
      {
        title: "BOOSTCOURSE 부스트 코딩뉴비 챌린지 2020 Summer: CS50",
        organization: "NAVER BOOSTCOURSE",
        date: "2020.07 ~ 2020.08",
      },
      {
        title: "DIGIT 라이노 아카데미 1기",
        organization: "DIGIT",
        date: "2020.07 ~ 2020.07",
      },
      {
        title: "Goorm DevelUP Season 1",
        organization: "주식회사 구름",
        date: "2019.09 ~ 2019.12",
      },
    ],
  },
];

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
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 20], fov: 50 }}>
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
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(5px)",
            }}
            onClick={handleClosePopup}
          >
            <div
              style={{
                width: "400px",
                backgroundColor: "#222",
                borderRadius: "15px",
                padding: "30px",
                boxShadow: "0 0 20px rgba(232, 176, 89, 0.3)",
                border: "1px solid rgba(232, 176, 89, 0.5)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                style={{
                  position: "absolute",
                  top: "15px",
                  right: "15px",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.3)",
                  border: "none",
                  color: "white",
                  fontSize: "16px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  transition: "background 0.2s",
                }}
                onClick={handleClosePopup}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "rgba(232, 176, 89, 0.6)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "rgba(0,0,0,0.3)")
                }
              >
                ✕
              </button>
              <h2
                style={{
                  color: "white",
                  fontSize: "24px",
                  marginBottom: "15px",
                  textAlign: "center",
                }}
              >
                {activeCard.title}
              </h2>
              <h3
                style={{
                  color: "white",
                  fontSize: "18px",
                  fontWeight: "normal",
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              >
                {activeCard.organization}
              </h3>
              <p
                style={{
                  color: "#E8B059",
                  fontSize: "16px",
                  textAlign: "center",
                }}
              >
                {activeCard.date}
              </p>
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
      {profileData.map((category, idx) => (
        <Cards
          key={category.category}
          category={category.category}
          items={category.items}
          from={idx * (Math.PI / 2)}
          len={Math.PI / 2}
          position={[0, idx * 0.4 - 0.4, 0]}
          onCardHover={setHovered}
          onCardClick={onCardClick}
          hoveredCard={hovered}
          isAnyCardActive={isCardActive}
        />
      ))}
    </group>
  );
}

function Cards({
  category,
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
  const textPosition = from + len / 2;

  return (
    <group {...props}>
      <Billboard
        position={[
          Math.sin(textPosition) * radius * 1.4,
          0.6,
          Math.cos(textPosition) * radius * 1.4,
        ]}
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
        visible={!isAnyCardActive}
      >
        <group>
          <Text
            fontSize={0.5}
            anchorX="center"
            color="#ffffff"
            outlineWidth={0.01}
            outlineColor="#E8B059"
          >
            {category}
          </Text>
        </group>
      </Billboard>

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
          <Text
            position={[0, 0.2, 0.01]}
            fontSize={0.09}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {item.title}
          </Text>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.07}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {item.organization}
          </Text>
          <Text
            position={[0, -0.2, 0.01]}
            fontSize={0.06}
            color="#aaaaaa"
            anchorX="center"
            anchorY="middle"
          >
            {item.date}
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
