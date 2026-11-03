// Conservative lexical invariants, not a semantic proof. False positives fall back.
import { detectNliContradiction } from './nli-hallucination-guard.js';

function signature(text,pattern) {
 return (text.normalize('NFKC').toLowerCase().match(pattern)||[]).sort();
}
const patterns=[
 /\d+(?:[.,:/-]\d+)*(?:\s*%)?/gu,
 /\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|hundred|thousand|million)\b/gu,
 /https?:\/\/[^\s<>]+|www\.[^\s<>]+|[\w.+-]+@[\w.-]+\.[a-z]{2,}/gu,
 /[$€£¥%]|\b(?:cad|usd|dollars?|cents?|percent)\b/gu,
 /\b(?:no|not|never|cannot|must|may|only|unless|except)\b/gu
];
function normalized(text){return text.replace(/\bcan't\b/giu,'cannot').replace(/\bwon't\b/giu,'will not').replace(/n't\b/giu,' not');}
export function assertRewriteInvariants(before,after) {
 for(const pattern of patterns) {
  if(JSON.stringify(signature(normalized(before),pattern))!==JSON.stringify(signature(normalized(after),pattern)))throw new Error('Rewrite changed protected evidence tokens');
 }
 const nli = detectNliContradiction(after, before);
 if (nli.contradiction) throw new Error('Rewrite contradicts source evidence polarity');
}
// A summary condenses several claims, so it may drop tokens but never add one:
// every protected token it uses must already occur in the evidence it sums up.
const promises=/\b(?:guarantee[ds]?|guaranteed|always|definitely|certainly|surely|will be approved|100% sure)\b/iu;
export function assertSummaryGrounded(evidence,summary) {
 if(promises.test(summary))throw new Error('Summary adds an unsupported promise');
 for(const pattern of patterns) {
  const available=signature(normalized(evidence),pattern);
  for(const token of signature(normalized(summary),pattern)) {
   const at=available.indexOf(token);
   if(at===-1)throw new Error('Summary adds protected evidence tokens');
   available.splice(at,1);
  }
 }
}
