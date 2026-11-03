import {buildVectorPdf, supportsWorksheetPdf} from './worksheet-pdf.js';
export {buildVectorPdf, escapePdfText} from './worksheet-pdf.js';
// src/official-forms.js
// Draft preparation worksheets and pure vector PDF 1.4 generator.
// Zero runtime npm dependencies.
import {ValidationError} from './api-errors.js';
import {assertCalendarDate} from './evidence-policy.js';

export const OFFICIAL_FORM_TEMPLATES = {
  ltb_t1: {
    org: 'Tribunals Ontario / Landlord and Tenant Board',
    num: 'FORM T1',
    title: 'Tenant Application for a Rebate of Money the Landlord Owes',
    statute: 'Residential Tenancies Act, 2006, s. 135',
    fields: [
      { id: 'tenantName', label: 'Tenant Full Legal Name', default: '' },
      { id: 'rentalAddress', label: 'Rental Unit Address', default: '' },
      { id: 'landlordName', label: 'Landlord Full Legal Name', default: '' },
      { id: 'remedyType', label: 'Reason for Application', default: '' },
      { id: 'illegalDepositPaid', label: 'Total Unlawful Amount Paid ($ CAD)', default: '' },
      { id: 'lawfulDepositAllowed', label: 'Statutory Permitted Rent Deposit ($ CAD)', default: '' },
      { id: 'rebateClaimed', label: 'Total Rebate Claimed from Landlord ($ CAD)', default: '' },
      { id: 'tenancyStartDate', label: 'Tenancy Start Date', default: '' }
    ]
  },
  ltb_t2: {
    org: 'Tribunals Ontario / Landlord and Tenant Board',
    num: 'FORM T2',
    title: 'Application about Tenant Rights & Substantial Interference',
    statute: 'Residential Tenancies Act, 2006, s. 24, 29, 31',
    fields: [
      { id: 'tenantName', label: 'Tenant Full Legal Name', default: '' },
      { id: 'rentalAddress', label: 'Rental Unit Address', default: '' },
      { id: 'landlordName', label: 'Landlord Full Legal Name', default: '' },
      { id: 'infractionType', label: 'Statutory Breach Claimed', default: '' },
      { id: 'abatementClaimed', label: 'Rent Abatement Claimed ($ CAD)', default: '' },
      { id: 'outOfPocketExpenses', label: 'Emergency Expenses (Hotel/Storage/Locks) ($ CAD)', default: '' },
      { id: 'administrativeFine', label: 'Administrative Fine Requested against Landlord ($ CAD)', default: '' },
      { id: 'incidentDate', label: 'Date of Unlawful Interference', default: '' }
    ]
  },
  cbsa_e677: {
    org: 'Canada Border Services Agency / Agence des services frontaliers du Canada',
    num: 'FORM E677',
    title: 'Cross-Border Currency or Monetary Instruments Report - Individual',
    statute: 'PCMLTFA s. 12(1) / Cross-Border Currency Regulations',
    fields: [
      { id: 'fullName', label: 'Full Legal Name (Surname, Given)', default: '' },
      { id: 'dob', label: 'Date of Birth (YYYY-MM-DD)', default: '' },
      { id: 'citizenship', label: 'Country of Citizenship', default: '' },
      { id: 'permanentAddress', label: 'Permanent Address', default: '' },
      { id: 'canadianAddress', label: 'Destination Address in Canada', default: '' },
      { id: 'portOfEntry', label: 'CBSA Port of Entry', default: '' },
      { id: 'currencyCAD', label: 'Total Canadian Dollar Value Transported', default: '' },
      { id: 'sourceOfFunds', label: 'Legitimate Source of Funds', default: '' }
    ]
  },
  fincen_105: {
    org: 'Department of the Treasury / Financial Crimes Enforcement Network (FinCEN)',
    num: 'FORM FinCEN 105 (CBP)',
    title: 'Report of International Transportation of Currency or Monetary Instruments (CMIR)',
    statute: '31 U.S.C. 5316 / 31 CFR 1010.340',
    fields: [
      { id: 'fullName', label: 'Full Legal Name', default: '' },
      { id: 'usAddress', label: 'Address in the United States', default: '' },
      { id: 'foreignAddress', label: 'Permanent Foreign Address', default: '' },
      { id: 'passportNo', label: 'Passport Number', default: '' },
      { id: 'portOfEntry', label: 'U.S. Customs Port of Entry', default: '' },
      { id: 'currencyUSD', label: 'Total U.S. Dollar Value Transported', default: '' },
      { id: 'carrierType', label: 'Mode of Travel / Carrier', default: '' }
    ]
  },
  cbsa_bsf186: {
    org: 'Canada Border Services Agency / Agence des services frontaliers du Canada',
    num: 'FORM BSF186 (B4)',
    title: 'Personal Effects Accounting Document (Settler Effects)',
    statute: 'Customs Tariff Heading 98.05 / 98.07; Customs Act s. 32',
    fields: [
      { id: 'importerName', label: 'Importer Full Legal Name (Surname, Given)', default: '' },
      { id: 'originCountry', label: 'Former Country of Domicile / Residence', default: '' },
      { id: 'arrivalDate', label: 'Date of Arrival in Canada (YYYY-MM-DD)', default: '' },
      { id: 'portOfEntry', label: 'Port of Entry / CBSA Office', default: '' },
      { id: 'classification', label: 'Tariff Classification & Status', default: '' },
      { id: 'docType', label: 'Accounting Form Type', default: '' },
      { id: 'electronics', label: 'Personal Electronics & Serial Numbers', default: '' },
      { id: 'jewelry', label: 'Precious Items & Jewelry Description', default: '' },
      { id: 'household', label: 'Used Household Goods & Wearing Apparel', default: '' },
      { id: 'conveyanceVin', label: 'Motor Vehicle / Conveyance (VIN or N/A)', default: '' },
      { id: 'goodsToFollow', label: 'CBSA BSF186A Attached for Goods to Follow?', default: '' },
      { id: 'totalDeclaredCAD', label: 'Total Declared Value in CAD', default: '' }
    ]
  },
  cra_rc151: {
    org: 'Canada Revenue Agency / Agence du revenu du Canada',
    num: 'FORM RC151',
    title: 'GST/HST and Canada Carbon Rebate Application for Individuals Becoming Residents of Canada',
    statute: 'Excise Tax Act s. 122.5 / Greenhouse Gas Pollution Pricing Act',
    fields: [
      { id: 'fullName', label: 'Full Legal Name', default: '' },
      { id: 'entryDate', label: 'Date You Became a Resident of Canada', default: '' },
      { id: 'sin', label: 'Social Insurance Number (SIN)', default: '' },
      { id: 'maritalStatus', label: 'Marital Status', default: '' },
      { id: 'currentAddress', label: 'Mailing Address in Canada', default: '' },
      { id: 'incomeEntryYearCAD', label: 'World Income in Year of Entry (CAD)', default: '' },
      { id: 'incomePriorYearCAD', label: 'World Income in Prior Year (CAD)', default: '' },
      { id: 'numberOfDependents', label: 'Number of Dependent Children', default: '' }
    ]
  }
};

