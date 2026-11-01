// src/audio-speech-helper.js
// Text-to-Speech (TTS) Speech Synthesis & Accent Engine
// Provides multi-accent speech profiles (en-IN, en-CA, en-GB, en-US, hi-IN, pa-IN),
// sentence chunking for buffer-safe Web Speech API streaming, and SSML generator.

import { boundedText } from './text-input.js';

export const VOICE_ACCENT_PROFILES = [
  {
    code: 'en-IN',
    label: 'English (India)',
    region: 'South Asia',
    lang: 'en-IN',
    defaultRate: 1.0,
    defaultPitch: 1.05,
    description: 'Natural Indian English cadence with clear statutory enunciation.'
  },
  {
    code: 'en-CA',
    label: 'English (Canada)',
    region: 'North America',
    lang: 'en-CA',
    defaultRate: 1.0,
    defaultPitch: 1.0,
    description: 'Standard Canadian English pronunciation for provincial guidelines.'
  },
  {
    code: 'en-GB',
    label: 'English (UK)',
    region: 'United Kingdom',
    lang: 'en-GB',
    defaultRate: 0.98,
    defaultPitch: 1.0,
    description: 'Received Pronunciation British English.'
  },
  {
    code: 'en-US',
    label: 'English (US)',
    region: 'United States',
    lang: 'en-US',
    defaultRate: 1.0,
    defaultPitch: 1.0,
    description: 'General American English.'
  },
  {
    code: 'hi-IN',
    label: 'हिन्दी (Hindi)',
    region: 'India',
    lang: 'hi-IN',
    defaultRate: 0.95,
    defaultPitch: 1.0,
    description: 'Standard Devanagari Hindi speech profile.'
  },
  {
    code: 'pa-IN',
    label: 'ਪੰਜਾਬੀ (Punjabi)',
    region: 'Punjab / Global',
    lang: 'pa-IN',
    defaultRate: 0.95,
    defaultPitch: 1.0,
    description: 'Gurmukhi Punjabi speech profile.'
  }
];

/**
 * Returns available accent profiles.
 */
export function getAvailableSpeechProfiles() {
  return [...VOICE_ACCENT_PROFILES];
}

/**
 * Cleans text for speech synthesis: strips Markdown formatting, links, citations, URLs, code blocks.
 */
export function cleanTextForSpeech(raw) {
  const bounded = boundedText(raw, '', 50000);
  if (!bounded) return '';
  return bounded
    .replace(/```[\s\S]*?```/g, ' ')           // Strip code blocks
    .replace(/`([^`]+)`/g, '$1')                // Strip inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')    // Replace markdown links with text
    .replace(/\[\d+\]/g, '')                     // Strip citation markers like [1], [2]
    .replace(/[#*_~>]/g, '')                     // Strip markdown symbols
    .replace(/https?:\/\/\S+/g, 'link')         // Replace URLs with 'link'
    .replace(/\s+/g, ' ')                       // Collapse multiple whitespace
    .trim();
}

/**
 * Splits text into sentence chunks (max length ~180-220 chars) to prevent Web Speech API timeout truncation.
 */
export function chunkTextForTTS(text, maxChars = 200) {
  const safeMaxChars = Number.isFinite(Number(maxChars)) ? Math.max(50, Math.min(2000, Math.floor(Number(maxChars)))) : 200;
  const clean = cleanTextForSpeech(text);
  if (!clean) return [];

  // Match sentence boundaries (period, question mark, exclamation, or hindi purna viram)
  const sentences = clean.match(/[^.!?।]+[.!?।]+|[^.!?।]+$/g) || [clean];
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (current.length + trimmed.length + 1 <= safeMaxChars) {
      current = current ? `${current} ${trimmed}` : trimmed;
    } else {
      if (current) chunks.push(current);
      if (trimmed.length > safeMaxChars) {
        // Split extra long sentence by comma or words
        const words = trimmed.split(' ');
        let wordChunk = '';
        for (const w of words) {
          if (wordChunk.length + w.length + 1 <= safeMaxChars) {
            wordChunk = wordChunk ? `${wordChunk} ${w}` : w;
          } else {
            if (wordChunk) chunks.push(wordChunk);
            wordChunk = w;
          }
        }
        current = wordChunk;
      } else {
        current = trimmed;
      }
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

/**
 * Generates valid SSML XML markup for advanced speech synthesis engines.
 */
export function generateSSML({ text, voice = 'en-IN', rate = 'medium', pitch = 'default' }) {
  const clean = cleanTextForSpeech(text);
  const safeVoice = boundedText(voice, 'en-IN', 30);
  const safeRate = boundedText(rate, 'medium', 30);
  const safePitch = boundedText(pitch, 'default', 30);
  const escaped = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${safeVoice}">
  <prosody rate="${safeRate}" pitch="${safePitch}">
    ${escaped}
  </prosody>
</speak>`;
}
