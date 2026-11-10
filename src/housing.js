// Deliberately narrow English subtopics. Unknown questions remain evidence gaps.
// The rent subject was added for the 0.19.8 price-data batch; its lookahead keeps
// compound questions (rent deposit, rental agreement, rent increase) with their
// own subjects so average-rent evidence never answers those unrelated asks.
export const housingSubjects=['deposit','agreement','repairs','eviction','rent'];
const patterns={
  deposit:/\bdeposits?\b|\bbonds?\b|\bbond lodgement\b|\bmietkaution\b|\brental bonds?\b|\btenant fees act\b|\bholding deposits?\b|\bprohibited payments?\b|\bno credit\b|\bcanadian credit history\b|\bfianza\b|\bvisale\b/iu,
  agreement:/\bleases?\b|\btenanc(?:y|ies)\b|\btenancy agreements?\b|\brental agreements?\b|\brent(?:al)? rules?\b|\bguidelines?\b|\brent controls?\b|\brent increases?\b|\braise rent\b|\brent(?:ing)? (?:a |an )?(?:flat|apartment|house|room|place|property|condo|home|unit)\b|\benter\b|\bentry\b|\bprivacy\b|\b24 hours?\b|\bno[- ]pet\b|\bpets?\b|\bdispute(?:\s+resolution)?\b|\brtb\b|(?<!resume\s+)(?<!cv\s+)(?<!job\s+)\bscreening\b|\bbackground checks?\b|\bequifax\b|\btransunion\b|\bsinglekey\b|\bfrontlobby\b|\bnaborly\b|\bapplications?\b|\bcredit checks?\b|\bsin\b|\bt2\b|\bharass(?:ment)?\b|\bquiet enjoyment\b|\bunlawful entry\b|\bfair housing\b|\btenancy deposit scheme\b|\btds\b|\bdps\b|\btenant fees act\b|\bresidential tenancies authority\b|\brta bond\b|\bmietpreisbremse\b|\bejari\b|\brera\b|\bschufa\b|\brta\b|\bshare kitchen\b|\bshare bathroom\b|\broommates?\b|\bboarders?\b|\bassign(?:ment|ing)?\b|\bbreak lease\b|\bterminate early\b|\bn9\b|\brent pressure zones?\b|\brpz\b|\bright to rent\b|\blandlord checking service\b|\bstatutory excuse\b|\bprevious rent\b|\bvormiete\b|\bsublet(?:s|ting)?\b|\bfirst[- ]hand\b|\bsecond[- ]hand\b|\bandrahand\b|\bförstahand\b|\bhyresnämnden\b|\bhyresnamnden\b|\bovercharge\b|\bbail d'habitation\b|\bloi alur\b|\blau\b|\bley de arrendamientos\b|\bura\b|\bhdb\b|\bmees\b|\bepc\b|\benergy efficiency\b|\bdecree 43\b|\brent hikes?\b|\bhealthy homes\b|\bencadrement des loyers\b|\bétat des lieux\b|\betat des lieux\b|\bwws\b|\bhuurcommissie\b|\bfirb\b|\bbounced (?:rental )?cheques?\b|\bcondition reports?\b|\brent arrears\b|\barrears\b|\baccessibility(?:\s+modifications?)?\b|\bcommute tradeoff\b|\bneighbourhood rent\b|\b(?:rental\s+fraud|rental\s+scams?|lease\s+fraud|listing\s+scams?|fake\s+listing)\b/iu,
  repairs:/\brepairs?\b|\bmaintenance\b|\bmould\b|\bmold\b|\bheat(?:ing)?\b|\bwinter\b|\btemperature\b|\bbylaws?\b|\bnebenkosten\b|\boperating costs?\b|\brepair\b|\bdeduct\b|\burgent repairs\b|\bncat\b|\bhabitability\b|\bheating capacity\b|\binsulation\b|\baccessibility(?:\s+modifications?)?\b/iu,
  eviction:/\bevict(?:ion|ions|ed)?\b|\block[ -]?out\b|\blocked out\b|\bn12\b|\bn13\b|\bdoor locks?\b|\bchange(?:d|s)? (?:the )?locks?\b|\bsheriff\b|\bsection 21\b|\bform 6a\b|\bnotary public\b/iu,
  rent:/\brent(?:al|s)?\b(?!\s+(?:rules?|deposits?|agreements?|leases?|increases?|controls?|stabilization|compensation|caps?|applications?|screening|housing|arrears|modifications?|and\s+commute|tradeoff|neighbourhood|flats?|properties|property|units?|apartments?|homes?|statutory|checks?|cheques?|hikes?|ceilings?|rates?|standards?|under\b|for\s+residential|guidelines?)\b)/iu
};

