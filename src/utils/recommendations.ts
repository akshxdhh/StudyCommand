import { Subject, Exam, Topic, Module } from '../types';

export interface SmartRecommendation {
  nextTopic: {
    subject: Subject;
    module: Module;
    topic: Topic;
    reason: string;
  } | null;
  incompleteModules: Array<{
    subjectCode: string;
    moduleName: string;
    pendingCount: number;
  }>;
  revisionQueue: Array<{
    subjectCode: string;
    topicTitle: string;
    subjectId: string;
    moduleId: string;
    topicId: string;
  }>;
  fallingBehindSubjects: Array<{
    subjectName: string;
    subjectCode: string;
    completionPct: number;
    daysUntilExam: number;
    urgencyLevel: 'CRITICAL' | 'HIGH' | 'MODERATE';
  }>;
  dailyTarget: {
    targetSessions: number;
    targetTopics: number;
    focusGuidance: string;
  };
  labAlert?: {
    date: string;
    title: string;
    focusAreas: string[];
  };
}

export function generateSmartRecommendations(
  subjects: Subject[],
  exams: Exam[]
): SmartRecommendation {
  const now = new Date().getTime();

  // Sort exams
  const sortedExams = [...exams].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const labExams = sortedExams.filter(e => e.isLab);
  const theoryExams = sortedExams.filter(e => !e.isLab);

  // Check lab alert for upcoming labs (e.g. Nov 10-11, 2026)
  let labAlert: SmartRecommendation['labAlert'] | undefined;
  const upcomingLab = labExams.find(e => new Date(e.date).getTime() > now);
  if (upcomingLab) {
    const labDays = Math.ceil((new Date(upcomingLab.date).getTime() - now) / (1000 * 60 * 60 * 24));
    if (labDays <= 5) {
      labAlert = {
        date: new Date(upcomingLab.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        title: upcomingLab.subjectName,
        focusAreas: upcomingLab.subjectCode.includes('1')
          ? ['CN Module 2: Sockets (TCP/UDP Client-Server, select/poll)', 'MC Module 2: STM32 GPIO, ADC/DAC & Timer Interfacing']
          : ['DAA Module 2/3: Graph Traversals, Dijkstra & Matrix Chain Multiplication', 'ML Module 1/2: Linear Regression, Logistic Regression & Decision Trees']
      };
    }
  }

  // Revision queue
  const revisionQueue: SmartRecommendation['revisionQueue'] = [];
  const incompleteModules: SmartRecommendation['incompleteModules'] = [];
  const subjectScores: Array<{
    subject: Subject;
    exam: Exam | undefined;
    completionPct: number;
    pendingCount: number;
    daysUntilExam: number;
    lagScore: number;
  }> = [];

  subjects.forEach(subj => {
    const exam = theoryExams.find(e =>
      e.subjectCode.toLowerCase() === subj.code.toLowerCase() ||
      subj.name.toLowerCase().includes(e.subjectCode.toLowerCase())
    );

    let sTotal = 0;
    let sCompleted = 0;

    subj.modules.forEach(m => {
      const pendingInMod = m.topics.filter(t => t.status !== 'COMPLETED' && !t.completed);
      if (pendingInMod.length > 0) {
        incompleteModules.push({
          subjectCode: subj.code,
          moduleName: m.name,
          pendingCount: pendingInMod.length
        });
      }

      m.topics.forEach(t => {
        sTotal++;
        if (t.status === 'COMPLETED' || t.completed) {
          sCompleted++;
        }
        if (t.status === 'NEEDS_REVISION' || t.needsRevision) {
          revisionQueue.push({
            subjectCode: subj.code,
            topicTitle: t.title,
            subjectId: subj.id,
            moduleId: m.id,
            topicId: t.id
          });
        }
      });
    });

    const completionPct = sTotal > 0 ? Math.round((sCompleted / sTotal) * 100) : 0;
    const daysUntilExam = exam ? Math.max(1, Math.ceil((new Date(exam.date).getTime() - now) / (1000 * 60 * 60 * 24))) : 30;
    const lagScore = (100 - completionPct) / daysUntilExam;

    subjectScores.push({
      subject: subj,
      exam,
      completionPct,
      pendingCount: sTotal - sCompleted,
      daysUntilExam,
      lagScore
    });
  });

  // Sort by lag score descending (most lagging / urgent first)
  subjectScores.sort((a, b) => b.lagScore - a.lagScore);

  const fallingBehindSubjects = subjectScores
    .filter(s => s.completionPct < 70 && s.daysUntilExam <= 25)
    .map(s => ({
      subjectName: s.subject.name,
      subjectCode: s.subject.code,
      completionPct: s.completionPct,
      daysUntilExam: s.daysUntilExam,
      urgencyLevel: (s.daysUntilExam <= 16 ? 'CRITICAL' : s.daysUntilExam <= 22 ? 'HIGH' : 'MODERATE') as any
    }));

  // Identify next best topic
  let nextTopic: SmartRecommendation['nextTopic'] = null;

  // Check top subject
  const topCandidate = subjectScores[0];
  if (topCandidate) {
    // Look for first uncompleted topic
    for (const mod of topCandidate.subject.modules) {
      const uncompleted = mod.topics.find(t => t.status !== 'COMPLETED' && !t.completed);
      if (uncompleted) {
        nextTopic = {
          subject: topCandidate.subject,
          module: mod,
          topic: uncompleted,
          reason: `Exam in ${topCandidate.daysUntilExam} days (${topCandidate.completionPct}% completed). High priority coverage needed.`
        };
        break;
      }
    }
  }

  // Daily target guidance
  const topSubjectDays = topCandidate ? topCandidate.daysUntilExam : 15;
  const targetTopics = topSubjectDays <= 16 ? 5 : 4;
  const focusGuidance = topSubjectDays <= 16
    ? `Accelerated sprint mode: Target 5 topics (2.5 hours total focus time) daily to ensure full syllabus readiness before ${topCandidate?.subject.code} exam.`
    : `Standard pacing: Target 4 topics (2 hours focus time) across ${topCandidate?.subject.code} and ${subjectScores[1]?.subject.code || 'S3 Math'}.`;

  return {
    nextTopic,
    incompleteModules: incompleteModules.slice(0, 6),
    revisionQueue: revisionQueue.slice(0, 5),
    fallingBehindSubjects,
    dailyTarget: {
      targetSessions: 8,
      targetTopics,
      focusGuidance
    },
    labAlert
  };
}