/**
 * Escapes plain text for the printable worksheet.
 */
function escapeHtml(value) {
  const entities = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};
  return String(value ?? '').replace(/[&<>"']/g, char => entities[char]);
}

export function autoPopulateForm(options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new ValidationError('Form options must be an object');
  const {
  formType = 'cbsa_bsf186',
  fieldOverrides = {},
  declarantDate = ''
  } = options;
  if (typeof formType !== 'string' || !Object.hasOwn(OFFICIAL_FORM_TEMPLATES, formType.toLowerCase())) throw new ValidationError('Unsupported form type');
  const key = formType.toLowerCase();
  const tpl = OFFICIAL_FORM_TEMPLATES[key];
  if (!fieldOverrides || typeof fieldOverrides !== 'object' || Array.isArray(fieldOverrides)) throw new ValidationError('Form fields must be an object');
  if (declarantDate !== '') assertCalendarDate(declarantDate, 'Worksheet date');
  for (const [id, value] of Object.entries(fieldOverrides)) {
    if (!tpl.fields.some(field => field.id === id)) throw new ValidationError(`Unknown form field: ${id}`);
    if ((typeof value !== 'string' && typeof value !== 'number') || (typeof value === 'number' && !Number.isFinite(value)) || String(value).length > 2000) throw new ValidationError(`Invalid form field: ${id}`);
  }

  const populatedFields = tpl.fields.map(f => {
    const val = Object.hasOwn(fieldOverrides, f.id) ? String(fieldOverrides[f.id]) : '';
    return { id: f.id, label: f.label, val };
  });

  const pdfSupported = supportsWorksheetPdf([tpl.org, tpl.num, tpl.title, tpl.statute, declarantDate, ...populatedFields.flatMap(field => [field.label, field.val])]);
  const pdf = pdfSupported ? buildVectorPdf({
    org: tpl.org,
    num: tpl.num,
    title: tpl.title,
    statute: tpl.statute,
    fields: populatedFields,
    date: declarantDate
  }) : null;

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
    .field-table { table-layout: fixed; width: 100%; border-collapse: collapse; margin-top: 15px; }
    .field-table td { overflow-wrap: anywhere; white-space: pre-wrap; padding: 8px 10px; border-bottom: 1px solid #ddd; font-size: 13px; }
    .field-label { width: 40%; font-weight: 600; color: #333; background: #fafafa; }
    .field-val { width: 60%; font-family: monospace; color: #000; font-weight: 500; }
    .decl-box { margin-top: 25px; border: 1px solid #999; padding: 14px; background: #fdfdfd; font-size: 11px; }
    .sig-row { margin-top: 35px; font-size: 13px; display: flex; justify-content: space-between; }
    @media print { body { margin: 15mm; } button { display: none; } }
  </style>
</head>
<body>
  <p><strong>DRAFT WORKSHEET - NOT AN OFFICIAL FORM</strong></p>
  <div class="form-header">
    <div class="org">${tpl.org}</div>
    <div class="title">${tpl.num}: ${tpl.title}</div>
    <div class="statute">Reference: ${tpl.statute}</div>
  </div>
  <table class="field-table">
    <tbody>
      ${populatedFields.map(f => `<tr><td class="field-label">${escapeHtml(f.label)}</td><td class="field-val">${escapeHtml(f.val)}</td></tr>`).join('')}
    </tbody>
  </table>
  <div class="decl-box">
    <strong>DRAFT WORKSHEET:</strong> This is not an official government form. Review your information and complete the current official form separately.
  </div>
  <div class="sig-row">
    <div>Draft worksheet - not for submission</div>
    <div>Date: ${escapeHtml(declarantDate)}</div>
  </div>
</body>
</html>`;

  return {
    documentStatus: 'draft_worksheet',
    submissionReady: false,
    missingFields: populatedFields.filter(field => !field.val.trim()).map(field => field.id),
    formType: key,
    organization: tpl.org,
    formNumber: tpl.num,
    title: tpl.title,
    statuteBasis: tpl.statute,
    fieldCount: populatedFields.length,
    populatedFields,
    pdfSupported,
    pdfNotice: pdfSupported ? null : 'Use View & Print Worksheet, then Save as PDF, to preserve non-ASCII text.',
    pdfByteSize: pdf?.length ?? 0,
    pdfBase64: pdf === null ? null : Buffer.from(pdf, 'ascii').toString('base64'),
    printReadyHtml
  };
}
