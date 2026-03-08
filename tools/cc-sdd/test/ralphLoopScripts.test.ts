import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const scriptsDir = join(process.cwd(), 'templates/agents/codex-skills/skills/kiro-ralph-impl/scripts');

const subTaskLine = (n: number) => `- [ ] ${n}.1 Task ${n}`;

const writeTasks = async (dir: string, lines: string[]) => {
  const tasksPath = join(dir, 'tasks.md');
  await writeFile(tasksPath, `${lines.join('\n')}\n`, 'utf8');
  return tasksPath;
};

describe('ralph loop scripts', () => {
  it('uses a simple default fuse of 100 iterations', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ccsdd-ralph-loop-'));
    const tasksPath = await writeTasks(dir, Array.from({ length: 50 }, (_, i) => subTaskLine(i + 1)));

    const { stdout } = await execFileAsync('bash', [join(scriptsDir, 'setup-loop.sh'), tasksPath], { cwd: dir });
    const state = await readFile(join(dir, '.ralph-loop-state.md'), 'utf8');

    expect(stdout).toContain('Max iterations:   100');
    expect(state).toContain('max_iterations: 100');
    expect(state).toContain('pending_initial: 50');
    expect(state).not.toContain('pending_last:');
    expect(state).not.toContain('no_progress_streak:');
  });

  it('increments iteration and continues while below the fuse', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ccsdd-ralph-loop-'));
    const tasksPath = await writeTasks(dir, ['- [ ] 1.1 First task']);

    await execFileAsync('bash', [join(scriptsDir, 'setup-loop.sh'), tasksPath], { cwd: dir });

    const { stdout } = await execFileAsync('bash', [join(scriptsDir, 'check-loop.sh'), tasksPath, '.ralph-loop-state.md'], { cwd: dir });
    expect(stdout).toContain('STATUS: CONTINUE');
    expect(stdout).toContain('ITERATION: 1/100');
  });

  it('stops when the fixed fuse is reached', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ccsdd-ralph-loop-'));
    const tasksPath = await writeTasks(dir, ['- [ ] 1.1 First task']);

    await writeFile(
      join(dir, '.ralph-loop-state.md'),
      ['---', 'iteration: 99', 'max_iterations: 100', 'pending_initial: 1', 'started_at: "2026-03-07T00:00:00Z"', `tasks_md: "${tasksPath}"`, '---', ''].join('\n'),
      'utf8',
    );

    const { stdout } = await execFileAsync('bash', [join(scriptsDir, 'check-loop.sh'), tasksPath, '.ralph-loop-state.md'], { cwd: dir });
    expect(stdout).toContain('STATUS: MAX_ITERATIONS_REACHED');
    expect(stdout).toContain('ITERATION: 100/100');
  });
});
