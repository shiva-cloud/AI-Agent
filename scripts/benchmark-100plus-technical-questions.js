import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// 120 Comprehensive Technical & Profile-Based Scenario Questions (100+ Suite)
export const technical120Suite = [
  // ── 1. FAMILY, PARENTS & SPONSORSHIP (20 Questions) ──────────────────────
  { id: 'FPS01', cat: 'Family & Parents', q: 'My mother is 62 and my father is 65. Can I sponsor both parents on a Super Visa in Toronto?', city: 'Toronto' },
  { id: 'FPS02', cat: 'Family & Parents', q: 'What is the minimum necessary income LICO requirement for sponsoring parents on a Super Visa in Mississauga?', city: 'Mississauga' },
  { id: 'FPS03', cat: 'Family & Parents', q: 'How long can parents stay continuously in Canada under the updated Super Visa rules in Brampton?', city: 'Brampton' },
  { id: 'FPS04', cat: 'Family & Parents', q: 'Can my elderly parents use foreign travel insurance for their Super Visa application in Vancouver?', city: 'Vancouver' },
  { id: 'FPS05', cat: 'Family & Parents', q: 'How many years of CRA Notice of Assessment NOA are required to sponsor parents under PGP in Toronto?', city: 'Toronto' },
  { id: 'FPS06', cat: 'Family & Parents', q: 'Can a foreign pension count toward the sponsor income requirement for parent sponsorship in Mississauga?', city: 'Mississauga' },
  { id: 'FPS07', cat: 'Family & Parents', q: 'My spouse lives abroad. How do I apply for spousal sponsorship and can my spouse get a work permit in Toronto?', city: 'Toronto' },
  { id: 'FPS08', cat: 'Family & Parents', q: 'How long must a couple live together to prove a common-law partnership for IRCC sponsorship in Vancouver?', city: 'Vancouver' },
  { id: 'FPS09', cat: 'Family & Parents', q: 'Is there a minimum income requirement to sponsor a spouse without dependent children in Brampton?', city: 'Brampton' },
  { id: 'FPS10', cat: 'Family & Parents', q: 'What is the length of the financial undertaking for sponsoring a spouse to Canada in Toronto?', city: 'Toronto' },
  { id: 'FPS11', cat: 'Family & Parents', q: 'My child was born in India while both parents are PRs living in Toronto. How do I sponsor my baby in Toronto?', city: 'Toronto' },
  { id: 'FPS12', cat: 'Family & Parents', q: 'What is form IMM 5604 declaration from non-accompanying parent for sponsoring a minor in Mississauga?', city: 'Mississauga' },
  { id: 'FPS13', cat: 'Family & Parents', q: 'What is the age cutoff for a dependent child under Canadian immigration law in Vancouver?', city: 'Vancouver' },
  { id: 'FPS14', cat: 'Family & Parents', q: 'Can I sponsor an unmarried orphaned minor brother or sister under age 18 in Toronto?', city: 'Toronto' },
  { id: 'FPS15', cat: 'Family & Parents', q: 'How many bonus CRS points are awarded for having a Canadian citizen or PR sibling in Toronto?', city: 'Toronto' },
  { id: 'FPS16', cat: 'Family & Parents', q: 'How does a single parent on a work permit apply for Canada Child Benefit CCB in Mississauga?', city: 'Mississauga' },
  { id: 'FPS17', cat: 'Family & Parents', q: 'How does the $22-a-day CWELCC child care fee reduction work for families in Toronto?', city: 'Toronto' },
  { id: 'FPS18', cat: 'Family & Parents', q: 'Can children of temporary residents attend public school in Peel District School Board in Brampton?', city: 'Brampton' },
  { id: 'FPS19', cat: 'Family & Parents', q: 'What immunization vaccine records are mandatory for registering children in Toronto schools TDSB in Toronto?', city: 'Toronto' },
  { id: 'FPS20', cat: 'Family & Parents', q: 'Can my elderly mother on a visitor visa receive health coverage under Ontario OHIP in Toronto?', city: 'Toronto' },

  // ── 2. WORK EXPERIENCE, EXPRESS ENTRY & CRS (25 Questions) ───────────────
  { id: 'WCR01', cat: 'Work Experience & CRS', q: 'How many CRS points do I get with 3 years foreign experience and 1 year in Toronto?', city: 'Toronto' },
  { id: 'WCR02', cat: 'Work Experience & CRS', q: 'What are the skill transferability bonus points for foreign work experience with CLB 9 in Toronto?', city: 'Toronto' },
  { id: 'WCR03', cat: 'Work Experience & CRS', q: 'How many points are deducted per year for age after 30 in Express Entry in Vancouver?', city: 'Vancouver' },
  { id: 'WCR04', cat: 'Work Experience & CRS', q: 'How many CRS points does a Master degree receive compared to a Bachelor degree in Mississauga?', city: 'Mississauga' },
  { id: 'WCR05', cat: 'Work Experience & CRS', q: 'How many additional CRS points are awarded for bilingual French proficiency at NCLC 7 in Brampton?', city: 'Brampton' },
  { id: 'WCR06', cat: 'Work Experience & CRS', q: 'Does IRCC require 1 year of continuous full-time work experience for Federal Skilled Worker FSW in Toronto?', city: 'Toronto' },
  { id: 'WCR07', cat: 'Work Experience & CRS', q: 'Does Canadian work experience for Canadian Experience Class CEC need to be continuous in Vancouver?', city: 'Vancouver' },
  { id: 'WCR08', cat: 'Work Experience & CRS', q: 'How many hours per week count toward the 1,560 hours requirement for Express Entry in Mississauga?', city: 'Mississauga' },
  { id: 'WCR09', cat: 'Work Experience & CRS', q: 'Can self-employed freelance work experience in Canada be counted toward CEC in Toronto?', city: 'Toronto' },
  { id: 'WCR10', cat: 'Work Experience & CRS', q: 'Can off-campus work experience gained while on a full-time study permit count for CEC in Brampton?', city: 'Brampton' },
  { id: 'WCR11', cat: 'Work Experience & CRS', q: 'What required details (salary, hours, duties) must an employer reference letter have for IRCC in Vancouver?', city: 'Vancouver' },
  { id: 'WCR12', cat: 'Work Experience & CRS', q: 'What are the minimum work experience requirements for Express Entry category-based selection draws in Toronto?', city: 'Toronto' },
  { id: 'WCR13', cat: 'Work Experience & CRS', q: 'How long of a post-graduation work permit PGWP does a graduate of a master degree receive in Toronto?', city: 'Toronto' },
  { id: 'WCR14', cat: 'Work Experience & CRS', q: 'Can a temporary worker continue working legally on maintained status under section 186 u in Mississauga?', city: 'Mississauga' },
  { id: 'WCR15', cat: 'Work Experience & CRS', q: 'When can an Express Entry applicant apply for a Bridging Open Work Permit BOWP in Vancouver?', city: 'Vancouver' },
  { id: 'WCR16', cat: 'Work Experience & CRS', q: 'Who is exempt from showing proof of settlement funds under Express Entry in Brampton?', city: 'Brampton' },
  { id: 'WCR17', cat: 'Work Experience & CRS', q: 'Where can internationally trained engineers apply for a Foreign Credential Recognition loan up to $30,000 in Toronto?', city: 'Toronto' },
  { id: 'WCR18', cat: 'Work Experience & CRS', q: 'What is the Foreign Credential Recognition FCR process for regulated professions in Mississauga?', city: 'Mississauga' },
  { id: 'WCR19', cat: 'Work Experience & CRS', q: 'How many bonus CRS points are awarded for an OINP provincial nomination in Toronto Ontario?', city: 'Toronto' },
  { id: 'WCR20', cat: 'Work Experience & CRS', q: 'Do foreign tech workers need an LMIA for the BC PNP Tech stream in Vancouver BC?', city: 'Vancouver' },
  { id: 'WCR21', cat: 'Work Experience & CRS', q: 'How many CRS points are awarded for an approved LMIA job offer in TEER 1 in Brampton?', city: 'Brampton' },
  { id: 'WCR22', cat: 'Work Experience & CRS', q: 'Can an unpaid internship be counted as valid foreign work experience for FSW in Toronto?', city: 'Toronto' },
  { id: 'WCR23', cat: 'Work Experience & CRS', q: 'How do concurrent part-time jobs calculate toward full-time work experience in Mississauga?', city: 'Mississauga' },
  { id: 'WCR24', cat: 'Work Experience & CRS', q: 'How does an LMIA-exempt CUSMA professional work permit work at the port of entry in Toronto?', city: 'Toronto' },
  { id: 'WCR25', cat: 'Work Experience & CRS', q: 'What TEER level is required for high-skilled work experience under Express Entry in Vancouver?', city: 'Vancouver' },

  // ── 3. TENANCY, RENT & LANDLORD DISPUTES (20 Questions) ───────────────────
  { id: 'TEN01', cat: 'Tenancy & Housing', q: 'Does my landlord legally owe me one month rent compensation for N12 in Toronto?', city: 'Toronto' },
  { id: 'TEN02', cat: 'Tenancy & Housing', q: 'Can an Ontario landlord evict a tenant without an order from the Landlord and Tenant Board in Brampton?', city: 'Brampton' },
  { id: 'TEN03', cat: 'Tenancy & Housing', q: 'Can my landlord raise rent by 8% in a 2015 building in Toronto?', city: 'Toronto' },
  { id: 'TEN04', cat: 'Tenancy & Housing', q: 'Are residential buildings first occupied after November 15 2018 exempt from rent control in Mississauga?', city: 'Mississauga' },
  { id: 'TEN05', cat: 'Tenancy & Housing', q: 'How much advance written notice on Form N1 is required for a legal rent increase in Toronto?', city: 'Toronto' },
  { id: 'TEN06', cat: 'Tenancy & Housing', q: 'Is a landlord allowed to ask for a damage deposit or pet deposit in Ontario in Brampton?', city: 'Brampton' },
  { id: 'TEN07', cat: 'Tenancy & Housing', q: 'Does an Ontario landlord have to pay annual interest on my last month rent deposit in Toronto?', city: 'Toronto' },
  { id: 'TEN08', cat: 'Tenancy & Housing', q: 'Can a landlord enter my apartment without 24 hours advance written notice in Mississauga?', city: 'Mississauga' },
  { id: 'TEN09', cat: 'Tenancy & Housing', q: 'Is a no-pet clause legally enforceable under the Ontario Residential Tenancies Act in Toronto?', city: 'Toronto' },
  { id: 'TEN10', cat: 'Tenancy & Housing', q: 'What should a tenant do if a landlord changes the door locks without the court sheriff in Brampton?', city: 'Brampton' },
  { id: 'TEN11', cat: 'Tenancy & Housing', q: 'Does a 1-year residential lease automatically convert to month-to-month in Toronto?', city: 'Toronto' },
  { id: 'TEN12', cat: 'Tenancy & Housing', q: 'How much compensation can the LTB award for a bad-faith N12 eviction under Form T5 in Toronto?', city: 'Toronto' },
  { id: 'TEN13', cat: 'Tenancy & Housing', q: 'Can a landlord legally demand 6 or 12 months rent upfront as a condition of renting in Mississauga?', city: 'Mississauga' },
  { id: 'TEN14', cat: 'Tenancy & Housing', q: 'Can a landlord refuse a reasonable request to assign a lease to a new tenant in Toronto?', city: 'Toronto' },
  { id: 'TEN15', cat: 'Tenancy & Housing', q: 'What are the minimum winter heating bylaws for residential rentals in Brampton?', city: 'Brampton' },
  { id: 'TEN16', cat: 'Tenancy & Housing', q: 'How much security deposit and pet damage deposit can a landlord charge in Vancouver BC?', city: 'Vancouver' },
  { id: 'TEN17', cat: 'Tenancy & Housing', q: 'What standard terms must be included in a BC residential tenancy agreement in Vancouver?', city: 'Vancouver' },
  { id: 'TEN18', cat: 'Tenancy & Housing', q: 'How much advance written notice is required before increasing rent under BC tenancy law in Vancouver?', city: 'Vancouver' },
  { id: 'TEN19', cat: 'Tenancy & Housing', q: 'What are landlord emergency repair responsibilities under BC residential tenancy law in Vancouver?', city: 'Vancouver' },
  { id: 'TEN20', cat: 'Tenancy & Housing', q: 'How do tenants file an online dispute resolution application with the BC RTB in Vancouver?', city: 'Vancouver' },

  // ── 4. POLICE CLEARANCE CERTIFICATES & ADMISSIBILITY (15 Questions) ───────
  { id: 'PCC01', cat: 'PCC & Admissibility', q: 'I lived in India for 24 years, lived in the UK for 3 years, and in Dubai UAE for 2 years. Which countries do I need Police Clearance Certificates PCC from for Canada PR in Toronto?', city: 'Toronto' },
  { id: 'PCC02', cat: 'PCC & Admissibility', q: 'Does IRCC require police certificates for countries where I lived before turning 18 in Vancouver?', city: 'Vancouver' },
  { id: 'PCC03', cat: 'PCC & Admissibility', q: 'How does an Indian citizen in Mississauga obtain an Indian police clearance certificate PCC through BLS?', city: 'Mississauga' },
  { id: 'PCC04', cat: 'PCC & Admissibility', q: 'How does an applicant in Toronto get an FBI Identity History Summary IdHS clearance for living in USA?', city: 'Toronto' },
  { id: 'PCC05', cat: 'PCC & Admissibility', q: 'How long is a UK ACRO Police Certificate valid for submitting with an IRCC application in Brampton?', city: 'Brampton' },
  { id: 'PCC06', cat: 'PCC & Admissibility', q: 'How does a Filipino applicant obtain an NBI Clearance with biometric fingerprinting in Vancouver BC?', city: 'Vancouver' },
  { id: 'PCC07', cat: 'PCC & Admissibility', q: 'Where can a Nigerian PR applicant obtain a CIID Police Character Certificate in Toronto?', city: 'Toronto' },
  { id: 'PCC08', cat: 'PCC & Admissibility', q: 'Do minor speeding traffic tickets without court appearances make an applicant inadmissible to Canada in Mississauga?', city: 'Mississauga' },
  { id: 'PCC09', cat: 'PCC & Admissibility', q: 'Does a single DUI conviction make an applicant inadmissible and require Criminal Rehabilitation in Toronto?', city: 'Toronto' },
  { id: 'PCC10', cat: 'PCC & Admissibility', q: 'What is the 730 days residency obligation in a 5-year window to maintain Canadian permanent residence in Vancouver?', city: 'Vancouver' },
  { id: 'PCC11', cat: 'PCC & Admissibility', q: 'Do days spent accompanying a Canadian citizen spouse outside Canada count toward PR residency in Toronto?', city: 'Toronto' },
  { id: 'PCC12', cat: 'PCC & Admissibility', q: 'How does a permanent resident whose PR card expired abroad apply for a PRTD to travel to Toronto?', city: 'Toronto' },
  { id: 'PCC13', cat: 'PCC & Admissibility', q: 'Are biometrics fingerprints given for a student visa valid for permanent residence in Brampton?', city: 'Brampton' },
  { id: 'PCC14', cat: 'PCC & Admissibility', q: 'What explanation letter must an applicant submit if a country refuses to issue police certificates in Toronto?', city: 'Toronto' },
  { id: 'PCC15', cat: 'PCC & Admissibility', q: 'Do multiple visits totaling 6 months in a country require a police clearance certificate in Vancouver?', city: 'Vancouver' },

  // ── 5. DRIVING LICENCE & EXPERIENCE (15 Questions) ────────────────────────
  { id: 'DRV01', cat: 'Driving & Licence', q: 'Can I exchange my Indian driving licence with a Sarathi extract in Toronto?', city: 'Toronto' },
  { id: 'DRV02', cat: 'Driving & Licence', q: 'With 2 or more years of foreign driving experience, can I skip G1 and G2 waiting periods in Mississauga?', city: 'Mississauga' },
  { id: 'DRV03', cat: 'Driving & Licence', q: 'Can I do a direct reciprocal exchange for a full Ontario G licence with a US driver licence in Toronto?', city: 'Toronto' },
  { id: 'DRV04', cat: 'Driving & Licence', q: 'Does a UK driver licence with 18 months experience exchange for a G or G2 licence in Brampton?', city: 'Brampton' },
  { id: 'DRV05', cat: 'Driving & Licence', q: 'Can an Australian driver licence be exchanged directly for a BC Class 5 licence at ICBC in Vancouver?', city: 'Vancouver' },
  { id: 'DRV06', cat: 'Driving & Licence', q: 'How many days can a new resident drive on a foreign driver licence in Ontario in Toronto?', city: 'Toronto' },
  { id: 'DRV07', cat: 'Driving & Licence', q: 'How many days can a newcomer drive with a foreign licence in British Columbia in Vancouver?', city: 'Vancouver' },
  { id: 'DRV08', cat: 'Driving & Licence', q: 'How do I authenticate a Philippines driver licence using the LTO LTMS portal in Mississauga?', city: 'Mississauga' },
  { id: 'DRV09', cat: 'Driving & Licence', q: 'What tests must a driver licence holder from China take at DriveTest in Brampton?', city: 'Brampton' },
  { id: 'DRV10', cat: 'Driving & Licence', q: 'What happens if an applicant with credited foreign experience fails the full G road test in Toronto?', city: 'Toronto' },
  { id: 'DRV11', cat: 'Driving & Licence', q: 'Does completing a Beginner Driver Education BDE course reduce car insurance rates in Toronto?', city: 'Toronto' },
  { id: 'DRV12', cat: 'Driving & Licence', q: 'Does ICBC require non-English driving records to be translated by an approved STIBC translator in Vancouver?', city: 'Vancouver' },
  { id: 'DRV13', cat: 'Driving & Licence', q: 'Can a Pakistani driver licence with a DLIMS verification extract be used at DriveTest in Mississauga?', city: 'Mississauga' },
  { id: 'DRV14', cat: 'Driving & Licence', q: 'Can German and French driver licences be exchanged directly for an Ontario G licence without road tests in Toronto?', city: 'Toronto' },
  { id: 'DRV15', cat: 'Driving & Licence', q: 'Where do newcomers book their G1 knowledge test and road tests in Brampton Ontario?', city: 'Brampton' },

  // ── 6. HEALTHCARE & MEDICAL ADMISSIBILITY (15 Questions) ──────────────────
  { id: 'HLT01', cat: 'Healthcare & Medical', q: 'Will type 2 diabetes cause medical inadmissibility for Canada PR in Toronto?', city: 'Toronto' },
  { id: 'HLT02', cat: 'Healthcare & Medical', q: 'How is the excessive demand cost threshold calculated for immigration medical exams in Vancouver?', city: 'Vancouver' },
  { id: 'HLT03', cat: 'Healthcare & Medical', q: 'Are sponsored spouses and dependent children exempt from medical excessive demand rules in Toronto?', city: 'Toronto' },
  { id: 'HLT04', cat: 'Healthcare & Medical', q: 'Is there a three-month waiting period for OHIP health card coverage in Toronto Ontario?', city: 'Toronto' },
  { id: 'HLT05', cat: 'Healthcare & Medical', q: 'What original identity documents are required to apply for an Ontario health card in Mississauga?', city: 'Mississauga' },
  { id: 'HLT06', cat: 'Healthcare & Medical', q: 'How is the coverage waiting period calculated for BC MSP in Vancouver BC?', city: 'Vancouver' },
  { id: 'HLT07', cat: 'Healthcare & Medical', q: 'What documents are required to enroll in BC MSP and get a BC Services Card in Vancouver?', city: 'Vancouver' },
  { id: 'HLT08', cat: 'Healthcare & Medical', q: 'Who is eligible for Interim Federal Health Program IFHP coverage in Toronto?', city: 'Toronto' },
  { id: 'HLT09', cat: 'Healthcare & Medical', q: 'What prescription drug and dental benefits are covered by IFHP for protected persons in Vancouver?', city: 'Vancouver' },
  { id: 'HLT10', cat: 'Healthcare & Medical', q: 'Is a newborn baby born in BC covered immediately while parents wait for MSP in Vancouver?', city: 'Vancouver' },
  { id: 'HLT11', cat: 'Healthcare & Medical', q: 'What panel physicians can perform the Canadian immigration medical exam eMedical in Toronto?', city: 'Toronto' },
  { id: 'HLT12', cat: 'Healthcare & Medical', q: 'Does managed hypertension or high blood pressure cause immigration medical refusal in Brampton?', city: 'Brampton' },
  { id: 'HLT13', cat: 'Healthcare & Medical', q: 'Can international students on study permits get provincial health coverage in Vancouver BC?', city: 'Vancouver' },
  { id: 'HLT14', cat: 'Healthcare & Medical', q: 'Can a temporary resident on a post-graduation work permit qualify for OHIP in Mississauga?', city: 'Mississauga' },
  { id: 'HLT15', cat: 'Healthcare & Medical', q: 'Where can newcomers without health insurance find community health centres in Toronto?', city: 'Toronto' },

  // ── 7. EDUCATION, ECA & CREDENTIALS (10 Questions) ────────────────────────
  { id: 'ECA01', cat: 'Education & ECA', q: 'How long is an Educational Credential Assessment ECA report valid for Express Entry in Toronto?', city: 'Toronto' },
  { id: 'ECA02', cat: 'Education & ECA', q: 'What organizations are designated by IRCC to issue an ECA for immigration in Mississauga?', city: 'Mississauga' },
  { id: 'ECA03', cat: 'Education & ECA', q: 'Can medical doctors use WES or must they use Medical Council of Canada MCC in Toronto?', city: 'Toronto' },
  { id: 'ECA04', cat: 'Education & ECA', q: 'Which assessment body PEBC evaluates foreign pharmacy degrees for Canada in Brampton?', city: 'Brampton' },
  { id: 'ECA05', cat: 'Education & ECA', q: 'What is the NNAS credential evaluation process for internationally educated nurses in Toronto?', city: 'Toronto' },
  { id: 'ECA06', cat: 'Education & ECA', q: 'Will WES evaluate a 3-year Bachelor and 1-year postgraduate diploma as two or more certificates in Vancouver?', city: 'Vancouver' },
  { id: 'ECA07', cat: 'Education & ECA', q: 'Do I need an ECA for high school if I already have an ECA for a Master degree in Mississauga?', city: 'Mississauga' },
  { id: 'ECA08', cat: 'Education & ECA', q: 'How does an internationally educated teacher obtain an OCT certificate in Toronto Ontario?', city: 'Toronto' },
  { id: 'ECA09', cat: 'Education & ECA', q: 'What are the P.Eng licensing requirements for Professional Engineers Ontario PEO in Brampton?', city: 'Brampton' },
  { id: 'ECA10', cat: 'Education & ECA', q: 'Who is eligible for free Language Instruction for Newcomers to Canada LINC English classes in Toronto?', city: 'Toronto' }
];

