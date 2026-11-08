import { describe, it, expect } from 'vitest';
import { generateSmartRecommendations } from '../recommendations';
import { Subject, Exam } from '../../types';

describe('recommendation engine tests', () => {
  const mockSubjects: Subject[] = [
    {
      id: 'sub-cn',
      code: 'CN',
      name: 'Computer Networks',
      courseCode: 'PCCST501',
      semester: 'S5',
      color: '#00f0ff',
      credits: 4,
      modules: [
        {
          id: 'mod-1',
          name: 'Module 1: IPv4',
          topics: [
            {
              id: 'top-1',
              title: 'Subnetting',
              status: 'NOT_STARTED',
              completed: false,
              priority: 'HIGH'
            },
            {
              id: 'top-2',
              title: 'CIDR',
              status: 'COMPLETED',
              completed: true,
              priority: 'MEDIUM'
            }
          ]
        }
      ]
    },
    {
      id: 'sub-daa',
      code: 'DAA',
      name: 'Design and Analysis of Algorithms',
      courseCode: 'PCCST502',
      semester: 'S5',
      color: '#a855f7',
      credits: 4,
      modules: [
        {
          id: 'mod-1',
          name: 'Module 1: Recurrences',
          topics: [
            {
              id: 'top-3',
              title: 'Master Theorem',
              status: 'NEEDS_REVISION',
              completed: false,
              priority: 'HIGH'
            }
          ]
        }
      ]
    }
  ];

  const futureLabDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
  const futureExamDate1 = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
  const futureExamDate2 = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();

  const mockExams: Exam[] = [
    {
      id: 'ex-cn',
      subjectCode: 'CN',
      subjectName: 'Computer Networks',
      date: futureExamDate1,
      color: '#00f0ff',
      isLab: false
    },
    {
      id: 'ex-daa',
      subjectCode: 'DAA',
      subjectName: 'Design and Analysis of Algorithms',
      date: futureExamDate2,
      color: '#a855f7',
      isLab: false
    },
    {
      id: 'ex-lab-1',
      subjectCode: 'LAB-1',
      subjectName: 'Network Systems & Microcontroller Lab',
      date: futureLabDate,
      color: '#f59e0b',
      isLab: true
    }
  ];

  it('aggregates topics needing revision into the revision queue', () => {
    const recs = generateSmartRecommendations(mockSubjects, mockExams);
    expect(recs.revisionQueue.length).toBe(1);
    expect(recs.revisionQueue[0].topicTitle).toBe('Master Theorem');
    expect(recs.revisionQueue[0].subjectCode).toBe('DAA');
  });

  it('detects upcoming tentative lab examinations when within window', () => {
    const recs = generateSmartRecommendations(mockSubjects, mockExams);
    expect(recs.labAlert).toBeDefined();
    expect(recs.labAlert?.title).toBe('Network Systems & Microcontroller Lab');
  });

  it('computes daily targets and focus guidance based on pending topics', () => {
    const recs = generateSmartRecommendations(mockSubjects, mockExams);
    expect(recs.dailyTarget).toBeDefined();
    expect(recs.dailyTarget.targetSessions).toBeGreaterThanOrEqual(1);
    expect(recs.dailyTarget.focusGuidance).toBeTruthy();
  });

  it('recommends the most urgent pending topic', () => {
    const recs = generateSmartRecommendations(mockSubjects, mockExams);
    expect(recs.nextTopic).toBeDefined();
    expect(recs.nextTopic?.topic.status).not.toBe('COMPLETED');
    expect(['Master Theorem', 'Subnetting']).toContain(recs.nextTopic?.topic.title);
  });
});
