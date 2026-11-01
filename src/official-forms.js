// src/official-forms.js
// Official statutory government forms definitions and pure vector PDF 1.4 generator.
// Zero runtime npm dependencies.

export const OFFICIAL_FORM_TEMPLATES = {
  ltb_t1: {
    org: 'Tribunals Ontario / Landlord and Tenant Board',
    num: 'FORM T1',
    title: 'Tenant Application for a Rebate of Money the Landlord Owes',
    statute: 'Residential Tenancies Act, 2006, s. 135',
    fields: [
      { id: 'tenantName', label: 'Tenant Full Legal Name', default: 'Sharma, Shiva' },
      { id: 'rentalAddress', label: 'Rental Unit Address', default: '100 City Centre Dr, Unit 1204, Mississauga, ON' },
      { id: 'landlordName', label: 'Landlord Full Legal Name', default: 'Ontario Premier Properties Inc.' },
      { id: 'remedyType', label: 'Reason for Application', default: 'Reason 1: Landlord collected an unlawful amount of money (illegal advance rent/deposit)' },
      { id: 'illegalDepositPaid', label: 'Total Unlawful Amount Paid ($ CAD)', default: '13200.00' },
      { id: 'lawfulDepositAllowed', label: 'Statutory Permitted Rent Deposit ($ CAD)', default: '2200.00' },
      { id: 'rebateClaimed', label: 'Total Rebate Claimed from Landlord ($ CAD)', default: '11000.00' },
      { id: 'tenancyStartDate', label: 'Tenancy Start Date', default: '2026-09-01' }
    ]
  },
  ltb_t2: {
    org: 'Tribunals Ontario / Landlord and Tenant Board',
    num: 'FORM T2',
    title: 'Application about Tenant Rights & Substantial Interference',
    statute: 'Residential Tenancies Act, 2006, s. 24, 29, 31',
    fields: [
      { id: 'tenantName', label: 'Tenant Full Legal Name', default: 'Sharma, Shiva' },
      { id: 'rentalAddress', label: 'Rental Unit Address', default: '100 City Centre Dr, Unit 1204, Mississauga, ON' },
      { id: 'landlordName', label: 'Landlord Full Legal Name', default: 'Ontario Premier Properties Inc.' },
      { id: 'infractionType', label: 'Statutory Breach Claimed', default: 'Reason 2: Illegal lockout / Changed locking system without LTB eviction order' },
      { id: 'abatementClaimed', label: 'Rent Abatement Claimed ($ CAD)', default: '2200.00' },
      { id: 'outOfPocketExpenses', label: 'Emergency Expenses (Hotel/Storage/Locks) ($ CAD)', default: '850.00' },
      { id: 'administrativeFine', label: 'Administrative Fine Requested against Landlord ($ CAD)', default: '5000.00' },
      { id: 'incidentDate', label: 'Date of Unlawful Interference', default: '2026-10-15' }
    ]
  },
  cbsa_e677: {
    org: 'Canada Border Services Agency / Agence des services frontaliers du Canada',
    num: 'FORM E677',
    title: 'Cross-Border Currency or Monetary Instruments Report - Individual',
    statute: 'PCMLTFA s. 12(1) / Cross-Border Currency Regulations',
    fields: [
      { id: 'fullName', label: 'Full Legal Name (Surname, Given)', default: 'Sharma, Shiva' },
      { id: 'dob', label: 'Date of Birth (YYYY-MM-DD)', default: '1995-04-12' },
      { id: 'citizenship', label: 'Country of Citizenship', default: 'India' },
      { id: 'permanentAddress', label: 'Permanent Address', default: '42 MG Road, Bangalore 560001, India' },
      { id: 'canadianAddress', label: 'Destination Address in Canada', default: '100 City Centre Dr, Mississauga, ON L5B 2C9' },
      { id: 'portOfEntry', label: 'CBSA Port of Entry', default: 'Toronto Pearson International (YYZ - Port 497)' },
      { id: 'currencyCAD', label: 'Total Canadian Dollar Value Transported', default: '16500.00' },
      { id: 'sourceOfFunds', label: 'Legitimate Source of Funds', default: 'Personal savings from employment & bank wire liquidation' }
    ]
  },
  fincen_105: {
    org: 'Department of the Treasury / Financial Crimes Enforcement Network (FinCEN)',
    num: 'FORM FinCEN 105 (CBP)',
    title: 'Report of International Transportation of Currency or Monetary Instruments (CMIR)',
    statute: '31 U.S.C. 5316 / 31 CFR 1010.340',
    fields: [
      { id: 'fullName', label: 'Full Legal Name', default: 'Sharma, Shiva' },
      { id: 'usAddress', label: 'Address in the United States', default: '350 5th Ave, New York, NY 10118' },
      { id: 'foreignAddress', label: 'Permanent Foreign Address', default: '42 MG Road, Bangalore 560001, India' },
      { id: 'passportNo', label: 'Passport Number', default: 'Z9823412' },
      { id: 'portOfEntry', label: 'U.S. Customs Port of Entry', default: 'JFK International Airport (New York)' },
      { id: 'currencyUSD', label: 'Total U.S. Dollar Value Transported', default: '14500.00' },
      { id: 'carrierType', label: 'Mode of Travel / Carrier', default: 'Commercial Airline Flight AI 101' }
    ]
  },
  cbsa_bsf186: {
    org: 'Canada Border Services Agency / Agence des services frontaliers du Canada',
    num: 'FORM BSF186 (B4)',
    title: 'Personal Effects Accounting Document (Settler Effects)',
    statute: 'Customs Tariff Heading 98.05 / 98.07; Customs Act s. 32',
    fields: [
      { id: 'importerName', label: 'Importer Full Legal Name (Surname, Given)', default: 'Sharma, Shiva' },
      { id: 'originCountry', label: 'Former Country of Domicile / Residence', default: 'India' },
      { id: 'arrivalDate', label: 'Date of Arrival in Canada (YYYY-MM-DD)', default: '2026-10-30' },
      { id: 'portOfEntry', label: 'Port of Entry / CBSA Office', default: 'Toronto Pearson International (YYZ - Port 497)' },
      { id: 'classification', label: 'Tariff Classification & Status', default: 'Settler (Heading 98.05) — Intends to reside > 12 months' },
      { id: 'docType', label: 'Accounting Form Type', default: 'BSF186 — Goods Accompanying at Landing' },
      { id: 'electronics', label: 'Personal Electronics & Serial Numbers', default: '1x Apple MacBook Pro 16" (SN: C02G45ABCDEF), 1x iPhone 15 (SN: DX3J9KLMNP), CAD 3,800' },
      { id: 'jewelry', label: 'Precious Items & Jewelry Description', default: '2x Gold chains (22K, 38g), 1x Wedding band (18K, 6g). Owned > 12 months, CAD 4,200' },
      { id: 'household', label: 'Used Household Goods & Wearing Apparel', default: '4x Suitcases containing used wearing apparel, textbooks, linens, cookware, CAD 2,500' },
      { id: 'conveyanceVin', label: 'Motor Vehicle / Conveyance (VIN or N/A)', default: 'N/A — No motor vehicle imported' },
      { id: 'goodsToFollow', label: 'CBSA BSF186A Attached for Goods to Follow?', default: 'Yes — 8 air-cargo manifest boxes arriving within 6 months' },
      { id: 'totalDeclaredCAD', label: 'Total Declared Value in CAD', default: '10500.00' }
    ]
  },
  cra_rc151: {
    org: 'Canada Revenue Agency / Agence du revenu du Canada',
    num: 'FORM RC151',
    title: 'GST/HST and Canada Carbon Rebate Application for Individuals Becoming Residents of Canada',
    statute: 'Excise Tax Act s. 122.5 / Greenhouse Gas Pollution Pricing Act',
    fields: [
      { id: 'fullName', label: 'Full Legal Name', default: 'Sharma, Shiva' },
      { id: 'entryDate', label: 'Date You Became a Resident of Canada', default: '2026-10-30' },
      { id: 'sin', label: 'Social Insurance Number (SIN)', default: '987-654-321' },
      { id: 'maritalStatus', label: 'Marital Status', default: 'Single' },
      { id: 'currentAddress', label: 'Mailing Address in Canada', default: '100 City Centre Dr, Mississauga, ON L5B 2C9' },
      { id: 'incomeEntryYearCAD', label: 'World Income in Year of Entry (CAD)', default: '12000.00' },
      { id: 'incomePriorYearCAD', label: 'World Income in Prior Year (CAD)', default: '35000.00' },
      { id: 'numberOfDependents', label: 'Number of Dependent Children', default: '0' }
    ]
  }
};

