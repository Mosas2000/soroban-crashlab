# feat: improve runtime replay and retention controls

Closes #428
Closes #429
Closes #430
Closes #431

## Summary

This PR improves the Wave 4 runtime reliability surface in `crashlab-core` by:

- adding stable failure classification resolution for replay and taxonomy reporting,
- wiring single-seed replay through shared bundle persistence and the main CLI,
- adding configurable time-based retention for run artifacts,
- and making stale-run detection easier to verify deterministically.

The implementation stays compatible with replay, bundle persistence, and health-oriented runtime flows by preserving legacy persisted bundle signatures while surfacing stable taxonomy classes during replay.

## What Changed

### Failure classification taxonomy

- added `stable_failure_class_for_bundle` so persisted bundles can resolve to stable classes such as `auth`, `budget`, `state`, and `xdr`,
- kept backward compatibility for legacy bundles that still store `signature.category = "runtime-failure"`,
- documented and tested the stable class mapping behavior.

### Replay single seed

- expanded replay logic into shared helpers in `replay.rs`,
- added replay result fields for stable class matching alongside signature matching,
- routed `replay-single-seed` through the shared persistence/replay path,
- added `crashlab replay seed <bundle-json-path>` to the main CLI,
- ensured replay output is deterministic and explicit about class/category/digest/signature hash.

### Run artifact retention

- extended `RetentionPolicy` with retention windows for failures and checkpoints,
- added `RetentionRecord<T>` to support time-aware pruning,
- preserved existing count-based retention helpers,
- added behavior to keep the latest failures pinned while pruning older non-critical artifacts.

### Stale run detector

- added `check_with_elapsed()` for deterministic validation without sleep-heavy tests,
- preserved `check()` for live runtime polling,
- kept recovery hints surfaced through `StaleStatus::Stale`.

### Runtime control cleanup

- fixed a pre-existing `run_control.rs` compile break and aligned it with the shared `worker_partition` API so the runtime crate builds and tests cleanly again.

## Validation

Primary:

```bash
cd contracts/crashlab-core
cargo test --all-targets
```

Observed result:

- `343` library tests passed
- `4` `import-corpus` binary tests passed
- `2` `replay-single-seed` binary tests passed

Secondary targeted checks maintainers can use:

```bash
cd contracts/crashlab-core
cargo test replay::
cargo test retention::
cargo test stale_detector::
cargo test --bin replay-single-seed
```

## Reviewer Notes

- replay remains compatible with persisted legacy bundles that store `"runtime-failure"` as the signature category,
- stable taxonomy classes are resolved during replay instead of rewriting old artifact data,
- retention behavior is now reproducible from explicit timestamps and windows instead of manual guesswork,
- stale detection behavior can be verified deterministically with explicit elapsed durations.

## Files Changed

- `contracts/crashlab-core/src/taxonomy.rs`
- `contracts/crashlab-core/src/replay.rs`
- `contracts/crashlab-core/src/bin/replay-single-seed.rs`
- `contracts/crashlab-core/src/bin/crashlab.rs`
- `contracts/crashlab-core/src/retention.rs`
- `contracts/crashlab-core/src/stale_detector.rs`
- `contracts/crashlab-core/src/run_control.rs`
- `contracts/crashlab-core/src/lib.rs`
- `README.md`
