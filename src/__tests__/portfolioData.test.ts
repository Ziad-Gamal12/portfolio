import { describe, it, expect } from 'vitest';
import { PERSONAL_INFO, STATS, SERVICES, EXPERIENCES, PROJECTS } from '../data/portfolioData';

describe('Portfolio Data Integrity', () => {
  it('has valid personal info with email and github links', () => {
    expect(PERSONAL_INFO.name).toBe('Ziad Gamal');
    expect(PERSONAL_INFO.title).toBe('Flutter Developer');
    expect(PERSONAL_INFO.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(PERSONAL_INFO.github).toContain('github.com');
    expect(PERSONAL_INFO.linkedin).toContain('linkedin.com');
    expect(PERSONAL_INFO.cvUrl).toBe('/Ziad_Gamal_CV.pdf');
  });

  it('contains expected stats with positive numbers', () => {
    expect(STATS.length).toBeGreaterThanOrEqual(4);
    for (const stat of STATS) {
      expect(stat.value).toBeGreaterThan(0);
      expect(stat.label.length).toBeGreaterThan(0);
    }
  });

  it('contains 3 detailed services with bullet items', () => {
    expect(SERVICES).toHaveLength(3);
    for (const service of SERVICES) {
      expect(service.number).toMatch(/^\d{2}$/);
      expect(service.title.length).toBeGreaterThan(0);
      expect(service.tagline.length).toBeGreaterThan(0);
      expect(service.bullets.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('contains 5 chronological experience entries', () => {
    expect(EXPERIENCES).toHaveLength(5);
    for (const exp of EXPERIENCES) {
      expect(exp.id).toBeTruthy();
      expect(exp.period).toBeTruthy();
      expect(exp.role).toBeTruthy();
      expect(exp.project).toBeTruthy();
      expect(exp.description).toBeTruthy();
    }
  });

  it('contains 5 projects with complete metadata, tech tags, and highlights', () => {
    expect(PROJECTS).toHaveLength(5);
    for (const project of PROJECTS) {
      expect(project.id).toBeTruthy();
      expect(project.number).toMatch(/^\d{2}$/);
      expect(project.name).toBeTruthy();
      expect(project.role).toBeTruthy();
      expect(project.date).toBeTruthy();
      expect(project.tag).toBeTruthy();
      expect(project.shortDescription).toBeTruthy();
      expect(project.fullDescription.length).toBeGreaterThan(0);
      expect(project.techTags.length).toBeGreaterThan(0);
      expect(project.githubUrl).toMatch(/^https:\/\/github\.com\//);
      expect(project.highlights.length).toBeGreaterThan(0);
    }
  });
});
