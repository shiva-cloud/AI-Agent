// Renderers for answers, coverage, journey, budget and other main views.
// Split out of public/app.js; app.js imports what it uses from here.
import { $, el, escapeHtml, generateVectorPDF } from './core.js';
import { AIRPORT_KITS, BANK_PACKAGES, CITY_FINANCIAL_BENCHMARKS, COMMON_DRUG_EQUIVALENCES, DTAA_MATRIX, HEALTHCARE_TRIAGE_MAP, ISPA_VACCINES, LICENSING_DATA, MULTILINGUAL_TERMS, PAYCHECK_DESTS } from './data.js';
import { evaluateTenancyDispute } from './setup.js';

export function renderMultilingualSynthesisCard(r, original) {
  const lang = original?.userLang;
  if (!lang || lang === 'en' || !MULTILINGUAL_TERMS[lang]) return null;
  const cfg = MULTILINGUAL_TERMS[lang];

  const card = el('div', undefined, 'multilingual-synthesis');
  const badge = el('div', `🌐 Two-Pass Multilingual Synthesis (${cfg.langName}) · Statutory Tokens Locked`, 'multilingual-badge');
  card.append(badge);

  const heading = el('h3', cfg.synthesisPrefix);
  card.append(heading);

  // Extract statutory tokens to lock
  const lockedTokens = [];
  r.claims?.forEach(c => {
    const matches = c.text.match(/\b(?:Section\s+\d+|s\.\s*\d+|Form\s+[A-Z0-9]+|RTA|LTB|RTB|BGB\s*§\s*\d+|AB\s*\d+|\$\d+[\d,]*\s*(?:CAD|USD|AUD)?|€\d+[\d,]*|£\d+[\d,]*|\d+\s*hours|\d+\s*days|\d+\s*weeks|\d+\s*months)\b/gi);
    if (matches) lockedTokens.push(...matches);
  });
  const uniqueTokens = [...new Set(lockedTokens)].slice(0, 5);

  let explanation = '';
  if (lang === 'hi') {
    explanation = `यह परामर्श आधिकारिक सरकारी कानून पर आधारित है। ${r.claims?.[0]?.text || ''} कृपया ध्यान रखें कि विनियामक प्रावधान जैसे ${uniqueTokens.join(', ') || 'सरकारी दिशानिर्देश'} कानूनी रूप से अपरिवर्तनीय और बाध्यकारी हैं।`;
  } else if (lang === 'pa') {
    explanation = `ਇਹ ਕਾਨੂੰਨੀ ਸਲਾਹ ਅਧਿਕਾਰਤ ਸਰਕਾਰੀ ਨਿਯਮਾਂ ਤੇ ਆਧਾਰਿਤ ਹੈ। ${r.claims?.[0]?.text || ''} ਕਾਨੂੰਨੀ ਪ੍ਰਾਵਧਾਨ ਜਿਵੇਂ ਕਿ ${uniqueTokens.join(', ') || 'ਸਰਕਾਰੀ ਨਿਯਮ'} ਅਦਾਲਤਾਂ ਦੁਆਰਾ ਸਖ਼ਤੀ ਨਾਲ ਲਾਗੂ ਕੀਤੇ ਜਾਂਦੇ ਹਨ।`;
  } else if (lang === 'ar') {
    explanation = `يستند هذا التوجيه إلى التشريعات الحكومية الرسمية. ${r.claims?.[0]?.text || ''} البنود القانونية المقفلة مثل ${uniqueTokens.join('، ') || 'اللوائح التنظيمية'} ملزمة قانوناً.`;
  } else if (lang === 'es') {
    explanation = `Esta respuesta se basa en la legislación oficial vigente. ${r.claims?.[0]?.text || ''} Los términos legales protegidos como ${uniqueTokens.join(', ') || 'disposiciones oficiales'} son de obligado cumplimiento.`;
  } else if (lang === 'fr') {
    explanation = `Cette directive est fondée sur les textes réglementaires officiels. ${r.claims?.[0]?.text || ''} Les dispositions statutaires telles que ${uniqueTokens.join(', ') || 'les règlements officiels'} sont strictement contraignantes.`;
  } else if (lang === 'zh') {
    explanation = `此法律与安置指引基于加拿大官方政府现行法规。${r.claims?.[0]?.text || ''} 请注意，法定监管条款如 ${uniqueTokens.join('、 ') || '官方法规条款'} 具有严格法律效力。`;
  }

  const p = el('p', explanation);
  card.append(p);
  return card;
}

// Pre-Flight KYC Compliance Banner
export function renderPreflightBanner(country, status) {
  const banner = $('#preflight-banner');
  if (!banner) return;
  banner.replaceChildren();

  const header = el('div', undefined, 'preflight-banner-header');
  const title = el('div', undefined, 'preflight-status-title');
  title.append(el('span', '🛡️ Pre-Flight KYC Compliance Shield', 'font-bold'));
  title.append(el('span', '· In-Person Rejection Prevention Guard', 'muted'));
  header.append(title);

  const chips = el('div', undefined, 'preflight-chips');
  const c1 = el('span', '✓ 90-Day Proof of Address Rule', 'preflight-chip chip-active');
  c1.title = 'Banks and registries strictly require proof of address issued within 90 days of registration.';
  const c2 = el('span', '✓ 6-Month Passport Validity Rule', 'preflight-chip chip-active');
  c2.title = 'Airlines and border control require foreign passports to be valid for at least 6 months.';
  const c3 = el('span', '✓ Certified Translation (ATIO/NAATI)', 'preflight-chip chip-active');
  c3.title = 'Foreign language documents require sworn or certified translation.';
  const c4 = el('span', '✓ Statutory Right-to-Work', 'preflight-chip chip-active');
  c4.title = 'Validates acceptable physical/digital right-to-work documents.';
  chips.append(c1, c2, c3, c4);
  header.append(chips);
  banner.append(header);
}

export function renderAirportKit() {
  const container = $('#airport-content');
  if (!container) return;
  const country = $('#airport-country')?.value || 'Canada';
  const kit = AIRPORT_KITS[country] || AIRPORT_KITS['Canada'];

  container.replaceChildren();

  // Hero Card
  const hero = el('div', undefined, 'airport-hero-card');
  const heroHeader = el('div', undefined, 'airport-hero-header');
  heroHeader.append(el('h2', `${country} · Airport Port-of-Entry Survival Guide`, 'airport-hero-title'));
  heroHeader.append(el('span', '✓ Cached Offline (PWA Ready)', 'airport-offline-pill'));
  hero.append(heroHeader);
  hero.append(el('p', `Major Gateway Airports: ${kit.airports}`, 'muted'));
  container.append(hero);

  const grid = el('div', undefined, 'airport-grid');

  // Customs & Currency Card
  const customsCard = el('div', undefined, 'airport-card');
  customsCard.append(el('h3', 'Customs Currency Declaration', 'airport-card-title'));
  customsCard.append(el('p', `Official Form: ${kit.customsForm}`));
  const cbox = el('div', undefined, 'customs-box');
  cbox.append(el('h4', 'Statutory Threshold Limit'));
  cbox.append(el('p', kit.customsLimit));
  cbox.append(el('p', kit.customsPenalty));
  customsCard.append(cbox);
  grid.append(customsCard);

  // Emergency Hotlines Card
  const emCard = el('div', undefined, 'airport-card');
  emCard.append(el('h3', 'Emergency & Essential Hotlines', 'airport-card-title'));
  const emStrip = el('div', undefined, 'emergency-strip');
  kit.emergency.forEach(em => {
    emStrip.append(el('span', `${em.num}: ${em.desc}`, 'emergency-tag'));
  });
  emCard.append(emStrip);
  grid.append(emCard);

  // Border Control Rights Card
  const rightsCard = el('div', undefined, 'airport-card');
  rightsCard.append(el('h3', 'Immigration Inspection & Rights', 'airport-card-title'));
  const rightsUl = el('ul');
  kit.borderRights.forEach(r => rightsUl.append(el('li', r)));
  rightsCard.append(rightsUl);
  grid.append(rightsCard);

  // First 48-Hours Card
  const f48Card = el('div', undefined, 'airport-card');
  f48Card.append(el('h3', 'First 48-Hour Survival Steps', 'airport-card-title'));
  const f48Ul = el('ul');
  kit.first48.forEach(s => f48Ul.append(el('li', s)));
  f48Card.append(f48Ul);
  grid.append(f48Card);

  container.append(grid);
}

export function renderPathway() {
  const container = $('#pathway-results');
  if (!container) return;

  const age = Number($('#pathway-age')?.value || 25);
  const edu = $('#pathway-edu')?.value || 'masters';
  const lang = $('#pathway-lang')?.value || 'clb9';
  const exp = Number($('#pathway-exp')?.value || 3);

  container.replaceChildren();

  // 1. Canada Express Entry CRS Estimation
  let crsAge = age <= 29 ? 110 : age <= 34 ? 95 : age <= 39 ? 70 : age <= 44 ? 35 : 0;
  let crsEdu = edu === 'phd' ? 150 : edu === 'masters' ? 135 : edu === 'bachelors' ? 120 : 98;
  let crsLang = lang === 'clb9' ? 136 : lang === 'clb7' ? 92 : 40;
  let crsTransfer = (edu === 'masters' || edu === 'phd') && lang === 'clb9' ? 50 : 25;
  if (exp >= 3 && lang === 'clb9') crsTransfer += 50;
  else if (exp >= 1) crsTransfer += 25;
  const totalCRS = crsAge + crsEdu + crsLang + crsTransfer;
  const caPass = totalCRS >= 465;

  const caCard = el('div', undefined, 'pathway-card');
  const caHdr = el('div', undefined, 'pathway-header');
  caHdr.append(el('h3', '🇨🇦 Canada · Express Entry', 'pathway-country'));
  caHdr.append(el('span', caPass ? 'Competitive CRS' : 'PNP Recommended', `pathway-status-badge ${caPass ? 'pathway-pass' : 'pathway-warn'}`));
  caCard.append(caHdr);
  caCard.append(el('div', `Estimated CRS: ${totalCRS}`, 'pathway-score'));
  caCard.append(el('p', caPass ? 'Strong profile for Express Entry Federal Skilled Worker (FSW) or Category-Based Draws (STEM, Healthcare, Trades).' : 'Consider Provincial Nominee Programs (OINP / BC PNP) or Canadian work experience to boost ranking.', 'pathway-desc'));
  caCard.append(el('div', `Breakdown: Age (${crsAge}) + Education (${crsEdu}) + Language (${crsLang}) + Skill Transfer (${crsTransfer})`, 'pathway-breakdown'));
  container.append(caCard);

  // 2. Australia SkillSelect (Subclass 189 / 190)
  let auAge = age <= 32 ? 30 : age <= 39 ? 25 : age <= 44 ? 15 : 0;
  let auEng = lang === 'clb9' ? 20 : lang === 'clb7' ? 10 : 0;
  let auEdu = edu === 'phd' ? 20 : edu === 'masters' || edu === 'bachelors' ? 15 : 10;
  let auExp = exp >= 3 ? 5 : 0;
  const totalAU = auAge + auEng + auEdu + auExp;
  const auPass = totalAU >= 65;

  const auCard = el('div', undefined, 'pathway-card');
  const auHdr = el('div', undefined, 'pathway-header');
  auHdr.append(el('h3', '🇦🇺 Australia · SkillSelect', 'pathway-country'));
  auHdr.append(el('span', auPass ? 'Eligible for EOI' : 'Below 65 Pass Mark', `pathway-status-badge ${auPass ? 'pathway-pass' : 'pathway-warn'}`));
  auCard.append(auHdr);
  auCard.append(el('div', `Points: ${totalAU} / Pass Mark: 65`, 'pathway-score'));
  auCard.append(el('p', auPass ? 'Qualifies to lodge an Expression of Interest (EOI) for Subclass 189 (Skilled Independent) or 190 (State Nominated).' : 'Requires additional English points (Superior PTE/IELTS 8+) or State Sponsorship (+5 pts for 190, +15 pts for 491) to meet the 65-point benchmark.', 'pathway-desc'));
  auCard.append(el('div', `Breakdown: Age (${auAge}) + English (${auEng}) + Education (${auEdu}) + Overseas Work (${auExp})`, 'pathway-breakdown'));
  container.append(auCard);

  // 3. United Kingdom Points-Based Skilled Worker
  const ukCard = el('div', undefined, 'pathway-card');
  const ukHdr = el('div', undefined, 'pathway-header');
  ukHdr.append(el('h3', '🇬🇧 UK · Skilled Worker Visa', 'pathway-country'));
  ukHdr.append(el('span', 'Sponsorship Required', 'pathway-status-badge pathway-warn'));
  ukCard.append(ukHdr);
  ukCard.append(el('div', 'Check current salary rules', 'pathway-score'));
  ukCard.append(el('p', 'Salary, occupation and sponsorship requirements depend on the current rules and the applicant’s circumstances. Verify official requirements before making an application.', 'pathway-desc'));
  ukCard.append(el('div', 'Eligibility not determined. Confirm accepted language evidence, occupation, salary and sponsorship requirements.', 'pathway-breakdown'));
  container.append(ukCard);

  // 4. Germany Chancenkarte (Opportunity Card)
  let deDeg = (edu === 'masters' || edu === 'phd' || edu === 'bachelors') ? 4 : 2;
  let deExp = exp >= 3 ? 3 : exp >= 1 ? 2 : 0;
  let deLang = lang === 'clb9' ? 1 : 0;
  let deAge = age <= 35 ? 2 : age <= 40 ? 1 : 0;
  const totalDE = deDeg + deExp + deLang + deAge;
  const dePass = totalDE >= 6;

  const deCard = el('div', undefined, 'pathway-card');
  const deHdr = el('div', undefined, 'pathway-header');
  deHdr.append(el('h3', '🇩🇪 Germany · Chancenkarte', 'pathway-country'));
  deHdr.append(el('span', dePass ? 'Eligible for Card' : 'Below 6 Points', `pathway-status-badge ${dePass ? 'pathway-pass' : 'pathway-warn'}`));
  deCard.append(deHdr);
  deCard.append(el('div', `Points: ${totalDE} / Pass Mark: 6`, 'pathway-score'));
  deCard.append(el('p', dePass ? 'Eligible for a 1-year German Opportunity Card job-search visa with 20 hours/week trial employment rights under the Skilled Immigration Act (FEG).' : 'Needs basic German language knowledge (A2 = 1 pt, B1 = 2 pts) to satisfy the 6-point statutory threshold.', 'pathway-desc'));
  deCard.append(el('div', `Breakdown: Degree Equivalence (${deDeg}) + Work Experience (${deExp}) + English C1 (${deLang}) + Age (${deAge})`, 'pathway-breakdown'));
  container.append(deCard);

  // 5. Express Entry & Visa Cutoff Historical Draw Probability Simulator
  const simCard = el('div', undefined, 'pathway-draw-card');
  const simHdr = el('div', undefined, 'pathway-draw-header');
  simHdr.append(el('h3', '🎯 Category-Based Express Entry Draw Probability Simulator'));
  simHdr.append(el('p', `Based on your estimated CRS score of ${totalCRS}, here is your invitation probability across past ministerial draw rounds:`, 'journey-milestone-cite'));
  simCard.append(simHdr);

  const simTbl = el('table', undefined, 'pathway-draw-table');
  const sThead = el('thead');
  const sTrh = el('tr');
  ['Express Entry Draw Category', 'Recent Historical Cutoff', 'Your Estimated Invitation Probability', 'Target Occupation Profiles'].forEach(h => sTrh.append(el('th', h)));
  sThead.append(sTrh);
  simTbl.append(sThead);

  const sTbody = el('tbody');
  const CUTOFFS = [
    ['General / All-Program Draw', '515–525 CRS', totalCRS >= 515 ? 'High (Next 1–3 Draws)' : totalCRS >= 495 ? 'Moderate (3–6 Months)' : 'Low (PNP Recommended)', totalCRS >= 515 ? 'badge-compliant' : totalCRS >= 495 ? 'badge-warn' : 'badge-danger', 'Open to all candidates across FSW, CEC, FST'],
    ['STEM Category Draw', '485–495 CRS', totalCRS >= 485 ? 'High (Direct ITA Expected)' : totalCRS >= 465 ? 'Moderate' : 'Low', totalCRS >= 485 ? 'badge-compliant' : totalCRS >= 465 ? 'badge-warn' : 'badge-danger', 'Software Engineers, Data Scientists, Web Developers'],
    ['Healthcare Category Draw', '430–445 CRS', totalCRS >= 430 ? 'High (Strong ITA Probability)' : 'Moderate', totalCRS >= 430 ? 'badge-compliant' : 'badge-warn', 'Physicians, Registered Nurses, Pharmacists, Dentists'],
    ['French Language Proficiency Draw', '380–410 CRS', totalCRS >= 380 ? 'High (Frequent Massive Draws)' : 'Moderate', totalCRS >= 380 ? 'badge-compliant' : 'badge-warn', 'Candidates with NCLC 7+ in all 4 French abilities'],
    ['Trades & Transport Draw', '430–450 CRS', totalCRS >= 430 ? 'High (Direct ITA Likely)' : 'Moderate', totalCRS >= 430 ? 'badge-compliant' : 'badge-warn', 'Electricians, Mechanics, Pilots, Heavy Equipment Operators']
  ];

  CUTOFFS.forEach(([cat, cutoff, prob, badgeCls, occ]) => {
    const tr = el('tr');
    tr.append(el('td', cat));
    tr.append(el('td', cutoff));
    const tdProb = el('td');
    tdProb.append(el('span', prob, `journey-milestone-badge ${badgeCls}`));
    tr.append(tdProb);
    tr.append(el('td', occ));
    sTbody.append(tr);
  });
  simTbl.append(sTbody);
  simCard.append(simTbl);

  // High-Yield Point Levers Grid
  const leversGrid = el('div', undefined, 'pathway-levers-grid');
  const l1 = el('div', undefined, 'pathway-lever-box');
  l1.append(el('div', '⚡ French NCLC 7 Language Mastery', 'pathway-lever-title'));
  l1.append(el('div', 'Adds up to +50 CRS points directly, plus unlocks French-category draws with low cutoffs (~390 CRS vs 520 General).', 'pathway-lever-desc'));

  const l2 = el('div', undefined, 'pathway-lever-box');
  l2.append(el('div', '⚡ Provincial Nominee Program (PNP)', 'pathway-lever-title'));
  l2.append(el('div', 'A provincial nomination (for example OINP, BC PNP or AAIP) adds 600 points to your Express Entry profile, which is usually enough for an invitation to apply.', 'pathway-lever-desc'));

  const l3 = el('div', undefined, 'pathway-lever-box');
  l3.append(el('div', '⚡ Sibling in Canada Benefit', 'pathway-lever-title'));
  l3.append(el('div', 'Having a Canadian citizen or permanent resident sibling residing in Canada awards +15 bonus CRS points.', 'pathway-lever-desc'));

  leversGrid.append(l1, l2, l3);
  simCard.append(leversGrid);

  container.append(simCard);
}

