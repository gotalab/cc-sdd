/**
 * Handoff Document Parser
 * 
 * Parses handoff documents to extract work state for continuation.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ParsedHandoff } from './types.js';

export class HandoffParser {
  /**
   * Parse a handoff document from file
   */
  parseFile(filepath: string): ParsedHandoff {
    let content: string;
    try {
      content = fs.readFileSync(filepath, 'utf-8');
    } catch (err) {
      throw new Error(`Failed to read handoff file: ${filepath}: ${err}`);
    }
    return this.parse(content);
  }

  /**
   * Parse a handoff document from content
   */
  parse(content: string): ParsedHandoff {
    const sections = this.extractSections(content);

    return {
      metadata: this.parseMetadata(sections.metadata),
      completedWork: this.parseCompletedWork(sections.completedWork),
      inProgressWork: this.parseInProgressWork(sections.inProgressWork),
      remainingWork: this.parseRemainingWork(sections.remainingWork),
      keyFiles: this.parseKeyFiles(sections.keyFiles),
      decisions: this.parseDecisions(sections.decisions),
      validationCheckpoints: this.parseCheckpoints(sections.checkpoints),
      continuationPoint: this.parseContinuationPoint(sections.continuation),
      keyFilesToRead: this.parseKeyFilesToRead(sections.continuation),
      referenceFiles: this.parseReferenceFiles(sections.continuation),
    };
  }

  /**
   * Extract sections from markdown content
   */
  private extractSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {};
    
    // Extract metadata section
    const metadataMatch = content.match(/## Metadata\n([\s\S]*?)(?=\n## )/);
    sections.metadata = metadataMatch ? metadataMatch[1] : '';

    // Extract completed work section
    const completedMatch = content.match(/## Completed Work\n([\s\S]*?)(?=\n## )/);
    sections.completedWork = completedMatch ? completedMatch[1] : '';

    // Extract in-progress work section
    const inProgressMatch = content.match(/## In-Progress Work\n([\s\S]*?)(?=\n## )/);
    sections.inProgressWork = inProgressMatch ? inProgressMatch[1] : '';

    // Extract remaining work section
    const remainingMatch = content.match(/## Remaining Work\n([\s\S]*?)(?=\n## )/);
    sections.remainingWork = remainingMatch ? remainingMatch[1] : '';

    // Extract continuation instructions section
    const continuationMatch = content.match(/## Continuation Instructions\n([\s\S]*?)(?=\n## )/);
    sections.continuation = continuationMatch ? continuationMatch[1] : '';

    // Extract key files section
    const keyFilesMatch = content.match(/## Key Files\n([\s\S]*?)(?=\n## )/);
    sections.keyFiles = keyFilesMatch ? keyFilesMatch[1] : '';

    // Extract decisions section
    const decisionsMatch = content.match(/## Decisions Log\n([\s\S]*?)(?=\n## )/);
    sections.decisions = decisionsMatch ? decisionsMatch[1] : '';

    // Extract validation checkpoints section
    const checkpointsMatch = content.match(/## Validation Checkpoints\n([\s\S]*?)$/);
    sections.checkpoints = checkpointsMatch ? checkpointsMatch[1] : '';

    return sections;
  }

  /**
   * Parse metadata section
   */
  private parseMetadata(content: string): ParsedHandoff['metadata'] {
    const getValue = (key: string): string => {
      const match = content.match(new RegExp(`\\*\\*${key}\\*\\*:\\s*(.+)`));
      return match ? match[1].trim() : '';
    };

    return {
      handoffId: getValue('Handoff ID'),
      timestamp: getValue('Created'),
      sessionId: getValue('Source Session') || undefined,
      contextPercentage: parseFloat(getValue('Context at Handoff')) || 0,
      featureName: getValue('Feature'),
      agentMode: getValue('Agent Mode') as 'claude-code-agent' | 'opencode-agent',
    };
  }

  /**
   * Parse completed work section
   */
  private parseCompletedWork(content: string): ParsedHandoff['completedWork'] {
    const tasks: ParsedHandoff['completedWork'] = [];
    const taskMatches = content.split(/(?=### )/);

    for (const match of taskMatches) {
      if (!match.trim()) continue;
      
      const nameMatch = match.match(/### (.+)/);
      if (!nameMatch) continue;

      const task: ParsedHandoff['completedWork'][0] = { name: nameMatch[1].trim() };
      
      const outputMatch = match.match(/\*\*Output Location\*\*:\s*(.+)/);
      if (outputMatch) task.outputLocation = outputMatch[1].trim();

      const decisionsMatch = match.match(/\*\*Key Decisions\*\*:\s*(.+)/);
      if (decisionsMatch) task.keyDecisions = decisionsMatch[1].trim();

      const validationMatch = match.match(/\*\*Validation\*\*:\s*(.+)/);
      if (validationMatch) task.validation = validationMatch[1].trim();

      tasks.push(task);
    }

    return tasks;
  }

  /**
   * Parse in-progress work section
   */
  private parseInProgressWork(content: string): ParsedHandoff['inProgressWork'] | undefined {
    if (content.includes('No in-progress work')) return undefined;

    const nameMatch = content.match(/### (.+)/);
    if (!nameMatch) return undefined;

    const getValue = (key: string): string => {
      const match = content.match(new RegExp(`\\*\\*${key}\\*\\*:\\s*(.+)`));
      return match ? match[1].trim() : '';
    };

    const percentageMatch = content.match(/(\d+)% complete/);

    return {
      name: nameMatch[1].trim(),
      percentage: percentageMatch ? parseInt(percentageMatch[1]) : 0,
      currentStep: getValue('Current Step'),
      nextStep: getValue('Next Step'),
      blockers: getValue('Blockers') || undefined,
      contextNeeded: getValue('Context Needed') || undefined,
    };
  }

  /**
   * Parse remaining work section
   */
  private parseRemainingWork(content: string): ParsedHandoff['remainingWork'] {
    const tasks: ParsedHandoff['remainingWork'] = [];
    const lines = content.split('\n');

    let currentTask: ParsedHandoff['remainingWork'][0] | null = null;

    for (const line of lines) {
      const taskMatch = line.match(/^\d+\.\s+(.+)/);
      if (taskMatch) {
        if (currentTask) tasks.push(currentTask);
        currentTask = { name: taskMatch[1].trim(), complexity: 'MEDIUM' };
        continue;
      }

      if (currentTask) {
        const depsMatch = line.match(/Dependencies:\s*(.+)/);
        if (depsMatch) currentTask.dependencies = depsMatch[1].trim();

        const complexityMatch = line.match(/complexity:\s*(LOW|MEDIUM|HIGH)/);
        if (complexityMatch) currentTask.complexity = complexityMatch[1] as 'LOW' | 'MEDIUM' | 'HIGH';
      }
    }

    if (currentTask) tasks.push(currentTask);
    return tasks;
  }

  /**
   * Parse key files table
   */
  private parseKeyFiles(content: string): ParsedHandoff['keyFiles'] {
    const files: ParsedHandoff['keyFiles'] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      const match = line.match(/\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/);
      if (match && !match[1].includes('File')) {
        files.push({
          path: match[1].trim(),
          purpose: match[2].trim(),
          status: match[3].trim() as 'pending' | 'in-progress' | 'complete',
        });
      }
    }

    return files;
  }

  /**
   * Parse decisions table
   */
  private parseDecisions(content: string): ParsedHandoff['decisions'] {
    const decisions: ParsedHandoff['decisions'] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      const match = line.match(/\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/);
      if (match && !match[1].includes('Decision')) {
        decisions.push({
          decision: match[1].trim(),
          rationale: match[2].trim(),
          alternatives: match[3].trim() !== 'N/A' ? match[3].trim() : undefined,
        });
      }
    }

    return decisions;
  }

  /**
   * Parse validation checkpoints
   */
  private parseCheckpoints(content: string): string[] {
    const checkpoints: string[] = [];
    const regex = /- \[ \] (.+)/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      checkpoints.push(match[1].trim());
    }

    return checkpoints;
  }

  /**
   * Parse continuation point
   */
  private parseContinuationPoint(content: string): string {
    const match = content.match(/Continue from:\s*(.+)/);
    return match ? match[1].trim() : 'Start';
  }

  /**
   * Parse key files to read
   */
  private parseKeyFilesToRead(content: string): string[] {
    const match = content.match(/Read (.+?)\n/);
    if (!match) return [];
    return match[1].split(',').map(f => f.trim()).filter(f => f && f !== 'None specified');
  }

  /**
   * Parse reference files
   */
  private parseReferenceFiles(content: string): string[] {
    const match = content.match(/pattern established in:\s*(.+)/);
    if (!match) return [];
    return match[1].split(',').map(f => f.trim()).filter(f => f && f !== 'None specified');
  }
}
