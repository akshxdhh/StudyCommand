import { describe, it, expect } from 'vitest';
import { SYLLABUS_METADATA } from '../../data/syllabusMetadata';

describe('syllabus integrity & official KTU mapping tests', () => {
  const expectedSubjectKeys = [
    'sub-cn',
    'sub-math',
    'sub-daa',
    'sub-ml',
    'sub-mc',
    'sub-dm'
  ];

  it('contains all 6 required examination subjects in syllabus metadata', () => {
    expectedSubjectKeys.forEach((key) => {
      expect(SYLLABUS_METADATA[key]).toBeDefined();
      expect(SYLLABUS_METADATA[key].courseCode).toBeTruthy();
      expect(SYLLABUS_METADATA[key].courseName).toBeTruthy();
    });
  });

  it('accurately maps course codes to official KTU subjects', () => {
    expect(SYLLABUS_METADATA['sub-cn'].courseCode).toBe('PCCST501');
    expect(SYLLABUS_METADATA['sub-math'].courseCode).toBe('GAMAT301');
    expect(SYLLABUS_METADATA['sub-daa'].courseCode).toBe('PCCST502');
    expect(SYLLABUS_METADATA['sub-ml'].courseCode).toBe('PCCST503');
    expect(SYLLABUS_METADATA['sub-mc'].courseCode).toBe('PBCST504');
    expect(SYLLABUS_METADATA['sub-dm'].courseCode).toBe('PECST525');
  });

  it('contains prescribed textbooks and reference citations for each subject', () => {
    expectedSubjectKeys.forEach((key) => {
      const meta = SYLLABUS_METADATA[key];
      expect(meta.textBooks.length).toBeGreaterThan(0);
      expect(meta.courseObjectives.length).toBeGreaterThan(0);
      expect(meta.examHours).toBeTruthy();
      expect(meta.cieMarks).toBeGreaterThan(0);
      expect(meta.eseMarks).toBeGreaterThan(0);
    });
  });

  it('links to existing local PDF resources for offline syllabus access', () => {
    expectedSubjectKeys.forEach((key) => {
      const meta = SYLLABUS_METADATA[key];
      expect(meta.pdfPath).toMatch(/\.pdf$/);
    });
  });
});
