# Bank 1501–1700 — अंतिम 200-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

1,700-क्वेश्चन मास्टर बैंक का अंतिम भाग (`scripts/data/questions-1501-1700.json` = Questions 1501–1700, 200 प्रश्न)।

**चलाने-का ढंग:** In-process runner (`scripts/run-bank200-final.mjs`) — `data/test-settlement.sqlite` पर `src/engine.answer()`; असली `data/settlement.sqlite` अछूता; fixed clock 2026-11-10T12:00Z।

## 1. डुप्लिकेट-प्रमाण

| जाँच | परिणाम |
|---|---|
| पिछले छह सेटों (3143 प्रश्न) से डुप्लिकेट | **0** |
| इस सेट के भीतर आपसी डुप्लिकेट | **0** |
| चले गए प्रश्न | **200** (5 सेकंड) |
| Engine Errors | **0** |

## 2. कुल स्थिति (200 प्रश्न)

| स्थिति | संख्या | % |
|---|---|---|
| `guidance` | **177** | **88.5%** |
| `partial` | 22 | 11.0% |
| `clarification` | 0 | 0.0% |
| `unavailable` | 1 | 0.5% |
| `error` | **0** | **0%** |

**Serviceable = 199 = 99.5%**।

## 3. Section-वार परिणाम

| Section | Total | Guidance | Partial | Unavail / Clarif |
|---|---|---|---|---|
| Immigration Policy and Legal Interpretation | 20 | **19** | 1 | 0 |
| Visa Refusals and Complex Application Scenarios | 20 | **20** | 0 | 0 |
| Financial Immigration and Cross-Border Wealth | 20 | **17** | 3 | 0 |
| Employment and Professional Immigration | 20 | **16** | 4 | 0 |
| Permanent Residency and Citizenship | 20 | **20** | 0 | 0 |
| Family, Marriage and Dependent Immigration | 20 | **17** | 3 | 0 |
| Education and International Student Immigration | 20 | **15** | 5 | 0 |
| Housing and Settlement Challenges | 20 | **19** | 0 | 1 |
| Healthcare, Insurance and Social Protection | 20 | **17** | 3 | 0 |
| Advanced, Logical and Unanswered Immigration Questions | 20 | **17** | 3 | 0 |

## 4. गैप-कारण विश्लेषण

| गैप कारण | आवृत्ति |
|---|---|
| `missing_personal_eligibility` | **26** |
| `awaiting_human_review` | **2** |
| `missing_evidence` | **1** |
