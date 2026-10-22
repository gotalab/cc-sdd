# Development

Use Node.js 24.22.1 or a newer Node.js 24 release and pnpm 12.4.2 (pinned in
`tools/cc-sdd/package.json`). CI resolves the latest Node.js 24 patch release.

Run package commands from `tools/cc-sdd`:

```sh
cd tools/cc-sdd
pnpm install --frozen-lockfile
pnpm test
pnpm run build
node dist/cli.js --help
npm pack --dry-run
```

Commit `pnpm-lock.yaml` when intentionally changing dependencies. The lockfile
was imported from npm to preserve the existing dependency versions.

The package is still distributed through the npm registry, and users can keep
running `npx cc-sdd@latest`. The release workflow installs and tests with pnpm,
then uses `npm publish` with the existing npm trusted publishing configuration.
The `prepare` script uses `npm run build` so npm source installs and npm package
commands can build without requiring pnpm on the consumer's machine.
