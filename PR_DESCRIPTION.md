Closes #<issue-number>

## Summary

Adds resume-from-checkpoint support for interrupted campaigns in `crashlab-core` without changing the existing non-resume run path. The runtime now validates persisted checkpoints against the requested campaign and schedule length, resumes from the last accounted global seed index, and preserves deterministic worker-partition behavior by using one checkpoint cursor per worker.

## What changed

- Added `RunCheckpoint::validate_run` and campaign-mismatch validation to make resume compatibility explicit before work starts.
- Added `RunResumeError`, `drive_run_from_checkpoint`, and `drive_run_partitioned_from_checkpoint` to `run_control.rs`.
- Kept the existing `drive_run` and `drive_run_partitioned` entry points unchanged to avoid regressions in adjacent runtime flows.
- Updated checkpoint docs in `README.md` and `docs/REPRODUCIBILITY.md` to describe per-worker checkpoint files, deterministic resume semantics, and the current no-file-locking limitation.
- Added focused unit coverage in `checkpoint.rs` and `run_control.rs`.
- Added regression/integration tests:
  - `contracts/crashlab-core/tests/run_resume_from_checkpoint.rs`
  - `contracts/crashlab-core/tests/run_resume_partitioned_checkpoint.rs`

## Validation

```bash
rg -n "TODO|TBD" README.md CONTRIBUTING.md MAINTAINER_WAVE_PLAYBOOK.md .github/SECURITY.md || true
```

Expected: no unresolved placeholder output.

```bash
cd contracts/crashlab-core
cargo test --test run_resume_from_checkpoint
cargo test --test run_resume_partitioned_checkpoint
```

Expected:
- interrupted single-worker run resumes from the saved checkpoint without replaying completed seeds
- partitioned worker resume advances the global cursor without rescanning earlier work
- checkpoint campaign mismatch is rejected before work starts

```bash
cd contracts/crashlab-core
cargo test --all-targets
```

Expected: currently blocked by pre-existing unrelated compile failures in `src/threat_model_tests.rs`; see local output summary.

## Local Output Summary

- `rg -n "TODO|TBD" README.md CONTRIBUTING.md MAINTAINER_WAVE_PLAYBOOK.md .github/SECURITY.md || true`: no output
- `git diff --check`: passed
- `cd contracts/crashlab-core && cargo test --test run_resume_from_checkpoint`: passed
- `cd contracts/crashlab-core && cargo test --test run_resume_partitioned_checkpoint`: passed
- `cd contracts/crashlab-core && cargo test --all-targets`: failed in pre-existing unrelated `src/threat_model_tests.rs` compile debt, including stale references such as:
  - `load_case_bundle_json`
  - removed `FailureClass` variants (`Storage`, `Arithmetic`, `Context`, `Object`, `Crypto`, `Events`)
  - removed constructors like `RetentionPolicy::new`, `RunCheckpoint::new`, and `WorkerPartition::new`

## Design Note

- Tradeoff: I added resume-specific APIs instead of changing `drive_run` / `drive_run_partitioned` in place. That keeps existing callers stable and makes the checkpointed control path explicit at the callsite.
- Alternative considered: baking checkpoint persistence directly into the run loop. I left persistence as a caller concern so replay, bundle persistence, and health-reporting interfaces stay decoupled from filesystem I/O.
- Rollback path: remove the new resume-specific APIs/tests/docs and callers fall back to the original start-from-zero run path.

## Notes for Maintainers

- Use one checkpoint file per worker when resuming partitioned campaigns.
- Checkpoint files are still not file-locked; concurrent writers can overwrite each other's progress.
- The resume cursor advances only after a seed index is fully accounted for, so cancellation and failure leave the next unprocessed seed in place for a deterministic retry.
