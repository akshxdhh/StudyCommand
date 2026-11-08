import { Subject, Module, Topic } from '../types';
import { SYLLABUS_METADATA } from '../data/syllabusMetadata';

export type StudyGoal =
  | 'SHORT_NOTES'
  | 'DETAILED'
  | 'QUESTIONS_ANSWERS'
  | 'NUMERICAL_PROBLEMS'
  | 'LAST_MINUTE_REVISION'
  | 'VIVA_PREP';

export type AnswerLength = 'SHORT' | 'MEDIUM' | 'DETAILED';

export interface PromptCustomizationOptions {
  goal: StudyGoal;
  length: AnswerLength;
  includeExamples: boolean;
  includeFormulas: boolean;
  includeExamQuestions: boolean;
  includeScoringTips: boolean;
  customInstructions?: string;
}

export const DEFAULT_PROMPT_OPTIONS: PromptCustomizationOptions = {
  goal: 'SHORT_NOTES',
  length: 'MEDIUM',
  includeExamples: true,
  includeFormulas: true,
  includeExamQuestions: true,
  includeScoringTips: true,
  customInstructions: '',
};

export const STUDY_GOAL_METADATA: Record<StudyGoal, { label: string; desc: string; icon: string }> = {
  SHORT_NOTES: {
    label: 'Short Notes',
    desc: 'High-yield definitions, core concepts & quick bullet summaries',
    icon: 'FileText',
  },
  DETAILED: {
    label: 'Detailed Explanation',
    desc: 'Comprehensive step-by-step conceptual walkthrough & mechanics',
    icon: 'BookOpen',
  },
  QUESTIONS_ANSWERS: {
    label: 'Important Q&A',
    desc: 'High-probability university exam questions with scoring answers',
    icon: 'HelpCircle',
  },
  NUMERICAL_PROBLEMS: {
    label: 'Numerical Problems',
    desc: 'Step-by-step worked formulas, equations & problem walkthroughs',
    icon: 'Calculator',
  },
  LAST_MINUTE_REVISION: {
    label: 'Last-Minute Revision',
    desc: 'Ultra-concise cheat sheet, high-frequency points & mnemonics',
    icon: 'Zap',
  },
  VIVA_PREP: {
    label: 'Viva Preparation',
    desc: 'Oral exam questions, conceptual distinctions & viva defense tips',
    icon: 'MessageSquare',
  },
};

