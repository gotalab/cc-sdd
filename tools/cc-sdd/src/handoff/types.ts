/**
 * Type definitions for handoff system
 * 
 * This module defines all the types used by the handoff system for
 * session continuation when context threshold is exceeded.
 */

/**
 * Supported agent modes for handoff documents
 */
export type AgentMode = 'claude-code-agent' | 'opencode-agent';

/**
 * Status of a task or file
 */
export type TaskStatus = 'pending' | 'in-progress' | 'complete';

/**
 * Complexity level for remaining tasks
 */
export type Complexity = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * Metadata for a handoff document
 */
export interface HandoffMetadata {
  /** Unique identifier for this handoff */
  handoffId: string;
  /** ISO 8601 timestamp when handoff was created */
  timestamp: string;
  /** Optional session identifier for the source session */
  sessionId?: string;
  /** Context usage percentage at time of handoff */
  contextPercentage: number;
  /** Name of the feature being worked on */
  featureName: string;
  /** Agent mode that created this handoff */
  agentMode: AgentMode;
}

/**
 * A completed task in the handoff document
 */
export interface CompletedTask {
  /** Name/title of the completed task */
  name: string;
  /** Path to the output file(s) produced */
  outputLocation?: string;
  /** Key decisions made during this task */
  keyDecisions?: string;
  /** How to validate this task was completed correctly */
  validation?: string;
}

/**
 * An in-progress task in the handoff document
 */
export interface InProgressTask {
  /** Name/title of the in-progress task */
  name: string;
  /** Percentage complete (0-100) */
  percentage: number;
  /** Description of the current step being worked on */
  currentStep: string;
  /** Description of the next step to take */
  nextStep: string;
  /** Any blockers preventing progress */
  blockers?: string;
  /** Context the new subagent needs to know to continue */
  contextNeeded?: string;
}

/**
 * A remaining task in the handoff document
 */
export interface RemainingTask {
  /** Name/title of the remaining task */
  name: string;
  /** Dependencies that must be completed first */
  dependencies?: string;
  /** Estimated complexity level */
  complexity: Complexity;
}

/**
 * A key file reference in the handoff document
 */
export interface KeyFile {
  /** Path to the file */
  path: string;
  /** Purpose of this file in the project */
  purpose: string;
  /** Current status of this file */
  status: TaskStatus;
}

/**
 * A decision made during the session
 */
export interface Decision {
  /** The decision that was made */
  decision: string;
  /** Rationale for why this decision was made */
  rationale: string;
  /** Alternative options that were considered */
  alternatives?: string;
}

/**
 * Complete handoff document structure
 */
export interface HandoffDocument {
  /** Document metadata */
  metadata: HandoffMetadata;
  /** List of completed tasks */
  completedWork: CompletedTask[];
  /** Currently in-progress task (if any) */
  inProgressWork?: InProgressTask;
  /** List of remaining tasks */
  remainingWork: RemainingTask[];
  /** Key files for the project */
  keyFiles: KeyFile[];
  /** Decisions made during the session */
  decisions: Decision[];
  /** Validation checkpoints to verify */
  validationCheckpoints: string[];
  /** Description of where to continue from */
  continuationPoint: string;
  /** Key files the next subagent should read */
  keyFilesToRead: string[];
  /** Reference files with established patterns to follow */
  referenceFiles: string[];
}

/**
 * Type alias for parsed handoff document
 * This is the return type for the HandoffParser.parse() method
 */
export type ParsedHandoff = HandoffDocument;
