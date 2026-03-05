# Changelog

All notable changes to this project are documented in this file.

## 5.1.0-mrmartineau.0 (Draft)

### Breaking

- Package is now published as `@mrmartineau/use-sound` (previously `use-sound`).
- Yarn lockfile has been removed from this fork branch.

### Added

- Added `unlock()` to `ExposedData` so apps can explicitly resume audio context from a user gesture (useful for iOS/Safari autoplay constraints).
- Added scoped package publishing metadata (`publishConfig.access = public`).
- Added explicit package subpath export for `./package.json`.

### Changed

- Improved package export and type resolution setup (`exports`, `types`, `typesVersions`) for better compatibility in Next.js, Remix, and TypeScript tooling.
- Updated README installation/import examples and badges to scoped package references.
- Updated project docs metadata and maintainer guidance in this fork.

### Fixed

- Fixed async lazy-load race conditions that could leave `useSound` with stale/null sources when `src` changes quickly.
- Fixed lifecycle cleanup to stop/unload active `Howl` instances on replacement and unmount.
- Improved sprite behavior:
  - `play()` now supports fallback to hook-level `id`.
  - `stop('spriteKey')` and `pause('spriteKey')` now track and control concurrent overlapping sprite instances.
  - Sprite playback ID bookkeeping now cleans up after `end` events.
- Stabilized sprite-related effect dependencies by using a boolean `hasSprite` guard instead of object-reference dependencies.

## npm Release Notes (Draft)

Title: `@mrmartineau/use-sound@5.1.0-mrmartineau.0`

Summary:

- First maintained fork release with fixes for long-standing race conditions, sprite edge-cases, and TypeScript/module-resolution compatibility issues.
- Includes explicit mobile autoplay escape hatch via `unlock()`.

Upgrade notes:

1. Replace package install:
   - `npm uninstall use-sound`
   - `npm install @mrmartineau/use-sound@5.1.0-mrmartineau.0`
2. Update imports:
   - `import useSound from '@mrmartineau/use-sound'`
3. Optional for mobile web:
   - call `unlock()` from a user gesture before first playback if needed.
