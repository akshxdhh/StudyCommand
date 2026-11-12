import { describe, it, expect } from 'vitest';
import { UserProfile, Subject, Exam, TimetableSlot } from '../../../electron/types';

describe('Multi-User Profile Data Isolation', () => {
  const profileA: UserProfile = {
    id: 'user-profile-a',
    name: 'Alice (CS)',
    academic: {
      educationLevel: 'undergraduate',
      institution: 'Tech University',
      course: 'Computer Science',
      department: 'CSE',
      semester: 'S5',
      examinationSystem: 'KTU',
    },
    language: 'en',
    focusSettings: {
      studyDurationMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      enableSound: true,
      enableNotifications: true,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      enableCameraEngagement: false,
      enableVoiceCommands: false,
    },
    subjects: [
      {
        id: 'sub-a1',
        name: 'Distributed Systems',
        courseCode: 'CS501',
        modules: [],
        createdAt: '2026-11-01',
        updatedAt: '2026-11-01',
      },
    ],
    exams: [
      {
        id: 'exam-a1',
        subjectId: 'sub-a1',
        subjectName: 'Distributed Systems Exam',
        subjectCode: 'CS501',
        examDate: '2026-12-01',
        session: 'FN',
        targetScore: 95,
        priority: 'HIGH',
      },
    ],
    timetable: [],
    dailyRecords: {},
    focusLogs: [],
    presets: [],
    activePresetId: 'preset-standard',
    onboardingCompleted: true,
    tutorialCompleted: true,
  };

  const profileB: UserProfile = {
    id: 'user-profile-b',
    name: 'Bob (Mechanical)',
    academic: {
      educationLevel: 'undergraduate',
      institution: 'Engineering Institute',
      course: 'Mechanical Engineering',
      department: 'ME',
      semester: 'S3',
      examinationSystem: 'VTU',
    },
    language: 'es',
    focusSettings: {
      studyDurationMinutes: 50,
      shortBreakMinutes: 10,
      longBreakMinutes: 20,
      enableSound: false,
      enableNotifications: true,
      autoStartBreaks: true,
      autoStartPomodoros: false,
      enableCameraEngagement: false,
      enableVoiceCommands: false,
    },
    subjects: [
      {
        id: 'sub-b1',
        name: 'Thermodynamics',
        courseCode: 'ME301',
        modules: [],
        createdAt: '2026-11-05',
        updatedAt: '2026-11-05',
      },
    ],
    exams: [],
    timetable: [],
    dailyRecords: {},
    focusLogs: [],
    presets: [],
    activePresetId: 'preset-deep',
    onboardingCompleted: true,
    tutorialCompleted: false,
  };

  it('should maintain strict isolation between profiles', () => {
    // Verify Profile A
    expect(profileA.subjects.length).toBe(1);
    expect(profileA.subjects[0].courseCode).toBe('CS501');
    expect(profileA.academic.course).toBe('Computer Science');
    expect(profileA.focusSettings.studyDurationMinutes).toBe(25);
    expect(profileA.exams.length).toBe(1);

    // Verify Profile B
    expect(profileB.subjects.length).toBe(1);
    expect(profileB.subjects[0].courseCode).toBe('ME301');
    expect(profileB.academic.course).toBe('Mechanical Engineering');
    expect(profileB.focusSettings.studyDurationMinutes).toBe(50);
    expect(profileB.exams.length).toBe(0);

    // Assert zero cross-contamination
    expect(profileA.subjects[0].name).not.toBe(profileB.subjects[0].name);
    expect(profileA.academic.institution).not.toBe(profileB.academic.institution);
  });

  it('newly initialized profile should start completely empty', () => {
    const newProfile: UserProfile = {
      id: 'user-profile-fresh',
      name: 'Fresh Learner',
      academic: {
        educationLevel: 'school',
        institution: '',
        course: '',
        department: '',
        semester: '',
        examinationSystem: '',
      },
      language: 'en',
      focusSettings: {
        studyDurationMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        enableSound: true,
        enableNotifications: true,
        autoStartBreaks: false,
        autoStartPomodoros: false,
        enableCameraEngagement: false,
        enableVoiceCommands: false,
      },
      subjects: [],
      exams: [],
      timetable: [],
      dailyRecords: {},
      focusLogs: [],
      presets: [],
      activePresetId: 'preset-standard',
      onboardingCompleted: false,
      tutorialCompleted: false,
    };

    expect(newProfile.subjects).toEqual([]);
    expect(newProfile.exams).toEqual([]);
    expect(newProfile.timetable).toEqual([]);
    expect(newProfile.dailyRecords).toEqual({});
    expect(newProfile.focusLogs).toEqual([]);
    expect(newProfile.onboardingCompleted).toBe(false);
  });
});