export const housingQuestionSubjects = question => {
  if (typeof question !== 'string') return [];
  let matched = Object.entries(patterns).filter(([, pattern]) => pattern.test(question)).map(([subject]) => subject);
  if (matched.includes('deposit')) {
    const isOnlyDepositAmount = /\b(?:[0-9]+|one|two|three|four|five|six)\s+(?:months?|weeks?)\s+rent\b/i.test(question) ||
      /\brent\s+as\s+a\s+(?:security\s+)?deposit\b/i.test(question) ||
      /\b(?:security\s+)?deposits?\s+at\s+(?:one|[0-9]+)\s+month\b/i.test(question) ||
      /\bannual\s+rent\s+under\b/i.test(question);
    const hasExplicitAgreementAnd = /\b(?:lease|agreement|contract)\s+and\s+(?:deposit|bond)\b|\b(?:deposit|bond)\s+and\s+(?:lease|agreement|contract)\b/i.test(question);
    
    matched = matched.filter(s => {
      if (s === 'rent' && (isOnlyDepositAmount || !/\b(?:average|market|median|typical|prices?|cost of)\s+rent\b/i.test(question))) {
        return /\b(?:and\s+rent\b|rent\s+and\b|prices?)/i.test(question) && !isOnlyDepositAmount;
      }
      if (s === 'agreement' && !hasExplicitAgreementAnd && /\b(?:residential\s+tenanc(?:y|ies)|tenanc(?:y|ies)\s+with|for\s+tenanc(?:y|ies))\b/i.test(question)) {
        return false;
      }
      return true;
    });
  }
  if (matched.includes('repairs') && matched.includes('rent')) {
    if (/\b(?:repair\s+and\s+deduct|spend\s+and\s+deduct|deduct(?:\s+from)?\s+rent)\b/i.test(question)) {
      matched = matched.filter(s => s !== 'rent');
    }
  }
  if (matched.includes('agreement') && matched.includes('rent')) {
    if (/\b(?:rent[- ]hike(?:\s+cap)?|percent\s+rent\s+hike|decree\s*43|rent\s+increase\s+bands?)\b/i.test(question) || (!/\b(?:average|market|median|typical|prices?|cost of)\s+rent\b/i.test(question) && !/\brent\s+prices?\b/i.test(question) && !/\b(?:how much is rent|rent in [a-z]+)\b/i.test(question) && !/\b(?:mietpreisbremse|vormiete|previous rent)\b/i.test(question))) {
      matched = matched.filter(s => s !== 'rent');
    }
  }
  return matched;
};

// Preserve the original seed's scope without rewriting historical database rows.
export const recordHousingSubject = record => record?.housingSubject ?? (record?.id === 'eviction' ? 'eviction' : null);

export const recordHousingSubjects = record => {
  if (!record || record.topic !== 'housing') return [];
  const primary = recordHousingSubject(record);
  const subjects = primary ? [primary] : [];
  const text = `${record.id || ''} ${record.title || ''} ${record.summary || ''}`.toLowerCase();
  if (!subjects.includes('deposit') && /\b(?:deposits?|bonds?|mietkaution|fianza|guarantors?)\b/i.test(text)) subjects.push('deposit');
  if (!subjects.includes('eviction') && /\b(?:evict|eviction)\b/i.test(text)) subjects.push('eviction');
  if (!subjects.includes('repairs') && /\b(?:repairs?|maintenance|mou?ld|mold|heating)\b/i.test(text)) subjects.push('repairs');
  if (!subjects.includes('agreement') && /\b(?:leases?|tenanc(?:y|ies)|agreements?|rent control|rent increase|rental|screening)\b/i.test(text)) subjects.push('agreement');
  if (!subjects.includes('rent') && /\b(?:rent subsidy|housing subsidy|housing benefit|section 8|vouchers?|supplement)\b/i.test(text)) subjects.push('rent');
  return subjects;
};
