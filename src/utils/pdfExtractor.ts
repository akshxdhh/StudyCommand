import { Subject, Exam, Module, Topic, TimetableSlot } from '../types';

export interface ExtractedTopicCandidate {
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  subtopics?: string[];
  selected?: boolean;
}

export interface ExtractedModuleCandidate {
  moduleNumber: number;
  name: string;
  topics: ExtractedTopicCandidate[];
  selected?: boolean;
}

export interface ExtractedSubjectCandidate {
  code: string;
  name: string;
  courseCode: string;
  semester: string;
  credits: number;
  color: string;
  modules: ExtractedModuleCandidate[];
  selected?: boolean;
  isDuplicate?: boolean;
}

export interface ExtractedExamCandidate {
  subjectCode: string;
  subjectName: string;
  date: string; // ISO string e.g. "2026-11-23T09:30:00"
  session?: string; // "FN" | "AN"
  isLab?: boolean;
  selected?: boolean;
  isDuplicate?: boolean;
}

export interface ExtractedScheduleSlotCandidate {
  label: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  type: 'STUDY' | 'BREAK' | 'LUNCH' | 'FREE';
  selected?: boolean;
}

export interface ExtractedPdfPayload {
  filename: string;
  numpages?: number;
  detectedType: 'SYLLABUS' | 'TIMETABLE' | 'SCHEDULE' | 'MIXED';
  rawTextPreview: string;
  isScanned?: boolean;
  warning?: string;
  subjects: ExtractedSubjectCandidate[];
  exams: ExtractedExamCandidate[];
  scheduleSlots?: ExtractedScheduleSlotCandidate[];
}

const PALETTE = ['#00f0ff', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6', '#6366f1'];

export function parsePdfText(rawText: string, filename: string = 'Document.pdf'): ExtractedPdfPayload {
  const trimmed = rawText ? rawText.trim() : '';
  const isScanned = trimmed.length < 50;

  if (isScanned) {
    return {
      filename,
      detectedType: 'SYLLABUS',
      rawTextPreview: trimmed,
      isScanned: true,
      warning: 'This appears to be a scanned document or image-only PDF with minimal text. Please import a digital text-based PDF or add subjects manually.',
      subjects: [],
      exams: [],
      scheduleSlots: [],
    };
  }

  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const subjects: ExtractedSubjectCandidate[] = [];
  const exams: ExtractedExamCandidate[] = [];
  const scheduleSlots: ExtractedScheduleSlotCandidate[] = [];

  // 1. Detect if it's an Exam Timetable or Daily Schedule
  const isTimetable = /timetable|time\s*table|schedule\s*of\s*examinations|date\s*sheet/i.test(rawText);

  // Parse Timetable items: dates followed by subject code / subject name
  const dateRegex = /(\d{1,2})[-/. ](\d{1,2}|[A-Za-z]{3,9})[-/. ](\d{2,4})/;
  const courseCodeRegex = /\b([A-Z]{3,5}\s*\d{2,4}[A-Z]?)\b/;

  // Parse Routine/Schedule time slots: e.g. "09:00 - 10:30" or "9:00 to 10:30"
  const timeSlotRegex = /(\d{1,2}[:.]\d{2})\s*(?:-|to|–)\s*(\d{1,2}[:.]\d{2})/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Exam Timetable line check
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
        selected: true,
      });
    }

    // Daily Schedule line check
    const timeMatch = line.match(timeSlotRegex);
    if (timeMatch) {
      const start = normalizeTime(timeMatch[1]);
      const end = normalizeTime(timeMatch[2]);
      let label = line.replace(timeMatch[0], '').replace(/[-–:,|]/g, '').trim();
      if (!label) label = `Study Session ${scheduleSlots.length + 1}`;
      const isLunch = /lunch|dinner|meal/i.test(label);
      const isBreak = /break|recess|tea/i.test(label);

      scheduleSlots.push({
        label,
        startTime: start,
        endTime: end,
        type: isLunch ? 'LUNCH' : isBreak ? 'BREAK' : 'STUDY',
        selected: true,
      });
    }
  }

  // 2. Parse Syllabus: Detect Subjects, Modules, Topics
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
        selected: true,
        topics: (rawTopics.length > 0 ? rawTopics : [
          {
            title: mb.title,
            priority: 'HIGH' as const,
            subtopics: mb.lines.slice(0, 3),
            selected: true,
          },
        ]).map((t) => ({ ...t, selected: true })),
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
      selected: true,
    });
  } else if (!isTimetable && lines.length > 5) {
    // Fallback: create 1 subject with synthesized modules if text contains content
    const chunkTopics = extractTopicsFromModuleLines(lines.slice(0, 30));
    subjects.push({
      code: currentCourseCode,
      name: currentCourseName,
      courseCode: currentCourseCode,
      semester: 'S5',
      credits: 4,
      color: '#00f0ff',
      selected: true,
      modules: [
        {
          moduleNumber: 1,
          name: `Module 1: Core Syllabus Content`,
          selected: true,
          topics: (chunkTopics.length > 0 ? chunkTopics : [
            {
              title: currentCourseName,
              priority: 'HIGH' as const,
              subtopics: lines.slice(0, 4),
              selected: true,
            },
          ]).map((t) => ({ ...t, selected: true })),
        },
      ],
    });
  }

  let detectedType: 'SYLLABUS' | 'TIMETABLE' | 'SCHEDULE' | 'MIXED' = 'SYLLABUS';
  if (exams.length > 0 && subjects.length > 0) {
    detectedType = 'MIXED';
  } else if (exams.length > 0) {
    detectedType = 'TIMETABLE';
  } else if (scheduleSlots.length > 0 && subjects.length === 0) {
    detectedType = 'SCHEDULE';
  }

  return {
    filename,
    detectedType,
    rawTextPreview: rawText.slice(0, 500),
    isScanned: false,
    subjects,
    exams,
    scheduleSlots: scheduleSlots.length > 0 ? scheduleSlots : undefined,
  };
}

