import { describe, it, expect } from 'vitest';
import { parsePdfText, checkDuplicates, ExtractedPdfPayload } from '../pdfExtractor';

describe('PDF Intelligence: Scanned Detection, Schedule Extraction & Duplicates', () => {
  it('should flag scanned documents with fewer than 50 extracted characters', () => {
    const scannedText = '   \n  APJ KTU \n  ';
    const result = parsePdfText(scannedText, 'Scanned_Syllabus.pdf');
    expect(result.isScanned).toBe(true);
    expect(result.warning).toContain('scanned document');
  });

  it('should not flag text-rich PDF documents as scanned', () => {
    const textRich = `
      APJ Abdul Kalam Technological University
      Course Code: CST305
      Course Name: Compiler Design
      Credits: 4
      Semester: S5
      MODULE I: Lexical Analysis and Tokenization
      Regular expressions, finite state automata, lexer implementation.
    `;
    const result = parsePdfText(textRich, 'CST305.pdf');
    expect(result.isScanned).toBe(false);
    expect(result.warning).toBeUndefined();
  });

  it('should extract daily study schedule slots with times and labels', () => {
    const scheduleText = `
      Daily Study Schedule / Timetable:
      09:00 - 10:30 CST305 Compiler Design (Study Session 1)
      11:00 - 12:30 CST301 Formal Languages (Study Session 2)
      14:00 - 15:30 CST303 Computer Networks (Study Session 3)
    `;
    const result = parsePdfText(scheduleText, 'Daily_Schedule.pdf');
    expect(result.detectedType).toBe('SCHEDULE');
    expect(result.scheduleSlots?.length).toBeGreaterThanOrEqual(3);

    const firstSlot = result.scheduleSlots![0];
    expect(firstSlot.startTime).toBe('09:00');
    expect(firstSlot.endTime).toBe('10:30');
    expect(firstSlot.label).toContain('CST305');
  });

  it('should detect duplicate subjects and exams correctly', () => {
    const payload: ExtractedPdfPayload = {
      filename: 'Sample.pdf',
      rawTextPreview: 'Sample text preview',
      detectedType: 'SYLLABUS',
      subjects: [
        {
          name: 'Compiler Design',
          courseCode: 'CST305',
          semester: 'S5',
          credits: 4,
          modules: [],
        },
        {
          name: 'Machine Learning',
          courseCode: 'CST307',
          semester: 'S5',
          credits: 4,
          modules: [],
        },
      ],
      exams: [
        {
          subjectName: 'Compiler Design Exam',
          subjectCode: 'CST305',
          date: '2026-11-27',
          session: 'FN',
        },
      ],
      scheduleSlots: [],
    };

    const existingSubjects = [
      { name: 'Compiler Design', courseCode: 'CST305' },
    ];
    const existingExams = [
      { subjectName: 'Compiler Design Exam', subjectCode: 'CST305' },
    ];

    const dupes = checkDuplicates(payload, existingSubjects, existingExams);

    expect(dupes.subjects[0].isDuplicate).toBe(true);
    expect(dupes.subjects[1].isDuplicate).toBe(false);
    expect(dupes.exams[0].isDuplicate).toBe(true);
  });
});
