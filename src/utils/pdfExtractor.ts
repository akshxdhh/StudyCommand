import { Subject, Exam, Module, Topic } from '../types';

export interface ExtractedTopicCandidate {
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  subtopics?: string[];
}

export interface ExtractedModuleCandidate {
  moduleNumber: number;
  name: string;
  topics: ExtractedTopicCandidate[];
}

export interface ExtractedSubjectCandidate {
  code: string;
  name: string;
  courseCode: string;
  semester: string;
  credits: number;
  color: string;
  modules: ExtractedModuleCandidate[];
}

export interface ExtractedExamCandidate {
  subjectCode: string;
  subjectName: string;
  date: string; // ISO string e.g. "2026-11-23T09:30:00"
  session?: string; // "FN" | "AN"
  isLab?: boolean;
}

export interface ExtractedPdfPayload {
  filename: string;
  numpages?: number;
  detectedType: 'SYLLABUS' | 'TIMETABLE' | 'MIXED';
  rawTextPreview: string;
  subjects: ExtractedSubjectCandidate[];
  exams: ExtractedExamCandidate[];
}

const PALETTE = ['#00f0ff', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6', '#6366f1'];

export function parsePdfText(rawText: string, filename: string = 'Document.pdf'): ExtractedPdfPayload {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const subjects: ExtractedSubjectCandidate[] = [];
  const exams: ExtractedExamCandidate[] = [];

  // 1. Detect if it's an Exam Timetable
  const isTimetable = /timetable|time\s*table|schedule\s*of\s*examinations|date\s*sheet/i.test(rawText);

  // Parse Timetable items: dates followed by subject code / subject name
  const dateRegex = /(\d{1,2})[-/. ](\d{1,2}|[A-Za-z]{3,9})[-/. ](\d{2,4})/;
  const courseCodeRegex = /\b([A-Z]{3,5}\s*\d{2,4}[A-Z]?)\b/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateMatch = line.match(dateRegex);
    const codeMatch = line.match(courseCodeRegex);

    if (dateMatch && codeMatch) {
      const code = codeMatch[1].replace(/\s+/g, '');
      const dateStr = normalizeDate(dateMatch[0]);
      let subjectName = line.replace(dateMatch[0], '').replace(codeMatch[0], '').replace(/[-–:,|]/g, '').trim();
      if (!subjectName && i + 1 < lines.length) {
        subjectName = lines[i + 1].trim();
      }
      if (!subjectName) subjectName = `Exam for ${code}`;

      exams.push({
        subjectCode: code,
        subjectName,
        date: dateStr,
        session: /AN|Afternoon|2:00|1:30|14:00/i.test(line) ? 'AN' : 'FN',
        isLab: /lab|practical|viva/i.test(line + ' ' + subjectName),
      });
    }
  }

  // 2. Parse Syllabus: Detect Subjects, Modules, Topics
  // Look for Course Code & Name
  let currentCourseCode = '';
  let currentCourseName = '';

  const courseMatch = rawText.match(/Course\s*Code\s*[:\-]?\s*([A-Z0-9]+)/i) ||
    rawText.match(/\b([A-Z]{3,5}\d{3}[A-Z]?)\b/);

  if (courseMatch) {
    currentCourseCode = courseMatch[1].trim();
  } else {
    currentCourseCode = filename.replace(/\.pdf$/i, '').toUpperCase().slice(0, 8);
  }

  const nameMatch = rawText.match(/Course\s*Name\s*[:\-]?\s*([^\n\r]+)/i) ||
    rawText.match(/Course\s*Title\s*[:\-]?\s*([^\n\r]+)/i);

  if (nameMatch) {
    currentCourseName = nameMatch[1].trim();
  } else {
    currentCourseName = cleanSubjectNameFromFilename(filename);
  }

  // Detect Modules (e.g. Module 1, Module I, UNIT I)
  const moduleBlocks: { num: number; title: string; lines: string[] }[] = [];
  const moduleRegex = /^(?:MODULE|UNIT)\s*[-:]?\s*([0-9]+|[IVXLCDM]+)(.*)$/i;

  let activeModule: { num: number; title: string; lines: string[] } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const modMatch = line.match(moduleRegex);

    if (modMatch) {
      const num = romanOrArabicToNumber(modMatch[1]);
      let title = modMatch[2]?.replace(/^[-: ]+/, '').trim() || '';
      if (!title && i + 1 < lines.length && !lines[i + 1].match(moduleRegex)) {
        title = lines[i + 1].trim();
      }
      if (!title) title = `Module ${num}`;

      activeModule = { num, title, lines: [] };
      moduleBlocks.push(activeModule);
    } else if (activeModule) {
      // Exclude references, questions, or headers
      if (/^(Text\s*Books?|References?|Course\s*Outcomes?|Question\s*Paper)/i.test(line)) {
        activeModule = null;
      } else {
        activeModule.lines.push(line);
      }
    }
  }

  // If modules were identified
  if (moduleBlocks.length > 0) {
    const modules: ExtractedModuleCandidate[] = moduleBlocks.map((mb) => {
      const rawTopics = extractTopicsFromModuleLines(mb.lines);
      return {
        moduleNumber: mb.num,
        name: `Module ${mb.num}: ${mb.title}`,
        topics: rawTopics.length > 0 ? rawTopics : [
          {
            title: mb.title,
            priority: 'HIGH' as const,
            subtopics: mb.lines.slice(0, 3),
          },
        ],
      };
    });

    subjects.push({
      code: currentCourseCode.replace(/\s+/g, ''),
      name: currentCourseName,
      courseCode: currentCourseCode,
      semester: 'S5',
      credits: 4,
      color: PALETTE[subjects.length % PALETTE.length],
      modules,
    });
  } else if (!isTimetable && lines.length > 5) {
    // Fallback: create 1 subject with synthesized modules if raw text contains readable chunks
    const chunkTopics = extractTopicsFromModuleLines(lines.slice(0, 30));
    subjects.push({
      code: currentCourseCode,
      name: currentCourseName,
      courseCode: currentCourseCode,
      semester: 'S5',
      credits: 4,
      color: '#00f0ff',
      modules: [
        {
          moduleNumber: 1,
          name: `Module 1: Core Syllabus Content`,
          topics: chunkTopics.length > 0 ? chunkTopics : [
            {
              title: currentCourseName,
              priority: 'HIGH' as const,
              subtopics: lines.slice(0, 4),
            },
          ],
        },
      ],
    });
  }

  return {
    filename,
    detectedType: isTimetable && exams.length > 0 ? (subjects.length > 0 ? 'MIXED' : 'TIMETABLE') : 'SYLLABUS',
    rawTextPreview: rawText.slice(0, 500),
    subjects,
    exams,
  };
}

