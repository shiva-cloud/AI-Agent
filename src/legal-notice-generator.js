import { ValidationError } from './api-errors.js';

/**
 * Statutory Legal Notice & Vector Document Generator
 * Generates formally structured legal demand notices and letters with strict statutory grounding:
 * 1. Ontario LTB Form T2 (Tenant Rights & Illegal Lockout / Harassment Notice - RTA ss. 21, 22, 24, 27)
 * 2. Ontario LTB Form T6 (Urgent Repair Demand & Maintenance Notice - RTA ss. 20, 30)
 * 3. Workplace Safety Work Refusal Notice (OHSA s. 43 / WorkSafeBC WCA s. 3.12)
 * 4. Employment Standards Formal Wage Demand (Ontario ESA s. 13 / BC ESA s. 58)
 * 5. Landlord Security Deposit Return Demand (Alberta RTA s. 19 / UK Housing Act 2004 s. 214)
 * 6. IRCC Dual Intent Letter of Explanation (IRPA s. 22(2))
 */

export const NOTICE_TYPES = Object.freeze({
  ONTARIO_LTB_T2: 'ontario_ltb_t2',
  ONTARIO_LTB_T6: 'ontario_ltb_t6',
  WORKPLACE_SAFETY_REFUSAL: 'workplace_safety_refusal',
  ESA_UNPAID_WAGES: 'esa_unpaid_wages',
  SECURITY_DEPOSIT_RETURN: 'security_deposit_return',
  IRCC_DUAL_INTENT_LOE: 'ircc_dual_intent_loe'
});

export const STATUTORY_METADATA = Object.freeze({
  [NOTICE_TYPES.ONTARIO_LTB_T2]: {
    title: 'Formal Notice of Tenant Rights Violation & Demand for Remedy (LTB Form T2 Pre-Action)',
    governingAct: 'Ontario Residential Tenancies Act, 2006 (RTA)',
    statutorySections: ['RTA s. 21 (Vital Services)', 'RTA s. 22 (Reasonable Enjoyment)', 'RTA s. 24 (Lock Changes)', 'RTA s. 27 (Entry Notice)', 'RTA s. 31(1) (Remedies)'],
    limitationPeriod: '1 year from the date of the incident (RTA s. 29(2))',
    maxAdministrativeFine: '$50,000 for individual landlords; $250,000 for corporate landlords (RTA s. 144)'
  },
  [NOTICE_TYPES.ONTARIO_LTB_T6]: {
    title: 'Formal Notice of Maintenance Breach & Urgent Repair Demand (LTB Form T6 Pre-Action)',
    governingAct: 'Ontario Residential Tenancies Act, 2006 (RTA)',
    statutorySections: ['RTA s. 20 (Landlord Responsibility to Repair)', 'RTA s. 30 (Remedies for Breach of Maintenance Standards)', 'O. Reg. 517/06 (Maintenance Standards)'],
    limitationPeriod: '1 year from the date of the failure to repair (RTA s. 29(2))',
    criticalWarning: 'CRITICAL STATUTORY MANDATE: Under no circumstances may a tenant unilaterally withhold rent without an order of the Landlord and Tenant Board. Doing so exposes the tenant to immediate eviction under RTA s. 59 (Form N4).'
  },
  [NOTICE_TYPES.WORKPLACE_SAFETY_REFUSAL]: {
    title: 'Formal Notice of Stage 1 Work Refusal on Grounds of Imminent Danger',
    governingAct: 'Ontario Occupational Health and Safety Act (OHSA) / Canada Labour Code',
    statutorySections: ['OHSA s. 43(3) (Right to Refuse Unsafe Work)', 'OHSA s. 43(4) (Employer Investigation Duty)', 'OHSA s. 50 (Prohibition of Reprisals)'],
    reprisalProtection: 'OHSA s. 50(5) places the reverse burden of proof on the employer at the Ontario Labour Relations Board (OLRB).'
  },
  [NOTICE_TYPES.ESA_UNPAID_WAGES]: {
    title: 'Formal Demand for Unpaid Wages and Statutory Entitlements',
    governingAct: 'Ontario Employment Standards Act, 2000 (ESA)',
    statutorySections: ['ESA s. 11 (Payment of Wages)', 'ESA s. 13 (Unlawful Deductions)', 'ESA s. 22 (Overtime Pay)', 'ESA s. 35.2 (Vacation Pay)'],
    limitationPeriod: '2 years to file an Employment Standards claim with the Ministry of Labour (ESA s. 111)',
    curePeriod: '14 calendar days from delivery before initiating formal ministry enforcement'
  },
  [NOTICE_TYPES.SECURITY_DEPOSIT_RETURN]: {
    title: 'Formal Demand for Return of Residential Security Deposit and Statutory Interest',
    governingAct: 'Alberta Residential Tenancies Act (RTA) / UK Housing Act 2004',
    statutorySections: ['Alberta RTA s. 19(4) (Inspection Requirement & Return Window)', 'Alberta RTA s. 46 (Deposit Interest)', 'UK Housing Act 2004 s. 214 (3x Deposit Penalty)'],
    statutoryWindow: '10 calendar days in Alberta; 10 days in UK after tenancy termination'
  },
  [NOTICE_TYPES.IRCC_DUAL_INTENT_LOE]: {
    title: 'Letter of Explanation — Demonstration of Dual Intent and Temporary Resident Compliance',
    governingAct: 'Immigration and Refugee Protection Act (IRPA)',
    statutorySections: ['IRPA s. 22(2) (Dual Intent Principle)', 'IRPR s. 179 (Temporary Resident Obligations)', 'IRPR s. 220 (Financial Sufficiency)'],
    corePrinciple: 'An intention by a foreign national to become a permanent resident does not preclude them from becoming a temporary resident if the officer is satisfied that they will leave Canada by the end of their authorized stay.'
  }
});

function sanitizeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export function generateLegalNotice(input = {}) {
  if (!input || typeof input !== 'object') {
    throw new ValidationError('Notice input must be an object');
  }

  const {
    type,
    senderName,
    senderAddress,
    senderPhone = '',
    senderEmail = '',
    recipientName,
    recipientAddress,
    unitAddress = '',
    incidentDate = '',
    issues = [],
    totalClaimAmount = 0,
    additionalDetails = '',
    targetCountry = 'CA',
    targetProvince = 'ON'
  } = input;

  if (!type || !Object.values(NOTICE_TYPES).includes(type)) {
    throw new ValidationError(`Invalid or missing notice type. Supported types: ${Object.values(NOTICE_TYPES).join(', ')}`);
  }

  if (!senderName || typeof senderName !== 'string' || !senderName.trim()) {
    throw new ValidationError('senderName is required');
  }

  if (!recipientName || typeof recipientName !== 'string' || !recipientName.trim()) {
    throw new ValidationError('recipientName is required');
  }

  const meta = STATUTORY_METADATA[type];
  const dateFormatted = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  // Optional fields may be missing (the website form has no address fields) or
  // the wrong type from API callers; treat anything that is not text as empty.
  const txt = v => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '').trim();
  const cleanSender = sanitizeHtml(senderName.trim());
  const cleanRecipient = sanitizeHtml(recipientName.trim());
  const cleanUnit = sanitizeHtml(txt(unitAddress) || txt(senderAddress));
  const cleanSenderAddress = sanitizeHtml(txt(senderAddress));
  const cleanRecipientAddress = sanitizeHtml(txt(recipientAddress));
  const cleanSenderEmail = sanitizeHtml(txt(senderEmail));
  const cleanSenderPhone = sanitizeHtml(txt(senderPhone));
  const cleanIncidentDate = sanitizeHtml(txt(incidentDate) || dateFormatted);
  const cleanDetails = sanitizeHtml(txt(additionalDetails));

  const issuesList = Array.isArray(issues) && issues.length > 0 
    ? issues.map(i => typeof i === 'string' ? sanitizeHtml(i.trim()) : sanitizeHtml(String(i.description || ''))).filter(Boolean)
    : ['Statutory compliance breach specified below'];

  let noticeBody = '';
  let remediesList = [];
  let warnings = [];

  switch (type) {
    case NOTICE_TYPES.ONTARIO_LTB_T2: {
      noticeBody = `This letter serves as formal pre-action notice pursuant to the Ontario Residential Tenancies Act, 2006 (RTA). You are hereby formally notified that your actions regarding the residential tenancy at ${cleanUnit} constitute serious violations of statutory tenant rights under Ontario law:\n\n` +
        issuesList.map((issue, idx) => `  ${idx + 1}. ${issue}`).join('\n') + '\n\n' +
        `Specifically, the RTA strictly prohibits landlords from substantially interfering with the reasonable enjoyment of the rental unit (s. 22), withholding or interfering with vital services (s. 21), entering without giving at least 24 hours written notice specifying reason and time (s. 27), and altering locking mechanisms without providing replacement keys (s. 24).\n\n` +
        `Unless these breaches cease immediately and full compensation is provided for incurred damages, a Form T2 Application will be formally filed with the Ontario Landlord and Tenant Board (LTB).`;
      
      remediesList = [
        'Immediate cessation of harassment, unlawful entries, or vital services cutoff',
        'Rent abatement for the entire duration of substantial interference',
        'Reimbursement of all out-of-pocket expenses directly resulting from the breach',
        'Statutory administrative fine request under RTA s. 144 (up to $50,000 for individuals, $250,000 for corporations)'
      ];
      warnings.push(`Statutory limitation: Form T2 must be filed with the LTB within 1 year of the incident date (RTA s. 29(2)).`);
      break;
    }

    case NOTICE_TYPES.ONTARIO_LTB_T6: {
      noticeBody = `This letter serves as formal written notice pursuant to Section 20 of the Ontario Residential Tenancies Act, 2006 (RTA) and Ontario Regulation 517/06 (Maintenance Standards). As landlord, you have an affirmative, non-delegable statutory obligation to keep the rental unit and residential complex at ${cleanUnit} in a good state of repair and fit for habitation.\n\n` +
        `The following urgent maintenance deficiencies require immediate remediation:\n` +
        issuesList.map((issue, idx) => `  ${idx + 1}. ${issue}`).join('\n') + '\n\n' +
        (cleanIncidentDate ? `These deficiencies have persisted since ${cleanIncidentDate} without adequate resolution.\n\n` : '') +
        `You are requested to confirm in writing within 48 hours the specific schedule and certified contractors engaged to complete these repairs. If you fail to respond or fail to commence repairs within 7 calendar days, a Form T6 Application will be filed with the Landlord and Tenant Board requesting repair orders, rent abatement, and work authorization.`;

      remediesList = [
        'Immediate certified repair of all listed health, safety, and maintenance hazards',
        'Compound rent abatement from the date landlord had knowledge until full completion',
        'Board order authorizing tenant to complete repairs and deduct costs from future rent (RTA s. 30)',
        'Compensation for damaged tenant personal property resulting from neglected repairs'
      ];
      warnings.push(meta.criticalWarning);
      warnings.push(`Limitation period: Form T6 must be filed within 1 year from the date the landlord failed to repair.`);
      break;
    }

    case NOTICE_TYPES.WORKPLACE_SAFETY_REFUSAL: {
      noticeBody = `This document provides formal written record of a Stage 1 Work Refusal initiated under Section 43(3) of the Ontario Occupational Health and Safety Act (OHSA) (or equivalent provincial workplace safety legislation).\n\n` +
        `On ${cleanIncidentDate}, the undersigned employee refused to perform the assigned task/work at the workplace due to reasonable grounds to believe that:\n` +
        issuesList.map((issue, idx) => `  - ${issue}`).join('\n') + '\n\n' +
        `Under OHSA s. 43(4), the employer or supervisor must immediately investigate the refusal in the presence of the worker and the certified health and safety representative or joint committee member. Pending this investigation, the refusing worker must remain in a safe place near the work station.\n\n` +
        `Notice of Statutory Reprisal Protection: Under OHSA s. 50, no employer or person acting on behalf of an employer shall dismiss, threaten to dismiss, discipline, suspend, or penalize a worker because the worker has acted in compliance with this Act. Under OHSA s. 50(5), on an inquiry by the Ontario Labour Relations Board (OLRB), the burden of proof that the employer did not act contrary to this section lies entirely upon the employer (Reverse Burden of Proof).`;

      remediesList = [
        'Immediate employer investigation conducted in the presence of the health and safety representative',
        'Implementation of adequate safety guards, personal protective equipment (PPE), or engineering controls',
        'Strict adherence to OHSA s. 50 non-reprisal protection with regular wage continuation'
      ];
      warnings.push(`The employee must remain on-site at a safe location during Stage 1 investigation unless assigned alternative safe work.`);
      break;
    }

    case NOTICE_TYPES.ESA_UNPAID_WAGES: {
      const claimStr = Number(totalClaimAmount) > 0 ? `$${Number(totalClaimAmount).toFixed(2)} CAD` : 'the full outstanding amount';
      noticeBody = `This letter constitutes formal legal demand for payment of unpaid wages and statutory entitlements owed under the Ontario Employment Standards Act, 2000 (ESA).\n\n` +
        `The undersigned employee is owed ${claimStr} for the following statutory violations:\n` +
        issuesList.map((issue, idx) => `  ${idx + 1}. ${issue}`).join('\n') + '\n\n' +
        `Under Section 11 of the ESA, an employer shall pay all wages to an employee on the regular pay day. Furthermore, Section 13 strictly prohibits an employer from withholding, deducting, or causing the return of wages unless authorized by statute or court order. Deductions for till cash shortages or company property damage are explicitly illegal.\n\n` +
        `Demand is hereby made for full remittance of all outstanding entitlements within 14 calendar days of receipt of this notice. Failure to satisfy this demand will result in an immediate formal Claim filed with the Ministry of Labour, Immigration, Training and Skills Development under ESA s. 96, seeking an Order to Pay plus statutory administrative fees.`;

      remediesList = [
        `Immediate payment of ${claimStr} via certified cheque, direct deposit, or electronic transfer`,
        'Issuance of an accurate, corrected Record of Employment (ROE) to Service Canada within 5 calendar days',
        'Ministry of Labour Order to Pay plus mandatory 10% administrative surcharge'
      ];
      warnings.push(`Limitation period: ESA claims must be filed within 2 years of the unpaid wage date (ESA s. 111).`);
      break;
    }

    case NOTICE_TYPES.SECURITY_DEPOSIT_RETURN: {
      const depositStr = Number(totalClaimAmount) > 0 ? `$${Number(totalClaimAmount).toFixed(2)}` : 'the full security deposit plus interest';
      noticeBody = `This letter serves as formal written demand for the prompt return of residential tenancy security deposit funds pursuant to provincial/national tenancy law.\n\n` +
        `Regarding the tenancy terminated at ${cleanUnit}:\n` +
        `Amount Owed: ${depositStr}\n` +
        issuesList.map((issue, idx) => `  - ${issue}`).join('\n') + '\n\n' +
        `Under Alberta RTA s. 19(4), a landlord who fails to complete both a move-in and move-out inspection report has forfeited the legal right to make deductions for damages from the security deposit. Furthermore, ordinary wear and tear (such as minor wall scuffs, nail holes, or carpet cleaning) cannot be deducted.\n\n` +
        `In jurisdictions subject to statutory deposit protection (e.g. UK Housing Act 2004 s. 214), failure to protect deposits or refund promptly subjects landlords to court penalties ranging from 1 to 3 times the deposit amount.\n\n` +
        `Please remit the full balance within 10 calendar days to avoid formal dispute proceedings at the Residential Tenancy Dispute Resolution Service (RTDRS) or Small Claims Court.`;

      remediesList = [
        `Full return of ${depositStr} without unauthorized deductions`,
        'Statutory compound interest accrued over the tenancy period',
        'Recovery of dispute resolution filing fees and costs'
      ];
      break;
    }

    case NOTICE_TYPES.IRCC_DUAL_INTENT_LOE: {
      noticeBody = `RE: Demonstration of Temporary Resident Intent and Dual Intent Compliance (IRPA s. 22(2))\n\n` +
        `Dear Immigration Officer,\n\n` +
        `This letter of explanation is submitted in support of the temporary resident visa / permit application for ${cleanSender}.\n\n` +
        `Under Section 22(2) of the Immigration and Refugee Protection Act (IRPA), 'An intention by a foreign national to become a permanent resident does not preclude them from becoming a temporary resident if the officer is satisfied that they will leave Canada by the end of the period authorized for their stay.'\n\n` +
        `The applicant affirms full understanding and adherence to temporary resident obligations under IRPR s. 179:\n` +
        issuesList.map((issue, idx) => `  • ${issue}`).join('\n') + '\n\n' +
        `Ties to Country of Origin & Departure Obligation:\n` +
        `The applicant maintains strong social, economic, and familial ties to their country of permanent residence. In the event that permanent residency is not granted or temporary authorization expires without extension, the applicant unconditionally commits to departing Canada prior to the expiration of lawful status.`;

      remediesList = [
        'Affirmative confirmation of IRPA s. 22(2) dual intent compliance',
        'Verification of financial sufficiency and verified living expense support under IRPR s. 220',
        'Clear documentation of lawful exit obligation and ties to home country'
      ];
      break;
    }
  }

  const printReadyHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${meta.title}</title>
  <style>
    body { font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 800px; margin: 40px auto; padding: 24px; }
    .header-box { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
    .doc-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
    .statute-cite { font-size: 13px; color: #475569; font-weight: 600; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; font-size: 14px; background: #f8fafc; padding: 16px; border-radius: 6px; border: 1px solid #e2e8f0; }
    .meta-col strong { display: block; color: #334155; margin-bottom: 4px; }
    .notice-body { font-size: 14px; white-space: pre-wrap; margin-bottom: 24px; }
    .remedies-box { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin-bottom: 24px; border-radius: 4px; }
    .remedies-box h4 { margin: 0 0 8px; color: #166534; font-size: 15px; }
    .remedies-box ul { margin: 0; padding-left: 20px; font-size: 13px; color: #14532d; }
    .warning-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin-bottom: 24px; border-radius: 4px; }
    .warning-box h4 { margin: 0 0 8px; color: #991b1b; font-size: 14px; }
    .warning-box p { margin: 0; font-size: 13px; color: #7f1d1d; }
    .signature-area { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
    .sig-line { border-bottom: 1px solid #475569; height: 40px; margin-bottom: 8px; }
    @media print { body { max-width: 100%; margin: 0; padding: 16px; } .header-box { border-bottom: 2px solid #000; } }
  </style>
</head>
<body>
  <div class="header-box">
    <div class="doc-title">${meta.title}</div>
    <div class="statute-cite">Governing Authority: ${meta.governingAct} | Sections: ${meta.statutorySections.join('; ')}</div>
    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Delivered on: ${dateFormatted}</div>
  </div>

  <div class="meta-grid">
    <div class="meta-col">
      <strong>FROM (Sender / Applicant):</strong>
      <div>${cleanSender}</div>
      ${cleanSenderAddress ? `<div>${cleanSenderAddress}</div>` : ''}
      ${cleanSenderEmail ? `<div>Email: ${cleanSenderEmail}</div>` : ''}
      ${cleanSenderPhone ? `<div>Tel: ${cleanSenderPhone}</div>` : ''}
    </div>
    <div class="meta-col">
      <strong>TO (Recipient / Authority):</strong>
      <div>${cleanRecipient}</div>
      ${cleanRecipientAddress ? `<div>${cleanRecipientAddress}</div>` : ''}
      ${cleanUnit ? `<div>Premises: ${cleanUnit}</div>` : ''}
    </div>
  </div>

  ${warnings.length > 0 ? `
  <div class="warning-box">
    <h4>Statutory Legal Notice & Limitations</h4>
    ${warnings.map(w => `<p>• ${w}</p>`).join('')}
  </div>` : ''}

  <div class="notice-body">${noticeBody}</div>

  ${remediesList.length > 0 ? `
  <div class="remedies-box">
    <h4>Demand for Statutory Relief & Action</h4>
    <ul>
      ${remediesList.map(r => `<li>${r}</li>`).join('')}
    </ul>
  </div>` : ''}

  ${cleanDetails ? `
  <div style="margin-bottom: 24px; font-size: 13px; background: #fff; border: 1px solid #cbd5e1; padding: 14px; border-radius: 4px;">
    <strong>Additional Documented Evidence & Specifics:</strong>
    <p style="margin: 6px 0 0; white-space: pre-wrap;">${cleanDetails}</p>
  </div>` : ''}

  <div class="signature-area">
    <div>
      <div class="sig-line"></div>
      <div style="font-size: 13px; font-weight: 600;">Signature of Sender / Applicant</div>
      <div style="font-size: 12px; color: #64748b;">${cleanSender}</div>
    </div>
    <div>
      <div class="sig-line"></div>
      <div style="font-size: 13px; font-weight: 600;">Date of Delivery / Service</div>
      <div style="font-size: 12px; color: #64748b;">${dateFormatted}</div>
    </div>
  </div>
</body>
</html>`;

  return {
    documentType: type,
    title: meta.title,
    governingAct: meta.governingAct,
    statutorySections: meta.statutorySections,
    date: dateFormatted,
    sender: { name: cleanSender, address: cleanSenderAddress, email: cleanSenderEmail, phone: cleanSenderPhone },
    recipient: { name: cleanRecipient, address: cleanRecipientAddress, unit: cleanUnit },
    formalNoticeText: noticeBody,
    remediesDemanded: remediesList,
    statutoryWarnings: warnings,
    limitationPeriod: meta.limitationPeriod || null,
    printReadyHtml
  };
}
