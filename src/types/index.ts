export interface Project {
  id: string;
  number: string;
  name: string;
  role: string;
  date: string;
  tag: string;
  shortDescription: string;
  fullDescription: string[];
  techTags: string[];
  githubUrl: string;
  demoUrl?: string;
  image?: string;
  logo?: string;
  coverGradient: string;
  highlights: string[];
  accentColor?: string;
  keyFacts?: string[];
  cover?: string;
  preview?: string;
}

export interface Service {
  number: string;
  title: string;
  tagline: string;
  bullets: string[];
}

export interface ExperienceItem {
  id: string;
  period: string;
  role: string;
  project: string;
  description: string;
}

export interface SkillCategory {
  category: string;
  skills: {
    name: string;
    icon?: string;
    iconType?: 'si' | 'lucide';
  }[];
}

export type CursorVariant = 
  | 'default'
  | 'magnetic'
  | 'project'
  | 'drag'
  | 'code'
  | 'heading'
  | 'hidden';