function extractTopicsFromModuleLines(lines: string[]): ExtractedTopicCandidate[] {
  const topics: ExtractedTopicCandidate[] = [];
  const textJoined = lines.join(' ');
  // Split on semicolons or commas or periods followed by capitals
  const candidateSentences = textJoined
    .split(/;|•|\n|\r|(?<=[a-z0-9\)])\.\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 8 && s.length <= 140);

  for (const sentence of candidateSentences) {
    // Avoid noise
    if (/hours|marks|credits|syllabus|module|page/i.test(sentence) && sentence.length < 20) {
      continue;
    }
    const parts = sentence.split(/[-–:]/);
    const title = parts[0].trim();
    const subtopics = parts.slice(1).join(' ').split(/,\s*/).map((st) => st.trim()).filter(Boolean);

    topics.push({
      title,
      priority: topics.length < 2 ? 'HIGH' : 'MEDIUM',
      subtopics: subtopics.length > 0 ? subtopics : undefined,
    });
  }

  return topics.slice(0, 10);
}

function romanOrArabicToNumber(val: string): number {
  const trimmed = val.trim().toUpperCase();
  const romanMap: Record<string, number> = {
    I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10,
  };
  if (romanMap[trimmed]) return romanMap[trimmed];
  const parsed = parseInt(trimmed, 10);
  return isNaN(parsed) ? 1 : parsed;
}

function cleanSubjectNameFromFilename(filename: string): string {
  const base = filename.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ');
  return base.replace(/\b([a-z])/g, (c) => c.toUpperCase());
}

function normalizeDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      d.setHours(9, 30, 0, 0);
      return d.toISOString();
    }
  } catch {}
  return new Date().toISOString();
}
