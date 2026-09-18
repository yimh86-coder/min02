import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', city: '충청남도 아산시' });
  });

  // API: AI 3줄 요약 생성 엔드포인트
  app.post('/api/summarize-project', async (req, res) => {
    try {
      const { title, purpose, description } = req.body;

      if (!title && !purpose && !description) {
        return res.status(400).json({ 
          error: '사업명, 사업 목적 또는 주요 내용을 최소 1개 이상 입력해 주세요.' 
        });
      }

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        // Fallback generator when GEMINI_API_KEY is not configured
        const lines = [
          `1. [추진목적] ${purpose ? purpose.slice(0, 70) : `${title || '아산시 정책'}을 통한 시민 편익 증대 및 지역 현안 해결`}`,
          `2. [주요내용] ${description ? description.slice(0, 75) : `${title || '사업'} 관련 인프라 구축 및 맞춤형 공공서비스 운영`}`,
          `3. [기대효과] 아산시 행정 효율화 달성 및 시민 체감 안전·복지 만족도 극대화`,
        ];
        return res.json({
          summary: lines.join('\n'),
          lines,
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `당신은 대한민국 충청남도 아산시청의 행정 정책 기획 전문가입니다.
다음 지자체(아산시) 사업 정보를 분석하여, 공무원 및 관리자가 한눈에 파악할 수 있는 "정확히 3줄 요약"을 생성해 주세요.

[사업 정보]
- 사업명: ${title || '(미입력)'}
- 사업 목적: ${purpose || '(미입력)'}
- 주요 내용: ${description || '(미입력)'}

[요약 원칙]
1. 반드시 3줄로 구성할 것. 각 줄은 "1. [추진배경/목적]", "2. [핵심내용]", "3. [기대효과]" 형식으로 시작할 것.
2. 아산시민 및 지자체 행정 관점에서 간결하고 명확한 개조식 문체(~구축, ~제고, ~지원 등)를 사용할 것.
3. 각 줄은 80자 이내로 핵심만 압축할 것.
4. 불필요한 인사말, 설명 등 부가 텍스트 없이 3줄 요약 텍스트만 출력할 것.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const rawText = response.text || '';
      const lines = rawText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      // Clean lines to ensure 3-line format
      let formattedLines: string[] = [];
      if (lines.length >= 3) {
        formattedLines = lines.slice(0, 3);
      } else if (lines.length > 0) {
        formattedLines = lines;
      } else {
        formattedLines = [
          `1. [추진목적] ${purpose || title || '아산시 핵심 과제 추진'}`,
          `2. [주요내용] ${description || '세부 사업 인프라 구축'}`,
          `3. [기대효과] 시민 만족도 향상 및 시정 발전 기여`,
        ];
      }

      return res.json({
        summary: formattedLines.join('\n'),
        lines: formattedLines,
      });
    } catch (error: any) {
      console.error('Error generating AI project summary:', error);
      const fallbackLines = [
        `1. [추진목적] ${req.body.purpose || req.body.title || '아산시 지역 현안 해결'}`,
        `2. [주요내용] ${req.body.description ? req.body.description.slice(0, 70) : `${req.body.title} 관련 인프라 및 지원 서비스 구축`}`,
        `3. [기대효과] 예산 절감 및 아산시민 행정 체감도 제고`,
      ];
      return res.status(200).json({
        summary: fallbackLines.join('\n'),
        lines: fallbackLines,
        warning: 'Gemini API 호출 지연으로 표준 요약문이 생성되었습니다.',
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`아산시 사업 관리 서버 구동 완료: http://0.0.0.0:${PORT}`);
  });
}

startServer();
