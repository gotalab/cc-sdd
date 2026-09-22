# Markdown Validation

Check the Markdown authored in this phase before reporting completion.

1. Find the repository's existing Markdown lint command and configuration in its
   scripts, contributor guidance, task runner, or CI/hooks. If none exists, skip
   this check and report that Markdown lint is not configured. Do not add a lint
   dependency, configuration, or new repository-wide gate.
2. Run the existing lint command on the files written or updated in this phase,
   including `research.md` when applicable. Use supported explicit file arguments
   or the repository's documented equivalent so untracked files can be checked;
   a staged-files-only hook is not sufficient. Use the existing configuration
   and respect host permissions and approvals.
3. Verify which files the command actually includes. Git ignore rules, lint
   exclusions, or tracked/staged-only selection may omit generated files even
   when the command exits successfully. Report excluded or otherwise unchecked
   files with the reason; do not call them linted. Do not stage files, change
   exclusions, or weaken rules just to make this check pass.
4. Fix findings in the authored documents while preserving their meaning and
   requirement, boundary, and dependency annotations, then rerun the check.
   If lint still fails, or cannot run because of missing tooling or permissions,
   report the command and unresolved result. Do not claim phase completion,
   auto-approve, or advance to the next phase with an unresolved lint failure.
5. Include a brief lint result in the phase output: command, outcome, files
   actually checked, and any unchecked files or unresolved findings. A successful
   command with no matching files is not a successful check of those documents.
