import test from 'node:test';

// The hosted runner records snapshot availability before other tests can create
// a seed-only store at the same path. Local runs still exercise the real snapshot.
export function snapshotTest(name, run) {
  const skip = process.env.REVIEWED_SNAPSHOT_UNAVAILABLE === '1'
    ? 'Reviewed evidence snapshot was absent at checkout'
    : false;
  return test(name, { skip }, run);
}