export function checkDuplicates(
  payload: ExtractedPdfPayload,
  existingSubjects: Array<{ name: string; courseCode?: string; code?: string }>,
  existingExams: Array<{ subjectCode?: string; subjectName?: string }>
): ExtractedPdfPayload {
  const updatedSubjects = payload.subjects.map((sub) => {
    const subCode = (sub.courseCode || sub.code || '').toLowerCase();
    const subName = (sub.name || '').toLowerCase();
    const isDup = existingSubjects.some((s) => {
      const code = (s.courseCode || s.code || '').toLowerCase();
      const name = (s.name || '').toLowerCase();
      return (code && subCode && code === subCode) || (name && subName && name === subName);
    });
    return { ...sub, isDuplicate: isDup };
  });

  const updatedExams = payload.exams.map((exam) => {
    const examCode = (exam.subjectCode || '').toLowerCase();
    const examName = (exam.subjectName || '').toLowerCase();
    const isDup = existingExams.some((e) => {
      const code = (e.subjectCode || '').toLowerCase();
      const name = (e.subjectName || '').toLowerCase();
      return (code && examCode && code === examCode) || (name && examName && name === examName);
    });
    return { ...exam, isDuplicate: isDup };
  });

  return {
    ...payload,
    subjects: updatedSubjects,
    exams: updatedExams,
  };
}

function extractTopicsFromModuleLines(lines: string[]): ExtractedTopicCandidate[] {
  const topics: ExtractedTopicCandidate[] = [];
  const textJoined = lines.join(' ');
  const candidateSentences = textJoined
    .split(/;|•|\n|\r|(?<=[a-z0-9\)])\.\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 8 && s.length <= 140);

  for (const sentence of candidateSentences) {
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
      selected: true,
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

function normalizeTime(timeStr: string): string {
  const clean = timeStr.replace('.', ':').trim();
  const parts = clean.split(':');
  const h = String(parseInt(parts[0], 10)).padStart(2, '0');
  const m = String(parseInt(parts[1] || '0', 10)).padStart(2, '0');
  return `${h}:${m}`;
}
