import { describe, it, expect } from 'vitest';
import { parsePdfText } from '../pdfExtractor';

describe('PDF Syllabus & Exam Timetable Extractor', () => {
  it('should extract syllabus subjects, modules, and topics from formatted text', () => {
    const sampleText = `
      APJ Abdul Kalam Technological University
      Course Code: CST305
      Course Name: Compiler Design
      Credits: 4
      Semester: S5

      MODULE I: Introduction to Compilers & Lexical Analysis
      Phases of a compiler; Analysis and Synthesis model; Lexical Analysis: Role of lexical analyzer, tokens, patterns, lexemes.
      Input buffering, Specification of tokens, Recognition of tokens.

      MODULE II: Syntax Analysis & Parsing
      Role of parser, Context free grammars, Writing a grammar, Top down parsing.
      Recursive descent parsing, LL(1) grammars, Non-recursive predictive parsing.
    `;

    const result = parsePdfText(sampleText, 'CST305_Compiler_Design.pdf');

    expect(result.detectedType).toBe('SYLLABUS');
    expect(result.subjects.length).toBe(1);

    const subject = result.subjects[0];
    expect(subject.courseCode).toBe('CST305');
    expect(subject.name).toContain('Compiler Design');
    expect(subject.modules.length).toBe(2);

    expect(subject.modules[0].moduleNumber).toBe(1);
    expect(subject.modules[0].topics.length).toBeGreaterThan(0);

    expect(subject.modules[1].moduleNumber).toBe(2);
    expect(subject.modules[1].topics.length).toBeGreaterThan(0);
  });

  it('should extract exam timetable dates and sessions', () => {
    const timetableText = `
      APJ ABDUL KALAM TECHNOLOGICAL UNIVERSITY
      B.Tech S5 Regular Examinations November 2026
      TIME TABLE
      Date : 23-11-2026 (Monday) FN: CST301 Formal Languages and Automata Theory
      Date : 25-11-2026 (Wednesday) FN: CST303 Computer Networks
      Date : 27-11-2026 (Friday) FN: CST305 System Software
    `;

    const result = parsePdfText(timetableText, 'KTU_S5_Exam_TimeTable.pdf');

    expect(result.exams.length).toBeGreaterThanOrEqual(3);
    const examCodes = result.exams.map((e) => e.subjectCode);
    expect(examCodes).toContain('CST301');
    expect(examCodes).toContain('CST303');
    expect(examCodes).toContain('CST305');
  });

  it('should handle unformatted or plain documents gracefully without crashing', () => {
    const emptyResult = parsePdfText('', 'Empty.pdf');
    expect(emptyResult.subjects).toEqual([]);
    expect(emptyResult.exams).toEqual([]);
  });
});