export function renderCashflow() {
  const container = $('#cashflow-results');
  if (!container) return;

  const destCity = $('#cashflow-dest')?.value || 'Toronto';
  const household = Number($('#cashflow-household')?.value || 1);
  const housingType = $('#cashflow-housing')?.value || '1bed';
  const savingsUSD = Number($('#cashflow-savings')?.value || 20000);

  const b = CITY_FINANCIAL_BENCHMARKS[destCity] || CITY_FINANCIAL_BENCHMARKS['Toronto'];
  container.replaceChildren();

  // Calculations (90-Day Horizon)
  const monthlyRent = b.rents[housingType] || b.rents['1bed'];
  const upfrontRentalLiquidity = Math.round(monthlyRent * b.depositMonths + (b.keyDeposit || 0));
  const remainingTwoMonthsRent = monthlyRent * 2;
  const total90DayRent = upfrontRentalLiquidity + remainingTwoMonthsRent;

  const pofIndex = Math.min(household - 1, b.statutoryPoF.length - 1);
  const statutoryPoF = b.statutoryPoF[pofIndex];

  const totalTransit90 = b.transitMonthly * household * 3;
  const totalHealth90 = b.healthMonthly * household * 3;
  const totalGroceries90 = b.groceriesPerPerson * household * 3;
  const total90DayLiving = totalTransit90 + totalHealth90 + totalGroceries90;

  const total90DayCashNeededLocal = total90DayRent + total90DayLiving;
  const total90DayCashNeededUSD = Math.round(total90DayCashNeededLocal * b.toUSD);

  const netSurplusUSD = savingsUSD - total90DayCashNeededUSD;
  const monthlyBurnUSD = Math.round((monthlyRent + (total90DayLiving / 3)) * b.toUSD);
  const runwayMonths = monthlyBurnUSD > 0 ? (savingsUSD / monthlyBurnUSD).toFixed(1) : '3.0+';

  const isSafe = netSurplusUSD >= 2000;
  const isWarn = netSurplusUSD >= 0 && netSurplusUSD < 2000;
  const cardCls = isSafe ? 'runway-safe' : isWarn ? 'runway-warn' : 'runway-danger';
  const badgeCls = isSafe ? 'badge-safe' : isWarn ? 'badge-warn' : 'badge-danger';
  const badgeText = isSafe ? 'Secure Runway (3+ Months)' : isWarn ? 'Tight Runway (60-90 Days)' : 'Deficit Risk (Underfunded)';

  // Hero Card
  const hero = el('div', undefined, `runway-hero-card ${cardCls}`);
  const heroHdr = el('div', undefined, 'runway-header');
  heroHdr.append(el('h2', `${destCity} · 90-Day Relocation Runway Assessment`, 'runway-title'));
  heroHdr.append(el('span', badgeText, `runway-badge ${badgeCls}`));
  hero.append(heroHdr);

  const statsGrid = el('div', undefined, 'runway-summary-stats');
  const s1 = el('div', undefined, 'runway-stat-box');
  s1.append(el('div', '90-Day Cash Needed', 'runway-stat-label'));
  s1.append(el('div', `${b.symbol}${total90DayCashNeededLocal.toLocaleString()} ${b.currency}`, 'runway-stat-value'));
  s1.append(el('div', `≈ $${total90DayCashNeededUSD.toLocaleString()} USD`, 'runway-stat-sub'));

  const s2 = el('div', undefined, 'runway-stat-box');
  s2.append(el('div', 'Available Savings', 'runway-stat-label'));
  s2.append(el('div', `$${savingsUSD.toLocaleString()} USD`, 'runway-stat-value'));
  s2.append(el('div', `Net reserve: ${netSurplusUSD >= 0 ? '+' : ''}$${netSurplusUSD.toLocaleString()} USD`, 'runway-stat-sub'));

  const s3 = el('div', undefined, 'runway-stat-box');
  s3.append(el('div', 'Runway Duration', 'runway-stat-label'));
  s3.append(el('div', `${runwayMonths} Months`, 'runway-stat-value'));
  s3.append(el('div', `Monthly burn ≈ $${monthlyBurnUSD.toLocaleString()} USD/mo`, 'runway-stat-sub'));

  statsGrid.append(s1, s2, s3);
  hero.append(statsGrid);
  container.append(hero);

  // Cards Grid
  const grid = el('div', undefined, 'cashflow-cards-grid');

  // Card 1: Statutory Capital
  const card1 = el('div', undefined, 'cashflow-card');
  card1.append(el('h3', '1. Statutory Proof of Funds', 'cashflow-card-title'));
  card1.append(el('p', b.statutoryRule, 'muted'));
  const l1 = el('div', undefined, 'cashflow-line-item');
  l1.append(el('span', `Legal PoF Requirement (${household} Person${household > 1 ? 's' : ''})`));
  l1.append(el('strong', `${b.symbol}${statutoryPoF.toLocaleString()} ${b.currency}`));
  const l1b = el('div', undefined, 'cashflow-line-item');
  l1b.append(el('span', 'Status'));
  l1b.append(el('span', 'Must be held unencumbered', 'cashflow-statutory-pill'));
  card1.append(l1, l1b);
  grid.append(card1);

  // Card 2: Upfront Rental Liquidity
  const card2 = el('div', undefined, 'cashflow-card');
  card2.append(el('h3', '2. Upfront Rental Liquidity', 'cashflow-card-title'));
  card2.append(el('p', b.depositRule, 'muted'));
  const l2a = el('div', undefined, 'cashflow-line-item');
  l2a.append(el('span', 'Day-1 Move-in (Rent + Deposit)'));
  l2a.append(el('strong', `${b.symbol}${upfrontRentalLiquidity.toLocaleString()} ${b.currency}`));
  const l2b = el('div', undefined, 'cashflow-line-item');
  l2b.append(el('span', 'Months 2 & 3 Rent'));
  l2b.append(el('span', `${b.symbol}${remainingTwoMonthsRent.toLocaleString()} ${b.currency}`));
  const l2c = el('div', undefined, 'cashflow-line-item');
  l2c.append(el('span', 'Total 90-Day Housing'));
  l2c.append(el('strong', `${b.symbol}${total90DayRent.toLocaleString()} ${b.currency}`));
  card2.append(l2a, l2b, l2c);
  grid.append(card2);

  // Card 3: Healthcare & Transit Burn
  const card3 = el('div', undefined, 'cashflow-card');
  card3.append(el('h3', '3. Healthcare & Living Burn', 'cashflow-card-title'));
  card3.append(el('p', b.healthNote, 'muted'));
  const l3a = el('div', undefined, 'cashflow-line-item');
  l3a.append(el('span', `Public Transit (90 Days, ${household} pass${household > 1 ? 'es' : ''})`));
  l3a.append(el('span', `${b.symbol}${totalTransit90.toLocaleString()} ${b.currency}`));
  const l3b = el('div', undefined, 'cashflow-line-item');
  l3b.append(el('span', 'Bridge Health Insurance (90 Days)'));
  l3b.append(el('span', `${b.symbol}${totalHealth90.toLocaleString()} ${b.currency}`));
  const l3c = el('div', undefined, 'cashflow-line-item');
  l3c.append(el('span', 'Groceries & Utilities (90 Days)'));
  l3c.append(el('span', `${b.symbol}${totalGroceries90.toLocaleString()} ${b.currency}`));
  card3.append(l3a, l3b, l3c);
  grid.append(card3);

  container.append(grid);
}

export function renderNewcomerBudget(data, container) {
  container.replaceChildren();
  const {
    city,
    province,
    household,
    savingsCad,
    initialUpfrontCosts,
    monthlyRecurringExpenses,
    monthlyGovernmentOffsets,
    netMonthlyBurnRate,
    remainingSavingsAfterUpfront,
    runwayMonths,
    runwaySafetyAssessment,
    bridgeHealthNotice
  } = data;

  const isSafe = runwayMonths >= 6;
  const isWarn = runwayMonths >= 3 && runwayMonths < 6;
  const statusCls = isSafe ? 'runway-safe' : isWarn ? 'runway-warn' : 'runway-danger';
  const badgeCls = isSafe ? 'badge-safe' : isWarn ? 'badge-warn' : 'badge-danger';
  const badgeText = isSafe ? 'Sustainable Runway (6+ Months)' : isWarn ? 'Moderate Runway (3–5 Months)' : 'Critical / High Risk (< 3 Months)';

  // Hero Card
  const hero = el('div', undefined, `runway-hero-card ${statusCls}`);
  const heroHdr = el('div', undefined, 'runway-header');
  heroHdr.append(el('h2', `${city} (${province}) · Canadian Newcomer Financial Runway`, 'runway-title'));
  heroHdr.append(el('span', badgeText, `runway-badge ${badgeCls}`));
  hero.append(heroHdr);

  const statsGrid = el('div', undefined, 'runway-summary-stats');

  const s1 = el('div', undefined, 'runway-stat-box');
  s1.append(el('div', 'Runway Duration', 'runway-stat-label'));
  s1.append(el('div', `${runwayMonths} Months`, 'runway-stat-value'));
  s1.append(el('div', `Savings: $${savingsCad.toLocaleString()} CAD`, 'runway-stat-sub'));

  const s2 = el('div', undefined, 'runway-stat-box');
  s2.append(el('div', 'Net Monthly Burn', 'runway-stat-label'));
  s2.append(el('div', `$${netMonthlyBurnRate.toLocaleString()} CAD/mo`, 'runway-stat-value'));
  s2.append(el('div', `After $${monthlyGovernmentOffsets.totalMonthlyGovernmentCredits} CAD offsets`, 'runway-stat-sub'));

  const s3 = el('div', undefined, 'runway-stat-box');
  s3.append(el('div', 'Day-1 Upfront Cash', 'runway-stat-label'));
  s3.append(el('div', `$${initialUpfrontCosts.totalOneTimeUpfront.toLocaleString()} CAD`, 'runway-stat-value'));
  s3.append(el('div', 'Rent deposit + stay + essentials', 'runway-stat-sub'));

  const s4 = el('div', undefined, 'runway-stat-box');
  s4.append(el('div', 'Remaining Reserve', 'runway-stat-label'));
  s4.append(el('div', `$${remainingSavingsAfterUpfront.toLocaleString()} CAD`, 'runway-stat-value'));
  s4.append(el('div', 'Net post-move-in liquidity', 'runway-stat-sub'));

  statsGrid.append(s1, s2, s3, s4);
  hero.append(statsGrid);

  const recP = el('p', runwaySafetyAssessment, 'runway-stat-sub');
  recP.style.marginTop = '1rem';
  recP.style.fontSize = '0.95rem';
  hero.append(recP);

  if (bridgeHealthNotice) {
    const healthP = el('div', bridgeHealthNotice, 'vault-consent-banner');
    healthP.style.marginTop = '1rem';
    hero.append(healthP);
  }

  container.append(hero);

  // Cards Grid
  const grid = el('div', undefined, 'cashflow-cards-grid');

  // Card 1: Monthly Expenses Breakdown
  const card1 = el('div', undefined, 'cashflow-card');
  card1.append(el('h3', '1. Monthly Living Expenses', 'cashflow-card-title'));
  card1.append(el('p', `Official ONFB / BCCDC food basket & CMHC rents (${household.replace(/_/g, ' ')}).`, 'muted'));

  const mLines = [
    ['Housing Rent (CMHC Median)', `$${monthlyRecurringExpenses.rent.toLocaleString()} CAD`],
    ['Nutritious Food Basket (Official)', `$${monthlyRecurringExpenses.foodBasketOfficial.toLocaleString()} CAD`],
    ['Public Transit Fares', `$${monthlyRecurringExpenses.transit.toLocaleString()} CAD`],
    ['Utilities & High-Speed Internet', `$${monthlyRecurringExpenses.utilitiesAndInternet.toLocaleString()} CAD`],
    ['Mobile Phone Plans', `$${monthlyRecurringExpenses.mobilePlans.toLocaleString()} CAD`],
    ['Tenant Liability Insurance', `$${monthlyRecurringExpenses.tenantInsurance.toLocaleString()} CAD`],
    ['Total Gross Monthly Expense', `$${monthlyRecurringExpenses.totalMonthlyExpenses.toLocaleString()} CAD`]
  ];
  mLines.forEach(([label, val], idx) => {
    const row = el('div', undefined, 'cashflow-line-item');
    row.append(el(idx === mLines.length - 1 ? 'strong' : 'span', label));
    row.append(el(idx === mLines.length - 1 ? 'strong' : 'span', val));
    card1.append(row);
  });
  grid.append(card1);

  // Card 2: Federal & Provincial Credits
  const card2 = el('div', undefined, 'cashflow-card');
  card2.append(el('h3', '2. Newcomer Tax Credits & Benefits', 'cashflow-card-title'));
  card2.append(el('p', 'Benefits are not assumed in this budget. Include only confirmed recurring payments in your monthly income; check eligibility and payment timing with the issuing agency.', 'muted'));
  const bLines = [
    ['Canada Child Benefit (CCB)', `$${monthlyGovernmentOffsets.canadaChildBenefit.toLocaleString()} CAD/mo`],
    ['GST/HST Credit (Form RC151)', `$${monthlyGovernmentOffsets.gstHstQuarterlyCreditMonthlyEquivalent.toLocaleString()} CAD/mo`],
    ['Unconfirmed Benefits Excluded', `-$${monthlyGovernmentOffsets.totalMonthlyGovernmentCredits.toLocaleString()} CAD/mo`],
    ['Net Monthly Living Burn', `$${netMonthlyBurnRate.toLocaleString()} CAD/mo`]
  ];
  bLines.forEach(([label, val], idx) => {
    const row = el('div', undefined, 'cashflow-line-item');
    row.append(el(idx >= 2 ? 'strong' : 'span', label));
    row.append(el(idx >= 2 ? 'strong' : 'span', val));
    card2.append(row);
  });
  grid.append(card2);

  // Card 3: Upfront Liquidity
  const card3 = el('div', undefined, 'cashflow-card');
  card3.append(el('h3', '3. First Month Move-In Liquidity', 'cashflow-card-title'));
  card3.append(el('p', 'Day-1 cash needed for lease signing, security deposit, temporary stay and winter essentials.', 'muted'));
  const uLines = [
    ['First Month Rent', `$${initialUpfrontCosts.firstMonthRent.toLocaleString()} CAD`],
    ['Statutory Rent Deposit (Last Mo / Sec)', `$${initialUpfrontCosts.statutoryRentDeposit.toLocaleString()} CAD`],
    ['Temporary Stay (First 10 Days)', `$${initialUpfrontCosts.temporaryStayFirst10Days.toLocaleString()} CAD`],
    ['Winter Clothing & Boots', `$${initialUpfrontCosts.winterClothingAndEssentials.toLocaleString()} CAD`],
    ['SIM Card & Setup Fees', `$${initialUpfrontCosts.mobileSimAndHardwareSetup.toLocaleString()} CAD`],
    ['Bridge Private Health Insurance', `$${initialUpfrontCosts.privateBridgeHealthInsurance.toLocaleString()} CAD`],
    ['Total Upfront Liquidity Needed', `$${initialUpfrontCosts.totalOneTimeUpfront.toLocaleString()} CAD`]
  ];
  uLines.forEach(([label, val], idx) => {
    const row = el('div', undefined, 'cashflow-line-item');
    row.append(el(idx === uLines.length - 1 ? 'strong' : 'span', label));
    row.append(el(idx === uLines.length - 1 ? 'strong' : 'span', val));
    card3.append(row);
  });
  grid.append(card3);

  container.append(grid);
}

