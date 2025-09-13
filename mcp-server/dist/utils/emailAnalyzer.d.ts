/**
 * 이메일 분석 유틸리티 함수들
 * 기존 프로젝트의 emailAnalyzer.js를 TypeScript로 포팅
 */
export declare function decodeBase64HeaderIfNeeded(value: string): string;
export declare const decodeMIMEHeader: (encodedHeader: string) => string;
export declare const decodeQuotedPrintable: (str: string) => string;
export declare const analyzeEmailHeader: (emailData: string) => any;
export declare function parseEmailBodyAndLinks(rawEmailData: string): {
    body: string;
    links: string[];
};
export declare const calculateRiskScore: (emailData: any) => {
    score: number;
    level: string;
    factors: string[];
};
export declare const checkBeaconImages: (htmlContent: string) => string[];
export declare const extractEmailText: (emailContent: string) => string;
export declare const analyzeEmailIntent: (emailContent: string) => Promise<any>;
//# sourceMappingURL=emailAnalyzer.d.ts.map