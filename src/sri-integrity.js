// Subresource Integrity (SRI) Hash Generator & Validator (Rec 142)
// Computes cryptographic SHA-384 digests for client-side JavaScript and CSS assets,
// ensuring zero unauthorized client-side modification or CDN poisoning.

import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import {  join } from 'node:path';
import { appModuleFiles } from './app-modules.js';

export function computeFileSri(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`File not found for SRI generation: ${filePath}`);
  }
  const content = readFileSync(filePath);
  const hash = createHash('sha384').update(content).digest('base64');
  return `sha384-${hash}`;
}

export function generateSriManifest(publicDir) {
  const targetFiles = [
    'app.js',
    'answer-view.js',
    'styles.css',
    'tool-modal.js',
    'tool-modal.css',
    'clarification.js',
    'errors.js',
    'editorial.js',
    ...appModuleFiles()
  ];

  const manifest = {};
  for (const file of targetFiles) {
    const fullPath = join(publicDir, file);
    if (existsSync(fullPath)) {
      manifest[file] = computeFileSri(fullPath);
    }
  }
  return manifest;
}

export function verifySri(content, expectedSri) {
  if (typeof content !== 'string' && !Buffer.isBuffer(content)) return false;
  if (!expectedSri || !expectedSri.startsWith('sha384-')) return false;

  const actualHash = createHash('sha384').update(content).digest('base64');
  return `sha384-${actualHash}` === expectedSri;
}
