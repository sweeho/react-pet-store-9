# TDD result SWHR8-T-0003

Test: src/test/acceptance-config.test.ts (2 cases).
RED (before fix): `Tests 2 failed` - playwright `--list` exited with "Error: No tests found"; vitest config: `AssertionError: expected ... to contain '"tests/acceptance/**/*.spec.ts"'`.
GREEN (after fix): `Tests 2 passed (2)`. `playwright --list`: `Total: 41 tests in 9 files` (all nine spec files). `bun run lint` exit 0.
TDD-RESULT: 2 passed, 0 failed