export function generateStudyPrompt(
  subject: Subject,
  module: Module,
  topic: Topic,
  options: PromptCustomizationOptions = DEFAULT_PROMPT_OPTIONS
): string {
  const metadata = SYLLABUS_METADATA[subject.id];
  const goalMeta = STUDY_GOAL_METADATA[options.goal] || STUDY_GOAL_METADATA.SHORT_NOTES;

  // Length instructions
  let lengthGuide = 'Deliver a balanced, focused explanation (around 500-700 words), ideal for a 30-minute study sprint.';
  if (options.length === 'SHORT') {
    lengthGuide = 'Keep the response crisp, concise, and ultra-high-yield (under 300 words). Focus only on scoring essentials.';
  } else if (options.length === 'DETAILED') {
    lengthGuide = 'Provide an in-depth, thorough explanation (around 1000+ words) covering fundamental theory, practical mechanisms, edge cases, and architectural context.';
  }

  // Goal-specific instructions
  let goalInstructions = '';
  switch (options.goal) {
    case 'SHORT_NOTES':
      goalInstructions = `• Generate crisp, scoring-oriented revision notes with bolded keywords.
• Break complex concepts into numbered points and structured tables where beneficial.
• Focus on what an examiner expects to see for maximum marks.`;
      break;
    case 'DETAILED':
      goalInstructions = `• Provide an authoritative, comprehensive pedagogical breakdown.
• Explain the underlying intuition, theoretical foundation, and operational mechanics.
• Use structured subsections with clear visual formatting.`;
      break;
    case 'QUESTIONS_ANSWERS':
      goalInstructions = `• Structure the response as typical university examination questions:
  - 2 to 3 Short Answer Questions (3 Marks each - Definition/Difference/Concept)
  - 1 to 2 Long Descriptive/Analytical Questions (7 to 14 Marks each)
• Provide model, scoring-grade answers with diagrams/points clearly indicated.`;
      break;
    case 'NUMERICAL_PROBLEMS':
      goalInstructions = `• State all governing equations, variable definitions, and standard SI units.
• Present typical university exam numerical problems related to this topic.
• Provide clear step-by-step worked solutions showing intermediate steps and final answers.`;
      break;
    case 'LAST_MINUTE_REVISION':
      goalInstructions = `• Create an emergency last-minute cheat sheet.
• Highlight core formulas, definitions, key differences, and mnemonic devices.
• Cut all non-essential filler text.`;
      break;
    case 'VIVA_PREP':
      goalInstructions = `• Provide rapid-fire viva voce questions and crisp 1-2 sentence ideal oral answers.
• Highlight common examiner trap questions and common student misconceptions.
• Cover conceptual 'Why' and 'How' rather than lengthy derivations.`;
      break;
  }

  // Subtopics list
  const subtopicsText = topic.subtopics && topic.subtopics.length > 0
    ? topic.subtopics.map(s => `  - ${s}`).join('\n')
    : '  - Comprehensive coverage of the topic as per KTU B.Tech curriculum.';

  // Textbooks list
  const booksText = metadata?.textBooks?.length
    ? metadata.textBooks.map(b => `${b.title} by ${b.authors}`).join('; ')
    : 'Prescribed university standard textbooks.';

  // Topic notes if any
  const notesSection = topic.notes
    ? `\nPersonal Study Notes / Specific Focus:\n"${topic.notes}"\n`
    : '';

  // Feature checkboxes
  const requestedSections: string[] = [
    '1. Fundamental Concept & Formal Academic Definition (standard engineering terminology)',
    '2. Key Technical Mechanics & Core Architecture (bulleted, unambiguous)'
  ];

  if (options.includeExamples) {
    requestedSections.push('3. Concrete Real-World Examples / Technical Applications (real engineering context)');
  }
  if (options.includeFormulas) {
    requestedSections.push('4. Essential Formulas, Equations, Algorithms, or Mathematical Formulations (with variable notations)');
  }
  if (options.includeExamQuestions) {
    requestedSections.push('5. High-Yield University Exam Questions & Ideal Answer Outlines (typical ESE 3-mark & 7/14-mark patterns)');
  }
  if (options.includeScoringTips) {
    requestedSections.push('6. Examiner Scoring Tips & Common Pitfalls to Avoid (key technical terms that earn marks)');
  }
  requestedSections.push('7. 2-Minute Quick Recall Summary (bullet points for instant retention)');

  const prompt = `You are an expert university professor and senior academic mentor in ${subject.name} (${subject.courseCode || subject.code}) following the APJ Abdul Kalam Technological University (KTU) B.Tech engineering curriculum.

I am starting a 30-minute focused study session. Teach me the following syllabus topic with maximum pedagogical clarity and exam scoring orientation:

--------------------------------------------------
ACADEMIC CONTEXT:
• Subject: ${subject.name} [Code: ${subject.courseCode || subject.code}]
• Semester: ${subject.semester || 'S5/S3'} | Examination Scheme: ${metadata?.cieMarks || 40} CIE / ${metadata?.eseMarks || 60} ESE Marks
• Module: ${module.name}
• Target Topic: ${topic.title}
• Core Subtopics to Cover:
${subtopicsText}
• Prescribed References: ${booksText}
${notesSection}--------------------------------------------------

SESSION OBJECTIVE: ${goalMeta.label.toUpperCase()}
${goalInstructions}

LENGTH GUIDELINE:
${lengthGuide}

REQUIRED STRUCTURAL BREAKDOWN:
${requestedSections.join('\n')}

SPECIAL INSTRUCTIONS:
- Do not invent external syllabus topics; strictly focus on the specified topic and subtopics.
- Use clear Markdown headings, bold keywords, and clean bullet lists.
- Avoid unnecessary introductory pleasantries; begin immediately with the technical content.
${options.customInstructions ? `\nADDITIONAL USER INSTRUCTION:\n${options.customInstructions}\n` : ''}
Now, generate the complete, exam-oriented study guide for "${topic.title}".`;

  return prompt;
}
