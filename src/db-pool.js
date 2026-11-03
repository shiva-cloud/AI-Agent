// Database Connection Pool & Read-Only Replica Manager (Rec 100, Rec 103)
// Isolates heavy read-only search operations onto dedicated worker connections,
// preserving writer throughput and preventing database lock contention.

import { DatabaseSync } from 'node:sqlite';

export function createDatabasePool(dbPath, options = {}) {
  if (!dbPath || typeof dbPath !== 'string') {
    throw new TypeError('Valid database path string required');
  }
  const safeOptions = (options && typeof options === 'object') ? options : {};
  const readPoolSize = Math.max(1, Math.min(32, Math.floor(Number(safeOptions.readPoolSize) || 2)));
  const readOnlyReplica = Boolean(safeOptions.readOnlyReplica);
  const readPool = [];

  for (let i = 0; i < readPoolSize; i++) {
    const conn = new DatabaseSync(dbPath, { readOnly: true });
    conn.exec('PRAGMA busy_timeout = 5000;');
    readPool.push(conn);
  }

  let writerConn = null;
  if (!readOnlyReplica) {
    writerConn = new DatabaseSync(dbPath);
    writerConn.exec('PRAGMA busy_timeout = 10000; PRAGMA journal_mode = WAL;');
  }

  let roundRobinIndex = 0;

  return {
    isReplicaMode: readOnlyReplica,
    poolSize: readPool.length,
    getReadConnection() {
      const conn = readPool[roundRobinIndex];
      roundRobinIndex = (roundRobinIndex + 1) % readPool.length;
      return conn;
    },
    getWriterConnection() {
      if (readOnlyReplica || !writerConn) {
        throw new Error('Database pool is operating in read-only replica mode; write operations forbidden');
      }
      return writerConn;
    },
    close() {
      for (const conn of readPool) {
        try { conn.close(); } catch (err) {
          if (process.env.NODE_ENV !== 'test') console.warn('[db-pool] Error closing read connection:', err?.message || err);
        }
      }
      if (writerConn) {
        try { writerConn.close(); } catch (err) {
          if (process.env.NODE_ENV !== 'test') console.warn('[db-pool] Error closing writer connection:', err?.message || err);
        }
      }
    }
  };
}
