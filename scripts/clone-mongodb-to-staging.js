#!/usr/bin/env node

/**
 * Clone MongoDB production cluster to staging.
 *
 * Usage:
 *   MONGODB_PROD_URI="mongodb+srv://..." MONGODB_STAGING_URI="mongodb+srv://..." node scripts/clone-mongodb-to-staging.js
 *
 * Or set the variables in your .env.staging file and run:
 *   node -r dotenv/config scripts/clone-mongodb-to-staging.js dotenv_config_path=.env.staging
 *
 * Options (env vars):
 *   MONGODB_PROD_URI       - Required. Connection URI for production cluster.
 *   MONGODB_STAGING_URI    - Required. Connection URI for staging cluster.
 *   EXCLUDE_DBS            - Comma-separated list of extra DB names to skip (system DBs are always skipped).
 *   BATCH_SIZE             - Number of documents to transfer per batch (default: 500).
 *   DROP_BEFORE_COPY       - Set to "true" to drop each staging collection before copying (default: true).
 */

const { MongoClient } = require("mongodb");

// ── Config ────────────────────────────────────────────────────────────────────

const PROD_URI = process.env.MONGODB_PROD_URI;
const STAGING_URI = process.env.MONGODB_STAGING_URI;
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE ?? "500", 10);
const DROP_BEFORE_COPY = (process.env.DROP_BEFORE_COPY ?? "true") === "true";
const EXTRA_EXCLUDE = (process.env.EXCLUDE_DBS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// MongoDB system databases that should never be cloned.
const SYSTEM_DBS = new Set(["admin", "local", "config"]);

// ── Helpers ───────────────────────────────────────────────────────────────────

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function error(msg) {
  console.error(`[${new Date().toISOString()}] ERROR: ${msg}`);
}

async function getUserDatabases(adminDb) {
  const { databases } = await adminDb.command({ listDatabases: 1 });
  return databases
    .map((d) => d.name)
    .filter((name) => !SYSTEM_DBS.has(name) && !EXTRA_EXCLUDE.includes(name));
}

async function cloneCollection(sourceDb, targetDb, collectionName) {
  const sourceCol = sourceDb.collection(collectionName);
  const targetCol = targetDb.collection(collectionName);

  const total = await sourceCol.countDocuments();

  if (total === 0) {
    log(`    ${collectionName}: empty, skipping`);
    return;
  }

  if (DROP_BEFORE_COPY) {
    await targetCol.drop().catch(() => {}); // ignore "ns not found"
  }

  // Copy documents in batches to avoid memory spikes on large collections.
  let copied = 0;
  const cursor = sourceCol.find({});

  while (true) {
    const batch = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      const doc = await cursor.next();
      if (doc === null) break;
      batch.push(doc);
    }
    if (batch.length === 0) break;

    await targetCol.insertMany(batch, { ordered: false });
    copied += batch.length;
    process.stdout.write(
      `\r    ${collectionName}: ${copied}/${total} documents copied...`
    );
  }

  await cursor.close();
  process.stdout.write("\n");

  // Replicate indexes (skip _id, it is always present).
  const indexes = await sourceCol.indexes();
  for (const idx of indexes) {
    if (idx.name === "_id_") continue;
    const { key, name, ...options } = idx;
    await targetCol.createIndex(key, { name, ...options }).catch((err) => {
      error(`    Could not create index "${name}" on ${collectionName}: ${err.message}`);
    });
  }
  log(`    ${collectionName}: done (${copied} docs, ${indexes.length - 1} indexes)`);
}

async function cloneDatabase(prodClient, stagingClient, dbName) {
  log(`  Database: ${dbName}`);
  const sourceDb = prodClient.db(dbName);
  const targetDb = stagingClient.db(dbName);

  const collections = await sourceDb
    .listCollections({}, { nameOnly: true })
    .toArray();

  if (collections.length === 0) {
    log(`    (no collections)`);
    return;
  }

  for (const { name } of collections) {
    await cloneCollection(sourceDb, targetDb, name);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!PROD_URI) {
    error("MONGODB_PROD_URI is not set.");
    process.exit(1);
  }
  if (!STAGING_URI) {
    error("MONGODB_STAGING_URI is not set.");
    process.exit(1);
  }
  if (PROD_URI === STAGING_URI) {
    error("MONGODB_PROD_URI and MONGODB_STAGING_URI are the same. Aborting.");
    process.exit(1);
  }

  const prodClient = new MongoClient(PROD_URI);
  const stagingClient = new MongoClient(STAGING_URI);

  try {
    log("Connecting to production...");
    await prodClient.connect();

    log("Connecting to staging...");
    await stagingClient.connect();

    const adminDb = prodClient.db("admin");
    const databases = await getUserDatabases(adminDb);

    if (databases.length === 0) {
      log("No user databases found in production. Nothing to clone.");
      return;
    }

    log(`Found ${databases.length} database(s) to clone: ${databases.join(", ")}`);
    log("─".repeat(60));

    for (const dbName of databases) {
      await cloneDatabase(prodClient, stagingClient, dbName);
    }

    log("─".repeat(60));
    log("Clone complete.");
  } catch (err) {
    error(err.message);
    process.exit(1);
  } finally {
    await prodClient.close();
    await stagingClient.close();
  }
}

main();
