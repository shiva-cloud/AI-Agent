> वर्तमान स्थिति: [8 नवंबर pending remediation](C:/Users/shiva/Music/Project/AI/docs/PENDING_FIXES_2026-11-08_HI.md)। चौदह records corrected/published (तीन IRCC + ग्यारह health); withheld 586, editorial review 528; 2,531 tests पास। नीचे पूर्व run का विवरण है।

# Pending fixes — 7 नवंबर 2026

## पूरे किए गए सुधार

- Language classes/training की समान अभिव्यक्ति और title context वाले relevant records अब retain होते हैं। Title का एक सामान्य शब्द unrelated summary को स्वीकार नहीं करा सकता।
- Employer-specific permit के प्रश्न में remote-work record वापस आने की regression रोकी गई।
- Source verification में primary failure, archive failure और transport code अलग दिखते हैं। Error messages, credentials और proxy URLs log नहीं किए जाते।
- Full suite: **2,529 पास, 0 fail, 0 skipped**। Lint और diff check पास।
- Latest 5,000-case run: `2026-11-07T13:38:56.748Z`; 147 partial, 2 guidance, 619 clarification, 4,232 unavailable; 0 runtime errors, 0 parsed-scope violations। चार प्रश्नों में claims वापस आए; इसे independent accuracy score नहीं कहा गया है।

## अभी खुले items

| Item | स्थिति | आगे आवश्यक कार्य |
|---|---|---|
| 600 withheld records | prerequisites के आधार पर review/import शुरू करने योग्य; publication-approved नहीं | हर summary का official evidence से मिलान और लागू review workflow |
| 519 editorial-review records | publication NOT READY | वास्तविक editorial assessment; source_verified और editorial_review को समान न मानें |
| 261 unreviewed source policies | current record sourceId से कोई सीधा link नहीं | source inventory/provenance और access-policy review; केवल warning हटाने के लिए approval नहीं |
| पहले 6 records का source check | 0/6 passed, 0 published | नीचे के transport और unavailable-page blockers resolve करें |
| Independent precision/recall | pending | independently labelled held-out questions; restored और rejected answers दोनों जाँचें |

600 और 519 के समूह overlap करते हैं। सभी 600 queue entries का ready होना केवल prerequisite readiness है, source correctness या publication approval नहीं।

## Live verification blockers

- `bc-msp-services-card-kyc-enrollment`, `msp`, `msp-documents`: `network_error / UND_ERR_SOCKET`। Connection बंद हो गया; इसे source content की verification नहीं माना गया।
- `ca-ircc-pdi-excessive-demand-formula`, `global-medical-inadmissibility-excessive-demand`, `ircc-medical-excessive-demand`: primary `http_404`; archive `archive_http_404`। Replacement source और पूरी summary का नया evidence review चाहिए।

## Review artifacts

- `artifacts/pending-review-2026-11-07.json`: record/source-wise pending work; reviewer और approval नहीं गढ़े गए।
- `artifacts/pending-live-source-verification.json`: छह live checks के परिणाम।
- `artifacts/pending-recall-change-review.json`: चार changed cases का before/after review input।
- `docs/LATEST_SYSTEM_AUDIT_VERIFICATION_HI.md`: updated audit।

Database evidence, source policies और editorial approvals इस follow-up में नहीं बदले गए। Code pendings के इन fixes के बाद भी ऊपर का review backlog खुला है।
