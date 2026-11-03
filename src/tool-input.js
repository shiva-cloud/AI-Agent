// Tool input contract: friendly form values -> canonical tool parameters.
// Extracted from src/server.js so the parity contract sits in its own module.
// Tool safety nets (diagnosis 2026-11-01). People type money as "$75,000" or
// "75,000"; tools expect numbers. Only values with a currency sign or thousands
// separators are converted, so codes such as "21231" stay text.
const TYPED_MONEY=/^\s*(?:CAD|C\$|CA\$|US\$|\$)?\s*-?\s*(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?\s*(?:CAD)?\s*$/i;
export function normalizeTypedNumber(value){
  if(typeof value!=='string'||!/[$,]|CAD/i.test(value)||!TYPED_MONEY.test(value))return value;
  const n=Number(value.replace(/CAD|C\$|CA\$|US\$|\$|,|\s/gi,''));
  return Number.isFinite(n)?n:value;
}
export function normalizeToolInput(input){
  if(!input||typeof input!=='object'||Array.isArray(input))return input;
  for(const [k,v] of Object.entries(input))input[k]=normalizeTypedNumber(v);
  return input;
}
// POST tool handlers accept the same friendly field names the website forms and
// the GET endpoints use; evaluators expect their canonical parameter names.
// Each entry maps formName -> [canonicalName(s), transform]; the transforms
// mirror the coercion the GET handlers apply (mirrors diagnosis 2026-11-01).
const ALIAS_TRANSFORMS={
  plain:value=>value,
  number:value=>{const n=Number(value);return value!==''&&value!==null&&Number.isFinite(n)?n:undefined;},
  boolTrue:value=>value===true||value==='true',
  notFalse:value=>!(value===false||value==='false'),
  csv:value=>Array.isArray(value)?value:(typeof value==='string'?value.split(',').map(s=>s.trim()).filter(Boolean):undefined),
  branch:value=>({parental:'parental_standard',qpip:'qpip_paternity',sickness:'sickness'}[value]??value)
};
const TOOL_FORM_ALIASES={
  '/v1/tools/study-permit-cap-pal':{
    tuition:[['tuitionFeeFirstYearCad'],'number'],
    funds:[['liquidFundsAvailableCad'],'number'],
    dependents:[['familyMembersAccompanying'],'number'],
    inland:[['isInCanadaApplication'],'boolTrue'],
    extension:[['isExtensionOfStudyPermit'],'boolTrue'],
    familyExempt:[['isFamilyOfWorkOrStudyHolder'],'boolTrue'],
    field:'fieldOfStudyCategory',cip:'cipCode',applicant:'applicantName'
  },
  '/v1/tools/study-to-pr':{
    degree:'studyLevel',
    clb:[['expectedClbLanguage'],'number'],
    teer:[['targetNocTeer'],'number'],
    foreignExperience:[['hasPriorForeignExperience'],'notFalse'],
    foreignYears:[['yearsForeignExperience'],'number']
  },
  '/v1/tools/visitor-visa-financial-ties':{
    applicant:'applicantName',country:'countryOfResidence',host:'hostInCanadaRelationship',
    days:[['plannedStayDays'],'number'],funds:[['liquidFundsCad'],'number'],
    tenure:[['yearsAtCurrentJob'],'number'],income:[['monthlyIncomeCad'],'number'],
    leaveLetter:[['hasApprovedJobLeaveLetter'],'notFalse'],property:[['ownsRealEstateProperty'],'notFalse'],
    familyHome:[['hasImmediateFamilyRemainingHome'],'notFalse'],familyTraveling:[['allImmediateFamilyTravelingTogether'],'boolTrue'],
    g7Travel:[['hasPriorCompliantTravelG7'],'notFalse'],refusal:[['hasPreviousVisaRefusal'],'boolTrue'],
    dualIntent:[['isDualIntentPrPending'],'boolTrue']
  },
  '/v1/tools/us-h1b-opt':{
    status:'visaStatus',lastWorked:'lastDayWorkedDate',i94:'i94ExpirationDate',
    hasH1bCos:[['hasTimelyFiledH1bCos'],'boolTrue'],unauthorizedDays:[['unauthorizedWorkDaysAccrued'],'number'],
    hasI485:[['hasPendingGreenCardI485'],'boolTrue']
  },
  '/v1/tools/uk-skilled-worker':{
    salary:[['annualOfferedSalaryGbp'],'number'],soc:'socCode',age:[['applicantAge'],'number'],
    preApril2024:[['isPreApril2024VisaHolder'],'boolTrue'],newEntrant:[['isNewEntrantRecentGraduate'],'boolTrue'],
    healthCare:[['isHealthAndCareOccupation'],'boolTrue'],absentDays:[['maxAbsenceDaysInAny12Months'],'number'],
    gasSafety:[['landlordGasSafetyProvided'],'notFalse']
  },
  '/v1/tools/workplace-rights':{
    profession:'regulatedProfessionName',accidentDate:'dateOfAccident',
    reported:[['reportedToSupervisor'],'notFalse'],disciplined:[['employerDisciplinedOrFiredWorker'],'boolTrue'],
    wageCut:[['unilateralWageReductionPercent'],'number']
  },
  '/v1/tools/esa-wage-theft':{
    earnings:[['grossEarningsCad'],'number'],
    years:[['yearsOfService','yearsOfContinuousService'],'number'],
    wages:[['wagesEarnedInPrior4WeeksCad'],'number'],weekly:[['regularWeeklyWagesCad'],'number'],
    payroll:[['employerOntarioPayrollCad'],'number'],control:[['hasControlOverSchedule'],'boolTrue'],
    tempRate:[['temporaryAgencyHourlyRateCad'],'number'],permRate:[['permanentEmployeeHourlyRateCad'],'number'],
    rate:[['hourlyRateCad'],'number'],hours:[['weeklyHoursWorked'],'number']
  },
  '/v1/tools/fcr-bridging':{
    nnas:[['hasNnasAdvisoryReport'],'notFalse'],province:'targetProvince',
    status:'immigrationStatus',funding:[['fundingRequiredCad'],'number']
  },
  '/v1/tools/poe-rights':{
    status:'statusCategory',
    secondary:[['isInSecondaryInspection'],'boolTrue'],deviceSearch:[['hasDigitalDeviceSearchConcern'],'boolTrue'],
    refusalRisk:[['facingRefusalRisk'],'boolTrue']
  },
  '/v1/tools/gcms-analyzer':{
    type:'applicationType',notes:'rawOfficerNotesText',
    codes:[['refusalCodes'],'csv'],days:[['daysSinceRefusal'],'number']
  },
  '/v1/tools/global-visa-matrix':{
    countries:[['preferredCountries'],'csv'],education:'educationLevel',field:'fieldOfStudy',
    experience:[['yearsExperience'],'number'],jobOffer:[['hasJobOffer'],'boolTrue'],age:[['applicantAge'],'number']
  },
  '/v1/tools/super-visa-lico':{
    hostMembers:[['hostFamilyMembersInCanada'],'number'],visitingMembers:[['parentsGrandparentsToSponsor'],'number'],
    income:[['hostAnnualIncomeCad'],'number'],coSignerIncome:[['coSignerIncomeCad'],'number'],
    insurance:[['hasCanadianHealthInsurance'],'notFalse'],coverage:[['insuranceCoverageAmountCad'],'number'],
    appType:[['applicationType'],'plain']
  },
  '/v1/tools/ei-benefits':{
    reason:'quitReasonCategory',earnings:[['averageWeeklyEarningsCad'],'number'],
    hours:[['insurableHoursAccrued'],'number'],rate:[['regionalUnemploymentRatePercent'],'number'],
    action:[['benefitType'],'branch']
  },
  '/v1/tools/lmia-readiness':{
    employer:'employerName',wage:[['offeredHourlyWageCad'],'number'],noc:'nocCode',teer:[['teerCategory'],'number'],
    isExempt:[['isExemptionClaimed'],'boolTrue'],exemptionCode:'exemptionCode',nclc:[['frenchProficiencyNclc'],'number'],
    citizenship:'applicantCitizenship',unemploymentHigh:[['cmaUnemploymentOver6Percent'],'boolTrue'],
    tfwProportion:[['currentTfwProportionPercent'],'number']
  },
  '/v1/tools/sin-healthcare':{
    status:'statusInCanada',studyWork:[['studyPermitHasWorkCondition'],'notFalse'],
    permitMonths:[['workPermitMinDurationMonths'],'number'],leaseReady:[['residencyDocumentsReady'],'notFalse']
  },
  '/v1/tools/pr-matrix':{
    education:'educationLevel',age:[['age'],'number'],experience:[['yearsExperience'],'number'],
    clb:[['englishLanguageScore'],'number'],jobOffer:[['hasJobOffer'],'boolTrue'],secondaryLang:[['hasSecondaryLanguage'],'boolTrue']
  },
  '/v1/tools/family-reunification':{
    category:'category',sponsorStatus:'sponsorStatus',programType:[['studentProgramType'],'plain']
  },
  '/v1/tools/tax-shield':{
    income:[['annualEmploymentIncomeCad'],'number']
  },
  '/v1/tools/calendar-sync':{
    milestone:[['milestoneType'],'plain'],date:[['anchorDate'],'plain'],name:[['applicantName'],'plain']
  },
  '/v1/tools/australia-reforms':{
    subclass:[['visaSubclass'],'plain'],ceasedDays:[['daysSinceCeasedEmployment'],'number'],
    cumulativeDays:[['totalCumulativeCessationDays'],'number'],income:[['annualTaxableIncomeAud'],'number'],
    hasMes:[['hasMedicareEntitlementStatement'],'boolTrue']
  },
  '/v1/tools/germany-chancenkarte':{
    points:[['chancenkartePoints'],'number'],language:[['germanLanguageLevel'],'plain'],
    hours:[['secondaryWorkHoursPerWeek'],'number'],nebenkostenMonths:[['nebenkostenInvoiceMonthsAfterPeriod'],'number'],
    arrears:[['nebenkostenArrearsDemandedEur'],'number']
  },
  '/v1/tools/moving-tax-calc':{
    oldToNewKm:[['distanceOldHomeToNewWorkKm'],'number'],newToNewKm:[['distanceNewHomeToNewWorkKm'],'number'],
    movers:[['transportAndStorageCostsCad'],'number'],travelKm:[['travelDistanceKm'],'number'],
    tempDays:[['temporaryLivingDays'],'number'],tempLodging:[['temporaryLivingLodgingCad'],'number']
  },
  '/v1/tools/severance-bardal':{
    age:[['employeeAge'],'number'],service:[['yearsOfService'],'number'],salary:[['annualSalaryCad'],'number'],
    role:[['employmentRole'],'plain'],largePayroll:[['employerPayrollOver2Point5Million'],'notFalse'],
    hasClause:[['hasSignedEnforceableEsaOnlyClause'],'boolTrue'],jobMarket:[['availabilityOfSimilarJobs'],'plain']
  },
  '/v1/tools/australia-tenancy':{
    state:[['state'],'plain'],weeklyRent:[['weeklyRentAud'],'number'],bondPaid:[['bondPaidAud'],'number'],
    rentIncreasePercent:[['rentIncreasePercent'],'number'],monthsSinceLastIncrease:[['monthsSinceLastRentIncrease'],'number'],
    noticeGivenDays:[['noticeGivenDays'],'number']
  },
  '/v1/tools/us-state-tenancy':{
    state:[['state'],'plain'],monthlyRent:[['monthlyRentUsd'],'number'],securityDeposit:[['securityDepositPaidUsd'],'number'],
    rentIncreasePercent:[['rentIncreasePercent'],'number'],tenancyMonths:[['tenancyDurationMonths'],'number'],
    daysSinceMoveOut:[['daysSinceMoveOut'],'number']
  },
  '/v1/tools/uk-devolved-tenancy':{
    nation:[['nation'],'plain'],monthlyRent:[['monthlyRentGbp'],'number'],depositPaid:[['depositPaidGbp'],'number'],
    tenureMonths:[['tenureDurationMonths'],'number'],noticeGivenDays:[['noticeGivenDays'],'number'],
    evictionGround:[['evictionGround'],'plain']
  },
  '/v1/tools/uae-tenancy-dispute':{
    emirate:[['emirate'],'plain'],currentRent:[['currentAnnualRentAed'],'number'],marketRent:[['averageMarketRentAed'],'number'],
    proposedRent:[['proposedAnnualRentAed'],'number'],noticeDays:[['noticeDaysPriorToRenewal'],'number'],
    evictionNotice:[['evictionNoticeGiven'],'boolTrue'],notaryServed:[['evictionServedViaNotary'],'notFalse']
  }
};
export function applyFormAliases(path,input){
  const aliases=TOOL_FORM_ALIASES[path];
  if(!aliases||!input||typeof input!=='object'||Array.isArray(input))return input;
  for(const [formKey,spec] of Object.entries(aliases)){
    if(!(formKey in input))continue;
    const value=input[formKey];
    if(value===undefined||value===null||value==='')continue;
    const specList=Array.isArray(spec)?spec:[spec,'plain'];
    const names=Array.isArray(specList[0])?specList[0]:[specList[0]];
    const transform=ALIAS_TRANSFORMS[specList[1]]||ALIAS_TRANSFORMS.plain;
    const mapped=transform(value);
    if(mapped===undefined)continue;
    for(const name of names)if(input[name]===undefined)input[name]=mapped;
  }
  return input;
}
// Text that must never reach a user: values of the wrong type rendered into prose.
export const TOOL_OUTPUT_GARBAGE=/\[object Object\]|\bNaN\b|\bInfinity\b|Invalid Date/;
export const TOOL_INPUT_ERROR={error:'Some fields have the wrong type or format. Check the values (numbers without letters, dates as YYYY-MM-DD) and try again.',code:'invalid_field_value'};

// Inputs a tool read but the caller left out. The tool then used a built-in default
// (or skipped the input), so the response lists them instead of presenting the
// result as if every value had come from the caller.
export const ASSUMPTION_NOTICE = 'Some inputs were not provided. The tool used its built-in default values for them, so this result may not describe your situation. Add your own values and run it again.';
const PROBED_KEYS = new Set(['then', 'toJSON', 'constructor', 'valueOf', 'toString', 'length', '__proto__', 'prototype', 'inspect', 'nodeType', 'asymmetricMatch', '$$typeof']);
const absent = value => value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

// A real URLSearchParams (iteration, Object.fromEntries and has() keep working);
// only get() also records keys that came back absent.
class TrackedSearchParams extends URLSearchParams {
  #missing;
  constructor(init, missing) { super(init); this.#missing = missing; }
  get(key) { const value = super.get(key); if (absent(value)) this.#missing.add(key); return value; }
}

export function trackQuery(url, missing) {
  return { searchParams: new TrackedSearchParams(url.searchParams, missing) };
}

export function trackBody(input, missing) {
  return new Proxy(input, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      if (typeof key === 'string' && !PROBED_KEYS.has(key) && absent(value)) missing.add(key);
      return value;
    }
  });
}