/**
 * Escapes characters for PDF literal text strings
 */
export function escapePdfText(str = '') {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/**
 * Builds a vector PDF 1.4 document string for an official statutory form.
 */
export function buildVectorPdf({
  org = '',
  num = '',
  title = '',
  statute = '',
  fields = [],
  date = '2026-10-30'
} = {}) {
  let stream = '';

  // Document Header
  stream += 'BT\n/F1 10 Tf\n50 780 Td\n(' + escapePdfText(org) + ') Tj\nET\n';
  stream += 'BT\n/F1 16 Tf\n50 760 Td\n(' + escapePdfText(num + ': ' + title) + ') Tj\nET\n';
  stream += 'BT\n/F1 9 Tf\n50 742 Td\n(Statutory Parity: ' + escapePdfText(statute) + ') Tj\nET\n';

  // Divider Line
  stream += '50 732 m 545 732 l S\n';

  // Section Heading
  stream += 'BT\n/F1 11 Tf\n50 715 Td\n(PART 1: PRESCRIBED STATUTORY SUBMISSION DETAILS) Tj\nET\n';

  let y = 690;
  fields.forEach(f => {
    stream += 'BT\n/F1 9 Tf\n50 ' + y + ' Td\n(' + escapePdfText(f.label) + ':) Tj\nET\n';
    stream += 'BT\n/F1 10 Tf\n220 ' + y + ' Td\n(' + escapePdfText(String(f.val || '-')) + ') Tj\nET\n';
    stream += '220 ' + (y - 2) + ' m 545 ' + (y - 2) + ' l S\n';
    y -= 22;
  });

  // Statutory Declaration Box
  y -= 10;
  stream += '50 ' + y + ' 495 50 re S\n';
  stream += 'BT\n/F1 8 Tf\n60 ' + (y + 35) + ' Td\n(STATUTORY DECLARATION: I declare under penalties of perjury and statutory non-compliance) Tj\nET\n';
  stream += 'BT\n/F1 8 Tf\n60 ' + (y + 22) + ' Td\n(that the statements made herein are true, correct, and complete to the best of my knowledge.) Tj\nET\n';
  stream += 'BT\n/F1 8 Tf\n60 ' + (y + 10) + ' Td\n(Prepared under official statutory authority: ' + escapePdfText(statute) + ') Tj\nET\n';

  // Signature Block
  y -= 45;
  stream += 'BT\n/F1 9 Tf\n50 ' + y + ' Td\n(Applicant / Declarant Signature: _______________________________   Date: ' + escapePdfText(date) + ') Tj\nET\n';

  const objects = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  objects.push('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n');
  objects.push('4 0 obj\n<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream\nendobj\n');
  objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

  let pdf = '%PDF-1.4\n';
  const xref = [0];
  let offset = pdf.length;

  objects.forEach(obj => {
    xref.push(offset);
    pdf += obj;
    offset = pdf.length;
  });

  const startxref = offset;
  pdf += 'xref\n0 ' + (objects.length + 1) + '\n';
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    pdf += String(xref[i]).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + startxref + '\n%%EOF';

  return pdf;
}

/**
 * Auto-populates an official government form template and produces both pure vector PDF 1.4 and print-ready HTML
 */
export function autoPopulateForm({
  formType = 'cbsa_bsf186',
  fieldOverrides = {},
  declarantDate = '2026-10-31'
} = {}) {
  const key = String(formType).toLowerCase();
  const tpl = OFFICIAL_FORM_TEMPLATES[key] || OFFICIAL_FORM_TEMPLATES.cbsa_bsf186;

  const populatedFields = tpl.fields.map(f => {
    const val = fieldOverrides[f.id] !== undefined ? String(fieldOverrides[f.id]) : f.default;
    return { id: f.id, label: f.label, val };
  });

  const pdf = buildVectorPdf({
    org: tpl.org,
    num: tpl.num,
    title: tpl.title,
    statute: tpl.statute,
    fields: populatedFields,
    date: declarantDate
  });

  const printReadyHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${tpl.num}: ${tpl.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 30px; color: #111; line-height: 1.5; }
    .form-header { border-bottom: 2px solid #222; padding-bottom: 12px; margin-bottom: 20px; }
    .org { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #444; }
    .title { font-size: 20px; font-weight: bold; margin: 4px 0; }
    .statute { font-size: 12px; color: #666; font-style: italic; }
    .field-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .field-table td { padding: 8px 10px; border-bottom: 1px solid #ddd; font-size: 13px; }
    .field-label { width: 40%; font-weight: 600; color: #333; background: #fafafa; }
    .field-val { width: 60%; font-family: monospace; color: #000; font-weight: 500; }
    .decl-box { margin-top: 25px; border: 1px solid #999; padding: 14px; background: #fdfdfd; font-size: 11px; }
    .sig-row { margin-top: 35px; font-size: 13px; display: flex; justify-content: space-between; }
    @media print { body { margin: 15mm; } button { display: none; } }
  </style>
</head>
<body>
  <div class="form-header">
    <div class="org">${tpl.org}</div>
    <div class="title">${tpl.num}: ${tpl.title}</div>
    <div class="statute">Statutory Parity: ${tpl.statute}</div>
  </div>
  <table class="field-table">
    <tbody>
      ${populatedFields.map(f => `<tr><td class="field-label">${f.label}</td><td class="field-val">${f.val}</td></tr>`).join('')}
    </tbody>
  </table>
  <div class="decl-box">
    <strong>STATUTORY DECLARATION:</strong> I declare under penalties of perjury and statutory non-compliance that the statements made herein are true, correct, and complete to the best of my knowledge under official authority of <em>${tpl.statute}</em>.
  </div>
  <div class="sig-row">
    <div>Applicant Signature: ___________________________</div>
    <div>Date: ${declarantDate}</div>
  </div>
</body>
</html>`;

  return {
    formType: key,
    organization: tpl.org,
    formNumber: tpl.num,
    title: tpl.title,
    statuteBasis: tpl.statute,
    fieldCount: populatedFields.length,
    populatedFields,
    pdfByteSize: pdf.length,
    pdfBase64: Buffer.from(pdf, 'latin1').toString('base64'),
    printReadyHtml
  };
}