export function renderTenancyWizard() {
  const container = $('#tenancy-results');
  if (!container) return;
  container.innerHTML = '';

  const dest = $('#tenancy-dest')?.value || 'CA-ON';
  const issue = $('#tenancy-issue')?.value || 'advance_rent';
  const rent = Number($('#tenancy-rent')?.value || 2200);
  const demand = Number($('#tenancy-demand')?.value || 13200);

  const res = evaluateTenancyDispute({ dest, issue, rent, demand });

  // Hero Card: Statutory Verdict
  const hero = el('div', undefined, `tenancy-verdict-card verdict-${res.status}`);
  const heroHeader = el('div', undefined, 'tenancy-verdict-header');
  heroHeader.append(el('h2', res.title, 'tenancy-verdict-title'));
  heroHeader.append(el('span', res.statusBadge, `tenancy-badge badge-${res.status}`));
  hero.append(heroHeader);
  hero.append(el('p', res.summary, 'tenancy-summary-text'));

  // Statutory Citation Pill
  const citPill = el('div', `Governing Law: ${res.citation}`, 'cashflow-statutory-pill');
  citPill.style.display = 'inline-block';
  citPill.style.marginTop = '8px';
  citPill.style.padding = '4px 8px';
  hero.append(citPill);

  // Financial Stats Grid (if quantitative)
  if (res.overcharge > 0 || res.lawfulLimit > 0) {
    const statsGrid = el('div', undefined, 'tenancy-summary-stats');

    const s1 = el('div', undefined, 'tenancy-stat-box');
    s1.append(el('div', 'Monthly Rent', 'tenancy-stat-label'));
    s1.append(el('div', `${res.j.symbol}${rent.toLocaleString()} ${res.j.currency}`, 'tenancy-stat-value'));
    s1.append(el('div', 'Agreed tenancy rate', 'tenancy-stat-sub'));

    const s2 = el('div', undefined, 'tenancy-stat-box');
    s2.append(el('div', 'Demanded by Landlord', 'tenancy-stat-label'));
    s2.append(el('div', `${res.j.symbol}${demand.toLocaleString()} ${res.j.currency}`, 'tenancy-stat-value danger'));
    s2.append(el('div', 'Claimed amount', 'tenancy-stat-sub'));

    const s3 = el('div', undefined, 'tenancy-stat-box');
    s3.append(el('div', 'Statutory Lawful Cap', 'tenancy-stat-label'));
    s3.append(el('div', typeof res.lawfulLimit === 'number' ? `${res.j.symbol}${res.lawfulLimit.toLocaleString()} ${res.j.currency}` : res.lawfulText, 'tenancy-stat-value safe'));
    s3.append(el('div', 'Maximum permitted by law', 'tenancy-stat-sub'));

    const s4 = el('div', undefined, 'tenancy-stat-box');
    s4.append(el('div', 'Unlawful Overcharge', 'tenancy-stat-label'));
    s4.append(el('div', `${res.j.symbol}${res.overcharge.toLocaleString()} ${res.j.currency}`, 'tenancy-stat-value danger'));
    s4.append(el('div', res.overcharge > 0 ? 'Excess illegal payment' : 'No financial overcharge', 'tenancy-stat-sub'));

    statsGrid.append(s1, s2, s3, s4);
    hero.append(statsGrid);
  }

  container.append(hero);

  // Playbook Card: Step-by-Step Defense Protocol
  const pbCard = el('div', undefined, 'tenancy-playbook-card');
  pbCard.append(el('h3', 'Step-by-Step Tenant Defense Protocol', 'tenancy-playbook-title'));
  const pbList = el('ol', undefined, 'tenancy-playbook-list');
  res.playbook.forEach(item => {
    pbList.append(el('li', item));
  });
  pbCard.append(pbList);
  container.append(pbCard);

  // Formal Dispute Notice Letter Card
  const letterCard = el('div', undefined, 'tenancy-letter-card');
  const letterHeader = el('div', undefined, 'tenancy-letter-header');
  letterHeader.append(el('h3', 'Official Statutory Dispute Letter (Ready to Send)', 'tenancy-letter-title'));

  const copyBtn = el('button', '📋 Copy Letter to Clipboard', 'primary tenancy-copy-btn');
  copyBtn.type = 'button';
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(res.disputeLetter);
      copyBtn.textContent = '✓ Copied to Clipboard!';
      setTimeout(() => { copyBtn.textContent = '📋 Copy Letter to Clipboard'; }, 3000);
    } catch {
      copyBtn.textContent = 'Selected (Ctrl+C to copy)';
    }
  });
  letterHeader.append(copyBtn);

  const pdfDisputeBtn = el('button', '📄 Download Notice PDF', 'primary tenancy-copy-btn');
  pdfDisputeBtn.type = 'button';
  pdfDisputeBtn.style.marginLeft = '8px';
  pdfDisputeBtn.addEventListener('click', () => {
    const pdfFields = [
      { label: 'Dispute Jurisdiction', val: res.j.jurisdiction },
      { label: 'Statutory Authority', val: res.j.authority },
      { label: 'Monthly Agreed Rent', val: `${res.j.symbol}${rent.toLocaleString()} ${res.j.currency}` },
      { label: 'Demanded by Landlord', val: `${res.j.symbol}${demand.toLocaleString()} ${res.j.currency}` },
      { label: 'Statutory Lawful Cap', val: typeof res.lawfulLimit === 'number' ? `${res.j.symbol}${res.lawfulLimit.toLocaleString()}` : res.lawfulText },
      { label: 'Unlawful Overcharge Claimed', val: `${res.j.symbol}${res.overcharge.toLocaleString()}` },
      { label: 'Prescribed Tribunal Application', val: res.j.tribunalForm }
    ];
    const pdfContent = generateVectorPDF('FORMAL STATUTORY TENANCY DISPUTE NOTICE', 'RESIDENTIAL TENANCY DISPUTE', 'Notice of Unlawful Demand & Overcharge', res.j.statute, pdfFields);
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'statutory-tenancy-dispute-notice.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
  letterHeader.append(pdfDisputeBtn);
  letterCard.append(letterHeader);

  const letterPre = el('pre', res.disputeLetter, 'tenancy-letter-body');
  letterCard.append(letterPre);
  container.append(letterCard);

  // Tribunal & Official Form Card
  const tribCard = el('div', undefined, 'tenancy-tribunal-card');
  tribCard.append(el('h3', `Statutory Authority & Tribunal Application: ${res.j.authority}`, 'tenancy-tribunal-header'));
  const p1 = el('p', undefined, 'tenancy-tribunal-info');
  p1.append(el('strong', 'Prescribed Form: '));
  p1.append(document.createTextNode(res.j.tribunalForm));
  const p2 = el('p', undefined, 'tenancy-tribunal-info');
  p2.append(el('strong', 'How to File: '));
  p2.append(document.createTextNode(res.j.tribunalHelp));
  tribCard.append(p1, p2);
  container.append(tribCard);
}

export function renderTaxEngine() {
  const origin = $('#tax-origin')?.value || 'India';
  const dest = $('#tax-dest')?.value || 'Canada';
  const assetsUSD = parseFloat($('#tax-assets')?.value || '125000');
  const incomeUSD = parseFloat($('#tax-income')?.value || '8000');
  const firstYear = $('#tax-first-year')?.value || 'yes';
  const bankBalanceUSD = parseFloat($('#tax-bank-balance')?.value || '25000');

  const assetsCAD = Math.round(assetsUSD * 1.36);
  const treaty = (DTAA_MATRIX[origin] && DTAA_MATRIX[origin][dest]) || { interest: '15%', dividends: '15%', royalties: '15%', treatyArticle: 'OECD Model Bilateral Double Taxation Convention', withholdingNote: 'Standard statutory foreign tax credit mechanism applies' };

  let statusBadge = 'FIRST-YEAR EXEMPT';
  let badgeCls = 'badge-compliant';
  let triggerTitle = 'CRA Form T1135: First-Year Statutory Exemption';
  let triggerDesc = 'Under Income Tax Act subsection 233.3(1), an individual who was a non-resident in the previous taxation year is statutory EXEMPT from filing Form T1135 for the year in which they established Canadian tax residency. Form T1135 filing will only apply starting in year 2 if specified foreign property cost base exceeds CAD $100,000.';
  let calloutClass = 'trigger-exempt';

  if (dest === 'Canada') {
    if (firstYear === 'yes') {
      statusBadge = 'FIRST-YEAR EXEMPT';
      badgeCls = 'badge-compliant';
      triggerTitle = 'CRA Form T1135: First-Year Statutory Exemption';
      triggerDesc = 'Under Income Tax Act s.233.3(1), an individual who was a non-resident in the previous taxation year is statutory EXEMPT from filing Form T1135 for the year in which they established Canadian tax residency. Form T1135 filing will only apply starting in year 2 if foreign property cost exceeds CAD $100,000.';
      calloutClass = 'trigger-exempt';
    } else if (assetsCAD > 100000) {
      statusBadge = 'MANDATORY DISCLOSURE';
      badgeCls = 'badge-danger';
      triggerTitle = 'CRA Form T1135: Mandatory Foreign Income Verification';
      triggerDesc = `Your foreign cost base is approx. CAD $${assetsCAD.toLocaleString()}, exceeding the CAD $100,000 threshold. You must submit Form T1135 by your tax return due date (April 30 / June 15). Non-filing penalty: CAD $25/day up to CAD $2,500 per tax year (ITA s.162(7)).`;
      calloutClass = 'trigger-active';
    } else {
      statusBadge = 'BELOW THRESHOLD';
      badgeCls = 'badge-warn';
      triggerTitle = 'Below CRA CAD $100,000 T1135 Threshold';
      triggerDesc = `Foreign cost base of CAD $${assetsCAD.toLocaleString()} is below the statutory CAD $100,000 reporting threshold. Regular reporting of foreign investment income on T1 line 12100 still applies.`;
      calloutClass = 'trigger-exempt';
    }
  } else if (dest === 'United States') {
    if (bankBalanceUSD > 10000) {
      statusBadge = 'MANDATORY FBAR';
      badgeCls = 'badge-danger';
      triggerTitle = 'FinCEN Form 114 (FBAR) Mandatory Filing';
      triggerDesc = `Foreign account peak balance ($${bankBalanceUSD.toLocaleString()} USD) exceeds the USD $10,000 aggregate threshold. Mandatory electronic filing via BSA E-Filing System by April 15 (auto-extension to October 15). Non-willful failure penalty: up to $15,611 per violation under 31 U.S.C. 5321.`;
      calloutClass = 'trigger-active';
    } else {
      statusBadge = 'BELOW FBAR THRESHOLD';
      badgeCls = 'badge-compliant';
      triggerTitle = 'Below USD $10,000 FBAR Threshold';
      triggerDesc = 'Aggregate foreign account balances did not exceed $10,000 USD at any point during the calendar year.';
      calloutClass = 'trigger-exempt';
    }
  } else if (dest === 'United Kingdom') {
    statusBadge = 'HMRC REGIME';
    badgeCls = 'badge-warn';
    triggerTitle = 'HMRC Worldwide Income & Foreign Income and Gains (FIG)';
    triggerDesc = 'Newcomers qualifying for the 4-year Foreign Income and Gains (FIG) regime (replacing remittance basis) can claim relief from UK tax on foreign income and gains for their first 4 tax years of UK residence. The relief has to be claimed on the tax return.';
    calloutClass = 'trigger-exempt';
  } else if (dest === 'Australia') {
    statusBadge = 'ATO TAX RESIDENT';
    badgeCls = 'badge-warn';
    triggerTitle = 'ATO Worldwide Income Taxation';
    triggerDesc = 'From the date you become an Australian resident for tax purposes, you must declare all foreign income. Foreign Income Tax Offset (FITO) prevents double taxation by crediting foreign taxes paid.';
    calloutClass = 'trigger-exempt';
  } else if (dest === 'Germany') {
    statusBadge = 'PROGRESSIONSVORBEHALT';
    badgeCls = 'badge-warn';
    triggerTitle = 'German EStG § 32b Progressionsvorbehalt';
    triggerDesc = 'Foreign income exempt from German tax under the DTAA must still be reported on Anlage AUS / WA-ESt to calculate your progressive personal income tax rate on German income.';
    calloutClass = 'trigger-exempt';
  }

  const container = $('#tax-results');
  if (!container) return;
  container.innerHTML = '';

  const card = el('div', undefined, 'tax-verdict-card');
  const header = el('div', undefined, 'tax-verdict-header');
  header.append(el('h2', `${origin} → ${dest} Cross-Border Tax Assessment`, 'tax-verdict-title'));
  header.append(el('span', statusBadge, `tax-verdict-badge ${badgeCls}`));
  card.append(header);

  const metricsGrid = el('div', undefined, 'tax-grid-metrics');

  const b1 = el('div', undefined, 'tax-metric-box');
  b1.append(el('div', 'Foreign Assets Base', 'tax-metric-label'));
  b1.append(el('div', `$${assetsUSD.toLocaleString()} USD`, 'tax-metric-val'));
  if (dest === 'Canada') b1.append(el('div', `~CAD $${assetsCAD.toLocaleString()}`, 'tenancy-stat-sub'));

  const b2 = el('div', undefined, 'tax-metric-box');
  b2.append(el('div', 'Foreign Bank Peak', 'tax-metric-label'));
  b2.append(el('div', `$${bankBalanceUSD.toLocaleString()} USD`, 'tax-metric-val'));
  b2.append(el('div', bankBalanceUSD > 10000 ? 'Exceeds FBAR $10k' : 'Below FBAR $10k', 'tenancy-stat-sub'));

  const b3 = el('div', undefined, 'tax-metric-box');
  b3.append(el('div', 'Annual Foreign Income', 'tax-metric-label'));
  b3.append(el('div', `$${incomeUSD.toLocaleString()} USD`, 'tax-metric-val'));
  b3.append(el('div', 'Dividends / Interest', 'tenancy-stat-sub'));

  const b4 = el('div', undefined, 'tax-metric-box');
  b4.append(el('div', 'Parental Cash Gift Tax', 'tax-metric-label'));
  b4.append(el('div', '0% (Tax-Free)', 'tax-metric-val safe'));
  b4.append(el('div', 'Non-taxable capital transfer', 'tenancy-stat-sub'));

  metricsGrid.append(b1, b2, b3, b4);
  card.append(metricsGrid);

  const callout = el('div', undefined, `tax-callout ${calloutClass}`);
  callout.append(el('strong', triggerTitle + ': '));
  callout.append(document.createTextNode(triggerDesc));
  card.append(callout);

  // Parental Gift Shield Note
  const giftNote = el('div', undefined, 'tax-callout trigger-exempt');
  giftNote.append(el('strong', 'Statutory Newcomer Cash Gift Shield: '));
  giftNote.append(document.createTextNode('In Canada (and under standard Anglo-American common law tax codes), bona fide cash gifts or inheritances received from parents abroad are NOT considered taxable income under the Income Tax Act. Retain bank wire receipts and a signed parental gift letter to substantiate the transfer with FINTRAC or CRA upon request.'));
  card.append(giftNote);

  container.append(card);

  // DTAA Treaty Table Card
  const treatyCard = el('div', undefined, 'tax-treaty-card');
  treatyCard.append(el('h3', `Bilateral DTAA Treaty Rates: ${origin} & ${dest}`));
  const subP = el('p', `Governing Agreement: ${treaty.treatyArticle}`, 'journey-milestone-cite');
  treatyCard.append(subP);

  const tbl = el('table', undefined, 'tax-treaty-table');
  const thead = el('thead');
  const trh = el('tr');
  ['Income Category', 'Treaty Maximum Withholding Rate', 'Double Tax Relief Mechanism'].forEach(h => {
    trh.append(el('th', h));
  });
  thead.append(trh);
  tbl.append(thead);

  const tbody = el('tbody');
  const rows = [
    ['Interest (Bank Deposits / Bonds)', treaty.interest, treaty.withholdingNote],
    ['Dividends (Equities / Mutual Funds)', treaty.dividends, treaty.withholdingNote],
    ['Royalties / Technical Services', treaty.royalties, treaty.withholdingNote],
    ['Capital Gains on Real Estate', 'Taxed in country where property is located', 'Foreign tax credit applied in residence state']
  ];
  rows.forEach(([cat, rate, relief]) => {
    const tr = el('tr');
    tr.append(el('td', cat));
    tr.append(el('td', rate));
    tr.append(el('td', relief));
    tbody.append(tr);
  });
  tbl.append(tbody);
  treatyCard.append(tbl);

  container.append(treatyCard);
}

export function renderPaycheckSimulator() {
  const destKey = $('#paycheck-dest')?.value || 'Toronto';
  const grossAnnual = parseFloat($('#paycheck-gross')?.value || '85000');
  const pensionPct = parseFloat($('#paycheck-pension')?.value || '0');

  const profile = PAYCHECK_DESTS[destKey] || PAYCHECK_DESTS.Toronto;
  const grossMonthly = grossAnnual / 12;

  // Calculate Deductions
  let fedTaxAnnual = grossAnnual * profile.fedRate;
  let provTaxAnnual = grossAnnual * profile.provRate;
  let pensionAnnual = grossAnnual * (pensionPct / 100);

  let socialContribAnnual = 0;
  let healthContribAnnual = 0;

  if (profile.country === 'Canada') {
    socialContribAnnual = Math.min(grossAnnual * profile.cppRate, profile.cppCap);
    healthContribAnnual = Math.min(grossAnnual * profile.eiRate, profile.eiCap);
  } else if (profile.country === 'USA') {
    socialContribAnnual = Math.min(grossAnnual * (profile.ficaRate * 0.8), profile.ficaCap);
    healthContribAnnual = grossAnnual * (profile.ficaRate * 0.2);
  } else if (profile.country === 'UK') {
    socialContribAnnual = Math.min(grossAnnual * profile.niRate, profile.niCap);
  } else if (profile.country === 'Germany') {
    socialContribAnnual = grossAnnual * (profile.socRate * 0.5);
    healthContribAnnual = grossAnnual * (profile.socRate * 0.5);
  } else if (profile.country === 'Australia') {
    healthContribAnnual = grossAnnual * 0.02; // Medicare levy
  }

  const totalDeductionsAnnual = fedTaxAnnual + provTaxAnnual + socialContribAnnual + healthContribAnnual + pensionAnnual;
  const netAnnual = Math.max(0, grossAnnual - totalDeductionsAnnual);
  const netMonthly = netAnnual / 12;

  const totalDeductionsMonthly = totalDeductionsAnnual / 12;
  const effectiveTaxRate = (totalDeductionsAnnual / grossAnnual) * 100;

  // Living Affordability
  const monthlyLivingNeed = profile.medianRent + profile.groceries;
  const rentToIncomeRatio = (profile.medianRent / netMonthly) * 100;
  const discretionaryRunway = netMonthly - monthlyLivingNeed;

  let feasibilityBadge = 'COMFORTABLE SURPLUS';
  let badgeCls = 'badge-compliant';
  let feasibilityNote = 'Net monthly take-home income comfortably covers median 1-bedroom rent and groceries with a healthy savings buffer.';

  if (rentToIncomeRatio > 65 || discretionaryRunway < 0) {
    feasibilityBadge = 'HIGH FINANCIAL STRESS';
    badgeCls = 'badge-danger';
    feasibilityNote = 'Rent consumes over 65% of net take-home salary. Discretionary savings will be negative or precarious without roommates or secondary income.';
  } else if (rentToIncomeRatio > 50) {
    feasibilityBadge = 'TIGHT MARGIN';
    badgeCls = 'badge-warn';
    feasibilityNote = 'Housing costs exceed 50% of net monthly income. Budget is workable but leaves modest discretionary breathing room.';
  } else if (rentToIncomeRatio > 35) {
    feasibilityBadge = 'BALANCED RUNWAY';
    badgeCls = 'badge-warn';
    feasibilityNote = 'Standard healthy newcomer budget ratio (35–50% rent-to-income). Sufficient for groceries, transit, and modest emergency reserves.';
  }

  const container = $('#paycheck-results');
  if (!container) return;
  container.innerHTML = '';

  // Summary Card
  const summaryCard = el('div', undefined, 'paycheck-summary-card');
  const header = el('div', undefined, 'paycheck-summary-header');
  header.append(el('h2', `${destKey} Net Take-Home Paycheck Analysis`, 'paycheck-summary-title'));
  header.append(el('span', feasibilityBadge, `paycheck-badge ${badgeCls}`));
  summaryCard.append(header);

  const metricsGrid = el('div', undefined, 'paycheck-metrics-grid');

  const b1 = el('div', undefined, 'paycheck-metric-box');
  b1.append(el('div', 'Net Monthly Take-Home', 'paycheck-metric-label'));
  b1.append(el('div', `${profile.symbol}${Math.round(netMonthly).toLocaleString()} ${profile.currency}`, 'paycheck-metric-val highlight'));
  b1.append(el('div', `${profile.symbol}${Math.round(netAnnual).toLocaleString()} annual in-hand`, 'paycheck-metric-sub'));

  const b2 = el('div', undefined, 'paycheck-metric-box');
  b2.append(el('div', 'Effective Tax & Statutory Rate', 'paycheck-metric-label'));
  b2.append(el('div', `${effectiveTaxRate.toFixed(1)}%`, 'paycheck-metric-val'));
  b2.append(el('div', 'Combined statutory withholding', 'paycheck-metric-sub'));

  const b3 = el('div', undefined, 'paycheck-metric-box');
  b3.append(el('div', 'Median 1-Bed Rent (City)', 'paycheck-metric-label'));
  b3.append(el('div', `${profile.symbol}${profile.medianRent.toLocaleString()} ${profile.currency}`, 'paycheck-metric-val'));
  b3.append(el('div', `${rentToIncomeRatio.toFixed(1)}% of net salary`, 'paycheck-metric-sub'));

  const b4 = el('div', undefined, 'paycheck-metric-box');
  b4.append(el('div', 'Discretionary Savings Monthly', 'paycheck-metric-label'));
  b4.append(el('div', `${profile.symbol}${Math.round(discretionaryRunway).toLocaleString()} ${profile.currency}`, `paycheck-metric-val ${discretionaryRunway >= 0 ? 'safe' : 'danger'}`));
  b4.append(el('div', 'After rent + groceries', 'paycheck-metric-sub'));

  metricsGrid.append(b1, b2, b3, b4);
  summaryCard.append(metricsGrid);

  const callout = el('div', undefined, `tax-callout ${discretionaryRunway >= 0 ? 'trigger-exempt' : 'trigger-active'}`);
  callout.append(el('strong', 'Affordability Verdict: '));
  callout.append(document.createTextNode(feasibilityNote));
  summaryCard.append(callout);

  container.append(summaryCard);

  // Statutory Deduction Breakdown Table Card
  const tableCard = el('div', undefined, 'paycheck-breakdown-card');
  tableCard.append(el('h3', `Statutory Payroll Deductions: ${profile.taxLaw}`));

  const tbl = el('table', undefined, 'paycheck-breakdown-table');
  const thead = el('thead');
  const trh = el('tr');
  ['Payroll Deduction Component', 'Statutory Authority', 'Monthly Deduction', 'Annual Deduction'].forEach(h => trh.append(el('th', h)));
  thead.append(trh);
  tbl.append(thead);

  const tbody = el('tbody');
  const rows = [
    ['Gross Salary', 'Agreed Employment Contract', `${profile.symbol}${Math.round(grossMonthly).toLocaleString()}`, `${profile.symbol}${grossAnnual.toLocaleString()}`],
    ['Federal Income Tax', 'National Revenue Authority', `-${profile.symbol}${Math.round(fedTaxAnnual / 12).toLocaleString()}`, `-${profile.symbol}${Math.round(fedTaxAnnual).toLocaleString()}`],
    ['Provincial / State Tax', profile.prov + ' Department of Revenue', `-${profile.symbol}${Math.round(provTaxAnnual / 12).toLocaleString()}`, `-${profile.symbol}${Math.round(provTaxAnnual).toLocaleString()}`],
    ['Social Security / Pension / CPP / NI', 'National Pension Code', `-${profile.symbol}${Math.round(socialContribAnnual / 12).toLocaleString()}`, `-${profile.symbol}${Math.round(socialContribAnnual).toLocaleString()}`],
    ['Healthcare Levy / EI / Medicare', 'Statutory Healthcare & Safety Net', `-${profile.symbol}${Math.round(healthContribAnnual / 12).toLocaleString()}`, `-${profile.symbol}${Math.round(healthContribAnnual).toLocaleString()}`],
    ['Voluntary Retirement / Match', `${pensionPct}% Defined Contribution`, `-${profile.symbol}${Math.round(pensionAnnual / 12).toLocaleString()}`, `-${profile.symbol}${Math.round(pensionAnnual).toLocaleString()}`],
    ['Net Monthly In-Hand Pay', 'Deposit into Retail Chequing Account', `${profile.symbol}${Math.round(netMonthly).toLocaleString()}`, `${profile.symbol}${Math.round(netAnnual).toLocaleString()}`]
  ];

  rows.forEach(([comp, auth, mo, yr], idx) => {
    const tr = el('tr');
    if (idx === rows.length - 1) tr.style.fontWeight = 'bold';
    tr.append(el('td', comp));
    tr.append(el('td', auth));
    tr.append(el('td', mo));
    tr.append(el('td', yr));
    tbody.append(tr);
  });
  tbl.append(tbody);
  tableCard.append(tbl);

  container.append(tableCard);
}

export async function renderCareersSuite() {
  const profession = $('#licensing-profession')?.value || 'engineering';
  const jurisdiction = $('#licensing-jurisdiction')?.value || 'Canada';
  const container = $('#licensing-results');
  if (!container) return;

  if (profession === 'tech') {
    const data = LICENSING_DATA.tech;
    container.innerHTML = `
      <div class="licensing-roadmap-card">
        <div class="licensing-roadmap-header">
          <h3>Statutory Credential Roadmap: ${data.title}</h3>
          <span class="journey-milestone-cite">${data.body}</span>
        </div>
        <div class="licensing-step-list">
          ${data.steps.map(s => `
            <div class="licensing-step-item">
              <div class="licensing-step-num">${s.num}</div>
              <div class="licensing-step-content">
                <h4 class="licensing-step-title">${s.title}</h4>
                <p class="licensing-step-desc">${s.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    return;
  }

  // If Canada, fetch authoritative statutory pathway
  if (jurisdiction === 'Canada') {
    container.innerHTML = '<p class="muted">Loading official statutory licensing roadmap...</p>';
    try {
      const res = await fetch(`/v1/tools/credential-pathway?profession=${encodeURIComponent(profession)}&province=ON`);
      if (!res.ok) throw new Error('Failed to fetch pathway');
      const d = await res.json();

      container.innerHTML = `
        <div class="licensing-roadmap-card">
          <div class="licensing-roadmap-header" data-s="margin-bottom-1rem">
            <div data-s="display-flex align-items-center justify-content-space-between flex-wrap-wrap gap-0_5rem">
              <div>
                <span class="badge" data-s="background-dbeafe color-1e40af padding-0_2rem-0_5rem border-radius-4px font-weight-700 font-size-0_8rem">🍁 REGULATED PROFESSION · ${d.targetProvince}</span>
                <h3 data-s="margin-0_4rem-0-0_2rem-0 font-size-1_3rem">${d.profession}</h3>
                <span class="journey-milestone-cite" data-s="color-text-muted">${d.regulatoryBody} · ${d.statute}</span>
              </div>
              <div data-s="text-align-right">
                <div data-s="font-size-1_25rem font-weight-700 color-0f766e">~$${d.estimatedTotalCostCad} CAD</div>
                <span data-s="font-size-0_8rem color-text-muted">Est. Exam &amp; Evaluation Fees</span>
              </div>
            </div>
          </div>

          <div data-s="margin-bottom-1_25rem padding-0_85rem background-f0fdf4 border-left-4px-solid-16a34a border-radius-4px font-size-0_88rem line-height-1_45">
            <strong data-s="color-15803d">⚖️ Rules on “Canadian experience” requirements:</strong><br>
            ${d.canadianExperiencePolicy.advisory}
          </div>

          <div data-s="margin-bottom-1_25rem padding-0_85rem background-bg-elevated-f8fafc border-1px-solid-e2e8f0 border-radius-6px">
            <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_5rem">
              <strong>Designated IRCC / Licensing Credential Body:</strong>
              <span class="badge" data-s="background-e0e7ff color-3730a3 font-weight-600">${d.designatedEca.code} (~$${d.designatedEca.estimatedFeeCad} CAD)</span>
            </div>
            <p data-s="margin-0_35rem-0-0_2rem-0 font-size-0_85rem color-text">${d.designatedEca.name} — ${d.designatedEca.coverage}</p>
            <div data-s="font-size-0_8rem color-text-muted">⏱ Estimated Timeline: ${d.designatedEca.timelineWeeks} | Delivery: ${d.designatedEca.deliveryMethod}</div>
          </div>

          <h4 data-s="margin-1rem-0-0_5rem-0 font-size-1rem">Licensing Steps &amp; Regulatory Milestones:</h4>
          <div class="licensing-step-list">
            ${d.phases.map(p => `
              <div class="licensing-step-item">
                <div class="licensing-step-num">${p.step}</div>
                <div class="licensing-step-content">
                  <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_25rem">
                    <h4 class="licensing-step-title" data-s="margin-0">${p.title}</h4>
                    <span class="badge" data-s="font-size-0_75rem background-f1f5f9 color-334155">~$${p.feeEstimateCad} CAD · ${p.duration}</span>
                  </div>
                  <p class="licensing-step-desc" data-s="margin-0_4rem-0-0_5rem-0 font-size-0_85rem color-text-muted">${p.statutoryRequirement}</p>
                  <ul data-s="margin-0 padding-left-1_25rem font-size-0_83rem line-height-1_45">
                    ${p.actions.map(a => `<li data-s="margin-bottom-0_25rem">${a}</li>`).join('')}
                  </ul>
                </div>
              </div>
            `).join('')}
          </div>

          <div data-s="margin-top-1_25rem padding-0_85rem background-eff6ff border-1px-solid-bfdbfe border-radius-6px font-size-0_85rem">
            <strong data-s="color-1d4ed8">💼 Financial Support &amp; Tax Credits:</strong>
            <p data-s="margin-0_35rem-0-0_25rem-0">Immigrant micro-loans (${d.financialAssistance.loanAmountRange}) available through <strong>${d.financialAssistance.loanPartners[0]}</strong> to cover exams, books, and bridge living costs.</p>
            <div data-s="font-size-0_8rem color-1e40af">${d.financialAssistance.taxDeductibility}</div>
          </div>
        </div>
      `;
      return;
    } catch {
      // fallback below
    }
  }

  // Fallback to legacy LICENSING_DATA
  const data = LICENSING_DATA[profession] || LICENSING_DATA.engineering;
  container.innerHTML = `
    <div class="licensing-roadmap-card">
      <div class="licensing-roadmap-header">
        <h3>Statutory Credential Roadmap: ${data.title}</h3>
        <span class="journey-milestone-cite">${data.body}</span>
      </div>
      <div class="licensing-step-list">
        ${data.steps.map(s => `
          <div class="licensing-step-item">
            <div class="licensing-step-num">${s.num}</div>
            <div class="licensing-step-content">
              <h4 class="licensing-step-title">${s.title}</h4>
              <p class="licensing-step-desc">${s.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function renderHealthcareSuite() {
  const symptom = $('#healthcare-symptom')?.value || 'chronic_rx';
  const data = HEALTHCARE_TRIAGE_MAP[symptom] || HEALTHCARE_TRIAGE_MAP.chronic_rx;

  const container = $('#healthcare-triage-result');
  if (container) {
    container.innerHTML = '';
    const badge = el('span', data.level, `triage-level-badge ${data.badge}`);
    const dest = el('div', data.destination, 'triage-destination');
    const desc = el('div', data.desc, 'triage-desc');
    const cite = el('div', `Statutory Authority: ${data.cite}`, 'triage-cite');
    container.append(badge, dest, desc, cite);
  }
}

export function renderDrugSearch(query = '') {
  const container = $('#drug-search-results');
  if (!container) return;
  const q = String(query).toLowerCase().trim();
  if (!q) {
    container.innerHTML = '<p class="drug-search-prompt">Type a medicine brand or select a quick chip above to inspect its active chemical generic and statutory pharmacist refill rules.</p>';
    return;
  }
  const matches = Object.entries(COMMON_DRUG_EQUIVALENCES).filter(([key, d]) =>
    key.includes(q) || d.brand.toLowerCase().includes(q) || d.generic.toLowerCase().includes(q) || d.drugClass.toLowerCase().includes(q)
  );

  if (matches.length === 0) {
    container.innerHTML = `
      <div class="drug-result-card unknown">
        <h4>No Direct Match Found for "${escapeHtml(query)}"</h4>
        <p>This brand may not be in our pre-indexed primary chronic list. However, under <strong>Ontario Pharmacy Act O. Reg. 202/94 s.34</strong> (and UK NHS / AU PBS regulations), licensed community pharmacists can determine bioequivalence upon inspecting your original prescription bottle or packaging.</p>
        <div class="drug-action-tip"><strong>Action:</strong> Bring the physical medication box or pill bottle with physician dosage instructions to any Shoppers Drug Mart, Rexall, Boots, or local retail pharmacy.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = matches.map(([key, d]) => `
    <div class="drug-result-card matched">
      <div class="drug-result-header">
        <div>
          <h4>${d.brand}</h4>
          <span class="drug-generic-badge">Generic Active: ${d.generic.toUpperCase()}</span>
        </div>
        <span class="drug-chronic-badge">Vital Chronic Therapy</span>
      </div>
      <div class="drug-details-grid">
        <div><strong>Therapeutic Class:</strong> ${d.drugClass}</div>
        <div><strong>Common Standard Dosages:</strong> ${d.commonDoses}</div>
        <div><strong>Domestic Bioequivalents:</strong> ${d.canEquiv}</div>
        <div><strong>Statutory Authority:</strong> Ontario Pharmacy Act O. Reg. 202/94 s.34 / UK NHS Emergency Supply / AU PBS Rule 49A</div>
      </div>
      <div class="drug-refill-note">
        <strong>What a pharmacist may do:</strong> Community pharmacists have legal discretion to dispense up to a 30-day emergency continuation supply without an in-person Canadian physician appointment if you present the original manufacturer packaging.
      </div>
    </div>
  `).join('');
}

export function renderHealthcareEligibility(data, container) {
  container.replaceChildren();
  const {
    province,
    planName,
    governingBody,
    statute,
    isEligible,
    ineligibilityReason,
    isAccordExempt,
    landingDate,
    coverageEffectiveDate,
    waitingPeriodDays,
    bridgeInsuranceRequired,
    householdSize,
    estimatedBridgeCostCad,
    acceptedProofOfResidence,
    chcAdvisory,
    statutoryGuidance
  } = data;

  const cardCls = isEligible ? (bridgeInsuranceRequired ? 'runway-warn' : 'runway-safe') : 'runway-danger';
  const badgeCls = isEligible ? (bridgeInsuranceRequired ? 'badge-warn' : 'badge-safe') : 'badge-danger';
  const badgeText = isEligible 
    ? (bridgeInsuranceRequired ? `Waiting Period: ${waitingPeriodDays} Days` : 'Immediate Coverage ($0 Wait)')
    : 'Not Eligible for Public Health Card';

  const card = el('div', undefined, `runway-hero-card ${cardCls}`);
  const hdr = el('div', undefined, 'runway-header');
  hdr.append(el('h3', `${planName} · ${province}`, 'runway-title'));
  hdr.append(el('span', badgeText, `runway-badge ${badgeCls}`));
  card.append(hdr);

  const statsGrid = el('div', undefined, 'runway-summary-stats');
  const s1 = el('div', undefined, 'runway-stat-box');
  s1.append(el('div', 'Coverage Start Date', 'runway-stat-label'));
  s1.append(el('div', coverageEffectiveDate, 'runway-stat-value'));
  s1.append(el('div', `Landing: ${landingDate}`, 'runway-stat-sub'));

  const s2 = el('div', undefined, 'runway-stat-box');
  s2.append(el('div', 'Waiting Period', 'runway-stat-label'));
  s2.append(el('div', `${waitingPeriodDays} Days`, 'runway-stat-value'));
  s2.append(el('div', isAccordExempt ? 'Accord Exempt' : (waitingPeriodDays === 0 ? 'No waiting period' : 'Bridge needed'), 'runway-stat-sub'));

  const s3 = el('div', undefined, 'runway-stat-box');
  s3.append(el('div', 'Bridge Insurance Cost', 'runway-stat-label'));
  s3.append(el('div', `$${estimatedBridgeCostCad} CAD`, 'runway-stat-value'));
  s3.append(el('div', `${householdSize} Person(s) estimate`, 'runway-stat-sub'));

  statsGrid.append(s1, s2, s3);
  card.append(statsGrid);

  const guideP = el('p', statutoryGuidance, 'runway-stat-sub');
  guideP.style.marginTop = '1rem';
  guideP.style.fontSize = '0.95rem';
  card.append(guideP);

  if (ineligibilityReason) {
    const errP = el('div', ineligibilityReason, 'alert-box error');
    errP.style.marginTop = '1rem';
    card.append(errP);
  }

  // Accepted documents list
  const docBox = el('div', undefined, 'cashflow-card');
  docBox.style.marginTop = '1rem';
  docBox.append(el('h4', 'Accepted Proof of Residence Documents', 'cashflow-card-title'));
  const ul = el('ul');
  acceptedProofOfResidence.forEach(doc => {
    const li = el('li', doc);
    ul.append(li);
  });
  docBox.append(ul);
  card.append(docBox);

  // CHC Advisory
  const chcBox = el('div', chcAdvisory, 'vault-consent-banner');
  chcBox.style.marginTop = '1rem';
  card.append(chcBox);

  // Statute citation
  const citP = el('div', `Governing Law: ${statute} · Administered by ${governingBody}`, 'journey-milestone-cite');
  citP.style.marginTop = '0.75rem';
  card.append(citP);

  container.append(card);
}

export function renderBankMatcher() {
  const country = $('#bank-country')?.value || 'Canada';
  const container = $('#bank-matcher-results');
  if (!container) return;
  container.innerHTML = '';

  const packages = BANK_PACKAGES[country] || BANK_PACKAGES['Canada'];
  const grid = el('div', undefined, 'bank-cards-grid');

  for (const pkg of packages) {
    const card = el('div', undefined, 'bank-card');
    const header = el('div', undefined, 'bank-card-header');
    header.append(el('h4', pkg.name, 'bank-name'), el('span', pkg.package, 'bank-package'));

    const list = el('ul', undefined, 'bank-features-list');
    for (const perk of pkg.perks) {
      list.appendChild(el('li', perk));
    }

    const cite = el('div', 'Regulatory Context: ' + pkg.cite, 'text-muted text-xs');
    card.append(header, list, cite);
    grid.appendChild(card);
  }

  container.appendChild(grid);
}

export function renderSchoolsSuite(e) {
  if (e && e.preventDefault) e.preventDefault();
  const birthYear = parseInt($('#schools-birth-year')?.value || '2020', 10);
  const board = $('#schools-board')?.value || 'tdsb';
  const status = $('#schools-status')?.value || 'work_permit';
  const lang = $('#schools-lang')?.value || 'non_english';

  const container = $('#schools-results');
  if (!container) return;
  container.innerHTML = '';

  const age = 2026 - birthYear;
  let grade = '';
  let level = '';

  if (age === 4) { grade = 'Junior Kindergarten (JK)'; level = 'Early Elementary (Kindergarten)'; }
  else if (age === 5) { grade = 'Senior Kindergarten (SK)'; level = 'Early Elementary (Kindergarten)'; }
  else if (age === 6) { grade = 'Grade 1'; level = 'Primary Elementary'; }
  else if (age === 7) { grade = 'Grade 2'; level = 'Primary Elementary'; }
  else if (age === 8) { grade = 'Grade 3'; level = 'Primary Elementary'; }
  else if (age === 9) { grade = 'Grade 4'; level = 'Junior Elementary'; }
  else if (age === 10) { grade = 'Grade 5'; level = 'Junior Elementary'; }
  else if (age === 11) { grade = 'Grade 6'; level = 'Junior Elementary'; }
  else if (age === 12) { grade = 'Grade 7'; level = 'Middle School / Intermediate'; }
  else if (age === 13) { grade = 'Grade 8'; level = 'Middle School / Intermediate'; }
  else if (age === 14) { grade = 'Grade 9'; level = 'Secondary School (High School)'; }
  else if (age === 15) { grade = 'Grade 10'; level = 'Secondary School (High School)'; }
  else if (age === 16) { grade = 'Grade 11'; level = 'Secondary School (High School)'; }
  else { grade = 'Grade 12'; level = 'Secondary School (Graduating Year)'; }

  const card = el('div', undefined, 'schools-results-card');
  const header = el('div', undefined, 'schools-results-header');
  header.innerHTML = `
    <div class="schools-grade-badge">Assigned Placement: ${grade} (${level})</div>
    <div class="schools-age-sub">Child Age: ${age} years old in 2026 school year</div>
  `;

  const statuteCallout = el('div', undefined, 'schools-statute-callout');
  statuteCallout.innerHTML = `
    <strong>Right to attend school (Ontario Education Act s.33 and s.49.2):</strong>
    <p>Public school boards are statutorily prohibited from denying admission to school-age children based on immigration status, parental permit type, or lack of status. Resident children are entitled to free elementary and secondary education without tuition fees.</p>
  `;

  const intakeSteps = el('div', undefined, 'schools-intake-steps');
  intakeSteps.innerHTML = `
    <h4>Catchment Registration & STEP Intake Requirements:</h4>
    <ol>
      <li><strong>Catchment Verification:</strong> Children usually have a place at the public school that serves their home address (their catchment school). Present residential lease, utility bill, or bank statement.</li>
      <li><strong>Proof of Age & Parentage:</strong> Child's foreign passport, birth certificate (with English translation if applicable).</li>
      <li><strong>Immunization Record:</strong> Yellow immunization booklet or clinic translation uploaded directly to Public Health (e.g. Toronto Public Health portal).</li>
      ${lang === 'non_english' ? '<li><strong>STEP English Intake Assessment:</strong> Children whose first language is not English are invited to a non-punitive 1-hour STEP (Steps to English Proficiency) intake session at the school board Welcome Centre to determine ESL/ELD classroom support tier.</li>' : ''}
    </ol>
  `;

  card.append(header, statuteCallout, intakeSteps);
  container.appendChild(card);
}

export function renderIspaAudit() {
  const auditContainer = $('#ispa-compliance-audit');
  if (!auditContainer) return;
  const checkboxes = document.querySelectorAll('.ispa-vax-cb');
  const checked = [];
  const missing = [];
  checkboxes.forEach(cb => {
    const id = cb.getAttribute('data-id');
    const vax = ISPA_VACCINES.find(v => v.id === id);
    if (cb.checked) {
      checked.push(vax);
    } else {
      missing.push(vax);
    }
  });

  if (missing.length === 0) {
    auditContainer.innerHTML = `
      <div class="ispa-audit-card compliant">
        <div class="ispa-audit-header">
          <span class="ispa-badge compliant">✅ Vaccine records complete</span>
          <h4>All 4 required vaccines recorded</h4>
        </div>
        <p>Your child's immunization profile satisfies the statutory mandate under the Ontario <em>Immunization of School Pupils Act</em> (ISPA s.3). Submit this record directly to your local Public Health Unit (e.g. Toronto Public Health Immunization Connect portal) to finalize enrollment.</p>
      </div>
    `;
  } else {
    auditContainer.innerHTML = `
      <div class="ispa-audit-card non-compliant">
        <div class="ispa-audit-header">
          <span class="ispa-badge warning">⚠️ Action Required: ${missing.length} Mandatory Vaccine(s) Missing</span>
          <h4>Risk of suspension from school (ISPA s.12)</h4>
        </div>
        <p>Under ISPA Section 12, Medical Officers of Health are statutorily mandated to issue <strong>20-day school suspension orders</strong> for students with incomplete vaccine records. The following required vaccines must be documented or exempted:</p>
        <ul class="ispa-missing-list">
          ${missing.map(m => `<li><strong>${m.name}:</strong> Required: ${m.doses}</li>`).join('')}
        </ul>
        <div class="ispa-audit-pathways">
          <strong>Your options:</strong>
          <ol>
            <li><strong>Catch-Up Immunization:</strong> Receive missing doses at any local Public Health Newcomer Clinic or community walk-in clinic at $0 charge.</li>
            <li><strong>Medical Exemption (ISPA s.3(1)):</strong> Statement of Medical Exemption form signed by a licensed Canadian MD/NP citing medical contraindications or lab serology immunity.</li>
            <li><strong>Conscience or Religious Belief (ISPA s.3(2)):</strong> Complete the 20-minute Public Health education session and swear an official Form 1/2 affidavit before a Commissioner for Taking Affidavits.</li>
          </ol>
        </div>
      </div>
    `;
  }
}

export function renderPreFlightAudit(data, container) {
  container.replaceChildren();
  const { overallReadiness, summaryHeadline, counts, documents, preFlightChecklist } = data;

  const statusCls = overallReadiness === 'verified_ready' ? 'runway-safe' : overallReadiness === 'action_required' ? 'runway-warn' : 'runway-danger';
  const badgeCls = overallReadiness === 'verified_ready' ? 'badge-safe' : overallReadiness === 'action_required' ? 'badge-warn' : 'badge-danger';
  const badgeText = overallReadiness === 'verified_ready' ? 'Ready for Flight Departure' : overallReadiness === 'action_required' ? 'Action Required Prior to Flight' : 'Critical Rejection Risk';

  const card = el('div', undefined, `runway-hero-card ${statusCls}`);
  const hdr = el('div', undefined, 'runway-header');
  hdr.append(el('h3', 'Pre-departure document check', 'runway-title'));
  hdr.append(el('span', badgeText, `runway-badge ${badgeCls}`));
  card.append(hdr);

  const statsGrid = el('div', undefined, 'runway-summary-stats');
  const s1 = el('div', undefined, 'runway-stat-box');
  s1.append(el('div', 'Documents checked', 'runway-stat-label'));
  s1.append(el('div', `${counts.total} Documents`, 'runway-stat-value'));

  const s2 = el('div', undefined, 'runway-stat-box');
  s2.append(el('div', 'Compliant', 'runway-stat-label'));
  s2.append(el('div', `${counts.valid} Valid`, 'runway-stat-value'));

  const s3 = el('div', undefined, 'runway-stat-box');
  s3.append(el('div', 'Critical / High Risk', 'runway-stat-label'));
  s3.append(el('div', `${counts.criticalRisk + counts.highRisk} Flagged`, 'runway-stat-value'));

  statsGrid.append(s1, s2, s3);
  card.append(statsGrid);

  const headP = el('p', summaryHeadline, 'runway-stat-sub');
  headP.style.marginTop = '1rem';
  headP.style.fontSize = '0.95rem';
  card.append(headP);

  // Document rows
  if (documents && documents.length > 0) {
    const docGrid = el('div', undefined, 'cashflow-cards-grid');
    docGrid.style.marginTop = '1rem';

    documents.forEach(doc => {
      const docCard = el('div', undefined, 'cashflow-card');
      const docHdr = el('div', undefined, 'runway-header');
      docHdr.append(el('h4', doc.docLabel, 'cashflow-card-title'));
      const dBadgeCls = doc.rejectionRisk === 'none' ? 'badge-safe' : doc.rejectionRisk === 'low' ? 'badge-warn' : 'badge-danger';
      docHdr.append(el('span', doc.status.toUpperCase().replace('_', ' '), `runway-badge ${dBadgeCls}`));
      docCard.append(docHdr);

      if (doc.daysUntilExpiry !== null) {
        docCard.append(el('div', `Runway to Landing: ${doc.daysUntilExpiry} days (${doc.expiryDate})`, 'muted'));
      }
      if (doc.correctiveAction) {
        const actionBox = el('div', doc.correctiveAction, 'alert-box ' + (doc.rejectionRisk === 'critical' ? 'error' : 'warn'));
        actionBox.style.marginTop = '0.5rem';
        docCard.append(actionBox);
      }
      const citeDiv = el('div', `Statute: ${doc.statute}`, 'journey-milestone-cite');
      citeDiv.style.marginTop = '0.5rem';
      docCard.append(citeDiv);
      docGrid.append(docCard);
    });
    card.append(docGrid);
  }

  // Pre-flight checklist
  const checkCard = el('div', undefined, 'cashflow-card');
  checkCard.style.marginTop = '1.25rem';
  checkCard.append(el('h4', 'Mandatory Pre-Flight Airport Protocol', 'cashflow-card-title'));
  const ul = el('ul');
  preFlightChecklist.forEach(item => {
    const li = el('li');
    li.innerHTML = `<strong>${escapeHtml(item.task)}</strong> — <span class="muted">${escapeHtml(item.reason)}</span>`;
    ul.append(li);
  });
  checkCard.append(ul);
  card.append(checkCard);

  container.append(card);
}

export function renderBorderFlagpolingResults(data, container) {
  if (!container || !data) return;

  let badgeColor = '#16a34a';
  let badgeText = 'ELIGIBLE FOR POE PROCESSING';

  if (data.determination === 'STRICTLY_BARRED') {
    badgeColor = '#dc2626';
    badgeText = 'STRICTLY BARRED AT PORT OF ENTRY';
  } else if (data.determination === 'HIGH_RISK_NOT_RECOMMENDED') {
    badgeColor = '#ea580c';
    badgeText = 'HIGH RISK — NOT RECOMMENDED';
  } else if (data.determination === 'TEMPORARILY_BLOCKED') {
    badgeColor = '#d97706';
    badgeText = 'PORT SCHEDULE BLOCK';
  } else if (data.determination === 'INELIGIBLE_AT_BORDER') {
    badgeColor = '#ca8a04';
    badgeText = 'INELIGIBLE FOR BORDER APPLICATION';
  }

  const barriersHtml = data.legalBarriers && data.legalBarriers.length > 0 ? `
    <div data-s="background-fee2e2 border-1px-solid-ef4444 border-radius-8px padding-0_85rem margin-bottom-1rem">
      <div data-s="font-weight-700 color-991b1b font-size-0_9rem margin-bottom-0_4rem">⛔ STATUTORY & MINISTERIAL LEGAL BARRIERS:</div>
      ${data.legalBarriers.map(b => `
        <div data-s="margin-bottom-0_5rem font-size-0_85rem color-7f1d1d">
          <strong>${escapeHtml(b.rule)} [${escapeHtml(b.severity)}]:</strong>
          <div>${escapeHtml(b.description)}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  const warningsHtml = data.warnings && data.warnings.length > 0 ? `
    <div data-s="background-fef3c7 border-1px-solid-f59e0b border-radius-8px padding-0_85rem margin-bottom-1rem">
      <div data-s="font-weight-700 color-92400e font-size-0_9rem margin-bottom-0_4rem">⚠️ OPERATIONAL & IMMIGRATION STATUS WARNINGS:</div>
      ${data.warnings.map(w => `
        <div data-s="margin-bottom-0_4rem font-size-0_85rem color-78350f">
          <strong>${escapeHtml(w.statute)} [${escapeHtml(w.level)}]:</strong> ${escapeHtml(w.message)}
        </div>
      `).join('')}
    </div>
  ` : '';

  const usImpact = data.usAdministrativeRefusalImpact || {};
  const usRefusalHtml = `
    <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_85rem margin-bottom-1rem">
      <div data-s="font-weight-700 font-size-0_85rem margin-bottom-0_4rem">🇺🇸 US CBP ADMINISTRATIVE REFUSAL &amp; IRPA s. 40 CANDOUR MANDATE:</div>
      <div data-s="font-size-0_8rem color-text-muted line-height-1_45">
        <div><strong>Turnaround Document:</strong> ${escapeHtml(usImpact.formName || 'CBP Form I-160A')}</div>
        <div data-s="margin-top-0_25rem"><strong>Mandatory Reporting:</strong> ${escapeHtml(usImpact.mandatoryDeclaration || '')}</div>
        <div data-s="margin-top-0_25rem color-b91c1c"><strong>Misrepresentation Risk:</strong> ${escapeHtml(usImpact.misrepresentationConsequence || '')}</div>
        <div data-s="margin-top-0_25rem"><strong>Advisory:</strong> ${escapeHtml(usImpact.advisory || '')}</div>
      </div>
    </div>
  `;

  const docsHtml = data.requiredDocuments && data.requiredDocuments.length > 0 ? `
    <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_85rem margin-bottom-1rem">
      <div data-s="font-weight-700 font-size-0_85rem margin-bottom-0_4rem">📋 MANDATORY BORDER DOCUMENTATION CHECKLIST:</div>
      <ul data-s="margin-0 padding-left-1_25rem font-size-0_85rem color-text">
        ${data.requiredDocuments.map(d => `<li data-s="margin-bottom-0_25rem">${escapeHtml(d)}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  const prepHtml = data.borderInterviewPrep && data.borderInterviewPrep.length > 0 ? `
    <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_85rem margin-bottom-1rem">
      <div data-s="font-weight-700 font-size-0_85rem margin-bottom-0_4rem">🛡️ CBSA BORDER SERVICES OFFICER (BSO) INTERVIEW PREPARATION:</div>
      <ul data-s="margin-0 padding-left-1_25rem font-size-0_85rem color-text-muted">
        ${data.borderInterviewPrep.map(p => `<li data-s="margin-bottom-0_35rem">${escapeHtml(p)}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  const statutesHtml = data.statutoryReferences && data.statutoryReferences.length > 0 ? `
    <div data-s="font-size-0_75rem color-text-muted border-top-1px-solid-border padding-top-0_75rem margin-top-1rem">
      <strong>Statutory Authorities:</strong> ${data.statutoryReferences.map(s => escapeHtml(s)).join(' • ')}
    </div>
  ` : '';

  container.innerHTML = `
    <div data-s="background-bg-card border-1px-solid-border border-radius-10px padding-1_25rem">
      <!-- Header -->
      <div data-s="display-flex align-items-center justify-content-space-between flex-wrap-wrap gap-0_75rem margin-bottom-1rem border-bottom-1px-solid-border padding-bottom-0_75rem">
        <div>
          <span data-style="display:inline-block;padding:0.25rem 0.6rem;background:${badgeColor}20;color:${badgeColor};border:1px solid ${badgeColor};border-radius:4px;font-weight:700;font-size:0.75rem;letter-spacing:0.05em;margin-bottom:0.4rem;">
            ${escapeHtml(badgeText)}
          </span>
          <h4 data-s="margin-0_2rem-0 font-size-1_15rem">CBSA Flagpoling Assessment: ${escapeHtml(data.portOfEntry?.name || 'Border POE')}</h4>
        </div>
        <div data-s="text-align-right">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">SCHEDULED DAY</div>
          <div data-style="font-size:1.1rem;font-weight:700;color:${data.isOperatingDay ? '#16a34a' : '#dc2626'};">
            ${escapeHtml(data.dayScheduled || '')} (${data.isOperatingDay ? 'Operating Day' : 'Non-Operating Day'})
          </div>
        </div>
      </div>

      <p data-s="font-size-0_95rem margin-0-0-1rem-0 line-height-1_45 color-text">
        ${escapeHtml(data.summary)}
      </p>

      <!-- Port Details Grid -->
      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-200 gap-0_75rem margin-bottom-1rem">
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">OPERATING DAYS</div>
          <div data-s="font-size-0_9rem font-weight-700 margin-top-0_2rem">
            ${(data.portOfEntry?.flagpolingDays || []).join(', ')}
          </div>
        </div>
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">FLAGPOLING HOURS</div>
          <div data-s="font-size-0_9rem font-weight-700 margin-top-0_2rem">
            ${escapeHtml(data.portOfEntry?.flagpolingHours || 'Check Port')}
          </div>
        </div>
        <div data-s="background-bg-elevated border-1px-solid-border border-radius-8px padding-0_75rem">
          <div data-s="font-size-0_75rem color-text-muted font-weight-600">DAILY QUOTA CAP</div>
          <div data-s="font-size-0_9rem font-weight-700 margin-top-0_2rem">
            ${escapeHtml(data.portOfEntry?.estimatedQuota || 'Discretionary')}
          </div>
        </div>
      </div>

      ${barriersHtml}
      ${warningsHtml}
      ${usRefusalHtml}
      ${docsHtml}
      ${prepHtml}
      ${statutesHtml}
    </div>
  `;
}

// 68. Alberta Opportunity Stream (AOS) & Tourism Stream Navigator
export function renderAlbertaOpportunityStreamResults(data, container) {
  if (!data || !container) return;
  const isEligible = data.isAosEligible || (data.eligibleStreams && data.eligibleStreams.length > 0);

  let html = `
    <div class="result-banner ${isEligible ? 'result-compliant' : 'result-warning'}" data-style="margin-bottom:1rem;padding:1rem;border-radius:6px;border:1px solid ${isEligible ? 'var(--color-success, #2e7d32)' : 'var(--color-warning, #ed6c02)'};background:${isEligible ? '#e8f5e9' : '#fff3e0'};">
      <div data-s="display-flex align-items-center justify-content-space-between flex-wrap-wrap gap-0_5rem">
        <h4 data-style="margin:0;color:${isEligible ? '#1b5e20' : '#e65100'};font-size:1.1rem;">
          ${isEligible ? '✅ QUALIFIES FOR AAIP PROVINCIAL NOMINATION' : '⚠️ AAIP STATUTORY BARS IDENTIFIED'}
        </h4>
        <span class="badge" data-style="background:${isEligible ? '#2e7d32' : '#ed6c02'};color:#fff;padding:0.25rem 0.5rem;border-radius:4px;font-size:0.85rem;">
          ${data.overallVerdict || 'EVALUATED'}
        </span>
      </div>
      <p data-s="margin-0_5rem-0-0-0 font-size-0_9rem color-333">
        Candidate: <strong>${data.candidateName || 'Candidate'}</strong> | NOC: <strong>${data.occupationAudit?.nocCode || 'NOC'}</strong> (TEER ${data.occupationAudit?.teerCategory || 0}) | Sector: <strong>${data.occupationAudit?.sector || 'general'}</strong>.
      </p>
    </div>
  `;

  if (Array.isArray(data.eligibleStreams) && data.eligibleStreams.length) {
    html += `
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border margin-bottom-1rem">
        <h5 data-s="margin-0-0-0_5rem-0">🏔️ Eligible AAIP Streams</h5>
        ${data.eligibleStreams.map(s => `
          <div data-s="border-left-3px-solid-2e7d32 padding-left-0_75rem margin-bottom-0_5rem">
            <strong>${s.streamName}</strong> - <span data-s="color-2e7d32 font-weight-bold">${s.status}</span> (Fee: ${s.applicationFeeCad} CAD)
          </div>
        `).join('')}
      </div>
    `;
  }

  html += `
    <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-250 gap-1rem margin-bottom-1rem">
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">📋 Work Experience Audit</h5>
        <div data-s="font-size-0_9rem">
          Alberta Months: <strong>${data.workExperienceAudit?.albertaMonths || 0} / ${data.workExperienceAudit?.requiredAlbertaMonths || 12} required</strong><br>
          Experience Status: <strong data-style="color:${data.workExperienceAudit?.isExperienceSatisfied ? '#2e7d32' : '#d32f2f'};">${data.workExperienceAudit?.isExperienceSatisfied ? 'SATISFIED' : 'SHORTFALL'}</strong>
        </div>
      </div>
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">🗣️ Language Benchmark</h5>
        <div data-s="font-size-0_9rem">
          Candidate Score: <strong>CLB ${data.languageAudit?.candidateClb || 0}</strong><br>
          Required Threshold: <strong>CLB ${data.languageAudit?.requiredClb || 5}</strong><br>
          Status: <strong data-style="color:${data.languageAudit?.isLanguageSatisfied ? '#2e7d32' : '#d32f2f'};">${data.languageAudit?.isLanguageSatisfied ? 'SATISFIED' : 'DEFICIENT'}</strong>
        </div>
      </div>
    </div>
  `;

  if (Array.isArray(data.violationsAndBars) && data.violationsAndBars.length) {
    html += `
      <div data-s="background-ffebee padding-1rem border-radius-6px border-1px-solid-ef5350 margin-bottom-1rem">
        <h5 data-s="margin-0-0-0_5rem-0 color-c62828">⚠️ Statutory Bars &amp; Deficiencies</h5>
        <ul data-s="margin-0 padding-left-1_25rem font-size-0_9rem color-b71c1c">
          ${data.violationsAndBars.map(v => `<li data-s="margin-bottom-0_25rem">${v}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (Array.isArray(data.actionPlan) && data.actionPlan.length) {
    html += `
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">📌 Application &amp; Mitigation Roadmap</h5>
        <ol data-s="margin-0 padding-left-1_25rem font-size-0_9rem">
          ${data.actionPlan.map(a => `<li data-s="margin-bottom-0_25rem">${a}</li>`).join('')}
        </ol>
      </div>
    `;
  }

  container.innerHTML = html;
}

// 69. BC Speculation and Vacancy Tax (SVT) Annual Declaration Engine
export function renderBcSpeculationTaxDeclarationResults(data, container) {
  if (!data || !container) return;
  const isExempt = data.isExemptFromSvt;

  let html = `
    <div class="result-banner ${isExempt ? 'result-compliant' : 'result-warning'}" data-style="margin-bottom:1rem;padding:1rem;border-radius:6px;border:1px solid ${isExempt ? 'var(--color-success, #2e7d32)' : 'var(--color-warning, #ed6c02)'};background:${isExempt ? '#e8f5e9' : '#fff3e0'};">
      <div data-s="display-flex align-items-center justify-content-space-between flex-wrap-wrap gap-0_5rem">
        <h4 data-style="margin:0;color:${isExempt ? '#1b5e20' : '#e65100'};font-size:1.1rem;">
          ${isExempt ? '🏡 STATUTORILY EXEMPT FROM BC SPECULATION TAX' : '⚠️ SPECULATION & VACANCY TAX OWED'}
        </h4>
        <span class="badge" data-style="background:${isExempt ? '#2e7d32' : '#ed6c02'};color:#fff;padding:0.25rem 0.5rem;border-radius:4px;font-size:0.85rem;">
          Estimated Tax: ${(data.estimatedTaxLiabilityCad || 0).toLocaleString()} CAD (${data.applicableTaxRatePercent || 0.5}%)
        </span>
      </div>
      <p data-s="margin-0_5rem-0-0-0 font-size-0_9rem color-333">
        Region: <strong>${data.propertyRegion || 'BC'}</strong> | Assessed Value: <strong>${(data.assessedPropertyValueCad || 0).toLocaleString()} CAD</strong> | Exemption: <strong>${data.exemptionReason || 'None'}</strong>.
      </p>
    </div>
  `;

  html += `
    <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-250 gap-1rem margin-bottom-1rem">
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">⚖️ Legal Basis &amp; Rate Classification</h5>
        <div data-s="font-size-0_9rem">
          Statutory Authority: <strong>${data.statutoryAuthority || 'SVT Act'}</strong><br>
          Satellite Family: <strong>${data.isSatelliteFamily ? 'YES (Subject to 2.0% Tax Rate)' : 'NO'}</strong><br>
          Tax Year: <strong>${data.taxYear || '2025'}</strong>
        </div>
      </div>
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">📅 Filing Deadline &amp; Portal</h5>
        <div data-s="font-size-0_9rem">
          Declaration Due: <strong>March 31, ${Number(data.taxYear || 2025) + 1}</strong><br>
          Portal: <strong>gov.bc.ca/spectax</strong><br>
          Mandatory Requirement: <strong>All owners must declare</strong>
        </div>
      </div>
    </div>
  `;

  if (Array.isArray(data.riskWarnings) && data.riskWarnings.length) {
    html += `
      <div data-s="background-ffebee padding-1rem border-radius-6px border-1px-solid-ef5350 margin-bottom-1rem">
        <h5 data-s="margin-0-0-0_5rem-0 color-c62828">⚠️ Statutory Warnings &amp; Satellite Family Bars</h5>
        <ul data-s="margin-0 padding-left-1_25rem font-size-0_9rem color-b71c1c">
          ${data.riskWarnings.map(w => `<li data-s="margin-bottom-0_25rem">${w}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (Array.isArray(data.actionPlan) && data.actionPlan.length) {
    html += `
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">📌 Declaration Steps &amp; Action Plan</h5>
        <ol data-s="margin-0 padding-left-1_25rem font-size-0_9rem">
          ${data.actionPlan.map(a => `<li data-s="margin-bottom-0_25rem">${a}</li>`).join('')}
        </ol>
      </div>
    `;
  }

  container.innerHTML = html;
}

// 70. PRTD & Humanitarian Grounds (H&C) Engine
export function renderPrtdHumanitarianResults(data, container) {
  if (!data || !container) return;
  const { humanitarianAssessment: hc, appealRights: appeal, residencyOverview: res } = data;
  const isStrong = hc?.overallHcStrength === 'STRONG';

  let html = `
    <div class="result-banner ${isStrong ? 'result-compliant' : 'result-warning'}" data-style="margin-bottom:1rem;padding:1rem;border-radius:6px;border:1px solid ${isStrong ? 'var(--color-success, #2e7d32)' : 'var(--color-warning, #ed6c02)'};background:${isStrong ? '#e8f5e9' : '#fff3e0'};">
      <div data-s="display-flex align-items-center justify-content-space-between flex-wrap-wrap gap-0_5rem">
        <h4 data-style="margin:0;color:${isStrong ? '#1b5e20' : '#e65100'};font-size:1.1rem;">
          🌐 H&amp;C ASSESSMENT: ${hc?.overallHcStrength || 'MODERATE'} CASE
        </h4>
        <span class="badge" data-style="background:${isStrong ? '#2e7d32' : '#ed6c02'};color:#fff;padding:0.25rem 0.5rem;border-radius:4px;font-size:0.85rem;">
          Physical Days: ${res?.physicalDaysInCanada || 0} / 730 (Shortfall: ${res?.daysShortfall || 0} days)
        </span>
      </div>
      <p data-s="margin-0_5rem-0-0-0 font-size-0_9rem color-333">
        Reason for Absence: <strong>${(hc?.absenceReasonCategory || 'none').replace(/_/g, ' ')}</strong> | BIOC Engaged: <strong>${hc?.bestInterestsOfChildEngaged ? 'YES' : 'NO'}</strong> | Mandatory In-Person Appeal Travel Doc: <strong data-style="color:${appeal?.qualifiesForMandatoryInPersonTravelDocument ? '#2e7d32' : '#d32f2f'};">${appeal?.qualifiesForMandatoryInPersonTravelDocument ? 'YES (IRPA s. 31(3)(c))' : 'NO (&lt; 365 Days in Canada)'}</strong>.
      </p>
    </div>
  `;

  html += `
    <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-250 gap-1rem margin-bottom-1rem">
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">⚖️ Positive H&amp;C Merits (Kanthasamy)</h5>
        <ul data-s="margin-0 padding-left-1_25rem font-size-0_9rem">
          ${(hc?.positiveHcFactors || []).map(f => `<li data-s="margin-bottom-0_25rem">${f}</li>`).join('')}
        </ul>
      </div>
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">🏛️ Appeal Rights (IRPA s. 63(4))</h5>
        <div data-s="font-size-0_9rem">
          Appellate Body: <strong>Immigration Appeal Division (IAD)</strong><br>
          Limitation Window: <strong>60 Calendar Days from Written Refusal</strong><br>
          Travel Document Right: <strong>${appeal?.qualifiesForMandatoryInPersonTravelDocument ? 'Mandatory In-Person Travel Document' : 'Virtual / Leave Required'}</strong>
        </div>
      </div>
    </div>
  `;

  if (Array.isArray(data.actionPlan) && data.actionPlan.length) {
    html += `
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">📌 Defense Strategy &amp; Application Plan</h5>
        <ol data-s="margin-0 padding-left-1_25rem font-size-0_9rem">
          ${data.actionPlan.map(a => `<li data-s="margin-bottom-0_25rem">${a}</li>`).join('')}
        </ol>
      </div>
    `;
  }

  container.innerHTML = html;
}

// 71. Common Law Reasonable Notice & Severance Calculator (Bardal Factors)
export function renderSeveranceReasonableNoticeResults(data, container) {
  if (!data || !container) return;
  const { statutoryEsaAudit: esa, commonLawAssessment: cl, enforceabilityAudit: enf } = data;

  let html = `
    <div class="result-banner" data-s="margin-bottom-1rem padding-1rem border-radius-6px border-1px-solid-1976d2 background-e3f2fd">
      <div data-s="display-flex align-items-center justify-content-space-between flex-wrap-wrap gap-0_5rem">
        <h4 data-s="margin-0 color-0d47a1 font-size-1_1rem">
          💼 COMMON LAW REASONABLE NOTICE ESTIMATION
        </h4>
        <span class="badge" data-s="background-1976d2 color-fff padding-0_25rem-0_5rem border-radius-4px font-size-0_85rem">
          Estimated Value: ${(cl?.estimatedCommonLawValueCad || 0).toLocaleString()} CAD (${cl?.estimatedNoticeMonths || 0} Months)
        </span>
      </div>
      <p data-s="margin-0_5rem-0-0-0 font-size-0_9rem color-333">
        Statutory Minimum (Notice + Severance): <strong>${(esa?.totalStatutoryMinimumCad || 0).toLocaleString()} CAD</strong> | Potential Common Law Differential: <strong data-s="color-2e7d32">+${(cl?.differentialOverStatutoryCad || 0).toLocaleString()} CAD</strong>.
      </p>
    </div>
  `;

  html += `
    <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-250 gap-1rem margin-bottom-1rem">
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">📜 Employment Standards Act (ESA) Minimums</h5>
        <div data-s="font-size-0_9rem">
          Statutory Notice: <strong>${esa?.statutoryNoticeWeeks || 0} Weeks (${(esa?.statutoryNoticePayCad || 0).toLocaleString()} CAD)</strong><br>
          Statutory Severance Pay (s. 64): <strong>${esa?.statutorySeveranceWeeks || 0} Weeks (${(esa?.statutorySeverancePayCad || 0).toLocaleString()} CAD)</strong><br>
          Qualifies for Severance ($2.5M+ Payroll &amp; 5+ Yrs): <strong>${esa?.qualifiesForStatutorySeverancePay ? 'YES' : 'NO'}</strong>
        </div>
      </div>
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">⚖️ Waksdale Clause Enforceability Audit</h5>
        <div data-s="font-size-0_9rem">
          Written Termination Clause: <strong>${enf?.hasWrittenClause ? 'Present' : 'None'}</strong><br>
          Clause Enforceability: <strong data-style="color:${enf?.isClauseEnforceable ? '#ed6c02' : '#2e7d32'};">${enf?.isClauseEnforceable ? 'Appears Compliant' : 'VOID UNDER WAKSDALE'}</strong><br>
          Entitlement Doctrine: <strong>${enf?.recommendedLegalClaim || 'COMMON_LAW'}</strong>
        </div>
      </div>
    </div>
  `;

  if (Array.isArray(data.actionPlan) && data.actionPlan.length) {
    html += `
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">📌 Negotiation &amp; Legal Next Steps</h5>
        <ol data-s="margin-0 padding-left-1_25rem font-size-0_9rem">
          ${data.actionPlan.map(a => `<li data-s="margin-bottom-0_25rem">${a}</li>`).join('')}
        </ol>
      </div>
    `;
  }

  container.innerHTML = html;
}

// 72. Manitoba Provincial Nominee Program (MPNP) Skilled Worker Navigator
export function renderManitobaPnpSkilledWorkerResults(data, container) {
  if (!data || !container) return;
  const { eoiScoreSummary: eoi, employmentAudit: emp } = data;
  const isEligible = data.isStreamEligible;

  let html = `
    <div class="result-banner ${isEligible ? 'result-compliant' : 'result-warning'}" data-style="margin-bottom:1rem;padding:1rem;border-radius:6px;border:1px solid ${isEligible ? 'var(--color-success, #2e7d32)' : 'var(--color-warning, #ed6c02)'};background:${isEligible ? '#e8f5e9' : '#fff3e0'};">
      <div data-s="display-flex align-items-center justify-content-space-between flex-wrap-wrap gap-0_5rem">
        <h4 data-style="margin:0;color:${isEligible ? '#1b5e20' : '#e65100'};font-size:1.1rem;">
          ${isEligible ? '🌾 QUALIFIES FOR SKILLED WORKER IN MANITOBA' : '⚠️ MANITOBA EMPLOYMENT DURATION SHORTFALL'}
        </h4>
        <span class="badge" data-style="background:${isEligible ? '#2e7d32' : '#ed6c02'};color:#fff;padding:0.25rem 0.5rem;border-radius:4px;font-size:0.85rem;">
          Total EOI Points: ${eoi?.totalEoiPoints || 0} / 1,000
        </span>
      </div>
      <p data-s="margin-0_5rem-0-0-0 font-size-0_9rem color-333">
        Candidate: <strong>${data.candidateName || 'Candidate'}</strong> | Months in Manitoba: <strong>${emp?.monthsWorkedInManitoba || 0} / ${emp?.requiredMonths || 6} required</strong> | Permanent Job Offer: <strong>${emp?.hasPermanentJobOffer ? 'YES' : 'NO'}</strong>.
      </p>
    </div>
  `;

  html += `
    <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border margin-bottom-1rem">
      <h5 data-s="margin-0-0-0_5rem-0">📊 MPNP 1,000-Point Factor Breakdown</h5>
      <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-140 gap-0_5rem font-size-0_85rem">
        <div data-s="background-fff padding-0_5rem border-radius-4px border-1px-solid-ddd">Language: <strong>${eoi?.pointsLanguage || 0} pts</strong></div>
        <div data-s="background-fff padding-0_5rem border-radius-4px border-1px-solid-ddd">Age: <strong>${eoi?.pointsAge || 0} pts</strong></div>
        <div data-s="background-fff padding-0_5rem border-radius-4px border-1px-solid-ddd">Experience: <strong>${eoi?.pointsWorkExperience || 0} pts</strong></div>
        <div data-s="background-fff padding-0_5rem border-radius-4px border-1px-solid-ddd">Education: <strong>${eoi?.pointsEducation || 0} pts</strong></div>
        <div data-s="background-fff padding-0_5rem border-radius-4px border-1px-solid-ddd">Adaptability: <strong>${eoi?.pointsAdaptability || 0} pts</strong></div>
        <div data-style="background:#fff;padding:0.5rem;border-radius:4px;border:1px solid #ddd;color:${(eoi?.riskDeductions || 0) < 0 ? '#d32f2f' : '#666'};">Risk Deductions: <strong>${eoi?.riskDeductions || 0} pts</strong></div>
      </div>
    </div>
  `;

  if (Array.isArray(data.riskWarnings) && data.riskWarnings.length) {
    html += `
      <div data-s="background-ffebee padding-1rem border-radius-6px border-1px-solid-ef5350 margin-bottom-1rem">
        <h5 data-s="margin-0-0-0_5rem-0 color-c62828">⚠️ Statutory Warnings &amp; Deductions</h5>
        <ul data-s="margin-0 padding-left-1_25rem font-size-0_9rem color-b71c1c">
          ${data.riskWarnings.map(w => `<li data-s="margin-bottom-0_25rem">${w}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (Array.isArray(data.actionPlan) && data.actionPlan.length) {
    html += `
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">📌 Application &amp; Next Steps</h5>
        <ol data-s="margin-0 padding-left-1_25rem font-size-0_9rem">
          ${data.actionPlan.map(a => `<li data-s="margin-bottom-0_25rem">${a}</li>`).join('')}
        </ol>
      </div>
    `;
  }

  container.innerHTML = html;
}

// 63. PR Card Renewal & Urgent Processing Navigator
export function renderPrCardRenewalResults(data, container) {
  if (!data || !container) return;
  const { residencyAssessment: res, urgentProcessing: urg, applicationPathway: path } = data;
  const isCompliant = res?.residencyObligationMet;

  let html = `
    <div class="result-banner ${isCompliant ? 'result-compliant' : 'result-warning'}" data-style="margin-bottom:1rem;padding:1rem;border-radius:6px;border:1px solid ${isCompliant ? 'var(--color-success, #2e7d32)' : 'var(--color-warning, #ed6c02)'};background:${isCompliant ? '#e8f5e9' : '#fff3e0'};">
      <div data-s="display-flex align-items-center justify-content-space-between flex-wrap-wrap gap-0_5rem">
        <h4 data-style="margin:0;color:${isCompliant ? '#1b5e20' : '#e65100'};font-size:1.1rem;">
          ${isCompliant ? '✅ RESIDENCY OBLIGATION SATISFIED' : '⚠️ RESIDENCY OBLIGATION SHORTFALL'}
        </h4>
        <span class="badge" data-style="background:${isCompliant ? '#2e7d32' : '#ed6c02'};color:#fff;padding:0.25rem 0.5rem;border-radius:4px;font-size:0.85rem;">
          ${res?.totalCreditedDays || 0} / 730 Days Credited (${res?.compliancePercentage || 0}%)
        </span>
      </div>
      <p data-s="margin-0_5rem-0-0-0 font-size-0_9rem color-333">
        Physical days in Canada: <strong>${res?.daysInCanadaPhysical || 0}</strong> | Credited days abroad: <strong>${(res?.totalCreditedDays || 0) - (res?.daysInCanadaPhysical || 0)}</strong>.
        ${!isCompliant ? ` Shortfall: <strong data-s="color-d32f2f">${res?.daysShortfall || 0} days</strong>.` : ''}
      </p>
    </div>
  `;

  html += `
    <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-250 gap-1rem margin-bottom-1rem">
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">⚡ Urgent Processing Audit</h5>
        <div data-s="font-size-0_9rem">
          Status: <strong data-style="color:${urg?.qualifiesForUrgentProcessing ? '#2e7d32' : '#666'};">${urg?.qualifiesForUrgentProcessing ? 'QUALIFIES FOR URGENT' : 'STANDARD PROCESSING'}</strong><br>
          Departure: <strong>${urg?.travelDepartureDaysFromNow || 0} days from now</strong><br>
          Urgent Ground: <strong>${(urg?.urgentReasonCategory || 'none').replace(/_/g, ' ')}</strong>
        </div>
      </div>
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">📋 Application Pathway</h5>
        <div data-s="font-size-0_9rem">
          Form Required: <strong>${path?.recommendedForm || 'IMM 5444'}</strong><br>
          Submission Channel: <strong>${path?.filingChannel || 'PR Portal'}</strong><br>
          Government Fee: <strong>${path?.statutoryGovernmentFeeCad || 50} CAD</strong><br>
          Timeline: <strong>${path?.estimatedProcessing || 'Standard'}</strong>
        </div>
      </div>
    </div>
  `;

  if (Array.isArray(data.requiredDocuments) && data.requiredDocuments.length) {
    html += `
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border margin-bottom-1rem">
        <h5 data-s="margin-0-0-0_5rem-0">📄 Required Documentation Checklist</h5>
        <ul data-s="margin-0 padding-left-1_25rem font-size-0_9rem">
          ${data.requiredDocuments.map(d => `<li data-s="margin-bottom-0_25rem">${d}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (Array.isArray(data.riskWarnings) && data.riskWarnings.length) {
    html += `
      <div data-s="background-ffebee padding-1rem border-radius-6px border-1px-solid-ef5350 margin-bottom-1rem">
        <h5 data-s="margin-0-0-0_5rem-0 color-c62828">⚠️ Statutory Warnings & Travel Bars</h5>
        <ul data-s="margin-0 padding-left-1_25rem font-size-0_9rem color-b71c1c">
          ${data.riskWarnings.map(w => `<li data-s="margin-bottom-0_25rem">${w}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (Array.isArray(data.actionPlan) && data.actionPlan.length) {
    html += `
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">📌 Step-by-Step Strategic Roadmap</h5>
        <ol data-s="margin-0 padding-left-1_25rem font-size-0_9rem">
          ${data.actionPlan.map(a => `<li data-s="margin-bottom-0_25rem">${a}</li>`).join('')}
        </ol>
      </div>
    `;
  }

  container.innerHTML = html;
}

// 64. Temporary Foreign Worker Transition & Policy Engine
export function renderForeignWorkerTransitionResults(data, container) {
  if (!data || !container) return;
  const { streamClassification: stream, lmiaAudit: lmia, currentPermitRunway: runway } = data;

  let html = `
    <div class="result-banner" data-style="margin-bottom:1rem;padding:1rem;border-radius:6px;border:1px solid ${stream?.isHighWage ? 'var(--color-success, #2e7d32)' : 'var(--color-warning, #ed6c02)'};background:${stream?.isHighWage ? '#e8f5e9' : '#fff3e0'};">
      <div data-s="display-flex align-items-center justify-content-space-between flex-wrap-wrap gap-0_5rem">
        <h4 data-style="margin:0;color:${stream?.isHighWage ? '#1b5e20' : '#e65100'};font-size:1.1rem;">
          ${stream?.stream === 'HIGH_WAGE_STREAM' ? '💼 HIGH-WAGE STREAM (FREEZE-EXEMPT)' : '⚠️ LOW-WAGE STREAM (SUBJECT TO CAPS)'}
        </h4>
        <span class="badge" data-style="background:${stream?.isHighWage ? '#2e7d32' : '#ed6c02'};color:#fff;padding:0.25rem 0.5rem;border-radius:4px;font-size:0.85rem;">
          Wage: ${(stream?.wagePerHourCad || 0).toFixed(2)} / hr (Median: ${(stream?.provincialMedianWageCad || 0).toFixed(2)})
        </span>
      </div>
      <p data-s="margin-0_5rem-0-0-0 font-size-0_9rem color-333">
        Employer Location: <strong>${lmia?.employerLocationCma || 'Canada'}</strong> (Unemployment Rate: <strong>${(lmia?.cmaUnemploymentRatePercent || 0).toFixed(1)}%</strong>) | Sector: <strong>${lmia?.sector || 'general'}</strong>.
        ${lmia?.isSubjectToCmaFreeze ? '<br><strong data-s="color-d32f2f">ESDC 6.0% Freeze Applies: Low-wage LMIA applications in this CMA are refused automatically.</strong>' : ''}
      </p>
    </div>
  `;

  html += `
    <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-240 gap-1rem margin-bottom-1rem">
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">⏱️ Work Permit Runway</h5>
        <div data-s="font-size-0_9rem">
          Days Remaining: <strong>${runway?.daysRemaining || 0} days</strong><br>
          Runway Status: <strong data-style="color:${runway?.status === 'CRITICAL_URGENCY' ? '#d32f2f' : '#2e7d32'};">${runway?.status || 'HEALTHY'}</strong><br>
          Max Permit Duration: <strong>${lmia?.maxWorkPermitDurationMonths || 12} months</strong>
        </div>
      </div>
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">🏢 Employer Cap & Exemption Rules</h5>
        <div data-s="font-size-0_9rem">
          Applicable Cap: <strong>${lmia?.applicableEmployerCapPercent || 10}% of workforce</strong><br>
          Sector Exemption: <strong>${lmia?.isSectorExemptFromFreeze ? 'YES (Construction/Healthcare)' : 'NO (Standard 10% Cap)'}</strong>
        </div>
      </div>
    </div>
  `;

  if (Array.isArray(data.viablePathways) && data.viablePathways.length) {
    html += `
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border margin-bottom-1rem">
        <h5 data-s="margin-0-0-0_5rem-0">🚀 Viable Transition Alternatives</h5>
        ${data.viablePathways.map(p => `
          <div data-s="border-left-3px-solid-color-primary padding-left-0_75rem margin-bottom-0_75rem">
            <strong>${p.pathwayName}</strong> <span class="badge" data-s="background-1976d2 color-fff font-size-0_75rem padding-0_15rem-0_35rem border-radius-3px">Feasibility: ${p.feasibility}</span><br>
            <span data-s="font-size-0_85rem color-444">${p.description} (<em>${p.statutoryReference}</em>)</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (Array.isArray(data.actionPlan) && data.actionPlan.length) {
    html += `
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">📌 Actionable Transition Steps</h5>
        <ol data-s="margin-0 padding-left-1_25rem font-size-0_9rem">
          ${data.actionPlan.map(a => `<li data-s="margin-bottom-0_25rem">${a}</li>`).join('')}
        </ol>
      </div>
    `;
  }

  container.innerHTML = html;
}

// 65. Child Disability Benefit (CDB) & RDSP Engine
export function renderChildDisabilityBenefitResults(data, container) {
  if (!data || !container) return;
  const { childDisabilityBenefit: cdb, rdspEntitlements: rdsp, dtcStatus: dtc } = data;

  let html = `
    <div class="result-banner" data-style="margin-bottom:1rem;padding:1rem;border-radius:6px;border:1px solid ${cdb?.isEligible ? 'var(--color-success, #2e7d32)' : '#d32f2f'};background:${cdb?.isEligible ? '#e8f5e9' : '#ffebee'};">
      <div data-s="display-flex align-items-center justify-content-space-between flex-wrap-wrap gap-0_5rem">
        <h4 data-style="margin:0;color:${cdb?.isEligible ? '#1b5e20' : '#c62828'};font-size:1.1rem;">
          ${cdb?.isEligible ? '🧸 CHILD DISABILITY BENEFIT ENTITLEMENT' : '⚠️ FORM T2201 PREREQUISITE REQUIRED'}
        </h4>
        <span class="badge" data-style="background:${cdb?.isEligible ? '#2e7d32' : '#c62828'};color:#fff;padding:0.25rem 0.5rem;border-radius:4px;font-size:0.85rem;">
          ${(cdb?.monthlyBenefitCad || 0).toFixed(2)} / month (${(cdb?.annualBenefitCad || 0).toFixed(2)} / yr)
        </span>
      </div>
      <p data-s="margin-0_5rem-0-0-0 font-size-0_9rem color-333">
        DTC Status: <strong>${dtc?.isDtcPrerequisiteSatisfied ? 'Certified Form T2201 Approved' : 'Action Required (Form T2201 Pending)'}</strong> | Child Age: <strong>${cdb?.childAgeYears || 0} years</strong> | Adjusted Family Income: <strong>${(cdb?.familyNetIncomeCad || 0).toLocaleString()} CAD</strong>.
      </p>
    </div>
  `;

  html += `
    <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-250 gap-1rem margin-bottom-1rem">
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">🇨🇦 RDSP Canada Disability Savings Grants</h5>
        <div data-s="font-size-0_9rem">
          Proposed Deposit: <strong>${(rdsp?.proposedAnnualContributionCad || 0).toFixed(2)} CAD</strong><br>
          Estimated Matching Grant: <strong data-s="color-2e7d32">+${(rdsp?.estimatedAnnualGrantCad || 0).toFixed(2)} CAD</strong><br>
          Estimated Bond ($0 contribution): <strong data-s="color-1976d2">+${(rdsp?.estimatedAnnualBondCad || 0).toFixed(2)} CAD</strong><br>
          Total Annual Govt Assistance: <strong data-s="color-1565c0">${(rdsp?.totalAnnualGovernmentAssistanceCad || 0).toFixed(2)} CAD</strong>
        </div>
      </div>
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">📈 Lifetime Limits &amp; Retroactive Catch-Up</h5>
        <div data-s="font-size-0_9rem">
          10-Year Catch-Up Potential: <strong data-s="color-7b1fa2">${(rdsp?.retroactiveCatchUpPotentialCad || 0).toFixed(2)} CAD</strong><br>
          Lifetime Max Grant: <strong>${(rdsp?.lifetimeGrantLimitCad || 70000).toLocaleString()} CAD</strong><br>
          Lifetime Max Bond: <strong>${(rdsp?.lifetimeBondLimitCad || 20000).toLocaleString()} CAD</strong>
        </div>
      </div>
    </div>
  `;

  if (Array.isArray(data.riskWarnings) && data.riskWarnings.length) {
    html += `
      <div data-s="background-ffebee padding-1rem border-radius-6px border-1px-solid-ef5350 margin-bottom-1rem">
        <h5 data-s="margin-0-0-0_5rem-0 color-c62828">⚠️ Statutory Preservation & Holdback Rules</h5>
        <ul data-s="margin-0 padding-left-1_25rem font-size-0_9rem color-b71c1c">
          ${data.riskWarnings.map(w => `<li data-s="margin-bottom-0_25rem">${w}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (Array.isArray(data.actionPlan) && data.actionPlan.length) {
    html += `
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">📌 Application & Account Setup Steps</h5>
        <ol data-s="margin-0 padding-left-1_25rem font-size-0_9rem">
          ${data.actionPlan.map(a => `<li data-s="margin-bottom-0_25rem">${a}</li>`).join('')}
        </ol>
      </div>
    `;
  }

  container.innerHTML = html;
}

// 66. Alberta Residential Tenancies Security Deposit & RTDRS Defense
export function renderAlbertaSecurityDepositResults(data, container) {
  if (!data || !container) return;
  const { depositAudit: dep, inspectionCompliance: insp, refundAssessment: ref } = data;

  let html = `
    <div class="result-banner ${insp?.landlordForfeitedDeductionRights ? 'result-warning' : 'result-compliant'}" data-style="margin-bottom:1rem;padding:1rem;border-radius:6px;border:1px solid ${insp?.landlordForfeitedDeductionRights ? '#d32f2f' : 'var(--color-success, #2e7d32)'};background:${insp?.landlordForfeitedDeductionRights ? '#ffebee' : '#e8f5e9'};">
      <div data-s="display-flex align-items-center justify-content-space-between flex-wrap-wrap gap-0_5rem">
        <h4 data-style="margin:0;color:${insp?.landlordForfeitedDeductionRights ? '#c62828' : '#1b5e20'};font-size:1.1rem;">
          ${insp?.landlordForfeitedDeductionRights ? '⚖️ LANDLORD FORFEITED DEDUCTION RIGHTS (RTA s. 19(4))' : '📋 SECURITY DEPOSIT AUDIT COMPLETE'}
        </h4>
        <span class="badge" data-style="background:${insp?.landlordForfeitedDeductionRights ? '#c62828' : '#2e7d32'};color:#fff;padding:0.25rem 0.5rem;border-radius:4px;font-size:0.85rem;">
          Total Refund Owed: ${(ref?.totalRefundOwedToTenantCad || 0).toFixed(2)} CAD
        </span>
      </div>
      <p data-s="margin-0_5rem-0-0-0 font-size-0_9rem color-333">
        Rental Unit: <strong>${data.rentalUnitAddress || 'Alberta Unit'}</strong> | Days Vacated: <strong>${ref?.daysSinceTenancyEnded || 0} days</strong> | Refund Status: <strong>${ref?.isRefundOverdue ? 'OVERDUE (Beyond 10-day statutory deadline)' : 'Within 10-day window'}</strong>.
      </p>
    </div>
  `;

  html += `
    <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-250 gap-1rem margin-bottom-1rem">
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">📝 Inspection Compliance (RTA s. 19)</h5>
        <div data-s="font-size-0_9rem">
          Move-In Inspection Completed: <strong>${insp?.landlordConductedMoveInInspection ? 'YES' : 'NO (Violates RTA s. 19)'}</strong><br>
          Signed Report Provided: <strong>${insp?.tenantReceivedSignedMoveInReport ? 'YES' : 'NO (Violates RTA s. 19)'}</strong><br>
          Move-Out Inspection Completed: <strong>${insp?.landlordConductedMoveOutInspection ? 'YES' : 'NO'}</strong><br>
          Forfeiture of Deduction Rights: <strong data-style="color:${insp?.landlordForfeitedDeductionRights ? '#d32f2f' : '#2e7d32'};">${insp?.landlordForfeitedDeductionRights ? 'FORFEITED UNDER STATUTE' : 'NO FORFEITURE'}</strong>
        </div>
      </div>
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">💰 Deposit &amp; Deductions Breakdown</h5>
        <div data-s="font-size-0_9rem">
          Deposit &amp; Fees Paid: <strong>${(dep?.totalDepositAndFeesPaid || 0).toFixed(2)} CAD</strong><br>
          Overcharged Deposit: <strong>${(dep?.overchargedDepositCad || 0).toFixed(2)} CAD</strong><br>
          Deductions Claimed: <strong>${(ref?.deductionsClaimedCad || 0).toFixed(2)} CAD</strong><br>
          Illegal Deductions Identified: <strong data-s="color-d32f2f">${(ref?.illegalDeductionsCad || 0).toFixed(2)} CAD</strong>
        </div>
      </div>
    </div>
  `;

  if (Array.isArray(data.statutoryViolations) && data.statutoryViolations.length) {
    html += `
      <div data-s="background-ffebee padding-1rem border-radius-6px border-1px-solid-ef5350 margin-bottom-1rem">
        <h5 data-s="margin-0-0-0_5rem-0 color-c62828">⚠️ Statutory Violations Identified</h5>
        <ul data-s="margin-0 padding-left-1_25rem font-size-0_9rem color-b71c1c">
          ${data.statutoryViolations.map(v => `<li data-s="margin-bottom-0_25rem">${v}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (Array.isArray(data.actionPlan) && data.actionPlan.length) {
    html += `
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">📌 RTDRS Dispute &amp; Demand Plan</h5>
        <ol data-s="margin-0 padding-left-1_25rem font-size-0_9rem">
          ${data.actionPlan.map(a => `<li data-s="margin-bottom-0_25rem">${a}</li>`).join('')}
        </ol>
      </div>
    `;
  }

  container.innerHTML = html;
}

// 67. Internationally Educated Nurses (IEN) Registration & Fast-Track Engine
export function renderInternationallyTrainedNurseResults(data, container) {
  if (!data || !container) return;
  const { nnasEvaluation: nnas, regulatoryRequirements: reg } = data;

  let html = `
    <div class="result-banner ${nnas?.isExpeditedCountry ? 'result-compliant' : 'result-warning'}" data-style="margin-bottom:1rem;padding:1rem;border-radius:6px;border:1px solid ${nnas?.isExpeditedCountry ? 'var(--color-success, #2e7d32)' : 'var(--color-warning, #ed6c02)'};background:${nnas?.isExpeditedCountry ? '#e8f5e9' : '#fff3e0'};">
      <div data-s="display-flex align-items-center justify-content-space-between flex-wrap-wrap gap-0_5rem">
        <h4 data-style="margin:0;color:${nnas?.isExpeditedCountry ? '#1b5e20' : '#e65100'};font-size:1.1rem;">
          ${nnas?.isExpeditedCountry ? '🩺 ACCELERATED NNAS EVALUATION QUALIFIED' : '📋 STANDARD NNAS EVALUATION REQUIRED'}
        </h4>
        <span class="badge" data-style="background:${nnas?.isExpeditedCountry ? '#2e7d32' : '#ed6c02'};color:#fff;padding:0.25rem 0.5rem;border-radius:4px;font-size:0.85rem;">
          ${nnas?.estimatedTimeline || 'Standard'}
        </span>
      </div>
      <p data-s="margin-0_5rem-0-0-0 font-size-0_9rem color-333">
        Designation: <strong>${data.nursingDesignation || 'RN'}</strong> | Education Country: <strong>${data.countryOfEducation || 'Philippines'}</strong> | Target Province: <strong>${data.targetProvince || 'ON'}</strong>.
        ${reg?.qualifiesForTemporaryClass ? '<br><strong data-s="color-2e7d32">Qualified for Temporary Class Registration: Can practice as an RN under supervision in Ontario while completing the NCLEX-RN.</strong>' : ''}
      </p>
    </div>
  `;

  html += `
    <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-250 gap-1rem margin-bottom-1rem">
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">🩺 Regulatory Gate Audits</h5>
        <div data-s="font-size-0_9rem">
          Currency of Practice: <strong data-style="color:${reg?.isCurrencyOfPracticeMet ? '#2e7d32' : '#d32f2f'};">${reg?.isCurrencyOfPracticeMet ? 'SATISFIED (Last practiced ' + reg?.yearsSinceLastPractice + ' yr ago)' : 'EXPIRED (> ' + reg?.currencyThresholdYears + ' yrs gap)'}</strong><br>
          Language Benchmark: <strong data-style="color:${reg?.isLanguageProficiencyMet ? '#2e7d32' : '#d32f2f'};">${reg?.isLanguageProficiencyMet ? 'SATISFIED' : 'PENDING'}</strong> (${reg?.languagePathway || 'standard'})<br>
          NCLEX-RN Exam: <strong>${reg?.hasPassedNclex ? 'PASSED' : 'Authorization to Test (ATT) Needed'}</strong>
        </div>
      </div>
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">⚖️ Statutory Protections &amp; Funding</h5>
        <div data-s="font-size-0_9rem">
          Canadian Experience Ban: <strong>FARPACTA s. 10.2 Protected</strong><br>
          Funded Supervised Placement: <strong>CNO SPEP (140–400 hours)</strong><br>
          NNAS Fee: <strong>${nnas?.applicationFeeUsd || 650} USD</strong>
        </div>
      </div>
    </div>
  `;

  if (Array.isArray(data.riskWarnings) && data.riskWarnings.length) {
    html += `
      <div data-s="background-ffebee padding-1rem border-radius-6px border-1px-solid-ef5350 margin-bottom-1rem">
        <h5 data-s="margin-0-0-0_5rem-0 color-c62828">⚠️ Licensure Hazards & Currency Gaps</h5>
        <ul data-s="margin-0 padding-left-1_25rem font-size-0_9rem color-b71c1c">
          ${data.riskWarnings.map(w => `<li data-s="margin-bottom-0_25rem">${w}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (Array.isArray(data.actionPlan) && data.actionPlan.length) {
    html += `
      <div data-s="background-surface-sunken padding-1rem border-radius-6px border-1px-solid-border">
        <h5 data-s="margin-0-0-0_5rem-0">📌 Step-by-Step Licensure Roadmap</h5>
        <ol data-s="margin-0 padding-left-1_25rem font-size-0_9rem">
          ${data.actionPlan.map(a => `<li data-s="margin-bottom-0_25rem">${a}</li>`).join('')}
        </ol>
      </div>
    `;
  }

  container.innerHTML = html;
}

// 68. Cross-Corridor Comparative PR Matrix Simulator
export function renderPrMatrixResults(data, container) {
  if (!data || !container) return;
  const { matrix = {}, comparativeSummary = {} } = data;

  const cardsHtml = Object.entries(matrix).map(([corridorKey, corr]) => {
    const isQual = corr.status === 'qualified' || corr.status === 'competitive';
    const statusBg = isQual ? '#e8f5e9' : '#fff3e0';
    const statusColor = isQual ? '#1b5e20' : '#e65100';
    const flag = corridorKey.includes('canada') ? '🇨🇦' : corridorKey.includes('australia') ? '🇦🇺' : corridorKey.includes('germany') ? '🇩🇪' : corridorKey.includes('uk') ? '🇬🇧' : '🇳🇿';

    return `
      <div data-s="background-surface-sunken border-1px-solid-border border-radius-6px padding-1rem">
        <div data-s="display-flex justify-content-space-between align-items-center margin-bottom-0_5rem">
          <h5 data-s="margin-0 font-size-1rem">${flag} ${corr.program}</h5>
          <span data-style="background:${statusBg};color:${statusColor};padding:0.2rem 0.5rem;border-radius:4px;font-size:0.8rem;font-weight:bold;">
            ${corr.status.toUpperCase()}
          </span>
        </div>
        <p data-s="margin-0_25rem-0 font-size-0_9rem">
          Score: <strong>${corr.points}</strong> / ${corr.threshold} minimum threshold
        </p>
        <p data-s="margin-0_25rem-0 font-size-0_8rem color-666">
          Statutory Authority: <em>${corr.statutoryAuthority}</em>
        </p>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="result-banner result-compliant" data-s="margin-bottom-1rem padding-1rem border-radius-6px border-1px-solid-color-success-2e7d32 background-e8f5e9">
      <h4 data-s="margin-0-0-0_5rem-0 color-1b5e20">🌐 Cross-Corridor Simulation Complete</h4>
      <p data-s="margin-0 font-size-0_95rem color-333">
        ${comparativeSummary.strategicTakeaway || 'Evaluation complete across Canada, Australia, Germany, UK, and New Zealand.'}
      </p>
    </div>
    <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-280 gap-1rem margin-bottom-1rem">
      ${cardsHtml}
    </div>
  `;
}

// 69. Spousal & Family Reunification Navigator
export function renderFamilyReunificationResults(data, container) {
  if (!data || !container) return;
  const isEligible = data.isEligible;
  const statusBg = isEligible ? '#e8f5e9' : '#fff3e0';
  const statusColor = isEligible ? '#1b5e20' : '#e65100';

  const findingsList = (data.detailedFindings || []).map(f => `<li>${f}</li>`).join('');
  const remediesList = (data.remedialOptions || []).map(r => `<li>${r}</li>`).join('');

  container.innerHTML = `
    <div class="result-banner" data-style="margin-bottom:1rem;padding:1rem;border-radius:6px;border:1px solid ${statusColor};background:${statusBg};">
      <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_5rem">
        <h4 data-style="margin:0;color:${statusColor};font-size:1.1rem;">
          ${isEligible ? '✅ REUNIFICATION CRITERIA SATISFIED' : '⚠️ REUNIFICATION BARRIERS DETECTED'}
        </h4>
        <span data-style="background:${statusColor};color:#fff;padding:0.25rem 0.5rem;border-radius:4px;font-size:0.85rem;">
          ${data.auditVerdict || 'AUDIT COMPLETE'}
        </span>
      </div>
      <p data-s="margin-0_5rem-0-0-0 font-size-0_9rem color-333">
        Statutory Basis: <strong>${data.statutoryBasis}</strong>
      </p>
    </div>
    <div data-s="background-surface-sunken border-1px-solid-border border-radius-6px padding-1rem margin-bottom-1rem">
      <h5 data-s="margin-0-0-0_5rem-0">📋 Statutory Findings & Policy Mandates</h5>
      <ul data-s="margin-0 padding-left-1_25rem font-size-0_9rem line-height-1_5">${findingsList}</ul>
    </div>
    ${remediesList ? `
    <div data-s="background-surface-sunken border-1px-solid-border border-radius-6px padding-1rem">
      <h5 data-s="margin-0-0-0_5rem-0">💡 Remedial Options & Next Steps</h5>
      <ul data-s="margin-0 padding-left-1_25rem font-size-0_9rem line-height-1_5">${remediesList}</ul>
    </div>` : ''}
  `;
}

// 70. Statutory Timeline & RFC 5545 iCalendar Sync Engine
export function renderTimelineCalendarSyncResults(data, container) {
  if (!data || !container) return;
  const milestones = data.milestones || [];

  const milestonesList = milestones.map(m => `
    <div data-s="background-surface-sunken border-1px-solid-border border-radius-6px padding-0_75rem-1rem margin-bottom-0_5rem">
      <div data-s="display-flex justify-content-space-between align-items-center">
        <strong>${m.summary}</strong>
        <span class="badge" data-s="background-1976d2 color-fff padding-0_2rem-0_5rem border-radius-4px font-size-0_8rem">${m.eventDate}</span>
      </div>
      <p data-s="margin-0_25rem-0 font-size-0_85rem color-444">${m.description}</p>
      <small data-s="color-666">Statutory authority: ${m.statutoryBasis}</small>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="result-banner result-compliant" data-s="margin-bottom-1rem padding-1rem border-radius-6px border-1px-solid-color-success-2e7d32 background-e8f5e9">
      <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_5rem">
        <h4 data-s="margin-0 color-1b5e20">📅 ${data.milestoneCount || milestones.length} Statutory Milestones Generated</h4>
        <button type="button" class="primary" id="download-ics-action-btn" data-s="padding-0_4rem-0_8rem font-size-0_85rem">
          Download .ICS Calendar File 📥
        </button>
      </div>
      <p data-s="margin-0_5rem-0-0-0 font-size-0_9rem color-333">
        Corridor: <strong>${data.corridor}</strong> | Anchor Date: <strong>${data.anchorDate}</strong>
      </p>
    </div>
    <div data-s="margin-bottom-1rem">
      ${milestonesList}
    </div>
  `;

  const downloadBtn = container.querySelector('#download-ics-action-btn');
  if (downloadBtn && data.icsCalendarContent) {
    downloadBtn.addEventListener('click', () => {
      const blob = new Blob([data.icsCalendarContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `settlement-statutory-timeline-${data.category}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
}

// 71. Newcomer Tax Shield & Wealth Builder
export function renderTaxShieldResults(data, container) {
  if (!data || !container) return;
  const { taxShieldAudit: ts = {}, governmentBenefitsAudit: gb = {}, netAnnualFinancialBoostCad = 0 } = data;

  const advisories = (data.statutoryAdvisories || []).map(a => `<li>${a}</li>`).join('');

  container.innerHTML = `
    <div class="result-banner result-compliant" data-s="margin-bottom-1rem padding-1rem border-radius-6px border-1px-solid-color-success-2e7d32 background-e8f5e9">
      <div data-s="display-flex justify-content-space-between align-items-center flex-wrap-wrap gap-0_5rem">
        <h4 data-s="margin-0 color-1b5e20">🛡️ Total Newcomer Financial Boost</h4>
        <span class="badge" data-s="background-2e7d32 color-fff padding-0_25rem-0_5rem border-radius-4px font-size-1_1rem font-weight-bold">
          +$${netAnnualFinancialBoostCad.toLocaleString()} CAD / Year
        </span>
      </div>
      <p data-s="margin-0_5rem-0-0-0 font-size-0_9rem color-333">
        Marginal Tax Rate: <strong>${data.marginalTaxRatePercent || 0}%</strong> | Tax Savings: <strong>$${(ts.totalTaxSavingsCad || 0).toLocaleString()}</strong> | Federal Benefits: <strong>$${(gb.totalAnnualBenefitsCad || 0).toLocaleString()}</strong>
      </p>
    </div>
    <div data-s="display-grid grid-template-columns-repeat-auto-fit-minmax-250 gap-1rem margin-bottom-1rem">
      <div data-s="background-surface-sunken border-1px-solid-border border-radius-6px padding-1rem">
        <h5 data-s="margin-0-0-0_5rem-0">🏠 FHSA Tax Deduction</h5>
        <p data-s="margin-0_25rem-0 font-size-0_9rem">Contribution: <strong>$${(ts.fhsa?.contributionAmountCad || 0).toLocaleString()} CAD</strong></p>
        <p data-s="margin-0_25rem-0 font-size-0_9rem color-2e7d32">Tax Saved: <strong>$${(ts.fhsa?.taxSavedCad || 0).toLocaleString()} CAD</strong></p>
        <small data-s="color-666">${ts.fhsa?.statutoryAuthority || ''}</small>
      </div>
      <div data-s="background-surface-sunken border-1px-solid-border border-radius-6px padding-1rem">
        <h5 data-s="margin-0-0-0_5rem-0">💳 TFSA $7,000 Room & Status</h5>
        <p data-s="margin-0_25rem-0 font-size-0_9rem">Room: <strong>$${(ts.tfsa?.roomCad || 0).toLocaleString()} CAD</strong></p>
        <p data-style="margin:0.25rem 0;font-size:0.9rem;color:${ts.tfsa?.nonResidentPenaltyRisk ? '#d32f2f' : '#2e7d32'};">
          ${ts.tfsa?.nonResidentPenaltyRisk ? '⚠️ Non-Resident 1%/mo Penalty Risk' : '✅ Resident: Statutorily Tax-Exempt'}
        </p>
        <small data-s="color-666">${ts.tfsa?.statutoryAuthority || ''}</small>
      </div>
      <div data-s="background-surface-sunken border-1px-solid-border border-radius-6px padding-1rem">
        <h5 data-s="margin-0-0-0_5rem-0">👨‍👩‍👧 CCB & GST/HST Family Cash</h5>
        <p data-s="margin-0_25rem-0 font-size-0_9rem">CCB Child Benefit: <strong>$${(gb.ccbAnnualCad || 0).toLocaleString()} CAD/yr</strong></p>
        <p data-s="margin-0_25rem-0 font-size-0_9rem">GST/HST Credit: <strong>$${(gb.gstHstCreditAnnualCad || 0).toLocaleString()} CAD/yr</strong></p>
        <small data-s="color-666">${gb.statutoryAuthority || ''}</small>
      </div>
    </div>
    <div data-s="background-surface-sunken border-1px-solid-border border-radius-6px padding-1rem">
      <h5 data-s="margin-0-0-0_5rem-0">⚖️ Statutory Strategy & Compliance</h5>
      <ul data-s="margin-0 padding-left-1_25rem font-size-0_9rem line-height-1_5">${advisories}</ul>
    </div>
  `;
}
