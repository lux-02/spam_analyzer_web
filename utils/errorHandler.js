// 개발 환경에서 콘솔 에러 관리
export const suppressConsoleErrors = () => {
  if (process.env.NODE_ENV === "development") {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      const message = args.join(" ");

      // 특정 에러 메시지들을 필터링
      const suppressedErrors = [
        "Failed to load resource: the server responded with a status of 403",
        "Chrome is moving towards a new experience",
        "Download the React DevTools",
        "Invalid message",
        "Cannot read properties of undefined (reading 'components')",
        "THREE.WebGLRenderer: Context Lost",
      ];

      const shouldSuppress = suppressedErrors.some((error) =>
        message.includes(error)
      );

      if (!shouldSuppress) {
        originalError.apply(console, args);
      }
    };

    console.warn = (...args) => {
      const message = args.join(" ");

      // 특정 경고 메시지들을 필터링
      const suppressedWarnings = [
        "THREE.WebGLRenderer: Context Lost",
        "thumbnailTexture load failed",
        "Audio load failed",
      ];

      const shouldSuppress = suppressedWarnings.some((warning) =>
        message.includes(warning)
      );

      if (!shouldSuppress) {
        originalWarn.apply(console, args);
      }
    };
  }
};

// 미디어 로드 에러 처리
export const handleMediaError = (mediaType, url, error) => {
  if (process.env.NODE_ENV === "development") {
    console.group(`🔧 미디어 로드 디버그 정보 (${mediaType})`);
    console.log("URL:", url);
    console.log("Error:", error);

    if (url.includes("storage.googleapis.com")) {
      console.log("💡 해결책: Google Drive 사용을 권장합니다");
      console.log("1. Google Drive에 파일 업로드");
      console.log("2. 공유 링크 생성 (링크가 있는 모든 사용자)");
      console.log("3. 포트폴리오 데이터에 링크 추가");
    }

    console.groupEnd();
  }
};

// WebGL 컨텍스트 복구 시도
export const handleWebGLContextLoss = (canvas) => {
  if (canvas && canvas.getContext) {
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl) {
      canvas.addEventListener("webglcontextlost", (event) => {
        event.preventDefault();
        console.warn("WebGL 컨텍스트 손실 감지, 복구 시도 중...");
      });

      canvas.addEventListener("webglcontextrestored", () => {
        console.log("WebGL 컨텍스트 복구 완료");
      });
    }
  }
};
