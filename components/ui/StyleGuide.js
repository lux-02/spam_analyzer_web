import React from "react";
import ThemeToggle from "./ThemeToggle";

export const StyleGuide = () => {
  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-heading">스타일 가이드</h1>
        <div className="flex items-center">
          <span className="mr-2 text-text-light">테마 전환:</span>
          <ThemeToggle />
        </div>
      </div>

      {/* 다크모드 안내 */}
      <section className="mb-12 bg-white dark:bg-box p-6 rounded-lg shadow-custom">
        <h2 className="text-xl font-semibold text-heading mb-4">
          다크모드 사용 안내
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-heading mb-2">
              다크모드 작동 방식
            </h3>
            <p className="text-text mb-4">
              다크모드는 Tailwind CSS의{" "}
              <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                darkMode: 'class'
              </code>{" "}
              설정과 CSS 변수를 사용하여 구현되었습니다. 클래스가{" "}
              <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                dark:
              </code>{" "}
              접두사를 사용하여 스타일을 변경합니다.
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <ThemeToggle />
              <span className="text-text">
                ← 이 버튼을 클릭하여 테마를 전환해보세요
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-heading mb-2">
              다크모드 사용 예시
            </h3>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto text-xs text-gray-800 dark:text-gray-200">
              {`// Tailwind CSS 클래스 예시
<div className="bg-white dark:bg-gray-800">
  <p className="text-gray-800 dark:text-gray-200">
    텍스트 내용
  </p>
</div>

// CSS 변수 사용 예시
.my-element {
  background-color: var(--background);
  color: var(--text);
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* 다크모드 컬러 팔레트 */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-heading mb-4">
          다크모드 컬러 팔레트
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-md font-medium text-heading mb-2">
              라이트 모드
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <ThemeColorPreview
                name="배경색"
                lightColor="#ffffff"
                darkColor="#0a0a0a"
                cssVar="--background"
              />
              <ThemeColorPreview
                name="텍스트"
                lightColor="#111111"
                darkColor="#e5e5e5"
                cssVar="--text"
              />
              <ThemeColorPreview
                name="헤딩"
                lightColor="#222222"
                darkColor="#ffffff"
                cssVar="--heading"
              />
              <ThemeColorPreview
                name="보조 텍스트"
                lightColor="#666666"
                darkColor="#a3a3a3"
                cssVar="--text-light"
              />
              <ThemeColorPreview
                name="기본 강조색"
                lightColor="#2563eb"
                darkColor="#3b82f6"
                cssVar="--primary"
              />
              <ThemeColorPreview
                name="박스 배경"
                lightColor="#333333"
                darkColor="#222222"
                cssVar="--box"
              />
            </div>
          </div>
          <div>
            <h3 className="text-md font-medium text-heading mb-2">다크 모드</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <ThemeColorPreview
                name="배경색"
                lightColor="#ffffff"
                darkColor="#0a0a0a"
                cssVar="--background"
                isDark
              />
              <ThemeColorPreview
                name="텍스트"
                lightColor="#111111"
                darkColor="#e5e5e5"
                cssVar="--text"
                isDark
              />
              <ThemeColorPreview
                name="헤딩"
                lightColor="#222222"
                darkColor="#ffffff"
                cssVar="--heading"
                isDark
              />
              <ThemeColorPreview
                name="보조 텍스트"
                lightColor="#666666"
                darkColor="#a3a3a3"
                cssVar="--text-light"
                isDark
              />
              <ThemeColorPreview
                name="기본 강조색"
                lightColor="#2563eb"
                darkColor="#3b82f6"
                cssVar="--primary"
                isDark
              />
              <ThemeColorPreview
                name="박스 배경"
                lightColor="#333333"
                darkColor="#222222"
                cssVar="--box"
                isDark
              />
            </div>
          </div>
        </div>
      </section>

      {/* 컬러 팔레트 */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-heading mb-4">컬러 팔레트</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ColorBox
            color="primary"
            name="Primary"
            hex="#2563EB"
            darkHex="#3b82f6"
          />
          <ColorBox
            color="primary-dark"
            name="Primary Dark"
            hex="#1e40af"
            darkHex="#2563eb"
          />
          <ColorBox
            color="primary-light"
            name="Primary Light"
            hex="#3b82f6"
            darkHex="#60a5fa"
          />
          <ColorBox color="box" name="Box" hex="#333333" darkHex="#222222" />
          <ColorBox
            color="box-light"
            name="Box Light"
            hex="#4b4b4b"
            darkHex="#333333"
          />
          <ColorBox
            color="box-dark"
            name="Box Dark"
            hex="#222222"
            darkHex="#111111"
          />
          <ColorBox
            color="heading"
            name="Heading"
            hex="#222222"
            darkHex="#ffffff"
            textClass="text-white"
          />
          <ColorBox
            color="text"
            name="Text"
            hex="#111111"
            darkHex="#e5e5e5"
            textClass="text-white"
          />
          <ColorBox
            color="text-light"
            name="Text Light"
            hex="#666666"
            darkHex="#a3a3a3"
            textClass="text-white"
          />
          <ColorBox
            color="danger"
            name="Danger"
            hex="#FF4136"
            darkHex="#FF4136"
          />
          <ColorBox
            color="warning"
            name="Warning"
            hex="#FF851B"
            darkHex="#FF851B"
          />
          <ColorBox color="safe" name="Safe" hex="#2ECC40" darkHex="#2ECC40" />
        </div>
      </section>

      {/* 타이포그래피 */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-heading mb-4">
          타이포그래피
        </h2>
        <div className="space-y-4 bg-white dark:bg-box p-6 rounded-lg shadow-custom">
          <div>
            <h1 className="text-4xl font-bold text-heading">제목 H1</h1>
            <p className="text-text-light">text-4xl font-bold text-heading</p>
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-heading">제목 H2</h2>
            <p className="text-text-light">
              text-3xl font-semibold text-heading
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-heading">제목 H3</h3>
            <p className="text-text-light">
              text-2xl font-semibold text-heading
            </p>
          </div>
          <div>
            <h4 className="text-xl font-medium text-heading">제목 H4</h4>
            <p className="text-text-light">text-xl font-medium text-heading</p>
          </div>
          <div>
            <p className="text-base text-text">본문 텍스트</p>
            <p className="text-text-light">text-base text-text</p>
          </div>
          <div>
            <p className="text-sm text-text-light">설명 텍스트</p>
            <p className="text-text-light">text-sm text-text-light</p>
          </div>
        </div>
      </section>

      {/* 버튼 */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-heading mb-4">버튼</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white dark:bg-box p-6 rounded-lg shadow-custom">
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-heading mb-2">기본 버튼</h3>
            <button className="btn-primary">기본 버튼</button>
            <button className="btn-secondary">보조 버튼</button>
            <button className="btn-outline">아웃라인 버튼</button>
            <button className="btn-text">텍스트 버튼</button>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-heading mb-2">크기</h3>
            <button className="btn-primary btn-sm">작은 버튼</button>
            <button className="btn-primary">보통 버튼</button>
            <button className="btn-primary btn-lg">큰 버튼</button>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-heading mb-2">상태</h3>
            <button className="btn-primary">기본</button>
            <button className="btn-primary hover:bg-primary-dark">호버</button>
            <button className="btn-primary opacity-70 cursor-not-allowed">
              비활성화
            </button>
            <button className="btn-primary flex items-center">
              <span className="mr-2">로딩중</span>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-heading mb-2">컬러</h3>
            <button className="btn-primary">기본</button>
            <button className="btn-danger">위험</button>
            <button className="btn-warning">경고</button>
            <button className="btn-success">성공</button>
          </div>
        </div>
      </section>

      {/* 카드 */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-heading mb-4">카드</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-heading">기본 카드</h3>
            </div>
            <div className="card-body">
              <p className="text-text">
                이것은 기본 카드 컴포넌트입니다. 다양한 정보를 담을 수 있습니다.
              </p>
            </div>
            <div className="card-footer">
              <button className="btn-text">자세히 보기</button>
            </div>
          </div>

          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3 className="text-lg font-semibold">강조 카드</h3>
            </div>
            <div className="card-body">
              <p className="text-text">
                중요한 정보를 강조하기 위한 카드입니다.
              </p>
            </div>
            <div className="card-footer">
              <button className="btn-primary">확인</button>
            </div>
          </div>

          <div className="card border-t-4 border-primary">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-heading">정보 카드</h3>
            </div>
            <div className="card-body">
              <p className="text-text">추가 정보를 제공하는 카드입니다.</p>
            </div>
            <div className="card-footer">
              <button className="btn-outline">닫기</button>
            </div>
          </div>
        </div>
      </section>

      {/* 폼 요소 */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-heading mb-4">폼 요소</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-box p-6 rounded-lg shadow-custom">
            <div className="mb-4">
              <label className="form-label">이메일</label>
              <input
                type="email"
                placeholder="이메일을 입력하세요"
                className="form-input"
              />
            </div>

            <div className="mb-4">
              <label className="form-label">비밀번호</label>
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                className="form-input"
              />
              <p className="form-help">
                8자 이상의 영문, 숫자, 특수문자를 포함해야 합니다.
              </p>
            </div>

            <div className="mb-4">
              <label className="form-label">메시지</label>
              <textarea
                placeholder="메시지를 입력하세요"
                className="form-textarea"
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="form-label">카테고리</label>
              <select className="form-select">
                <option>옵션 1</option>
                <option>옵션 2</option>
                <option>옵션 3</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-box p-6 rounded-lg shadow-custom">
            <div className="mb-4">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2 text-text">이용약관에 동의합니다</span>
              </label>
            </div>

            <div className="mb-4">
              <div className="form-label mb-2">알림 설정</div>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="notification"
                    className="form-radio"
                    defaultChecked
                  />
                  <span className="ml-2 text-text">모든 알림 받기</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="notification"
                    className="form-radio"
                  />
                  <span className="ml-2 text-text">중요 알림만 받기</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="notification"
                    className="form-radio"
                  />
                  <span className="ml-2 text-text">알림 받지 않기</span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">파일 업로드</label>
              <div className="form-file-upload">
                <input type="file" className="hidden" id="file-upload" />
                <label
                  htmlFor="file-upload"
                  className="btn-outline w-full text-center"
                >
                  파일 선택
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input type="checkbox" className="form-toggle" />
                <span className="ml-2 text-text">다크 모드</span>
              </label>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// 컬러 박스 컴포넌트
const ColorBox = ({ color, name, hex, darkHex, textClass = "text-black" }) => {
  return (
    <div
      className={`p-4 rounded-lg bg-${color} flex flex-col justify-between h-32 shadow-custom relative overflow-hidden`}
    >
      <div className="absolute inset-0 dark:hidden"></div>
      <div className="relative z-10">
        <span className={`font-semibold ${textClass}`}>{name}</span>
        <div className="mt-auto">
          <span className={`text-sm ${textClass} block`}>Light: {hex}</span>
          <span className={`text-sm ${textClass} block dark:inline`}>
            Dark: {darkHex}
          </span>
        </div>
      </div>
    </div>
  );
};

// 테마 컬러 미리보기 컴포넌트
const ThemeColorPreview = ({ name, lightColor, darkColor, cssVar, isDark }) => {
  const bgColor = isDark ? darkColor : lightColor;
  const textColor = isDark
    ? isLightColor(darkColor)
      ? "#000"
      : "#fff"
    : isLightColor(lightColor)
    ? "#000"
    : "#fff";

  return (
    <div className="flex flex-col">
      <div
        className="h-12 rounded-t-md p-2 flex items-center justify-between font-mono text-xs"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <span>{name}</span>
        <span>{isDark ? darkColor : lightColor}</span>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-b-md p-2 text-xs">
        <code>var({cssVar})</code>
      </div>
    </div>
  );
};

// 밝은 색상인지 판단하는 함수
const isLightColor = (hex) => {
  // 16진수 색상을 RGB로 변환
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // 상대적 휘도 계산 (WCAG 기준)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // 0.5보다 크면 밝은 색상으로 간주
  return luminance > 0.5;
};

export default StyleGuide;
