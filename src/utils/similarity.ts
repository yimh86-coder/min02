import { Project } from '../types';

export interface SimilarityResult {
  project: Project;
  score: number; // 0 to 100
  reasons: string[];
  level: 'high' | 'medium' | 'low';
}

function extractKeywords(text: string): string[] {
  if (!text) return [];
  // Tokenize korean words and remove common stops
  return text
    .toLowerCase()
    .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !['구축', '사업', '추진', '위한', '기반', '지원', '조성', '운영', '계획'].includes(w));
}

export function calculateSimilarity(
  draft: {
    title: string;
    category?: string;
    purpose?: string;
    description?: string;
    tags?: string[];
  },
  existingProjects: Project[],
  excludeId?: string
): SimilarityResult[] {
  const draftTitleWords = extractKeywords(draft.title);
  const draftTags = (draft.tags || []).map((t) => t.toLowerCase().trim());
  const draftDescWords = extractKeywords(`${draft.purpose || ''} ${draft.description || ''}`);

  if (draftTitleWords.length === 0 && draftTags.length === 0) {
    return [];
  }

  const results: SimilarityResult[] = [];

  for (const prj of existingProjects) {
    if (excludeId && prj.id === excludeId) continue;

    let score = 0;
    const reasons: string[] = [];

    // Category match
    if (draft.category && prj.category === draft.category) {
      score += 15;
      reasons.push(`동일 정책 분야 (${prj.category})`);
    }

    // Tag overlap
    const prjTags = prj.tags.map((t) => t.toLowerCase().trim());
    const matchedTags = draftTags.filter((t) => prjTags.includes(t));
    if (matchedTags.length > 0) {
      const tagScore = Math.min(35, matchedTags.length * 15);
      score += tagScore;
      reasons.push(`핵심 태그 일치: #${matchedTags.join(', #')}`);
    }

    // Title word overlap
    const prjTitleWords = extractKeywords(prj.title);
    const matchedTitleWords = draftTitleWords.filter((w) =>
      prjTitleWords.some((pw) => pw.includes(w) || w.includes(pw))
    );
    if (matchedTitleWords.length > 0) {
      const titleScore = Math.min(40, matchedTitleWords.length * 15);
      score += titleScore;
      reasons.push(`사업명 핵심어 일치: [${matchedTitleWords.join(', ')}]`);
    }

    // Purpose & Description overlap
    const prjDescWords = extractKeywords(`${prj.purpose} ${prj.description}`);
    const matchedDescWords = draftDescWords.filter((w) => prjDescWords.includes(w));
    if (matchedDescWords.length >= 2) {
      const descScore = Math.min(20, matchedDescWords.length * 3);
      score += descScore;
      reasons.push(`사업 목적/내용 유사 키워드 (${matchedDescWords.slice(0, 3).join(', ')})`);
    }

    score = Math.min(99, Math.round(score));

    if (score >= 25) {
      results.push({
        project: prj,
        score,
        reasons,
        level: score >= 70 ? 'high' : score >= 45 ? 'medium' : 'low',
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
