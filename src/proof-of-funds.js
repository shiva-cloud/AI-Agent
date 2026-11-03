// Express Entry proof of settlement funds (Federal Skilled Worker and Federal Skilled Trades).
// Amounts are 50% of the low-income cut-off and were updated by IRCC effective 7 July 2025.
// Reference copy; IRCC updates them every year, so confirm on the official page.
import {ValidationError} from './api-errors.js';
import { factValue, KB_FACTS } from './kb-facts.js';

export const POF_SOURCE = {
  title: 'IRCC: Proof of funds – Express Entry',
  url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html',
  effectiveFrom: KB_FACTS['ca.expressEntry.settlementFundsCad'].effectiveFrom,
  referenceCopy: KB_FACTS['ca.expressEntry.settlementFundsCad'].checkedAt
};

// Index = family size (1..7); each additional family member adds the increment.
// The table lives in src/kb-facts.js so every tool uses the same figures.
function count(value=1){
 if(!['number','string'].includes(typeof value)||String(value).trim()===''||!Number.isInteger(Number(value))||Number(value)<1||Number(value)>30)throw new ValidationError('Family size must be an integer from 1 to 30');
 return Number(value);
}
export function requiredSettlementFunds(familySize) {
  const funds=factValue('ca.expressEntry.settlementFundsCad');
  const size = count(familySize);
  return size <= 7 ? funds[size] : funds[7] + (size - 7) * funds.additionalPerPerson;
}

export function evaluateProofOfFunds(input = {}) {
  if(!input||typeof input!=='object'||Array.isArray(input))throw new ValidationError('Expected a proof-of-funds object');
  const program=input.program===undefined?'fsw':input.program;
  if(!['fsw','fst','cec'].includes(program))throw new ValidationError('Unsupported program');
  if(input.availableFundsCad!==undefined&&(!['number','string'].includes(typeof input.availableFundsCad)||String(input.availableFundsCad).trim()===''||!Number.isFinite(Number(input.availableFundsCad))||Number(input.availableFundsCad)<0))throw new ValidationError('Available funds must be a finite nonnegative amount');
  if(input.hasValidJobOfferAndWorkAuthorization!==undefined&&![true,false,'true','false'].includes(input.hasValidJobOfferAndWorkAuthorization))throw new ValidationError('Job offer confirmation must be boolean');
  const familySize = count(input.familySize);
  const available = Number.isFinite(Number(input.availableFundsCad)) ? Math.max(0, Number(input.availableFundsCad)) : 0;
  const jobOffer = input.hasValidJobOfferAndWorkAuthorization === true || input.hasValidJobOfferAndWorkAuthorization === 'true';
  const required = requiredSettlementFunds(familySize);

  let exemptReason = null;
  if (program === 'cec') exemptReason = 'Canadian Experience Class applicants do not need to show settlement funds.';
  else if (jobOffer) exemptReason = 'You are currently authorized to work in Canada and have a valid job offer, so you do not need to show settlement funds.';

  const shortfall = exemptReason ? 0 : Math.max(0, required - available);
  const buffer = Math.round(required * 0.1);
  return {
    program, familySize, requiredCad: required, availableFundsCad: available,
    exempt: Boolean(exemptReason), exemptReason,
    meetsRequirement: Boolean(exemptReason) || available >= required,
    shortfallCad: shortfall,
    surplusCad: exemptReason ? null : Math.max(0, available - required),
    recommendedBufferCad: exemptReason ? null : buffer,
    verdict: exemptReason ? 'Exempt from proof of funds'
      : available >= required + buffer ? 'Meets the requirement with a margin'
        : available >= required ? 'Meets the requirement, but with little margin for exchange-rate changes'
          : `Short by CAD ${shortfall.toLocaleString('en-CA')}`,
    rules: [
      'Family size counts you, your spouse or partner and dependent children, even if they are not coming with you.',
      'Funds must be available and transferable, and not borrowed. Equity in a home does not count.',
      'Keep the funds through the application, until you land: IRCC can ask again, and the amounts change each year.',
      'Official bank letters normally need to show the current balance and the average balance for the past six months.'
    ],
    source: POF_SOURCE
  };
}
