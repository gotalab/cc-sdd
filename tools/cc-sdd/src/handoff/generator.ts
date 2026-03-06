/**
 * Handoff Document Generator
 * 
 * Creates handoff documents when context threshold is exceeded.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import type {
  HandoffMetadata,
  CompletedTask,
  InProgressTask,
  RemainingTask,
  KeyFile,
  Decision,
  HandoffDocument,
} from './types.js';

export class HandoffGenerator {
  private kiroDir: string;

  constructor(kiroDir: string) {
    this.kiroDir = kiroDir;
  }

  /**
   * Generate a unique handoff ID
   */
  generateHandoffId(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const randomId = crypto.randomUUID().slice(0, 8);
    return `handoff-${timestamp}-${randomId}`;
  }

  /**
   * Get the handoff directory path
   */
  getHandoffDir(): string {
    return path.join(this.kiroDir, 'handoffs');
  }

  /**
   * Ensure handoff directory exists
   */
  ensureHandoffDir(): void {
    const handoffDir = this.getHandoffDir();
    if (!fs.existsSync(handoffDir)) {
      fs.mkdirSync(handoffDir, { recursive: true });
    }
  }

  /**
   * Generate handoff document from template
   */
  generate(document: HandoffDocument): string {
    const template = this.loadTemplate();
    return this.renderTemplate(template, document);
  }

  /**
   * Load the handoff template
   */
  private loadTemplate(): string {
    const templatePath = path.join(
      this.kiroDir,
      'settings/templates/specs/handoff.md'
    );
    
    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf-8');
    }
    
    // Return default template if file doesn't exist
    return this.getDefaultTemplate();
  }

  /**
   * Get default template
   */
  private getDefaultTemplate(): string {
    return `# Session Handoff Document

## Metadata

- **Handoff ID**: {{HANDOFF_ID}}
- **Created**: {{TIMESTAMP}}
- **Source Session**: {{SESSION_ID}}
- **Context at Handoff**: {{CONTEXT_PERCENTAGE}}%
- **Feature**: {{FEATURE_NAME}}
- **Agent Mode**: {{AGENT_MODE}}

## Completed Work

{{COMPLETED_WORK_SECTIONS}}

## In-Progress Work

{{IN_PROGRESS_SECTION}}

## Remaining Work

### Task Queue

{{REMAINING_TASKS}}

## Continuation Instructions

### Quick Resume Command

{{RESUME_COMMAND}}

### What the Next Subagent Should Do

1. Read this handoff document
2. Read {{KEY_FILES_TO_READ}}
3. Continue from: {{CONTINUATION_POINT}}
4. Follow the pattern established in: {{REFERENCE_FILES}}

## Key Files

{{KEY_FILES_TABLE}}

## Decisions Log

{{DECISIONS_TABLE}}

## Validation Checkpoints

{{VALIDATION_CHECKPOINTS}}
`;
  }

  /**
   * Render template with document data
   */
  private renderTemplate(template: string, doc: HandoffDocument): string {
    let rendered = template;

    // Metadata replacements
    rendered = rendered.replace(/\{\{HANDOFF_ID\}\}/g, doc.metadata.handoffId);
    rendered = rendered.replace(/\{\{TIMESTAMP\}\}/g, doc.metadata.timestamp);
    rendered = rendered.replace(/\{\{SESSION_ID\}\}/g, doc.metadata.sessionId || 'N/A');
    rendered = rendered.replace(/\{\{CONTEXT_PERCENTAGE\}\}/g, doc.metadata.contextPercentage.toString());
    rendered = rendered.replace(/\{\{FEATURE_NAME\}\}/g, doc.metadata.featureName);
    rendered = rendered.replace(/\{\{AGENT_MODE\}\}/g, doc.metadata.agentMode);

    // Completed work sections
    const completedSections = doc.completedWork.map(task => 
      `### ${task.name}\n\n` +
      `- **Status**: Complete\n` +
      (task.outputLocation ? `- **Output Location**: ${task.outputLocation}\n` : '') +
      (task.keyDecisions ? `- **Key Decisions**: ${task.keyDecisions}\n` : '') +
      (task.validation ? `- **Validation**: ${task.validation}\n` : '')
    ).join('\n');
    rendered = rendered.replace(/\{\{COMPLETED_WORK_SECTIONS\}\}/g, completedSections || 'No completed work.');

    // In-progress section
    let inProgressSection = 'No in-progress work.';
    if (doc.inProgressWork) {
      const ip = doc.inProgressWork;
      inProgressSection = 
        `### ${ip.name}\n\n` +
        `- **Status**: ${ip.percentage}% complete\n` +
        `- **Current Step**: ${ip.currentStep}\n` +
        `- **Next Step**: ${ip.nextStep}\n` +
        (ip.blockers ? `- **Blockers**: ${ip.blockers}\n` : '') +
        (ip.contextNeeded ? `- **Context Needed**: ${ip.contextNeeded}\n` : '');
    }
    rendered = rendered.replace(/\{\{IN_PROGRESS_SECTION\}\}/g, inProgressSection);

    // Remaining tasks
    const remainingTasks = doc.remainingWork.map((task, i) => 
      `${i + 1}. ${task.name}\n` +
      `   - Dependencies: ${task.dependencies || 'None'}\n` +
      `   - Estimated complexity: ${task.complexity}`
    ).join('\n');
    rendered = rendered.replace(/\{\{REMAINING_TASKS\}\}/g, remainingTasks || 'No remaining tasks.');

    // Resume command
    const resumeCommand = doc.metadata.agentMode === 'claude-code-agent' 
      ? `/resume ${doc.metadata.handoffId}`
      : `/kiro:resume ${doc.metadata.handoffId}`;
    rendered = rendered.replace(/\{\{RESUME_COMMAND\}\}/g, resumeCommand);

    // Key files to read
    const keyFilesToRead = doc.keyFilesToRead.join(', ') || 'None specified';
    rendered = rendered.replace(/\{\{KEY_FILES_TO_READ\}\}/g, keyFilesToRead);

    // Continuation point
    rendered = rendered.replace(/\{\{CONTINUATION_POINT\}\}/g, doc.continuationPoint || 'Start');

    // Reference files
    const referenceFiles = doc.referenceFiles.join(', ') || 'None specified';
    rendered = rendered.replace(/\{\{REFERENCE_FILES\}\}/g, referenceFiles);

    // Key files table
    const keyFilesTable = doc.keyFiles.map(f => 
      `| ${f.path} | ${f.purpose} | ${f.status} |`
    ).join('\n');
    rendered = rendered.replace(/\{\{KEY_FILES_TABLE\}\}/g, 
      keyFilesTable ? '| File | Purpose | Status |\n| ---- | ------- | ------ |\n' + keyFilesTable : 'No key files.');

    // Decisions table
    const decisionsTable = doc.decisions.map(d => 
      `| ${d.decision} | ${d.rationale} | ${d.alternatives || 'N/A'} |`
    ).join('\n');
    rendered = rendered.replace(/\{\{DECISIONS_TABLE\}\}/g,
      decisionsTable ? '| Decision | Rationale | Alternatives Considered |\n| -------- | --------- | ----------------------- |\n' + decisionsTable : 'No decisions logged.');

    // Validation checkpoints
    const checkpoints = doc.validationCheckpoints.map(c => `- [ ] ${c}`).join('\n');
    rendered = rendered.replace(/\{\{VALIDATION_CHECKPOINTS\}\}/g, checkpoints || 'No validation checkpoints.');

    return rendered;
  }

  /**
   * Save handoff document to file
   */
  save(document: HandoffDocument): string {
    this.ensureHandoffDir();
    const content = this.generate(document);
    const filename = `${document.metadata.handoffId}.md`;
    const filepath = path.join(this.getHandoffDir(), filename);
    fs.writeFileSync(filepath, content, 'utf-8');
    return filepath;
  }

  /**
   * Create and save a handoff document in one step
   */
  createHandoff(options: {
    featureName: string;
    agentMode: 'claude-code-agent' | 'opencode-agent';
    contextPercentage: number;
    completedWork: CompletedTask[];
    inProgressWork?: InProgressTask;
    remainingWork: RemainingTask[];
    keyFiles: KeyFile[];
    decisions: Decision[];
    validationCheckpoints: string[];
    continuationPoint: string;
    keyFilesToRead: string[];
    referenceFiles: string[];
  }): { handoffId: string; filepath: string } {
    const handoffId = this.generateHandoffId();
    
    const document: HandoffDocument = {
      metadata: {
        handoffId,
        timestamp: new Date().toISOString(),
        contextPercentage: options.contextPercentage,
        featureName: options.featureName,
        agentMode: options.agentMode,
      },
      completedWork: options.completedWork,
      inProgressWork: options.inProgressWork,
      remainingWork: options.remainingWork,
      keyFiles: options.keyFiles,
      decisions: options.decisions,
      validationCheckpoints: options.validationCheckpoints,
      continuationPoint: options.continuationPoint,
      keyFilesToRead: options.keyFilesToRead,
      referenceFiles: options.referenceFiles,
    };

    const filepath = this.save(document);
    return { handoffId, filepath };
  }
}