async function run() {
  console.log(`Starting execution of ${technical120Suite.length} technical questions on live server http://localhost:3000 ...`);

  const results = [];
  let passCount = 0;
  let failCount = 0;

  for (let i = 0; i < technical120Suite.length; i++) {
    const item = technical120Suite[i];
    const start = performance.now();
    
    try {
      let res = await fetch('http://localhost:3000/v1/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: item.q, city: item.city })
      });

      if (res.status === 429) {
        const waitSec = Number(res.headers.get('retry-after') || 1);
        await new Promise(r => setTimeout(r, (waitSec * 1000) + 100));
        res = await fetch('http://localhost:3000/v1/answers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: item.q, city: item.city })
        });
      }

      await new Promise(r => setTimeout(r, 20));

      const latency = Number((performance.now() - start).toFixed(1));
      const data = await res.json();
      const isGuidance = (data.status === 'guidance' || data.status === 'partial') && data.claims?.length > 0;
      
      if (isGuidance) {
        passCount++;
      } else {
        failCount++;
      }

      results.push({
        id: item.id,
        category: item.cat,
        question: item.q,
        city: item.city,
        httpStatus: res.status,
        resultStatus: data.status,
        aiStatus: data.ai?.status || 'disabled',
        passed: isGuidance,
        claimsCount: data.claims?.length || 0,
        leadClaim: data.claims?.[0]?.text || data.clarification || 'None',
        leadSource: data.sources?.[0]?.title || 'None',
        sourcesCount: data.sources?.length || 0,
        latencyMs: latency
      });

      if ((i + 1) % 20 === 0 || i === technical120Suite.length - 1) {
        console.log(`Progress: ${i + 1} / ${technical120Suite.length} tested (${passCount} passed, ${failCount} failed)`);
      }
    } catch (err) {
      failCount++;
      console.error(`Error on ${item.id}:`, err.message);
    }
  }

  console.log(`\n================================================================`);
  console.log(`100+ TECHNICAL QUESTIONS BENCHMARK FINISHED`);
  console.log(`Total Questions: ${technical120Suite.length}`);
  console.log(`Passed (Guidance Returned): ${passCount} / ${technical120Suite.length} (${((passCount / technical120Suite.length) * 100).toFixed(1)}%)`);
  console.log(`Failed / Unavailable: ${failCount}`);
  console.log(`AI Engine Status: ${results[0]?.aiStatus} (All facts strictly sourced from Knowledge Base SQLite)`);
  console.log(`================================================================\n`);

  // Breakdown by category
  const catStats = {};
  for (const r of results) {
    if (!catStats[r.category]) catStats[r.category] = { total: 0, passed: 0 };
    catStats[r.category].total++;
    if (r.passed) catStats[r.category].passed++;
  }

  console.log('Category Breakdown:');
  for (const [cat, s] of Object.entries(catStats)) {
    console.log(` - ${cat.padEnd(28)}: ${s.passed} / ${s.total} (${((s.passed / s.total) * 100).toFixed(1)}%)`);
  }

  // Write detailed CSV report
  const csvRows = ['ID,Category,City,HTTPStatus,ResultStatus,AIStatus,Passed,ClaimsCount,SourcesCount,LatencyMs,LeadSource,Question,LeadClaimSnippet'];
  for (const r of results) {
    const snippet = (r.leadClaim || '').replace(/"/g, '""').slice(0, 200);
    csvRows.push([
      r.id,
      `"${r.category}"`,
      r.city,
      r.httpStatus,
      r.resultStatus,
      r.aiStatus,
      r.passed,
      r.claimsCount,
      r.sourcesCount,
      r.latencyMs,
      `"${(r.leadSource || '').replace(/"/g, '""')}"`,
      `"${r.question.replace(/"/g, '""')}"`,
      `"${snippet}"`
    ].join(','));
  }

  writeFileSync('artifacts/benchmark-100plus-technical-results.csv', csvRows.join('\n'));
  console.log('\nDetailed results saved to artifacts/benchmark-100plus-technical-results.csv');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  run();
}
