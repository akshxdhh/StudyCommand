import { describe, it, expect } from 'vitest';
import {
  generateStudyPrompt,
  DEFAULT_PROMPT_OPTIONS,
  STUDY_GOAL_METADATA,
  PromptCustomizationOptions
} from '../promptGenerator';
import { Subject, Module, Topic } from '../../types';

describe('promptGenerator unit tests', () => {
  const mockSubject: Subject = {
    id: 'sub-cn',
    code: 'CN',
    name: 'Computer Networks',
    courseCode: 'PCCST501',
    semester: 'S5',
    color: '#00f0ff',
    credits: 4,
    modules: []
  };

  const mockModule: Module = {
    id: 'mod-1',
    name: 'Module 1: Network Layer Concepts & IPv4 Addressing',
    topics: []
  };

  const mockTopic: Topic = {
    id: 'top-1',
    title: 'IPv4 Addressing, Subnetting & CIDR',
    status: 'IN_PROGRESS',
    completed: false,
    priority: 'HIGH',
    subtopics: [
      'IPv4 address structure and notation',
      'Classful vs Classless Addressing',
      'Subnet mask and CIDR notation',
      'Subnetting calculation and VLSM'
    ],
    notes: 'Focus on VLSM numerical problems for exam.'
  };

  it('generates a valid study prompt with default options', () => {
    const prompt = generateStudyPrompt(mockSubject, mockModule, mockTopic, DEFAULT_PROMPT_OPTIONS);
    expect(prompt).toContain('Computer Networks');
    expect(prompt).toContain('PCCST501');
    expect(prompt).toContain('Module 1: Network Layer Concepts & IPv4 Addressing');
    expect(prompt).toContain('IPv4 Addressing, Subnetting & CIDR');
    expect(prompt).toContain('Subnet mask and CIDR notation');
    expect(prompt).toContain('VLSM numerical problems');
    expect(prompt).toContain('SHORT NOTES');
  });

  it('generates question and answer format for QUESTIONS_ANSWERS goal', () => {
    const options: PromptCustomizationOptions = {
      ...DEFAULT_PROMPT_OPTIONS,
      goal: 'QUESTIONS_ANSWERS',
      length: 'DETAILED'
    };
    const prompt = generateStudyPrompt(mockSubject, mockModule, mockTopic, options);
    expect(prompt).toContain('IMPORTANT Q&A');
    expect(prompt).toContain('Short Answer Questions (3 Marks');
    expect(prompt).toContain('Long Descriptive/Analytical Questions');
  });

  it('generates numerical problem guidance for NUMERICAL_PROBLEMS goal', () => {
    const options: PromptCustomizationOptions = {
      ...DEFAULT_PROMPT_OPTIONS,
      goal: 'NUMERICAL_PROBLEMS'
    };
    const prompt = generateStudyPrompt(mockSubject, mockModule, mockTopic, options);
    expect(prompt).toContain('NUMERICAL PROBLEMS');
    expect(prompt).toContain('governing equations');
    expect(prompt).toContain('step-by-step worked solutions');
  });

  it('generates viva voce oral exam preparation prompt for VIVA_PREP goal', () => {
    const options: PromptCustomizationOptions = {
      ...DEFAULT_PROMPT_OPTIONS,
      goal: 'VIVA_PREP'
    };
    const prompt = generateStudyPrompt(mockSubject, mockModule, mockTopic, options);
    expect(prompt).toContain('VIVA PREPARATION');
    expect(prompt).toContain('viva voce questions');
    expect(prompt).toContain('common examiner trap questions');
  });

  it('respects answer depth selections (SHORT, MEDIUM, DETAILED)', () => {
    const shortPrompt = generateStudyPrompt(mockSubject, mockModule, mockTopic, {
      ...DEFAULT_PROMPT_OPTIONS,
      length: 'SHORT'
    });
    expect(shortPrompt).toContain('under 300 words');

    const detailedPrompt = generateStudyPrompt(mockSubject, mockModule, mockTopic, {
      ...DEFAULT_PROMPT_OPTIONS,
      length: 'DETAILED'
    });
    expect(detailedPrompt).toContain('around 1000+ words');
  });

  it('includes custom user instructions when provided', () => {
    const customOptions: PromptCustomizationOptions = {
      ...DEFAULT_PROMPT_OPTIONS,
      customInstructions: 'Please provide a comparative ASCII diagram of Class C vs CIDR.'
    };
    const prompt = generateStudyPrompt(mockSubject, mockModule, mockTopic, customOptions);
    expect(prompt).toContain('comparative ASCII diagram of Class C vs CIDR');
  });
});
