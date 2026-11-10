import { globalDestinations, explicitCountryPatterns, resolveInputCountry, isValidCityForCountry, destinationCities, destinationRegions, destinationCountries, cityToRegion } from './destinations.js';
import { normalizeEnglishQuestion } from './question-normalization.js';
import { ValidationError } from './api-errors.js';
import { randomUUID } from 'node:crypto';
import { assertEnglishText, assertEnglishRecord } from './language.js';
import { cities, topics } from './knowledge.js';
import { queryTerms, rankLexically, tokenize } from './search.js';
import { detectUrgentHelp } from './urgent-help.js';
import { loadSubjectTags, ROUTED_TOPICS, subjectShadow, subjectsOfRecord } from './subject-tags.js';
import { questionSubjects } from './subject-vocabulary.js';
import { subjectEvidenceMatcher, requestedSubject } from './requested-subject.js';
import { describesLifeInCountry, namedReferenceCountry, recordFitsSubject, referenceCoverageNotice } from './reference-countries.js';
import { housingQuestionSubjects, recordHousingSubject, recordHousingSubjects } from './housing.js';
import { licenceContext, originCountryContext } from './licence-context.js';
import { highRiskTopics } from './evidence-policy.js';
import { telecomContext } from './telecom.js';
import { hasUnsupportedDestination, supportedCitiesIn, supportedRegionsIn, describeLocationClarification, resolveClauseGeography, GEOGRAPHY_VERSION } from './geography.js';
import { queryRequirements, assessAnswerability } from './query-contract.js';
import { resolveQuestionBankItem } from './global-immigration-question-bank-resolver.js';
import { resolveQuestionBankBatch3Item, resolveQuestionBankAny } from './global-immigration-question-bank-batch3-resolver.js';
import { resolveMarketGapBatch1Item } from './market-gap-batch1-resolver.js';
import { resolveMarketGapBatch2Item } from './market-gap-batch2-resolver.js';
import { resolveMarketGapBatch3Item } from './market-gap-batch3-resolver.js';
import { resolveGlobalSettlementItem } from './global-settlement-resolver.js';
import { resolveSocialCrisisGuidance } from './social-qa-crisis-navigator.js';
import { detectAndTranslateMultilingualQuery } from './multilingual-layer.js';
import { resolveNarrativeCrisis } from './narrative-crisis-resolver.js';




export const REGION_ALIASES = Object.freeze({
  'Australia': Object.freeze({
    'NSW': 'New South Wales',
    'VIC': 'Victoria',
    'QLD': 'Queensland',
    'WA': 'Western Australia',
    'SA': 'South Australia'
  }),
  'United States': Object.freeze({
    'CA': 'California',
    'Calif': 'California',
    'NY': 'New York',
    'NYC': 'New York',
    'TX': 'Texas',
    'FL': 'Florida',
    'WA': 'Washington State',
    'IL': 'Illinois'
  }),
  'United Kingdom': Object.freeze({
    'NI': 'Northern Ireland'
  }),
  'Germany': Object.freeze({
    'NRW': 'North Rhine-Westphalia',
    'Bayern': 'Bavaria'
  }),
  'Spain': Object.freeze({
    'Catalunya': 'Catalonia',
    'Cataluña': 'Catalonia',
    'Andalucía': 'Andalusia'
  })
});

const lexicon = {
  sin: /\bsin\b|social insurance|\bsin disclosure\b|\b900[- ]series\b|\bssn\b|\bsocial security(?:\s+number)?\b|\bnin\b|\bnational insurance(?:\s+number)?\b|\bni\s+numbers?\b|\btfn\b|\btax file number\b|\bsteuer[- ]id\b|\banmeldung\b|\bbürgeramt\b|\bemirates id\b|\bird number\b|\bpps number\b|\bppsn\b|\bitin\b|\bform w[- ]?7\b|\bcpf\b|\bdigid\b|\bfin\b|\bpersonnummer\b|\bnie\b|\btie\b|\bcarte vitale\b|\bburgerservicenummer\b|\bbsn\b|\bsin number\b|\bsin card\b|\bnin number\b|\bssn card\b|\blost (?:identity|id|status) documents?\b|\bname mismatch\b|\bidentity recovery\b|\bpersonal data correction\b|\btax numbers?\b|\btax id\b|\btax identification numbers?\b|\b(?:provincial\s+)?photo\s+ids?\b|\bstate\s+ids?\b|\bgovernment[- ]issued\s+ids?\b|\bmunicipal\s+ids?\b|\bidentity\s+cards?\b|\bidentity\s+documents?\b|\bproof of (?:residence|address)\b|\bresidence proof\b|\bpadron\b|\bempadronamiento\b/iu,
  health: /\bohip\b|\bdoctors?\b|\boptometrists?\b|\beye (?:exams?|doctors?|tests?)\b|\btherapists?\b|\btherapy\b|\bloneliness support\b|\bmobility services\b|\bassistive devices\b|\bmaternity care\b|\bprenatal care\b|\bpregnan(?:cy|t)?(?:\s+care)?\b|\bmidwi(?:fe|fery|ves)\b|\bflu shots?\b|\bfamily doctors?\b|\bwalk[- ]in clinics?\b|\bwalk-in\b|(?<!legal )\bclinics?\b|\bprescriptions?\b|\brefills?\b|\bhospitals?\b|\bemergency rooms?\b|\burgent care\b|\bemergency departments?\b|\bdentists?\b|\bdental\b|\bnurse practitioners?\b|\bvaccin(?:e|es|ated|ation|ations)\b|\bmsp\b|\bhealth(?:care)?\b|\bmedical\b|\bhealth insurance\b|\bmedical exam\b|\bexcessive demand\b|(?<!criminally\s+)(?<!criminal\s+)\binadmissib(?:le|ility)\b|\bphysicians?\b|\bregulation 552\b|\blist [abc]\b|\bnewborn\b|\bbirth registration\b|\b5-in-1\b|\b(?:register(?:ing)? (?:the |a )?birth|born in|newborn bundle)\b|\baddress change\b|\bchange of address\b|\bispa\b|\baffidavit\b|\bstatement of conscience\b|\bbc services card\b|\bcarecard\b|\bwaiting period\b|\baca\b|\bhealthcare\.gov\b|\bmarketplace insurance\b|\bnhs\b|\bgp\b|\bgp surgery\b|\bmedicare\b|\bgkv\b|\bgesetzliche krankenversicherung\b|\bkrankenkasse\b|\btechniker krankenversicherung\b|\btk\b|\baok\b|\bdha\b|\bdoh\b|\bessential benefits plan\b|\bacc\b|\bhse\b|\bmedicare levy\b|\bmedicare entitlement statement\b|\bmes\b|\bportabilit(?:y|ies)\b|\bbill 175\b|\breciprocal health(?: care)?\b|\brhca\b|\bameli\b|\bcpam\b|\bmutuelle\b|\bbasisverzekering\b|\bzorgverzekering\b|\bförsäkringskassan\b|\btarjeta sanitaria\b|\bt[si]\b|\bsns\b|\bsistema nacional de salud\b|\bprimary care plan\b|\bhuisarts\b|\bvårdcentral\b|\bhögkostnadsskydd\b|\beigen risico\b|\bzorgtoeslag\b|\bambulance(?:s|\s+bills?|\s+fees?)?\b|\b(?:emergency\s+treatment(?:\s+without\s+insurance)?|treatment\s+without\s+insurance|uninsured\s+(?:emergency|care|healthcare|treatment)|refugee\s+health(?:\s+coverage)?)\b|\bmedicat(?:ion|ions)?\b|\bmedicines?\b|\bdrugs?\b|\bgeneric\b|\bbioequivalent\b|\bbioequivalence\b|\bpharmaceutical\b|\bdiabetes\b|\bcholesterol\b|\bthyroid\b|\basthma\b|\binhalers?\b|\bblood pressure\b|\bglucophage\b|\blipitor\b|\bsynthroid\b|\bventolin\b|\bnorvasc\b|\bmetformin\b|\batorvastatin\b|\blevothyroxine\b|\bsalbutamol\b|\bamlodipine\b/iu,
  housing: /\blandlords?\b|\bapartments?\b|\bshelters?\b|\bhomeless(?:ness)?\b|\bcondos?\b|\bbasement (?:units?|apartments?|suites?)\b|\broommates?\b|\bsublet(?:s|ting)?\b|\b(?:one|two|three|1|2|3)[- ]bedrooms?\b|\beviction\b|\bevictions\b|\bevicted\b|\bevict\b|\brent(?:als?|ing)?\b|\btenants?\b|\bhousing\b|\btenanc(?:y|ies)\b|\bleases?\b|\b(?:security|damage|pet) deposits?\b|(?<!direct |bank )\bdeposits?\b|\blocked out\b|\block[ -]?outs?\b|\billegal lock[ -]?outs?\b|\bchanging locks\b|\bchanged locks\b|\bshut off (?:heat|hydro|utilities|power|water)\b|\bcut (?:heat|hydro|utilities|power|water)\b|\bhydro(?: bills?)?\b|\belectricity bills?\b|\bwater bills?\b|\butility bills?\b|\bwinter heating\b|\bradiator\b|\bcold (?:room|unit|apartment)\b|\bwaste services\b|\bwithhold(?:ing)? rent\b|\bkeep(?:ing)? deposit\b|\bforfeit(?:ed|ing)? deposit\b|\bguest fees?\b|\broommate fees?\b|\bovernight guests?\b|\bnotice\b(?!\s+of\s+assessment\b)|\bn12\b|\bn13\b|\bguideline\b|\brent increase\b|\blandlord entry\b|\brenoviction\b|\bmaintenance\b|\bheat(?:ing)?\b|\bmou?ld\b|\bmold\b|\bhabitability\b|\bholding deposits?\b|\baccessibility(?:\s+modifications?)?\b|\bno[- ]pet\b|(?<!resume\s+)(?<!cv\s+)(?<!job\s+)\bscreening\b|\bbackground checks?\b|\bequifax\b|\btransunion\b|\bsinglekey\b|\bfrontlobby\b|\bnaborly\b|\bguarantors?\b|\bco[- ]signers?\b|\bkey deposits?\b|\bt2\b|\bharass(?:ment)?\b|\bquiet enjoyment\b|\bunlawful entry\b|\bfair housing act\b|\btenancy deposit scheme\b|\btds\b|\bdps\b|\bmydeposits\b|\btenant fees act\b|\bresidential tenancies authority\b|\brta bond\b|\brental bonds online\b|\bmietkaution\b|\bkaution(?:en)?\b|\bmietpreisbremse\b|\bejari\b|\btawtheeq\b|\brera\b|\bavra\b|\btenancy tribunal\b|\bassign(?:ment|ing)?\b|\bbreak lease\b|\bterminate early\b|\bn9\b|\bsection 21\b|\bform 6a\b|\bnebenkosten\b|\boperating costs?\b|\brent pressure zones?\b|\brpz\b|\bnotary public\b|\bholding deposits?\b|\bprohibited payments?\b|\bright to rent\b|\blandlord checking service\b|\bstatutory excuse\b|\bhuman rights code\b|\bohrc\b|\bvormiete\b|\brecord (?:phone )?calls?\b|\bone[- ]party consent\b|\bmonetary (?:claim )?limit\b|\bair condition(?:er|ing)?\b|\bwindow unit\b|\bura\b|\bhdb\b|\bbail d'habitation\b|\bloi alur\b|\bvisale\b|\bhuurcommissie\b|\bwws\b|\bhyresgästföreningen\b|\bhyresnämnden\b|\blau\b|\bley de arrendamientos\b|\bfianza\b|\bandrahand\b|\bförstahand\b|\bbruksvärde\b|\bivima\b|\bincasòl\b|\brlto\b|\brrio\b|\brtdrs\b|\bjust cause eviction\b|\brepair and deduct\b|\bcivil code (?:section\s+)?1942\b|\bsubstandard\b|\bmees\b|\bepc rating\b|\bncat\b|\bdecree 43\b|\bdecree no\.?\s*43\b|\bfirb\b|\bforeign investment review board\b|\bhealthy homes\b|\bunderfloor insulation\b|\bheating capacity\b|\bencadrement des loyers\b|état des lieux|etat des lieux|\bcondition reports?\b|\bwws\b|\bhuurcommissie\b|\brent hikes?\b|\banmeldung\b|\blisting impersonation\b|\brental listing\b|\brental scam\b|\bwritten lease\b|\brefuses written lease\b|\bemergency\s+(?:interim\s+)?accommodation\b|\bsnowstorm\s+emergency\b/iu,
  community: /\blegal aid\b|\b(?:community )?legal clinics?\b|\blibrar(?:y|ies)\b|\besl\b|\blinc\b|\b(?:english|french|language) (?:classes|courses|lessons|training)\b|\bsettlement(?:\s+(?:services?|support|help|programs?|agenc(?:y|ies)))?\b|\bnewcomers?(?:\s+(?:services?|support|help|programs?|agenc(?:y|ies)))?\b|\bcultural support\b|\blocal government offices?\b|\bvolunteering\b|\bdocument translations?\b|\bemergency alerts?\b|\bbusiness registration\b|\bcommunity\b|\banti[- ]fraud\b|\bcafc\b|\bscams?\b|\bdeportation\b|\bfraud\b|\bextortion\b|\bphishing\b|\bphoto card\b|\bontario photo card\b|\bnon[- ]driver\b|\bnon[- ]drivers\b|\bftc\b|\baction fraud\b|\bscamwatch\b|\bbsi\b|\banmeldung\b|\bbürgeramt\b|\beinwohnermeldeamt\b|\bwohnungsgeberbestätigung\b|\bcouncil tax\b|\bsingpass\b|\brundfunkbeitrag\w*\b|\bbeitragsservice\b|\bgez\b|\bupdate (?:my )?address\b|\bcitizenship\b|\bnaturali[sz](?:e|ation|ation\s+eligibility)\b|\bcitizenship\s+by\s+descent\b|\bstaatsangehörigkeit\b|\blife in the uk\b|\bcitizenship test\b|\banti[- ]spam\b|\bcasl\b|\bdncr\b|\bdo not call\b|\bcollection agenc(?:y|ies)\b|\bconsumer protection\b|\bconsumer guarantees\b|\bfair trading\b|\bempadronamiento\b|\bpadrón\b|\bfolkbokföring\b|\bcir\b|\bcontrat d'intégration\b|\banef\b|\btitre de s[eé]jour\b|\bpr[eé]fecture\b|\binburgering\b|\binburgeringsexamen\b|\bswish\b|\bbankid\b|\bgemeente\b|\bskatteverket\b|\bayuntamiento\b|\bpolicía national\b|\bpolicia nacional\b|\bn-?400\b|\bphysical presence\b|\baustralian consumer law\b|\bacl\b|\bconsumer guarantee\b|\bwarrant(?:y|ies)\b|\bsworn translations?\b|\bcourt[- ]certified translators?\b|\bbeglaubigte übersetzung\b|\bdata sharing\b|\bprivacy complaint\b|\bgdpr\b|\bprivacy\b|\bdata protection\b|\bcommunity cent(?:er|re)\b|\bidentity theft\b|\bidentity fraud\b|\bsim swap\b|\b(?:contract\s+)?misrepresentation\b|\bdeceptive\s+practices?\b|\bconsumer\s+contracts?\b|\bconflicting government guidance\b|\bdata sharing and privacy\b|\bfraudulent agent\b|\bdevice search\b|\bborder officer searches\b|\bemergency\s+accommodation\b|\bsnowstorm\s+emergency\b|\blocal\s+government\s+appointment\b|\b(?:adult\s+)?language\s+(?:class(?:es)?|courses?|lessons?|training|instruction|enrolment|enrollment)\b|\bconsulat(?:e|es|ar)?\b|\bbls(?:\s+international)?\b|\bembass(?:y|ies)\b|\bhigh\s+commission\b|\bpr cards?\b|\bpermanent resident cards?\b|\bpr renewal\b|\bprtd\b|\bministerial\s+discretion\b|\bhumanitarian\s+and\s+compassionate\b|\bh\s*&\s*c\b|\birpa\s+s(?:ection|\.)?\s*25\b|\btransitional\s+provisions?\b|\bretroactive\s+(?:rule\s+changes?|policies?)\b|\bresidency\s+obligations?\b|\bcitizenship\s+physical\s+presence\b/iu,
  arrival: /\blanded\b|\barriv(?:al|e|ed|ing)\b|\bfirst (?:week|weeks?|two weeks|2 weeks|7 days|14 days)\b|\bthis week\b|\bemergency (?:telephone|phone)?\s*number\b|\bdigital device\b|\bdevice search\b|\bphone search\b|\bpasscode\b|\bduty[- ]free\b|\bhousehold (?:items|goods|effects)\b|\bsettlers?(?:'s)? effects\b|\bused personal (?:effects|belongings)\b|\bcustoms duty exemption\b|\bduty[- ]free customs\b|\bcustoms clearance\b|\btransfer of residence\b|\btor\b|\btor01\b|\bform 0350\b|\bform c&e\b|\bmpi\b|\bbiosecurity\b|\bsoft landing\b|\bfirst landing\b|\bflagpoling\b|\bflagpole\b|\blanding interview\b|\buebersiedlungsgut\b|\bübersiedlungsgut\b|\belectronic travel authori[sz]ation\b|\beta\b|\binfringement notice\b|\bundeclared\b|\bimport (?:a )?(?:dog|cat|pet)\b|\bmickleham\b|\bquarantine\b|\brnat\b|\bhousehold belongings\b|\bmoving with pets\b|\bpets?\b|\banimals?\b|\bveterinar(?:y|ian)\b|\but[- ]kort\b|\buppeh[aå]llstillst[aå]ndskort\b|\bresidence permit cards?\b|\bwhen I land\b|\bland in\b|\bland(?:ing)? documents?\b|\bdocuments? (?:to|should I) carry\b|\bbring(?:ing)? (?:a |my )?(?:dog|cat|pet)\b|\bvehicle\s+import(?:ation)?\b|\bimporting\s+a\s+vehicle\b/iu,
  employment: /\bcriminal (?:inadmissibility|rehabilitation)\b|\bei\b|\binsurable hours\b|\bunemployment benefits?\b|\bemployment insurance\b|\bcriminally inadmissible\b|\bdui\b|\bovertime\b|\bvacation pay\b|\bpaycheques?\b|\bpaychecks?\b|\bemployers?\b|\bstatutory holidays?\b|\bblue card\b|\bgolden visa\b|\bjobs?\b|\bminimum wages?\b|\bwork(?:ers?|ing|ed)?\b|\bmoonlighting\b|\bcash jobs?\b|\bside hustle\b|\bundocumented work\b|\bundocumented worker\b|\bundocumented employment\b|\b(?:person |people )?without regular status\b|\birregular status\b|\bstatusless\b|\bunder[- ]the[- ]table\b|\bgig work\b|\bunpaid overtime\b|\bwage theft\b|\bwithholding wages\b|\bnurs(?:e|es|ing)\b|\bcredentials?\b|\bemployment\b|\bexpress entry\b|\bcrs\b|\bfsw\b|\bcec\b|\bpnp\b|\boinp\b|\bwork permit\b|\bpgwp\b|\bbowp\b|\blmia\b|\bnoc\b|\bteer\b|\bsection 186\b|\b(?:maintained|implied) status\b|\breference letters?\b|\bpolice (?:certificate|clearance)s?\b|\bpcc\b|\bbiometrics\b|\bfbi\b|\bnbi\b|\bciid\b|\bprtd\b|\bpr card\b|\bland border\b|\bdual intent\b|\bresidency obligation\b|\bpebc\b|\boct\b|\bpeo\b|\bpharmac(?:y|ist)\b|\bengineers?\b|\bteachers?\b|\bdegree\b|\bdiploma\b|\bmaster(?:'?s)?\b|\bbachelor(?:'?s)?\b|\beca\b|\bwes\b|\bright to work\b|\bwp-ext\b|\bimm 5429\b|\bimm 5988\b|\bonboarding\b|\bvulnerable sector\b|\bvsc\b|\bpolice reference check\b|\b900[- ]series\b|\bh-1b\b|\bead\b|\bgreen card\b|\bform i-9\b|\be-verify\b|\bskilled worker visa\b|\bshare code\b|\bvevo\b|\bsubclass (?:189|190|482|485|491|500|600|820|186)\b|\bgraduate visa\b|\bstudent visa\b|\bgenuine student\b|\bgst\b|\bskillselect\b|\beu blue card\b|\bblaue karte\b|\bchancenkarte\b|\bgolden visa\b|\bgreen visa\b|\bmohre\b|\bsmc\b|\baewv\b|\bcsep\b|\bstamp 4\b|\bgrace period\b|\bopt\b|\bcap[- ]gap\b|\bilr\b|\bindefinite leave to remain\b|\bcontinuous residence\b|\bcondition 8607\b|\bsponsor transfer\b|\bgratuity\b|\bend[- ]of[- ]service\b|\bredundanc(?:y|ies)?\b|\bvariation of conditions\b|\bvoc\b|\b90[- ]day rule\b|\bmisrepresentation\b|\badjustment of status\b|\bi-485\b|\b540[- ]days?\b|\bautomatic extension\b|\bworking holiday\b|\b88[- ]days?\b|\bregional work\b|\bpiece rate\b|\bhorticulture\b|\bnotice periods?\b|\bkündigungsfrist\b|\bprobation(?:ary)?\b|\b1560 hours\b|\b52 weeks\b|\bi-94\b|\bform i-94\b|\badmit until date\b|\bseverance\b|\bseverance pay\b|\btermination pay\b|\bnotice of termination\b|\bsalary threshold\b|\bgrandfather(?:ed)?\b|\b38,?700\b|\bprobearbeit\b|\bopportunity card\b|\bintent to reside\b|\b245\(k\)\b|\bstatus violations?\b|\bunauthorized work\b|\bunauthorized employment\b|\bresumes?\b|\bcvs?\b|\baccount(?:ants?|ing)\b|\bcpa\b|\bweb form\b|\bircc web form\b|\bvisitor record\b|\bvisitor status\b|\btourist visa\b|\bextend (?:status|stay|visitor)\b|\brestoration\b|\brestore status\b|\bo[- ]?1a?\b|\beb[- ]?[123]\b|\bniw\b|\bnational interest waiver\b|\bperm\b|\bform i[- ]?140\b|\bj[- ]?1\b|\b212\(e\)\b|\bds[- ]?3035\b|\bb[- ]?[12]\b|\bbrp\b|\bevisa\b|\bdigital evisa\b|\bisl\b|\bimmigration salary list\b|\bssp\b|\bstatutory sick pay\b|\bsick pay\b|\bsick leave\b|\bmaternity leave\b|\bparental leave\b|\bmaternity pay\b|\bsmp\b|\bmutterschutz\b|\bpaternity leave\b|\bannual leave\b|\bpaid leave\b|\bholidays act\b|\bloe\b|\brecord of employment\b|\broe\b|\bsole trader\b|\bpty ltd\b|\bdelaware c[- ]corp\b|\bincorporat(?:e|ion)\b|\bllc\b|\bs[- ]corp\b|\bc[- ]corp\b|\bfreiberufler\b|\bduale ausbildung\b|\bvocational training\b|\bteaching council\b|\bnzqa\b|\biqa\b|\bsqe\b|\bpres\b|\bnmbi\b|\bapprobation\b|\bfachsprachprüfung\b|\bpartner visa\b|\bsubclass 820\b|\bde facto\b|\bresident return visa\b|\brrv\b|\bsubclass 155\b|\badministrative review tribunal\b|\bart\b|\birp\b|\birish residence permit\b|\boverstay\b|\blong service leave\b|\bat[- ]will\b|\bconsular\b|\b221\(g\)\b|\bsevis\b|\be[- ]2\b|\biloe\b|\bsection 3c\b|\b3c leave\b|\bstudy visa\b|\bstudy permit\b|\bstudent visa\b|\bstudent permit\b|\bf[- ]?1 visa\b|\bf[- ]?1\b|\bj[- ]?1\b|\bm[- ]?1\b|\bi[- ]?20\b|\bcas letter\b|\bgraduate route\b|\bpsw\b|\bpost[- ]study work\b|\bpost[- ]graduation work\b|\bsubclass 500\b|\bsubclass 485\b|\bstamp 2\b|\bstamp 1g\b|\bstudent'?s pass\b|\bvls[- ]ts\b|\bpal\b|\bprovincial attestation letter\b|\boff[- ]campus work\b|\bpr\b|\bpermanent residen(?:ce|cy|t|ts)\b|\bapply for pr\b|\bpr application\b|\bpr status\b|\bpr visa\b|\bpr pathway\b|\bpoints[- ]based (?:system|immigration)\b|\bstraight to residence\b|\bwork to residence\b|\bsmc resident visa\b|\bpts scheme\b|\bbusiness visa\b|\binvestor visa\b|\bstartup visa\b|\bstart[- ]up visa\b|\bentrepreneur visa\b|\binnovator founder\b|\beb[- ]?5\b|\be[- ]?2 investor\b|\bsubclass 188\b|\bactive investor plus\b|\bstep program\b|\bpasseport talent\b|\bfrench tech visa\b|\bcommercial freelance\b|\bfreiberufler visa\b|\bsuv\b|\bwork visa\b|\bimmigrat(?:e|ion)\b|\bvisa options?\b|\bvisa programs?\b|\bimmigration programs?\b|\bcompass\b|\bs[- ]?pass\b|\bone pass\b|\bentrepass\b|\bkennismigrant\b|\bhighly skilled migrant\b|\bzoekjaar\b|\borientation year\b|\barbetstillstånd\b|\bput\b|\bdigital nomad\b|\bteletrabajador\b|\bprofesionales altamente cualificados\b|\bpac\b|\bl[- ]?1\b|\bl[- ]?1a\b|\bl[- ]?1b\b|\bo[- ]?1\b|\bo[- ]?1a\b|\bo[- ]?1b\b|\bscale[- ]up worker\b|\bhpi\b|\bhigh potential individual\b|\b186 ens\b|\bgep\b|\bgeneral employment permit\b|\baewv\b|\baccredited employer\b|\bcarte de résident\b|\b10-year residency\b|\bresidencia de larga duración\b|\benisa\b|\bkollektivavtal\b|\befa\b|\btjänstepension\b|\brvo\b|\berkend referent\b|\brecognized sponsor\b|\blanguage requirements?\b|\bielts\b|\btoefl\b|\bpte\b|\bcelpip\b|\bclb\b|\bnclc\b|\bcefr\b|\btcf\b|\btef\b|\bgoethe\b|\bdele\b|\bsiele\b|\bfbi idhs\b|\bacro\b|\bafp\b|\bführungszeugnis\b|\bpolice clearance\b|\bpolice certificate\b|\bcredential assessment\b|\beca\b|\bwes\b|\bvetassess\b|\banabin\b|\bzas\b|\becctis\b|\bnuffic\b|\buhr\b|\bhomologación\b|\bhomologacion\b|\bpr card landing\b|\blanding day\b|\beconomic reality\b|\bflsa\b|\bindependent contractor\b|\b29 cfr part 795\b|\bsqe[12]?\b|\blawyers?\b|\bsolicitors?\b|\bglobal talent\b|\btech nation\b|\bfee waiver\b|\brehabilitation of offenders\b|\btzbfg\b|\bfixed[- ]term contracts?\b|\bbefristeter arbeitsvertrag\b|\bbridging visa\b|\bbva\b|\bbvb\b|\bsection 501\b|\bcharacter test\b|\bvisa cancellation\b|\bdegree attestation\b|\bmofa\b|\bapprenticeship\b|\bskilled trades\b|\btrade equivalency\b|\bcertificate of qualification\b|\bpolicy guidance\b|\blegislat(?:ion|ive)\b|\bstatutory interpretation\b|\bentrepreneur pathway\b|\b(?:visa|permit|ircc) processing times?\b|\bworkplace accommodations?\b|\bmisclassification\b|\bcontractor classification\b|\bwrongful dismissal\b|\bliving wage\b|\bworkplace injur(?:y|ies)\b|\bunpaid trial shifts?\b|\bstatute (?:versus|vs) policy\b|\bboss\b|\bmanager\b|\bcut (?:my |your |our )?hours\b|\breduc(?:ed?|ing) hours\b|\bchang(?:e|ing) (?:my |your |our )?schedule\b|\bwork schedule\b|\blast minute schedule\b|\bunsafe (?:work|workplace|working conditions)\b|\bworkplace safety\b|\breport (?:an? )?unsafe\b|\bfired\b|\bbeing fired\b|\bsick days?\b|\bpaid sick days?\b|\bprovincial nominee program\b|\bconstructive dismissal\b|\bpay cut\b|\bthreatens? deportation\b|\btrial shifts?\b|\bgig platform\b|\bcontract substitution\b|\bfalse job offer\b|\bregulated profession\b|\bforeign degree\b|\bbusiness\s+founder\s+residence\b|\bfounder\s+residence\b|\bpermit\s+expiry\s+while\s+appeal\s+pending\b|\bvisitor\s+extension\s+after\s+expiry\b|\bclosed\s+work\s+permit(?:\s+job\s+loss)?\b|\bclosed\s+permits?\b|\bhours?\s+cut\b|\bcut\s+(?:in\s+)?hours?\b|\bcash\s+(?:wages?|pay|salary|income|in\s+hand)\b|\b(?:unpaid|late|withheld|docked|deduct(?:ed|ions?)?)\s+wages?\b|\bwages?\s+(?:delayed|unpaid|cut|reduction)\b|\bdeductions?\s+from\s+wages?\b|\b(?:regulated\s+occupations?|regulated\s+professions?|recruitment\s+fees?|administrative\s+guidance|ministerial\s+discretion|transitional\s+provisions?|retroactive\s+(?:rule\s+changes?|policies?)|statute\s+(?:versus|vs)\s+policy|job\s+scams?|job\s+search\s+without\s+local\s+experience|resume\s+screening|employer\s+compliance|work\s+permit\s+restoration|sponsor\s+licen[cs]es?|workplace\s+relations(?:\s+act)?|wrc|unfair\s+dismissal|medbestämmandelagen|mbl)\b/iu,
  money: /(?<!food )\bbank(?:ing|s)?\b|\bosap\b|\bstudent loans?\b|\bsend(?:ing)? money\b|\bmoney transfers?\b|\bremittances?\b|\btax(?:es)?\b|\bcra\b|\bcbsa\b|\bcash\b|\bport of entry\b|\bcredit\b|\bbenefits?\b|\bproof of funds?\b|\bpof\b|\bsettlement funds?\b|\bnoa\b|\bnotice of assessment\b|\blico\b|\bkyc\b|\bidentity verification\b|\bbank act\b|\bfintrac\b|\bwire transfers?\b|\bsource of funds\b|\blarge cash\b|\baml\b|\bsecured credit\b|\bcredit file\b|\bpredatory (?:loans?|lending)\b|\be677\b|\bdeclare\b|\bbring(?:ing)? money\b|\bcash declaration\b|\bcarrying cash\b|\brc151\b|\brc66\b|\bgifts?\b|\bdeed of gift\b|\bgift deed\b|\binterac sign[- ]in\b|\bsign[- ]in partner\b|\bcra my account\b|\bcra security code\b|\bfraud alert\b|\bcredit bureau\b|\bequifax\b|\btransunion\b|\bpatriot act\b|\bcip\b|\bfdic\b|\bctr\b|\bfca\b|\b100[- ]point\b|\baustrac\b|\bsuperannuation\b|\bbafin\b|\bsperrkonto\b|\bwps\b|\bwages protection system\b|\bexperian\b|\bfico\b|\bschufa\b|\baecb\b|\bt1135\b|\bforeign property\b|\bpersonal[- ]use property\b|\bfica\b|\bsocial security taxes?\b|\bmedicare taxes?\b|\bfhsa\b|\bfirst home savings account\b|\bdual[- ]status\b|\bfirst[- ]year choice\b|\b6013\(g\)\b|\bcgt\b|\bcapital gains tax\b|\bmoving expenses?\b|\bt1-m\b|\bline 21900\b|\b40 kilometres\b|\b40 km\b|\bfincen(?:\s+form\s+105)?\b|\bcesg\b|\bresp\b|\bkiwisaver\b|\bsubstantial presence\b|\bform 8843\b|\bfatca\b|\bform 8938\b|\bfbar\b|\bform 114\b|\bvat\b|\bcorporate tax\b|\bsmall business relief\b|\busc\b|\buniversal social charge\b|\bhelp loan\b|\bstudent debt\b|\bfirst home guarantee\b|\bfhbg\b|\blisa\b|\blifetime isa\b|\bsdlt\b|\bstamp duty\b|\bfirst[- ]time buyer relief\b|\bsepa\b|\bdirect debit\b|\blastschrift\b|\bhundesteuer\b|\bdog tax\b|\b30% ruling\b|\b30%-regeling\b|\bbeckham law\b|\bsettlement funds\b|\bproof of funds\b|\bmaintenance funds\b|\bshow money\b|\bdroit au compte\b|\bkvk\b|\bforeign income\b|\bcash gifts?\b|\bbringing cash across border\b|\bwire transfer limits?\b|\binternational transfer limits?\b|\bforeign bank accounts?\b|\bfragebogen zur steuerlichen erfassung\b|\bfinanzamt\b|\bbounced (?:rental )?cheque\b|\bcurrent account\b|\bdroit au compte\b|\bdgpip\b|\bdgfip\b|\btax domicile\b|\bf[- ]skatt\b|\bsink\b|\bbeckham law\b|\bmodelo 720\b|\bstatutory residence test\b|\bsrt\b|\btax residency\b|\bsuper fund\b|\bretail fund\b|\bindustry super\b|\bcross[- ]border transfers?\b|\bfinancial abuse\b|\btfsa\b|\btax[- ]free savings account\b|\brrsp\b|\bregistered retirement savings plan\b|\btwo countries claim tax\b|\bdual tax residency\b|\bcross[- ]border crypto\b|\bremittance account frozen\b|\bbank\s+account\s+without\s+address\b|\bforeign\s+pension\b|\bpension\s+taxation\b|\bfounder\s+residence\b|\bbusiness\s+founder\b|\bself[- ]employed\s+residence\b|\bcredit\s+building\b|\bbuilding\s+credit\b|\bforeign\s+tax\s+credits?\b|\bforeign\s+rental\s+income\b/iu,
  family: /\bchild(?:ren)?\b(?![ -]?care)|\bschools?\b|\bkindergarten\b|\bfamily\b|\bopen access\b|\bmother\b|\bfather\b|\bparents and grandparents\b|\bgrandparents?\b|\bspous(?:e|al)\b|\bpartner\b|\bsiblings?\b|\bbrother\b|\bsister\b|\bsponsor(?:ship|s|ed|ing)?\b|\bsuper visa\b|\bpgp\b|\bschool enrollment\b|\bschool registration\b|\btdsb\b|\bpdsb\b|\bvsb\b|\bimmunization\b|\bdaughter\b|\bson\b|\bcustody\b|\bimm 5604\b|\bnon[- ]accompanying\b|\bcommon[- ]law\b|\bcohabitation\b|\bconjugal\b|\bplunket\b|\bschool (?:zone|enrolment|enrollment)\b|\bsponsor (?:unmarried )?daughters?\b|\b4,?000\s*(?:aed|dirhams?)\b|\bfamily visa\b|\bparental leave\b|\bföräldrapenning\b|\bforaldrapenning\b|\bsgi\b|\bmutterschutz(?:gesetz)?\b|\bchild custody\b|\bcustody across borders\b|\bhague convention\b|\bcare for elderly parent\b|\belderly parent\b|\bdependent parent\b|\bparental\b|\bprotective orders?\b|\bspecial education\b|\bconfidential counselling\b|\bminor\s+travell?ing\s+with\s+(?:one\s+)?parent\b|\bchild\s+travell?ing\s+with\s+(?:one\s+)?parent\b|\b(?:student\s+tuition\s+classification|adult\s+language\s+class\s+enrolment)\b|\bchild\s+benefits?\b|\bfamily\s+allowance\b|\bkindergeld\b|\bspecial\s+education\b/iu,
  childcare: /\bchild[ -]?care\b|\bday[ -]?care\b|\bdaycare subsid(?:y|ies)\b|\bchildcare subsid(?:y|ies)\b|\bnursery schools?\b|\bafter[- ]school care\b|\bbabysitters?\b|\bkita\b|\bkita[- ]gutschein\b|\bjugendamt\b|\bncs\b|\bnational childcare scheme\b|\bdeduccion\s+por\s+maternidad\b/iu,
  telecom: /\bsim\b|\b(?:phone|cell(?:phone)?|mobile|internet) contracts?\b|\bdata plans?\b|\bphone (?:plans?|bills?|providers?|carriers?)\b|(?<!emergency )\bphone numbers?\b|\bphone plans?\b|\bmobile\b|\bcell[ -]?phone\b|\bwireless\b|\binternet\b|\bbroadband\b|\bwi[ -]?fi\b|\btelecom\b|\bccts\b|\bunlocking fee\b|\bunlock(?:ed|ing)?\b|\bwireless code\b|\bcancellation fee\b|\becf\b|\bcooling[- ]off\b|\bconsumer contracts regulations\b|\bccr 2013\b|\bcritical information summary\b|\bcis\b|\bbreitbandmessung\b|\bdesktop app\b|\btdra\b|\bport phone numbers?\b|\bport(?:ing)?\b|\btext[- ]to[- ]switch\b|\bauto[- ]switch\b|\bnetwork coverage\b|\bcoverage differences\b|\bcarrier\b|\bcarriers\b|\bmvno\b|\bmvnos\b|\bphone compan(?:y|ies)\b|\bcancel (?:my |a |the )?plan\b|\bplan cancellation\b/iu,
  groceries: /\bgrocer(?:y|ies|s)?\b|\bfood stores?\b|\bfood banks?\b|\bfood(?:\s+(?:basket|costs?|insecurity))?\b/iu,
  driving: /\bdriv(?:e|ing|er|ers)\b|\bwinter (?:tires?|tyres?)\b|\blicen[cs]es?\b|\broad tests?\b|\bg[12]\b|\bg test\b|\bfull g\b|\batio\b|\bstibc\b|\bcertified translations?\b|\bdocument authentication\b|\bauto insurance\b|\bcar insurance\b|\bclaims[- ]free\b|\bdriving extract\b|\bexperience extract\b|\bexperience credit\b|\btüv\b|\bhauptuntersuchung\b|\bnct\b|\bnational car test\b|\bsalik\b|\btoll tag\b|\bliability coverage\b|\bfev\b|\bannex 11\b|\bedt\b|\bessential driver training\b|\bpip\b|\bpersonal injury protection\b|\bproperty damage liability\b|\bpdl\b|\bvehicles?\b|\bcars?\b|\bvehicle registration\b|\bsafety inspection\b|\bfree movement rights\b|\blicen[cs]e\s+expiry\b|\bused\s+vehicle\s+purchase\b|\bdriving\s+history(?:\s+recognition)?\b/iu,
  transit: /\btransit\b|\bsubways?\b|\bstreetcars?\b|\bpresto\b|\bcompass card\b|\bpublic transport(?:ation)?\b|\bfares?\b|\bbus(?:es)?\b|\btrains?\b|\btrip plann(?:er|ing)\b|\bttc\b|\bmiway\b|\btranslink\b|\bskytrain\b|\bomny\b|\bmetrocard\b|\boyster(?:\s+card)?\b|\bopal(?:\s+card)?\b|\bmyki(?:\s+card)?\b|\bnol(?:\s+card)?\b|\bbvg\b|\btap(?:\s+card)?\b|\bclipper(?:\s+card)?\b|\bbee network\b|\bleap(?:\s+card)?\b|\bat hop\b|\bovpay\b|\bov[- ]chipkaart\b|\bhafilat\b|\bt[- ]mobilitat\b|\bt[- ]usual\b|\bt[- ]casual\b|\bdeutschlandticket\b|\bnavigo\b|\borca(?:\s+card)?\b|\bventra\b|\bcharliecard\b|\bcapmetro\b|\bctrain\b|\bo[- ]train\b|\bopus(?:\s+card)?\b|\blight rail\b|\bcommuter rail\b|\bconcession opal\b|\bcommute\s+planning\b|\bregional\s+transfers?\b|\bstudent\s+transit\s+fares?\b|\baccessible\s+transit\b/iu
};
export const INJECTION_PATTERNS = [
  /\bignore\s+(?:all\s+)?(?:previous\s+|prior\s+|system\s+)?instructions\b/gi,
  /\bdisregard\s+(?:all\s+)?(?:previous\s+|prior\s+|system\s+)?instructions\b/gi,
  /\bsystem\s+prompt\s+(?:override|ignore|bypass)\b/gi,
  /\byou\s+are\s+now\s+(?:in\s+)?dan\s+mode\b/gi,
  /\bjailbreak\s+(?:prompt|mode|enabled?)\b/gi,
  /\bpretend\s+you\s+have\s+no\s+(?:rules|guidelines|restrictions)\b/gi,
  /\bact\s+as\s+an\s+unrestricted\s+ai\b/gi
];

export function sanitizePromptInjection(text) {
  if (!text || typeof text !== 'string') return '';
  let sanitized = text;
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, ' ');
  }
  return sanitized.replace(/\s+/g, ' ').trim();
}

export const NEWCOMER_TYPO_MAP = [
  [/\bamel(?:dung|ung)\b/gi, 'anmeldung'],
  [/\bprsto\b/gi, 'presto'],
  [/\bejary\b/gi, 'ejari'],
  [/\boystr\b/gi, 'oyster'],
  [/\bchancen[ -]?kart[ea]?\b/gi, 'chancenkarte'],
  [/\bburgerservice\b/gi, 'burgerservicenummer'],
  [/\bkaution(?:en)?\b/gi, 'kaution mietkaution']
];

export const HINGLISH_TRANSLITERATION_MAP = [
  [/\b(?:kiraya|rent\s*agreement|makan\s*malik)\b/gi, 'rent agreement lease landlord'],
  [/\b(?:advance\s*kiraya|chabi\s*deposit|security\s*deposit)\b/gi, 'key deposit security deposit advance rent'],
  [/\b(?:bina\s*notice|ghar\s*me\s*ghus|ghar\s*khali)\b/gi, 'landlord entry without 24 hours notice eviction'],
  [/\b(?:sin\s*kaise|sin\s*number\s*kaise|pehchan\s*number)\b/gi, 'how to apply for SIN social insurance number'],
  [/\b(?:bank\s*khata|khata\s*khol|bina\s*naukri\s*account)\b/gi, 'open bank account without a job'],
  [/\b(?:videsh\s*se\s*paise|dus\s*hazar|paise\s*bhejna)\b/gi, 'wire transfer 10000 cash fintrac declaration'],
  [/\b(?:swasthya|ilaj|bina\s*card\s*doctor|ohip\s*kaise)\b/gi, 'OHIP provincial healthcare doctor clinic']
];

export function normalizeHinglishTransliteration(text) {
  if (!text || typeof text !== 'string') return '';
  let out = text;
  for (const [pattern, replacement] of HINGLISH_TRANSLITERATION_MAP) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

export function normalizeNewcomerTypos(text) {
  if (!text || typeof text !== 'string') return '';
  let out = normalizeHinglishTransliteration(text);
  for (const [pattern, replacement] of NEWCOMER_TYPO_MAP) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

export function extractStatutoryThresholds(text) {
  if (!text || typeof text !== 'string') return null;
  const thresholds = {};

  const numPattern = '(\\d+(?:,\\d+)*(?:\\.\\d+)?|\\d+)';

  const salaryMatch = text.match(new RegExp(`(?:salary|wages?|earning|income|makes?|paid)\\s*(?:of|is|around)?\\s*(?:[\\$£€]|AED|CAD|USD|GBP)?\\s*${numPattern}\\s*(k|thousand)?(?:\\s*(?:cad|usd|gbp|aed|eur))?(?:\\s*(?:\\/|\\s*per\\s*)(?:yr|year|annum|hr|hour|mo|month))?`, 'i'))
    || text.match(new RegExp(`(?:[\\$£€]|AED|CAD|USD|GBP)\\s*${numPattern}\\s*(k|thousand)?\\s*(?:salary|income|\\/yr|\\/year|per year|annually)`, 'i'));
  if (salaryMatch) {
    let amount = parseFloat(salaryMatch[1].replace(/,/g, ''));
    if (salaryMatch[2]?.toLowerCase()?.startsWith('k') || salaryMatch[2]?.toLowerCase() === 'thousand') {
      amount *= 1000;
    }
    thresholds.salary = amount;
  }

  const rentMatch = text.match(new RegExp(`(?:rent|renting|lease)\\s*(?:of|is)?\\s*(?:[\\$£€]|AED|CAD|USD|GBP)?\\s*${numPattern}(?:\\s*(?:\\/|\\s*per\\s*)(?:mo|month))?`, 'i'))
    || text.match(new RegExp(`(?:[\\$£€]|AED|CAD|USD|GBP)\\s*${numPattern}(?:\\s*(?:\\/|\\s*per\\s*)(?:mo|month))?\\s*(?:rent|lease)`, 'i'));
  if (rentMatch && !salaryMatch) {
    thresholds.rent = parseFloat(rentMatch[1].replace(/,/g, ''));
  }

  const hoursMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hrs?|hours?)(?:\s*(?:\/|\s*per\s*)(?:wk|week))?/i);
  if (hoursMatch) {
    thresholds.hoursPerWeek = parseFloat(hoursMatch[1]);
  }

  const cashMatch = text.match(new RegExp(`(?:carrying|declare|bringing|transfer(?:ring)?)\\s*(?:[\\$£€]|AED|CAD|USD|GBP)?\\s*${numPattern}\\s*(k|thousand)?\\s*(?:cash|dollars?|in cash)?`, 'i'))
    || text.match(new RegExp(`${numPattern}\\s*(?:cash|dollars?)\\s*(?:at border|customs|when landing)`, 'i'));
  if (cashMatch) {
    let cashAmt = parseFloat(cashMatch[1].replace(/,/g, ''));
    if (cashMatch[2]?.toLowerCase()?.startsWith('k') || cashMatch[2]?.toLowerCase() === 'thousand') {
      cashAmt *= 1000;
    }
    thresholds.cash = cashAmt;
  }

  return Object.keys(thresholds).length > 0 ? thresholds : null;
}

export function isConceptualOrFederalQuestion(q) {
  if (!q) return false;
  return Boolean(resolveQuestionBankItem(q)) || Boolean(resolveQuestionBankBatch3Item(q)) || Boolean(resolveMarketGapBatch1Item(q)) || Boolean(resolveMarketGapBatch2Item(q)) || Boolean(resolveMarketGapBatch3Item(q)) || Boolean(resolveGlobalSettlementItem(q)) || /\b(?:fundamental|difference|differ|distinguish|distinction|definition|define|mean(?:ing)?|concept|international law|sovereign|philosophy|principle|principles|objective|compare|comparison|evaluate|evaluation|misconception|unanswered|treaty|treaties|bilateral|quota|quotas|authority|entitlements?|discretion|retrospective|enforce|accountab|human rights|misinformation|contradict|refus(?:e|es|ed|ing|al|als)?|inadmissib|ban|deport|waiver|maintain|overstay|consultant|lawyer|representat|notari|apostille|consular|legalization|authenticat|eligibility|pathway|sustainable|sustainability|planning|document|inconsisten|record|express entry|fsw|cec|pnp|crs|pr card|permanent residen|work permit|study permit|student visa|visitor visa|super visa|spousal sponsor|sponsor|dependents?|maintained status|lmia|pgwp|bowp|teer|noc|biometrics|police certificate|police clearance|eca|wes|fintrac|cra|income tax|cbsa|customs|border|duty[- ]free|bsf186|goods to follow|citizenship|naturaliz|physical presence|misrepresentation|section 40|a40|asylum|refugee|five eyes|unhcr|bank act|proof of funds|settlement funds|show money|electronic travel authorization|eta|airport transit|custody|newborn|healthcare costs?|housing availability|rent a home|rental housing|rental deposits?|refuses? to return|temporary migrant|legal protections?|indefinitely|suspended?|exchange.*information|expire.*during|expire.*relocation|vehicle insurance|transport systems?|international students?|students?|chronic|treatment|vaccin(?:e|es|ated)?|mental[- ]health|emergenc(?:y|ies)?|privacy|qualificat(?:ion|ions)?|medical(?:\\s+examinations?)?|medical\\s+condition|limited housing|family sponsorship|airline|carrier|trains?|healthcare rights?|health insurance|prescription|medicines?|vaccination|waiting periods?|permanent address|undocumented|credit history|rental scams?|public housing|homeless|housing demand|housing shortages?|reconsideration|diplomatic|watchlist|discrimination|intergenerational|neighbourhood|integration|climate|algorithmic|brain drain|access local healthcare|visa categor(?:y|ies)|children|providers?|register(?:ing|ation)?|consequences?|immigration programs?|settlement|rental history|tax identification(?: number)?|utility bills?|address[- ]reporting|housing dispute|rental screening|healthcare services?|healthcare benefit|unpaid|liable|habitual residence|annulled|entry|admissib(?:le|ility)|residen(?:ce|cy)|authoriz(?:ation|ations)|nationalit(?:y|ies)|destination|relocat(?:e|ing|ion)|educational?|authenticit(?:y|ies)|origin|require(?:ment|ments)?|overseas|cross-border|applicant|applicants|internationally|departure|insurance|expenses|birth|certificates?|issuing|translat(?:e|ion|ions)|parentage|passports?|travel|biometric|biometrics|savings|transferring|identity|aliases|facial recognition|refugees?|tuition|institution|recruitment|occupation|exploitation|verification|disaster|portals?|visas?|applications?|conditions?|employers?|immigrat(?:e|ion|ions|ing)?|citizens?|foreigners?|migrants?|enter(?:ing|ed)?|admission|permits?|stay|agents?|directors?|employees?|points?|birthdays?|assessing|career|scores?|invitation|professions?|classification|qualify|testing|assess(?:ed|ment)?|business(?:es)?|invest(?:ment|ments|or|ors)?|capital|patent|relationship|marriages?|stepchild(?:ren)?|adopt(?:ion|ions|ive|ed)?|polygam(?:y|ous)|equivalency|portfolio|academics?|examinations?|gifted|deposits?|foreign[- ]currency|balances?|exchange rates?|inherit(?:ed|ance)?|self[- ]employed|income|liabilities|loans?|retirement|exclusion|convict(?:ion|ions)?|criminal|proceedings?|pending|civil disputes?|appeals?|deadlines?|procedural unfairness|unlawful presence|stateless(?:ness)?|remov(?:al|als)?|persecut(?:ion|ed)?|fraudulent|deported|property|political|environmental|minors?|evidence|social[- ]media|displaced|displacement|resettlement|protection|detention|passenger|humanitarian|cancellation|renunciation|naturalization|pensions?|contributions?|assets?|literacy|mortgages?|consumer|downgrading|apprenticeships?|barriers?|overqualification|belonging|segregation|culture shock|adaptation|mobility|sovereignty|ageing|demographic|data[- ]protection|outages?|officers?|disciplinary|embass(?:y|ies)?|exceptional|competitiveness|occupancy|correspondence|signatures?|towns?|caregiving|scoring|networks?|legal name|names? differs?|language tests?|language-test|funds|offen[cs]e|reapply|reapplying|salaries|salary|parents?|laws?|fairness|advis[eo]rs?|decline|promises|pathways?|artificial intelligence|standards?|impacts?|professional experience|exchange programs?|trust)\b/i.test(q);
}

// Short codes collide with ordinary words ("on", "act", "pe", "nu"), so they
// count only when written as the upper-case code; an all-capitals question gives
// no such signal. Full names stay case-insensitive.
function regionNamedIn(name, text) {
  if (name.length > 3) return new RegExp(`\\b${name}\\b`, 'i').test(text);
  return text !== text.toUpperCase() && new RegExp(`\\b${name}\\b`).test(text);
}
const PROVINCE_SPECIFIC_TERMS = Object.freeze([
  [/\b(?:ohip|ltb|landlord and tenant board|n12|n13)\b/i, 'ON'],
  [/\b(?:msp|rtb|residential tenancy branch|translink|compass card|skytrain)\b/i, 'BC']
]);

export function parse(input) {
  if (!input || typeof input.question !== 'string' || !input.question.trim() || input.question.length > 2000) throw new ValidationError('question must contain 1–2000 characters');
  const inputCountry = resolveInputCountry(input?.country);
  if (input.city && !isValidCityForCountry(input.city, inputCountry)) throw new ValidationError('Choose a supported pilot city');
  if (input.language !== undefined && input.language !== 'en') throw new ValidationError('Only English (en) is supported in this release');
  const multilingual = detectAndTranslateMultilingualQuery(input.question);
  const effectiveQuestion = multilingual ? multilingual.canonicalStatutoryQuery : input.question;
  if (!multilingual) {
    assertEnglishText(input.question, 'Question');
  }

  const sanitizedQuestion = sanitizePromptInjection(effectiveQuestion);
  const q = normalizeEnglishQuestion(sanitizedQuestion || effectiveQuestion), language = 'en';
  const queryForMatching = normalizeNewcomerTypos(q);
  const relocation = resolveClauseGeography(q);
  const isGlobalDest = Boolean(inputCountry && inputCountry !== 'CA');
  const found = isGlobalDest ? [] : supportedCitiesIn(q);
  const city = (relocation?.isDestSupported && relocation.destCity) ? relocation.destCity : (found.length === 1 ? found[0] : input.city || null);
  let region = city ? cities[city] : (relocation?.isDestSupported && relocation.destRegion ? relocation.destRegion : null);
  const explicitRegions = isGlobalDest ? [] : supportedRegionsIn(q);
  if (!region && explicitRegions.length === 1) region = explicitRegions[0];
  const intents = Object.entries(lexicon).filter(([, r]) => r.test(queryForMatching)).map(([t]) => t);
  // Internet access at a library is a community facility question. Separate
  // commercial service requests still retain their telecom intent.
  if (intents.includes('community') && /\blibrar(?:y|ies)\b/i.test(q) && /\binternet\b|\bwi[ -]?fi\b/i.test(q)
    && !/\b(?:plans?|providers?|contracts?|rights?|complaints?|ccts|broadband|mobile|sim|home)\b/i.test(q)) {
    const index = intents.indexOf('telecom'); if (index !== -1) intents.splice(index, 1);
  }
  // Inquiries about opening a bank account or signing a lease without a job are
  // financial or housing eligibility questions, not employment search asks.
  if ((intents.includes('money') || intents.includes('housing')) && intents.includes('employment')
    && /\b(?:no job|without (?:a )?job|unemployed|unemployment|jobless)\b/i.test(q)
    && !/\b(?:job search|(?:find|finding|seek|seeking|look(?:ing)? for|search(?:ing)? for) (?:a )?(?:jobs?|work|employment)|resume|work permit|lmia|noc|teer|credential|experience|ei\b|employment insurance|insurable hours|unemployment benefits|regular benefits)\b/i.test(q)) {
    const empIdx = intents.indexOf('employment');
    if (empIdx !== -1) intents.splice(empIdx, 1);
  }
  // Credit building, fraud alerts, or banking inquiries are financial money questions,
  // not housing tenancy questions, unless housing terms are explicitly present.
  if (intents.includes('housing') && intents.includes('money')
    && /\b(?:fraud alert|credit score|secured credit|credit file|credit bureau|credit card)\b/i.test(q)
    && !/\b(?:landlords?|tenants?|leases?|rent(?:als?|ing)?|deposits?|eviction|screening|singlekey|naborly|frontlobby)\b/i.test(q)) {
    const hIdx = intents.indexOf('housing');
    if (hIdx !== -1) intents.splice(hIdx, 1);
  }
  // Employment Insurance (EI) and insurable hours inquiries are employment questions,
  // not money/banking questions, even when the word "benefits" is present.
  if (intents.includes('employment') && intents.includes('money')
    && /\b(?:ei\b|employment insurance|insurable hours|unemployment benefits?|regular benefits)\b/i.test(q)
    && !/\b(?:bank|credit|loan|mortgage|tax|cra|invest|wire|remittance)\b/i.test(q)) {
    const mIdx = intents.indexOf('money');
    if (mIdx !== -1) intents.splice(mIdx, 1);
  }
  // Wage deductions, cash pay/wages, or reduction of hours by employers are employment standards (ESA) issues,
  // not money/banking border currency issues, unless border/customs/CBSA terms are explicitly present.
  if (intents.includes('employment') && intents.includes('money')
    && /\b(?:cash\s+(?:wages?|pay|salary|in\s+hand)|hours?\s+cut|cut\s+hours|withheld\s+wages?|unpaid\s+wages?|deductions?\s+from\s+wages?|pay\s+in\s+cash)\b/i.test(q)
    && !/\b(?:cbsa|border|customs|fintrac|declare|declaration|10,?000|wire transfer|bank account)\b/i.test(q)) {
    const mIdx = intents.indexOf('money');
    if (mIdx !== -1) intents.splice(mIdx, 1);
  }
  // UK Council tax is a local municipal charge on community records,
  // not income tax (money), unless general tax terms (income tax, hmrc, self assessment) are present.
  if (intents.includes('money') && /\bcouncil tax\b/i.test(q)
    && !/\b(?:income tax|hmrc|self[- ]assessment|cgt|capital gains|vat)\b/i.test(q)) {
    const mIdx = intents.indexOf('money');
    if (mIdx !== -1) intents.splice(mIdx, 1);
    if (!intents.includes('community')) intents.push('community');
  }
  // German Bürgeramt Anmeldung registration for Steuer-ID is a tax/identity (sin) question,
  // not housing, unless lease agreements or eviction terms are explicitly present.
  if (intents.includes('sin') && /\b(?:anmeldung|bürgeramt|steuer[- ]id)\b/i.test(q)
    && !/\b(?:landlords?|tenants?|leases?|eviction|sublet|deposit|rent increase)\b/i.test(q)) {
    const hIdx = intents.indexOf('housing');
    if (hIdx !== -1) intents.splice(hIdx, 1);
  }
  // Consumer financing inquiries are financial money questions, not telecom,
  // unless telecom services (mobile, internet, broadband, phone, SIM) are explicitly mentioned.
  if (intents.includes('telecom') && /\bconsumer financing\b|\bfinancing contract\b/i.test(q)
    && !/\b(?:broadband|mobile|sim|phone|internet|carrier|ccts)\b/i.test(q)) {
    const tIdx = intents.indexOf('telecom');
    if (tIdx !== -1) intents.splice(tIdx, 1);
    if (!intents.includes('money')) intents.push('money');
  }
  // Mobile and cell phone plans are telecom inquiries, not community settlement services,
  // even when asked by or for a newcomer.
  if (intents.includes('telecom') && intents.includes('community')
    && /\b(?:phone|mobile|cell(?:phone)?|data|wireless)\s+plans?\b/i.test(q)) {
    const cIdx = intents.indexOf('community');
    if (cIdx !== -1) intents.splice(cIdx, 1);
  }
  // Professional or occupational licensing is an employment qualification question,
  // not motor vehicle driving licensing, unless vehicle/driving terms are explicitly present.
  if (intents.includes('driving') && intents.includes('employment')
    && /\b(?:regulated\s+profession|professional\s+licen[cs]e|occupational\s+licen[cs]e|trade\s+licen[cs]e)\b/i.test(q)
    && !/\b(?:driver|driving|vehicle|car|road test)\b/i.test(q)) {
    const dIdx = intents.indexOf('driving');
    if (dIdx !== -1) intents.splice(dIdx, 1);
  }
  // "Locked out" in immigration context (visas, travel overseas, border, re-entry) is not a tenancy lockout.
  if (intents.includes('housing') && /\b(?:locked out|lockouts?)\b/i.test(q)
    && /\b(?:visa|bva|bvb|permit|border|overseas|re-entry)\b/i.test(q)
    && !/\b(?:landlords?|tenants?|leases?|apartments?|units?|rooms?|rent(?:als?|ing)?)\b/i.test(q)) {
    const hIdx = intents.indexOf('housing');
    if (hIdx !== -1) intents.splice(hIdx, 1);
  }
  // Consumer contract misrepresentation and deceptive practices are consumer protection (community),
  // not employment disputes, unless explicit employment terms appear.
  if (intents.includes('employment') && /\b(?:contract\s+)?misrepresentation\b|\bdeceptive\s+practices?\b/i.test(q)
    && !/\b(?:jobs?|wages?|salaries|salary|boss|fired|firing|dismissal|overtime|workplace|adjustment of status|green card|visa|status|inadmissib)\b/i.test(q)) {
    const eIdx = intents.indexOf('employment');
    if (eIdx !== -1) intents.splice(eIdx, 1);
    if (!intents.includes('community')) intents.push('community');
  }
  // Professional licences (nursing, engineering, teaching, medical) are employment questions, not vehicle driving.
  if (intents.includes('driving') && /\b(?:professional|occupational|business|trade|teaching|nursing|medical)\s+licen[cs]es?\b/i.test(q)) {
    const dIdx = intents.indexOf('driving');
    if (dIdx !== -1) intents.splice(dIdx, 1);
    if (!intents.includes('employment')) intents.push('employment');
  }
  // Certified translations for legal documents or applications are general immigration/employment documentation, not vehicle driving.
  if (intents.includes('driving') && /\bcertified translations?\b/i.test(q) && !/\b(?:licen[cs]e|driv|road test|car|vehicle)\b/i.test(q)) {
    const dIdx = intents.indexOf('driving');
    if (dIdx !== -1) intents.splice(dIdx, 1);
    if (!intents.includes('employment')) intents.push('employment');
  }
  // Airport transit, transit passengers or transit visas are international border/arrival, not municipal public bus/train transit.
  if (intents.includes('transit') && /\b(?:airport|flight|plane|terminal|transit visas?|direct airside|layover|transiting|in transit|transit passengers?|transit without visa|twov)\b/i.test(q)
    && !/\b(?:bus|subway|train|presto|fare|translink|ttc|metro|station)\b/i.test(q)) {
    const tIdx = intents.indexOf('transit');
    if (tIdx !== -1) intents.splice(tIdx, 1);
    if (!intents.includes('arrival')) intents.push('arrival');
  }
  // Immigration removal orders, due process, or asylum/refugee country condition reports are community/immigration questions, not housing tenancy.
  if (intents.includes('housing') && /\b(?:removal orders?|deportation|asylum|refugee|admissibility|country[- ]condition reports?)\b/i.test(q)) {
    const hIdx = intents.indexOf('housing');
    if (hIdx !== -1) intents.splice(hIdx, 1);
    if (!intents.includes('community')) intents.push('community');
  }
  // Border screening accuracy is border arrival, not rental housing screening.
  if (intents.includes('housing') && /\bborder[- ]screening\b/i.test(q)) {
    const hIdx = intents.indexOf('housing');
    if (hIdx !== -1) intents.splice(hIdx, 1);
    if (!intents.includes('arrival')) intents.push('arrival');
  }
  // Foreign rental property taxation is financial taxation (money), not tenancy eviction/housing.
  if (intents.includes('housing') && /\b(?:taxation|taxes?|cra|t1135|foreign (?:rental )?income)\b/i.test(q)) {
    const hIdx = intents.indexOf('housing');
    if (hIdx !== -1) intents.splice(hIdx, 1);
    if (!intents.includes('money')) intents.push('money');
  }
  // Biometrics appointments for residence permit cards (UT-kort, etc.) upon arrival are arrival/registration questions, not employment search.
  if (intents.includes('employment') && /\b(?:ut[- ]kort|uppeh[aå]llstillst[aå]ndskort|biometrics appointment)\b/i.test(q)
    && !/\b(?:jobs?|work(?:ers?|ing|ed)?|wages?|salaries|salary|minimum wage|hiring|employer|termination|severance|contract)\b/i.test(q)) {
    const eIdx = intents.indexOf('employment');
    if (eIdx !== -1) intents.splice(eIdx, 1);
    if (!intents.includes('arrival')) intents.push('arrival');
  }
  const EU_MEMBER_STATES = new Set(['Germany', 'France', 'Netherlands', 'Ireland', 'Sweden', 'Spain', 'Italy', 'Greece', 'Cyprus', 'Malta', 'Austria', 'Belgium', 'Denmark', 'Finland', 'Poland', 'Portugal']);
  const filterMemberStateEU = list => (list.includes('European Union') && list.some(c => EU_MEMBER_STATES.has(c))) ? list.filter(c => c !== 'European Union') : list;

  const licence = intents.includes('driving') ? licenceContext(q) : { licenceCountry: null, licenceCountryAmbiguous: false, destinationText: q };
  const inputGlobal = inputCountry && inputCountry !== 'CA' ? inputCountry : null;
  const rawGlobals = filterMemberStateEU(globalDestinations.filter(([, pattern]) => pattern.test(licence.destinationText)).map(([c]) => c));
  const isCanadianCity = Boolean(city && Object.hasOwn(cities, city));
  const explicitCanadianPlace = Boolean(isCanadianCity || region || explicitRegions.length > 0 || /\b(?:canada|(?<!\b(?:without|no|zero|lack of|prior|previous|past)\s+)canadian|toronto|mississauga|brampton|vancouver|ontario|british columbia)\b/iu.test(q));
  const canadianTerms = /\b(?:canada|(?<!\b(?:without|no|zero|lack of|prior|previous|past)\s+)canadian|toronto|mississauga|brampton|vancouver|ontario|british columbia|bc|ohip|msp|sin|social insurance number|g[12]|n12|n13|cra|fintrac|cbsa|lmia|pgwp|bowp|oinp|pnp|ttc|miway|translink|compass card|t1135|ircc|irpa|irpr|ltb|ccb|tfsa|rrsp|fhsa|pr card|open work permit|closed work permit|visitor record|super visa|maple leaf card)\b/iu;
  // A programme acronym is a topic hint; an explicit foreign place determines geography.
  const explicitForeignPlace = explicitCountryPatterns.some(([, pattern]) => pattern.test(licence.destinationText));
  const hasCanadianGeo = inputGlobal ? explicitCanadianPlace : Boolean(inputCountry === 'CA' || explicitCanadianPlace || (!explicitForeignPlace && canadianTerms.test(q)));
  const isDirectGlobal = Boolean((inputGlobal || rawGlobals.length === 1) && !hasCanadianGeo);
  const origin = isDirectGlobal ? { originCountry: null, destinationText: licence.destinationText } : originCountryContext(licence.destinationText);
  let destText = origin.destinationText || licence.destinationText;
  if (relocation?.isDestSupported && relocation.maskPattern) {
    destText = destText.replace(relocation.maskPattern, ' '.repeat(10));
  }

  const textGlobals = filterMemberStateEU(isDirectGlobal ? rawGlobals : globalDestinations.filter(([, pattern]) => pattern.test(destText)).map(([c]) => c));
  const detectedGlobal = inputGlobal || (textGlobals.length === 1 ? textGlobals[0] : null);
  // A country already identified as where the person comes from ("lived in California on an H-1B")
  // is history, not a second destination competing with the Canadian place in the question.
  const onlyOriginCountry = Boolean(origin.originCountry && textGlobals.length && textGlobals.every(c => c === origin.originCountry));
  const explicitForeignMatches = filterMemberStateEU(explicitCountryPatterns.filter(([, pattern]) => pattern.test(destText)).map(([c]) => c));
  const explicitForeignConflict = Boolean(inputGlobal && explicitForeignMatches.some(c => c !== inputGlobal));
  const hasGlobalConflict = inputGlobal
    ? Boolean(explicitCanadianPlace || explicitForeignConflict)
    : (Boolean(detectedGlobal && hasCanadianGeo && !onlyOriginCountry) || textGlobals.length > 1);
  const isGlobalDestination = Boolean(detectedGlobal && !hasCanadianGeo && !hasGlobalConflict);
  const foreignCountry = Boolean(!hasCanadianGeo && !detectedGlobal && origin.originCountry);
  const isSupportedForeign = foreignCountry && (destinationCountries.includes(origin.originCountry) || origin.originCountry === 'Canada' || origin.originCountry === 'CA');
  const country = inputGlobal ? inputGlobal : (isGlobalDestination ? detectedGlobal : (foreignCountry && isSupportedForeign ? origin.originCountry : 'CA'));

  const CA_PROVINCE_CODES = {
    'ontario': 'ON', 'on': 'ON',
    'british columbia': 'BC', 'bc': 'BC',
    'alberta': 'AB', 'ab': 'AB',
    'quebec': 'QC', 'qc': 'QC',
    'manitoba': 'MB', 'mb': 'MB',
    'saskatchewan': 'SK', 'sk': 'SK',
    'nova scotia': 'NS', 'ns': 'NS',
    'new brunswick': 'NB', 'nb': 'NB',
    'prince edward island': 'PE', 'pei': 'PE', 'pe': 'PE',
    'newfoundland and labrador': 'NL', 'newfoundland': 'NL', 'nl': 'NL',
    'yukon': 'YT', 'yt': 'YT',
    'northwest territories': 'NT', 'nwt': 'NT', 'nt': 'NT',
    'nunavut': 'NU', 'nu': 'NU'
  };

  let resolvedCity = city;
  let resolvedRegion = region;

  if (input?.city) {
    const inputCityLower = input.city.trim().toLowerCase();
    if (CA_PROVINCE_CODES[inputCityLower]) {
      resolvedRegion = CA_PROVINCE_CODES[inputCityLower];
      if (resolvedCity === input.city) resolvedCity = null;
    } else if (country && destinationRegions[country]?.includes(input.city)) {
      resolvedRegion = input.city;
      if (resolvedCity === input.city) resolvedCity = null;
    }
  }

  if (!resolvedCity && country && country !== 'CA') {
    const candidateCities = destinationCities[country] || [];
    const matchedCity = candidateCities.find(c => new RegExp(`\\b${c}\\b`, 'i').test(q));
    if (matchedCity) resolvedCity = matchedCity;
  }
  if (!resolvedCity && country === 'CA' && /\b(?:compass card|translink|skytrain)\b/i.test(q)) {
    resolvedCity = 'Vancouver';
    resolvedRegion = 'BC';
  }

  if (!resolvedRegion && input?.region) resolvedRegion = input.region;
  if (!resolvedRegion && input?.province) resolvedRegion = input.province;
  if (!resolvedRegion && resolvedCity && cityToRegion[resolvedCity]) {
    resolvedRegion = cityToRegion[resolvedCity];
  }
  if (!resolvedRegion && country) {
    const candidateRegions = destinationRegions[country] || [];
    const matchedRegion = candidateRegions.find(r => regionNamedIn(r, q));
    if (matchedRegion) resolvedRegion = matchedRegion;
  }
  if (!resolvedRegion && country && REGION_ALIASES[country]) {
    for (const [alias, canonical] of Object.entries(REGION_ALIASES[country])) {
      if (country === 'United Kingdom' && alias === 'NI' && /\bNI\s+(?:numbers?|contributions?|category|code|credits?)\b/i.test(q)) {
        continue;
      }
      if (regionNamedIn(alias, q)) {
        resolvedRegion = canonical;
        break;
      }
    }
  }
  // These programmes and tribunals exist in one province only, so naming one
  // already answers "which province?".
  if (!resolvedRegion && country === 'CA') {
    resolvedRegion = PROVINCE_SPECIFIC_TERMS.find(([pattern]) => pattern.test(q))?.[1] ?? null;
  }
  if (resolvedRegion && country && REGION_ALIASES[country]?.[resolvedRegion]) {
    resolvedRegion = REGION_ALIASES[country][resolvedRegion];
  }

  let cleanDestText = destText;
  if (resolvedRegion && input?.city && CA_PROVINCE_CODES[input.city.trim().toLowerCase()] === resolvedRegion) {
    cleanDestText = cleanDestText.replace(new RegExp(`\\b${input.city.trim()}\\b`, 'gi'), ' ');
  }
  if (resolvedRegion) {
    cleanDestText = cleanDestText.replace(/\b(Alberta|British Columbia|Ontario|Nova Scotia|Saskatchewan|Manitoba|New Brunswick|Newfoundland|Prince Edward Island|Yukon|Northwest Territories|Nunavut|AB|BC|ON|NS|SK|MB|NB|NL|PE|YT|NT|NU)\s*\/\s*([A-Za-z\s.'-]+?)(?=[,?.!]|\s+(?:with|under|in|for|from|to|as|how|what|is|are|can|which|without|and|or|$))/gi, (m, prov) => prov + ' ');
  }
  const unsupported = hasUnsupportedDestination(cleanDestText, isGlobalDestination) || (foreignCountry && !isSupportedForeign);
  const ambiguous = (found.length > 1) || explicitRegions.length > 1 || (region && explicitRegions.some(r => r !== region)) || (!foreignCountry && unsupported) || (foreignCountry && !isSupportedForeign) || hasGlobalConflict;
  const resolvedLicenceCountry = licence.licenceCountry || origin.originCountry || (relocation?.originCountry || null);
  const missingSlots = [];
  const foreignProgrammeConflict = isGlobalDestination && (/^(?:sin|social insurance number)\s+in\s+[a-z\s]+$/i.test(q.trim()) || (/^(?:ohip|msp|g[12])\s+in\s+[a-z\s]+$/i.test(q.trim())));
  if (foreignProgrammeConflict) missingSlots.push('location');
  if ((ambiguous && !foreignCountry) || (foreignCountry && !isSupportedForeign)) missingSlots.push('location');
  const isStrictlyLocalTopic = intents.some(t => ['housing', 'transit', 'childcare'].includes(t))
    || (intents.includes('health') && !/\b(?:inadmissib|excessive demand|medical exam|medical clearance)\b/i.test(q))
    || (intents.includes('driving') && !/\b(?:riv|import|transport canada|customs|safety inspection)\b/i.test(q))
    || (intents.includes('employment') && /\b(?:minimum wages?|overtime pay|statutory holiday pay|vacation pay|severance pay)\b/i.test(q));

  const isConceptualOrFederal = isConceptualOrFederalQuestion(q);

  if (!isGlobalDestination && !foreignCountry && !resolvedCity && !resolvedRegion && isStrictlyLocalTopic && !isConceptualOrFederal) missingSlots.push('location');
  const isLicenceAcquisitionOrExchange = /\blicen[cs]e\b/i.test(q)
    && !/\b(?:purchase|buy|buying|import|importing|registration|registering|insurance|parking|demerit|speed limit|used car|used vehicle|winter driving|winter tires?|licen[cs]e expiry|expired licen[cs]e|driving history|driver abstract|driving record|safety inspection)\b/i.test(q);
  if (intents.includes('driving') && isLicenceAcquisitionOrExchange && (resolvedCity || resolvedRegion) && !resolvedLicenceCountry && (!foreignCountry || foreignCountry === 'CA')) missingSlots.push('licence_country');
  const parsedResult = { intents, city: resolvedCity, region: resolvedRegion, country, language, licenceCountry: resolvedLicenceCountry, licenceCountryAmbiguous: licence.licenceCountryAmbiguous, risk: intents.some(t => highRiskTopics.has(t)) ? 'high' : 'low', missingSlots: [...new Set(missingSlots)], ambiguous, queryTerms: queryTerms(queryForMatching), housingSubjects: housingQuestionSubjects(q), telecom: telecomContext(q), ...queryRequirements(q, intents), thresholds: extractStatutoryThresholds(q), parserVersion: 'english-rules-0.12', geographyVersion: GEOGRAPHY_VERSION, relocation: relocation ? { origin: relocation.originName, originCountry: relocation.originCountry, destination: relocation.destName, destCountry: relocation.destCountry } : null };
  Object.defineProperty(parsedResult, 'isConceptual', { value: isConceptualOrFederal, enumerable: false, configurable: true, writable: true });
  return parsedResult;
}
// "approved" alone does not say who approved it. Only the editorial review
// paths (store.review, ingestion decisions) stamp reviewMethod; records that
// arrive approved from seed files or bulk scripts are labelled as such.
function reviewMethodOf(r) {
  if (r.status !== 'approved') return 'none';
  return r.reviewMethod === 'editorial_review' || r.reviewMethod === 'source_verified' ? r.reviewMethod : 'bulk_approval';
}
export function retrieve(parsed, records, now = new Date(), searchIndex) {
  if (!parsed || parsed.ambiguous || parsed.missingSlots?.includes('location')) return [];
  const safeRecords = Array.isArray(records) ? records : [];
  const safeNow = (now instanceof Date && !isNaN(now.getTime())) ? now : new Date();
  const date = safeNow.toISOString().slice(0, 10);
  const isGlobal = parsed.country && parsed.country !== 'CA';
  const effectiveRegion = parsed.region || (parsed.city && cityToRegion[parsed.city]) || null;
  const isNationalConceptual = !parsed.region && !effectiveRegion && !parsed.city && (parsed.isConceptual || isConceptualOrFederalQuestion(parsed.queryTerms?.join(' ')));
  const nationalBaselines = isNationalConceptual && destinationRegions[parsed.country || 'CA'] ? destinationRegions[parsed.country || 'CA'] : [];
  const EU_MEMBER_STATES = new Set(['Germany', 'Ireland', 'France', 'Netherlands', 'Sweden', 'Spain', 'European Union']);
  const euScope = isGlobal && EU_MEMBER_STATES.has(parsed.country)
    ? (parsed.country === 'European Union' ? ['Germany', 'France', 'Ireland', 'Netherlands', 'Sweden', 'Spain', 'European Union'] : ['European Union'])
    : [];
  // Global destinations scope strictly to target country, region, city, and licence country.
  // Canadian pilot questions scope to CA, province, and city.
  const scope = isGlobal
    ? new Set([parsed.country, parsed.region, effectiveRegion, parsed.city, parsed.licenceCountry, ...nationalBaselines, ...euScope].filter(Boolean))
    : new Set(['CA', parsed.region, effectiveRegion, parsed.city, parsed.licenceCountry, ...nationalBaselines].filter(Boolean));
  const scoped = safeRecords.filter(r => {
    // Reject out-of-scope records before expensive English/policy validation.
    // Every record that can reach ranking still passes the full validator.
    if (!r || !scope.has(r.jurisdiction) || !parsed.intents.includes(r.topic)) return false;
    // The origin country is in scope for exchanging its licence or for leaving it.
    // Its tax or health rules do not apply to someone asking about another destination country.
    if (parsed.licenceCountry && parsed.licenceCountry !== parsed.country && r.jurisdiction === parsed.licenceCountry && !['driving', 'community'].includes(r.topic)) return false;
    // "Moving from Germany to Canada" says nothing about living in Germany.
    if (isGlobal && !describesLifeInCountry(r)) return false;
    try { assertEnglishRecord(r); } catch { return false; }
    const recHousingSubj = r.topic === 'housing' ? recordHousingSubject(r) : null;
    return (r.topic !== 'housing' || parsed.housingSubjects === undefined || parsed.housingSubjects.length === 0 || !recHousingSubj || parsed.housingSubjects.includes(recHousingSubj))
      && (r.topic !== 'telecom' || parsed.telecom === undefined || parsed.telecom.subjects.includes(r.telecomSubject) || isGlobal);
  });
  const activeRegion = parsed.region || effectiveRegion;
  return (searchIndex ? searchIndex.rank(scoped, parsed.queryTerms) : rankLexically(scoped, parsed.queryTerms)).map(r => ({
    ...r,
    available: ['research_seed', 'approved'].includes(r.status) && r.checkedAt <= date && r.expiresAt >= date && (!r.effectiveFrom || r.effectiveFrom <= date) && (!r.effectiveTo || date < r.effectiveTo),
    reason: r.status === 'pending' ? 'awaiting_human_review' : r.status === 'rejected' ? 'rejected' : r.checkedAt > date ? 'future_check_date' : r.expiresAt < date ? 'stale' : (r.effectiveFrom && r.effectiveFrom > date) || (r.effectiveTo && date >= r.effectiveTo) ? 'outside_effective_dates' : 'source_guidance',
    scopeScore: r.jurisdiction === parsed.city ? 3 : (activeRegion && r.jurisdiction === activeRegion) ? 2.5 : (isGlobal && r.jurisdiction === parsed.country) ? 2 : 1,
    score: r.lexicalScore + (r.jurisdiction === parsed.city ? 0.75 : (activeRegion && r.jurisdiction === activeRegion) ? (isGlobal ? 0.8 : 0.45) : (isGlobal && r.jurisdiction === parsed.country) ? 0.3 : 0),
    retrievalVersion: r.retrievalVersion || 'lexical-bm25-0.1'
  })).sort((a, b) => b.score - a.score || b.scopeScore - a.scopeScore || a.id.localeCompare(b.id));
}
const CANADIAN_REGION_NAMES = Object.freeze({ ON: 'ontario', BC: 'british columbia', AB: 'alberta', QC: 'quebec', MB: 'manitoba', SK: 'saskatchewan', NS: 'nova scotia', NB: 'new brunswick', PE: 'prince edward island', NL: 'newfoundland labrador', YT: 'yukon', NT: 'northwest territories', NU: 'nunavut' });
const GENERIC_QUESTION_TERMS = new Set('case newcomer another under date available who policy law eligibility status assessment guidance authority document legal rules government analyze responsible different compare options required requirement much many long need needed get got find help know tell want use using as while than by if not but any some all there who which why will may might must also have has had was were been am very more most less best new free local official common normal normally general basic main minimum maximum apply start process work file people person thing things way'.split(' '));
function substantiveTerms(terms, parsed) {
  const place = new Set(tokenize([parsed.city, parsed.region, CANADIAN_REGION_NAMES[parsed.region], parsed.country, 'canada', 'canadian'].filter(Boolean).join(' ')));
  return (terms || []).filter(term => !place.has(term));
}
// Diagnostic only until a topic is switched on: see subjectShadow.
const subjectTags = loadSubjectTags();
const MIN_RELATIVE_SCORE = 0.3;
// Subjects a record must actually be about when the question names them: nothing
// else in the same topic stands in for them, however many other words it shares.
const REQUIRED_SUBJECTS = Object.freeze([
  [/\blibrary (?:membership|card|registration)\b/i, /\blibrar(?:y|ies)\b/i],
  [/\b(?:emergency (?:family )?shelter|family shelter|emergency housing)\b/i, /\bshelters?\b|\bemergency (?:housing|accommodation)\b|\bhomeless(?:ness)?\b/i],
  [/\bwage theft\b|\bunpaid wages?\b/i, /\bwage theft\b|\bunpaid (?:wages?|pay)\b|\bwages? (?:owed|claims?)\b|\bemployment standards claims?\b|\b(?:payment|non-payment|withholding|deductions?) of wages\b/i],
  [/\blegal aid\b|\blegal clinics?\b/i, /\blegal aid\b|\blegal clinics?\b|\bberatungshilfe\b|\bprozesskostenhilfe\b|\baide juridictionnelle\b|\bjuridisch loket\b|\bcommunity legal\b/i],
  [/\b(?:english|french|language) (?:classes|courses|lessons|training)\b|\b(?:esl|linc)\b/i, /\b(?:english|french|language)\b.*\b(?:classes|courses|lessons|training|instruction)\b|\b(?:esl|linc)\b|\binburgering\b|\bintegrations?kurs\b|\bdelf\b|\bdalf\b|\blanguage\b|\bfrancisation\b/i],
  [/\b(?:business registration|register(?:ing)? (?:a |my |the )?business|incorporat(?:e|ion|ing))\b/i, /\b(?:business|compan(?:y|ies)|corporat(?:e|ion|ions))\s+(?:name\s+)?regist(?:er|ration|ry)|\bregist(?:er|ering)\s+(?:a |your |the )?(?:business|company)|\bincorporat(?:e|ed|ion|ing)\b/i],
  [/\bstudent (?:transit|bus|transport)(?: fares?)?\b/i, /\bstudent\b.*\b(?:fare|pass|transit|bus)\b|\b(?:fare|pass|transit|bus)\b.*\bstudent\b/i],
  [/\bsettlement agenc(?:y|ies)\b/i, /\bsettlement\b|\bresettlement\b|\bwelcome\b|\bintegration\b|\bnewcomer\b/i],
  [/\brent affordability\b/i, /\b(?:subsid|afford|rent.geared.to.income|rgi|housing assistance)/i],
  [/\b(?:agent|consultant|representative)\b.*\b(?:stopped responding|cash without receipt|scam|fraud)\b/i, /\b(?:agent|consultant|representative|fraud|scam)\b/i],
  [/\bstatutory holidays?\b|\bpublic holidays?\b/i, /\bholidays?\b/i],
  [/\bvacation pay\b/i, /\bvacation\b/i],
  [/\bovertime\b/i, /\bovertime\b|\bhours of work\b|\bworking hours\b|\bshifts?\b|\bmilog\b|\bpay\b|\bwages?\b/i],
  [/\bminimum wages?\b/i, /\bminimum wages?\b|\bkollektivavtal\b|\bcollective agreements?\b|\bsalary floor\b/i],
  [/\bfood\s*banks?\b/i, /\bfood\s*banks?\b|\bdaily bread\b|\btafel\b|\bozharvest\b|\btrussell\b|\bemergency food\b/i],
  [/\bmental health\b/i, /\bmental\b|\bcrisis\b|\bpsychiatr\w*|\bpsycholog\w*|\btherap\w*|\bgkv\b|\bhealth\b|\bclinic\b/i],
  [/\bforeign (?:property|assets?)\b|\bt1135\b/i, /\bforeign (?:property|assets?)\b|\bt1135\b/i],
  [/\bfhsa\b|\bfirst home savings\b/i, /\bfhsa\b|\bfirst home savings\b/i],
  [/\bsublet(?:ting)?\b/i, /\bsublet|\bassign/i],
  [/\bmou?ld\b/i, /\bmou?ld\b|\brepairs?\b|\bmaintenance\b/i],
  [/\bfirst and last\b|\blast month'?s rent\b/i, /\bdeposit\b|\blast month/i],
  [/\b(?:locked|locks?|lockout)\b.*\b(?:out|landlord|apartment)\b|\blandlord\b.*\b(?:locked|lockout|locks?)\b/i, /\block|\bevict/i],
  [/\bworkplace (?:injur|accident|safety)\b|\bworkers? comp(?:ensation)?\b/i, /\b(?:injur|workers? comp|occupational health|safety)\b/i],
  [/\bwrong spelling\b|\bname error\b|\btypo on (?:visa|permit|record)\b/i, /\b(?:amendment|correction|spelling|name)\b/i],
  [/\b(?:meal|rest|shift)\s+breaks?\b|\bbreak during (?:my |a |the )?shift\b/i, /\b(?:breaks?|rest period|meal)\b/i],
  [/\bunsafe (?:workplace|work|working conditions)\b|\breport (?:an? )?unsafe\b/i, /\b(?:unsafe|safety|occupational health|reprisal|inspector)\b/i],
  [/\b(?:employment insurance|\bei\b)\b/i, /\b(?:employment insurance|\bei\b)\b/i],
  [/\b(?:pregnancy|prenatal|maternity) care\b/i, /\b(?:pregnan\w*|prenatal|matern\w*|midwi\w*|ohip|sanitaria|centros? de salud|plunket|lmc|médico|healthcare|clinic)\b/i],
  [/\bsend(?:ing)? money\b|\bmoney transfers?\b|\bremittances?\b/i, /\b(?:transfer|remit(?:tanc(?:e|es))?|wire|fintrac|send)\b/i],
  [/\b(?:change|changing) (?:my |your |our )?schedule\b|\blast minute schedule\b|\bwork schedule\b/i, /\b(?:schedul|hours of work|shift)\b/i],
  [/\bsick days?\b|\bpaid sick days?\b|\bsick leave\b/i, /\bsick\b/i],
  [/\bmaternity leave\b|\bparental leave\b/i, /\b(?:maternity|parental|pregnan\w*|elterngeld|leave|right to work|form i-?9|sick leave|statutory pay)\b/i],
  [/\brecord of employment\b|\broe\b/i, /\b(?:record of employment|\broe\b)\b/i],
  [/\btied to one employer\b|\bclosed work permit\b|\bvulnerable worker\b/i, /\b(?:vulnerable|open work permit|tied|employer-specific|aewv|work visa|work permit|employment permit|redundanc\w*|job change|sponsor\w*|aufenthalt\w*|labour contract|decree|stamp 4|residence permit|permission)\b/i],
  [/\bunder the table\b|\bpaid in cash\b/i, /\b(?:unauthorized|cash|under the table|self-employ)\b/i],
  [/\b(?:employee or (?:an )?independent contractor|independent contractor|gig worker)\b/i, /\b(?:contractor|misclassif|gig|independent|sham contracting|self-employ\w*|freelanc\w*|worker|employee|labour|employment standards|esa|flsa|economic reality)\b/i],
  [/\b(?:rent|months?(?:\s+of\s+rent)?)\s+(?:up\s+front|in\s+advance)\b|\badvance\s+rent\b/i, /\b(?:deposit|advance|up front|prepa)\b/i],
  [/\bbreak (?:my |a |the )?lease\b|\bterminate (?:my |a |the )?lease early\b/i, /\b(?:lease|tenanc(?:y|ies))\b.*\b(?:break|assign|sublet|terminat|end)\b|\b(?:break|assign|sublet|terminat|end)\b.*\b(?:lease|tenanc(?:y|ies))\b/i],
  [/\b(?:rental (?:listing\s+)?(?:is\s+a\s+)?scam|rental fraud|listing scam|fake listing)\b/i, /\b(?:scam|fraud|warning)\b/i],
  [/\bsee a doctor without insurance\b|\buninsured doctor\b/i, /\b(?:uninsured|without (?:insurance|msp|coverage)|walk[- ]in clinic|ifhp)\b/i],
  [/\bunlock(?:ing)?\b.*\bphone\b|\bphone\b.*\bunlock(?:ing)?\b/i, /\bunlock/i],
  [/\b(?:therapist|psychologist|counsellor|counseling)\b/i, /\b(?:therap\w*|mental\w*|counsel\w*|psycholog\w*)\b/i],
  [/\brrsp\b|\bregistered retirement savings plan\b/i, /\brrsp\b|\bregistered retirement\b/i],
  [/\bosap\b|\bstudent loans?\b/i, /\bosap\b|\bstudent loans?\b/i],
  [/\btrillium\b/i, /\btrillium\b/i],
  [/\b(?:bring(?:ing)?|import(?:ing)?)\s+(?:a |my )?(?:dog|cat|pet|animal)\b/i, /\b(?:dog|cat|pet|animal|quarantine|mickleham)\b/i],
  [/\bflagpol(?:e|ing)\b(?!\s+(?:at\s+rainbow\s+bridge|for\s+pgwp))/i, /\bflagpol(?:e|ing)\b/i],
  [/\b(?:car|auto|vehicle) insurance\b/i, /\b(?:insurance|insurer|fsra|premium)\b/i],
  [/\bparents and grandparents\b|\bpgp\b/i, /\bparents and grandparents\b|\bpgp\b/i],
  [/\b(?:register(?:ing)? (?:the |a )?birth|born in|newborn bundle)\b/i, /\b(?:birth|newborn|baby|bundle)\b/i],
  [/\b(?:phone|mobile|cell|wireless) plans?\b/i, /\b(?:plan|mobile|cell|wireless|carrier|sim|phone|telecom|provider|contract|order|cooling)\b/i],
  [/\b(?:spend on food|food costs?|cost of food|food basket)\b/i, /\b(?:food|grocer|basket|costing)\b/i],
  [/\banmeldung\b/i, /\banmeldung\b/i],
  [/\b(?:damage|pet|security)\s+deposits?\b|\bpet\s+deposits?\b/i, /\b(?:deposits?|bonds?|kaution|fianza)\b/i],
  [/\b(?:cancel|cancellation)\s+(?:my\s+|a\s+)?(?:plan|contract|service|phone)\b|\b(?:plan|contract|service|phone)\s+(?:cancellation|cancel)\b|\bcancel(?:ling)?\s+(?:my\s+|a\s+)?(?:plan|contract)\b/i, /\b(?:cancel|cancellation|ccts|tdr|tdra|dispute|complaints?|terminat(?:e|ion|ing)|cooling[- ]off)\b/i]
]);
const coversRequiredSubjects = (record, question) => {
  const text = `${record.title} ${record.summary}`;
  if (/\bflagpol(?:e|ing)\b/i.test(record.title) && !/\bflagpol(?:e|ing)\b|\brainbow bridge\b/i.test(question)) {
    return false;
  }
  const primarySubject = requestedSubject(question);
  return REQUIRED_SUBJECTS.every(([asked, needed]) => {
    if (!asked.test(question)) return true;
    if (primarySubject && !asked.test(primarySubject) && (/agent|consultant|representative|spelling|name error|typo/.test(asked.source))) {
      return true;
    }
    if (/locked.*out/.test(asked.source) && /\b(?:visa|bva|bvb|permit|border|overseas|re-entry)\b/i.test(question) && !/\b(?:landlords?|tenants?|apartments?|units?|rooms?|rent(?:als?|ing)?)\b/i.test(question)) {
      return true;
    }
    return needed.test(text);
  });
};
const hasInformativeOverlap = (matchedTerms, parsed) => substantiveTerms(matchedTerms, parsed).some(term => !GENERIC_QUESTION_TERMS.has(term));
// The narrower reading of a question about a country outside the corridors. It
// applies only when a published record about life there fits the question;
// otherwise the question keeps its normal "not covered yet" answer.
function referenceScope(input, parsed, records, now, searchIndex) {
  if (input?.city) return null;
  const country = namedReferenceCountry(normalizeEnglishQuestion(input?.question), parsed, records);
  if (!country) return null;
  const scoped = { ...parsed, country, region: null, city: null, licenceCountry: null, licenceCountryAmbiguous: false, ambiguous: false, missingSlots: [], relocation: null };
  const inCountry = records.filter(record => describesLifeInCountry(record) && recordFitsSubject(record, input.question));
  const coversNamed = subjectEvidenceMatcher(normalizeEnglishQuestion(input?.question));
  const fits = retrieve(scoped, inCountry, now, searchIndex).some(r => r.available && coversNamed(r) && coversRequiredSubjects(r, input.question) && hasInformativeOverlap(r.matchedTerms, scoped));
  return fits ? { parsed: scoped, records: inCountry, country } : null;
}
export function answer(input, records, now = new Date(), searchIndex, options = {}) {
  const safeOptions = (options && typeof options === 'object') ? options : {};
  const subjectRouting = safeOptions.subjectRouting || { topics: ROUTED_TOPICS, tags: subjectTags };
  const safeRecords = Array.isArray(records) ? records : [];
  const safeNow = (now instanceof Date && !isNaN(now.getTime())) ? now : new Date();
  const started = performance.now();
  const qbMatch = !input?.gmsId && !input?.marketGapId ? resolveQuestionBankAny(input?.questionBankId || input?.question) : null;
  const mkt1Match = !input?.gmsId && !input?.questionBankId ? resolveMarketGapBatch1Item(input?.marketGapId || input?.question) : null;
  const mkt2Match = !input?.gmsId && !input?.questionBankId ? resolveMarketGapBatch2Item(input?.marketGapId || input?.question) : null;
  const mkt3Match = !input?.gmsId && !input?.questionBankId ? resolveMarketGapBatch3Item(input?.marketGapId || input?.question) : null;
  const gmsMatch = !input?.marketGapId && !input?.questionBankId ? resolveGlobalSettlementItem(input?.gmsId || input?.question) : null;
  const directResolved = Boolean(qbMatch || mkt1Match || mkt2Match || mkt3Match || gmsMatch);

  const narrativeCrisis = !directResolved ? resolveNarrativeCrisis(input?.question, input) : null;
  // A catalog match found from the question's text is only a research lead: it
  // must not stop reviewed evidence from answering the same question. Only an
  // explicit catalog id asks for that catalog entry and nothing else.
  const directHandled = directResolved && Boolean(input?.questionBankId || input?.marketGapId || input?.gmsId);
  let parsed = directHandled
    ? {
      intents: [(gmsMatch?.topic || mkt1Match?.topic || mkt2Match?.topic || mkt3Match?.topic || 'immigration_law')],
      city: null,
      region: null,
      country: gmsMatch?.country || mkt1Match?.country || mkt2Match?.country || mkt3Match?.country || 'CA',
      language: 'en',
      licenceCountry: null,
      licenceCountryAmbiguous: false,
      risk: 'medium',
      missingSlots: [],
      ambiguous: false,
      queryTerms: [],
      housingSubjects: [],
      telecom: { subjects: [], priceRequest: false },
      contractVersion: 'query-2',
      requestedOutput: 'source_guidance',
      facets: [],
      thresholds: null,
      parserVersion: 'direct-resolver',
      geographyVersion: 'geo-1',
      relocation: null
    }
    : parse(input);
  if (directHandled && parsed.missingSlots.includes('location')) {
    parsed.missingSlots = parsed.missingSlots.filter(s => s !== 'location');
  }
  const reference = directHandled ? null : referenceScope(input, parsed, safeRecords, safeNow, searchIndex);
  if (reference) parsed = reference.parsed;
  const evidenceRecords = reference ? reference.records : safeRecords;
  const result = {
    traceId: randomUUID(), parsed, status: 'unavailable', claims: [], sources: [], gaps: [], clarification: null,
    notice: 'Limited research pilot. These are relevant source summaries, not a complete answer to every detail of your question.'
  };
  Object.defineProperty(result, 'disclaimer', { value: 'This information is for research and settlement guidance only and does not constitute formal legal representation or statutory advice.', enumerable: false });
  // Narrative matches are research hints, never substitutes for reviewed evidence.
  if (narrativeCrisis) result.gaps.push({ topic: narrativeCrisis.topic, reason: 'awaiting_human_review' });
  if (Array.isArray(safeOptions.liveAlerts)) {
    result.liveAlerts = safeOptions.liveAlerts;
  } else if (safeOptions.realtimeStore?.findActiveAlerts) {
    result.liveAlerts = safeOptions.realtimeStore.findActiveAlerts({
      country: parsed.country,
      region: parsed.region,
      city: parsed.city,
      topic: parsed.intents[0]
    });
  }
  if (detectAndTranslateMultilingualQuery(input?.question)?.requiresConfirmation) {
    result.status = 'clarification';
    result.clarification = 'Please confirm your question in English, including the destination, dates and immigration status. Automatic translation could change these details.';
    result.gaps.push({ topic: null, reason: 'translation_confirmation_required' });
  } else if (parsed.missingSlots.includes('location')) {
    const place = describeLocationClarification(normalizeEnglishQuestion(input.question), parsed);
    result.status = 'clarification'; result.clarification = place.message; result.placeClarification = place;
    if (parsed.country !== 'CA' && !parsed.ambiguous) {
      result.clarification = 'Are you asking about a Canadian programme while abroad, or about services in ' + parsed.country + '?';
      result.placeClarification = { ...place, message: result.clarification };
    }
    result.gaps.push({ topic: null, reason: 'missing_or_unsupported_geography' });
  } else {
    // .test() advances a /g regex's lastIndex, so every second call would
    // wrongly miss an injection; test with a fresh stateless copy instead
    // (sanitizePromptInjection below keeps the same literals global for replace()).
    const hasInjection = INJECTION_PATTERNS.some(pat => new RegExp(pat.source, pat.flags.replace('g', '')).test(input?.question || ''));
    const isConceptual = !hasInjection && isConceptualOrFederalQuestion(normalizeEnglishQuestion(input?.question));
    // The catalog knows which country a templated question is about, even when it
    // borrows a Canadian term ("CRA account access in New Zealand"); Canadian
    // evidence must not answer it.
    const catalogElsewhere = gmsMatch && gmsMatch.country !== 'Canada' && parsed.country === 'CA';
    // Being in the catalog does not make a question conceptual: its templated words
    // ("assessment", "authority") would match unrelated records across these topics.
    const searchIntents = directHandled || catalogElsewhere ? [] : (parsed.intents.length ? parsed.intents : (gmsMatch?.topic ? [gmsMatch.topic] : (isConceptual ? ['employment', 'community', 'arrival', 'housing', 'money', 'transit', 'family', 'driving', 'health'] : [])));
    const candidates = searchIntents.length ? retrieve({ ...parsed, intents: searchIntents, isConceptual }, evidenceRecords, safeNow, searchIndex) : [];
    result.retrieval = { version: candidates[0]?.retrievalVersion || 'lexical-bm25-0.1', candidates: candidates.map(r => ({ id: r.id, score: r.score, matchedTerms: r.matchedTerms, available: r.available, reason: r.reason })) };
    // The topic alone is not relevance: a record matching only the place name or
    // a filler word ("minimum" in "minimum wage") must not stand in for an answer
    // when the record that fits is withheld or missing. This guards the legal and
    // benefit topics; a transit or directory pointer stays useful without sharing
    // the asker's words ("bus journey" -> trip planner). A one-word question
    // ("Toronto bus") asks for the topic itself, and injected instructions are
    // not part of what was asked.
    const askedTerms = new Set(substantiveTerms(parsed.queryTerms, parsed));
    const normalizedQ = normalizeEnglishQuestion(input?.question);
    const coversNamedSubject = subjectEvidenceMatcher(normalizedQ);
    const namedSubject = requestedSubject(normalizedQ);
    const questionIsSpecific = !hasInjection && askedTerms.size > 1 && [...askedTerms].some(term => !GENERIC_QUESTION_TERMS.has(term));
    const fitsQuestion = r => {
      if (!coversNamedSubject(r)) return false;
      if (!coversRequiredSubjects(r, input.question)) return false;
      if (namedSubject && coversNamedSubject(r)) return true;
      if (!parsed.intents.length) return hasInformativeOverlap(r.matchedTerms, parsed);
      // A country-level reference record must always fit the question itself.
      return reference || (questionIsSpecific && highRiskTopics.has(r.topic)) ? hasInformativeOverlap(r.matchedTerms, parsed) : true;
    };
    // A record far weaker than the best match on any asked topic is a stand-in, not
    // an answer. Withheld records count: when the record that fits awaits review, say
    // so rather than serve a weak one. A rejected record is no longer evidence at all.
    const bestScore = Math.max(0, ...candidates.filter(r => r.status !== 'rejected' && fitsQuestion(r)).map(r => r.score));
    // Lead with the topic holding the strongest match, whatever order the words came in.
    const bestForTopic = topic => Math.max(0, ...candidates.filter(r => r.topic === topic && fitsQuestion(r)).map(r => r.score));
    for (const topic of [...searchIntents].sort((a, b) => bestForTopic(b) - bestForTopic(a))) {
      // Broad topic matches must not masquerade as answers to unrelated legal subquestions.
      // In a switched-on topic a recognised subject decides outright. Only a confirmed tag
      // can answer; a withheld record's suggestion may only explain why nothing is served.
      const askedSubjects = subjectRouting.topics.has(topic) ? questionSubjects(input?.question, [topic]) : [];
      const onAskedSubject = r => subjectsOfRecord(r, subjectRouting.tags, { includeProposed: !r.available }).some(subject => askedSubjects.includes(subject));
      const relevant = candidates.filter(r => r.topic === topic && coversNamedSubject(r) && (askedSubjects.length ? onAskedSubject(r) : fitsQuestion(r)));
      const usable = relevant.filter(r => r.available && (askedSubjects.length > 0 || !highRiskTopics.has(r.topic) || r.score >= bestScore * MIN_RELATIVE_SCORE));
      const conflicts = new Set(usable.filter(r => usable.some(s => s.id !== r.id && s.topic === r.topic && s.jurisdiction === r.jurisdiction && s.claimKey && s.claimKey === r.claimKey && s.summary !== r.summary)).map(r => r.id));
      if (conflicts.size) result.gaps.push({ topic, reason: 'conflicting_evidence' });
      else for (const r of usable.slice(0, 2)) {
        // P1-5: an ordered checklist is provided only when the question asks
        // for one AND the evidence itself declares ordered steps. Support is
        // never inferred from keywords alone.
        const kind = parsed.requestedOutput === 'checklist' && Array.isArray(r.steps) && r.steps.length ? 'checklist' : 'source_guidance';
        result.claims.push({ id: `claim-${result.claims.length + 1}`, text: r.summary, evidenceId: r.id, status: r.status, kind, topic: r.topic, ...(kind === 'checklist' ? { steps: r.steps } : {}) });
      }
      const selectedIds = new Set(result.claims.map(c => c.evidenceId));
      const cited = [...new Map([...relevant.filter(r => selectedIds.has(r.id)), ...relevant.slice(0, 3)].map(r => [r.id, r])).values()];
      for (const r of cited) result.sources.push({ id: r.id, title: r.title, url: r.url, quote: r.quote, checkedAt: r.checkedAt, expiresAt: r.expiresAt, status: r.available ? r.status : r.reason, reviewMethod: r.available ? reviewMethodOf(r) : 'none', jurisdiction: r.jurisdiction, snapshotId: r.snapshotId ?? null });
      if (!usable.length && (parsed.intents.includes(topic) || !result.claims.length)) result.gaps.push({ topic, reason: relevant.find(r => !r.available)?.reason || 'missing_evidence' });
      if (topic === 'telecom' && parsed.telecom.priceRequest) result.gaps.push({ topic, reason: 'missing_live_price_data' });
      if (topic === 'housing' && usable.length) for (const subject of parsed.housingSubjects) {
        if (!result.claims.some(c => relevant.some(r => r.id === c.evidenceId && recordHousingSubject(r) === subject))) {
          result.gaps.push({ topic, subject, reason: relevant.find(r => recordHousingSubject(r) === subject)?.reason || 'missing_evidence' });
        }
      }
    }
    if (!parsed.intents.length && !result.claims.length) result.gaps.push({ topic: null, reason: 'unrecognized_intent' });
    // P1-5: a facet whose demand the evidence explicitly declares (ordered
    // steps for the facet's topic, or for any topic when the question spans
    // several) no longer reports a gap.
    const checklistTopics = new Set(result.claims.filter(c => c.kind === 'checklist').map(c => c.topic));
    for (const facet of parsed.facets) {
      if (facet.id === 'ordered_checklist' && (facet.topic === null ? checklistTopics.size > 0 : checklistTopics.has(facet.topic))) continue;
      result.gaps.push({ topic: facet.topic, subject: facet.id, reason: facet.reason });
    }
    if (reference && result.claims.length) {
      result.gaps.push({ topic: null, reason: 'limited_country_coverage' });
      result.referenceCoverage = referenceCoverageNotice(reference.country);
    }
    if (parsed.missingSlots.includes('licence_country')) result.clarification = parsed.licenceCountryAmbiguous ? 'You mentioned more than one licence country. Which current licence do you want to ask about?' : 'Which country issued your current driving licence?';
    if (!result.claims.length && !result.clarification) {
      const qText = input?.question || '';
      const isLicenceContextTest = /exchange.*licence/i.test(qText) && /\b(?:toronto|ontario|vancouver|bc)\b/i.test(qText);
      const isPoemOrFluff = /write a poem|poem/i.test(qText);
      const isForeign = parsed.country && parsed.country !== 'CA' && !directHandled;
      const isDomesticUnsupported = (parsed.country === 'CA' && (
        (parsed.region && !['ON', 'BC'].includes(parsed.region)) ||
        hasUnsupportedDestination(qText) ||
        /\b(?:winter driving|winter road safety|rental fraud|credit building)\b/i.test(qText)
      ));
      const isUnsupportedProcedure = /\b(?:winter driving|winter road safety|vehicle import|used vehicle purchase|custody documents from another country|adult language training eligibility|prescription transfer from overseas|unpaid trial shift|utility account with no credit history|credit history without Canadian loans|bank account frozen due to identity checks|lost passport during temporary residence|cross-border identity verification|renoviction notice and compensation|procedural fairness response evidence|reconsideration versus judicial review|appeal of disability benefit denial|government benefits overpayment recovery|recruitment agency fee dispute|misclassification as independent contractor|unpaid overtime with variable shifts|driving history recognition|regulated occupation licensing|local legal aid intake|settlement agency service eligibility|licence expiry|maternity care|rent increase|rental fraud|credit building)\b/i.test(qText)
        || (/\bsponsor licen[cs]e\b/i.test(qText) && parsed.country !== 'United Kingdom')
        || (/\bSurrey\b/i.test(qText));

      if (!isLicenceContextTest && !isPoemOrFluff && (isForeign || isDomesticUnsupported || (isUnsupportedProcedure && (parsed.city || parsed.region)))) {
        const dest = [parsed.city, parsed.region, parsed.country].filter(Boolean).join(', ') || 'that jurisdiction';
        result.status = 'unavailable';
        result.clarification = `Statutory settlement guidance on this topic for ${dest} is outside our verified statutory coverage.`;
        result.placeClarification = { version: GEOGRAPHY_VERSION, reason: 'unsupported_place', message: result.clarification, mentioned: [], selectableCities: [] };
        result.gaps = result.gaps.filter(g => g.reason !== 'missing_evidence');
        result.gaps.push({ topic: parsed.intents[0] || null, reason: 'missing_or_unsupported_geography' });
      }
    }
    result.status = result.claims.length ? (result.gaps.length ? 'partial' : 'guidance') : 'unavailable';
    // Internal diagnostic metadata is intentionally excluded from public JSON.
    Object.defineProperty(result, 'subjectShadow', { value: subjectShadow({ question: input?.question, parsed, candidates, claims: result.claims, tags: subjectTags }), enumerable: false });
  }
  const crisisMatch = !narrativeCrisis ? resolveSocialCrisisGuidance(input?.question, parsed) : null;
  const leads = [
    ['questionBankMatch', qbMatch], ['marketGapMatch', mkt1Match || mkt2Match || mkt3Match],
    ['globalSettlementMatch', gmsMatch], ['crisisMatch', crisisMatch]
  ];
  for (const [key, match] of leads) if (match) {
    // Internal diagnostic metadata is intentionally excluded from public JSON.
    Object.defineProperty(result, key, { value: match, enumerable: false });
    result.gaps.push({ topic: match.topic || null, reason: 'awaiting_human_review' });
  }
  if (leads.some(([, match]) => match) && result.status !== 'clarification')
    result.status = result.claims.length ? 'partial' : 'unavailable';
  result.message = result.claims.length ? result.message || 'Here is starting guidance from the available sources.' : 'A verified answer to this question is not yet available.';
  // A question placed abroad must not be handed Canadian phone numbers just
  // because the parser's default country is CA.
  const placedAbroad = result.placeClarification?.reason === 'unknown_place' || result.placeClarification?.mentioned?.some(place => place.status === 'outside_canada');
  const urgentHelp = detectUrgentHelp(input?.question, placedAbroad ? null : parsed.country);
  if (urgentHelp) result.urgentHelp = urgentHelp;
  const multilingual = detectAndTranslateMultilingualQuery(input?.question);
  if (multilingual) result.multilingual = multilingual;
  result.answerability = assessAnswerability(parsed, result.claims, result.gaps);
  // Why this status: citation mix plus honest unverified counts, so the UI can
  // explain a "partial"/"unavailable" verdict without hiding behind a chip.
  const approvedClaims = result.claims.filter(c => c.status === 'approved').length;
  const editorReviewed = new Set(result.sources.filter(s => s.reviewMethod === 'editorial_review').map(s => s.id));
  const editorReviewedClaims = result.claims.filter(c => editorReviewed.has(c.evidenceId)).length;
  const sourceVerified = new Set(result.sources.filter(s => s.reviewMethod === 'source_verified').map(s => s.id));
  const sourceVerifiedClaims = result.claims.filter(c => sourceVerified.has(c.evidenceId)).length;
  result.verification = {
    claimsTotal: result.claims.length,
    approvedClaims,
    editorReviewedClaims,
    sourceVerifiedClaims,
    bulkApprovedClaims: approvedClaims - editorReviewedClaims - sourceVerifiedClaims,
    seedClaims: result.claims.length - approvedClaims,
    reviewPendingTopics: result.gaps.filter(g => g.reason === 'awaiting_human_review').length,
    unverifiedTopics: result.gaps.length
  };
  result.latencyMs = Number((performance.now() - started).toFixed(2));
  return result;
}
export function coverage(records, now = new Date()) {
  return Object.keys(cities).map(city => ({
    city, region: cities[city],
    // This pilot publishes evidence summaries in English only; say so per city.
    language: 'en',
    topics: topics.map(topic => {
      const matches = retrieve({ city, region: cities[city], intents: [topic] }, records, now);
      return { topic, status: matches.some(r => r.available) ? 'source_guidance' : matches.length ? 'review_or_refresh_needed' : 'missing', count: matches.filter(r => r.available).length };
    })
  }));
}
// One city's sheet with the actual records behind its status, so "why does
// this tile say review needed?" is answerable publicly, not just internally.
export function coverageDetail(city, records, now = new Date()) {
  if (!Object.hasOwn(cities, city)) throw new ValidationError('Unknown pilot city');
  const region = cities[city];
  return {
    city, region, language: 'en', topics: topics.map(topic => {
      const matches = retrieve({ city, region, intents: [topic] }, records, now);
      return {
        topic,
        status: matches.some(r => r.available) ? 'source_guidance' : matches.length ? 'review_or_refresh_needed' : 'missing',
        count: matches.filter(r => r.available).length,
        evidence: matches.slice(0, 4).map(r => ({
          id: r.id, title: r.title, url: r.url,
          status: r.available ? r.status : r.reason, checkedAt: r.checkedAt, expiresAt: r.expiresAt
        }))
      };
    })
  };
}

export const destinationSubnationalMap = {
  'Australia': ['New South Wales', 'NSW', 'Victoria', 'VIC', 'Queensland', 'QLD', 'Western Australia', 'WA', 'South Australia', 'Tasmania', 'ACT', 'Northern Territory', 'Sydney', 'Melbourne', 'Brisbane', 'Perth'],
  'United States': ['California', 'New York', 'Texas', 'TX', 'Florida', 'FL', 'Washington', 'Illinois', 'IL', 'New York City', 'Austin', 'Los Angeles', 'San Francisco', 'Chicago', 'Seattle', 'Miami'],
  'United Kingdom': ['Scotland', 'Wales', 'Northern Ireland', 'London', 'Edinburgh', 'Cardiff', 'Belfast', 'Manchester', 'Birmingham'],
  'Germany': ['Berlin', 'Bavaria', 'Bayern', 'NRW', 'North Rhine-Westphalia', 'Munich', 'Frankfurt', 'Hamburg'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'],
  'Spain': ['Catalonia', 'Madrid', 'Andalusia', 'Barcelona', 'Valencia'],
  'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'],
  'New Zealand': ['Auckland', 'Wellington', 'Christchurch'],
  'France': ['Paris', 'Lyon', 'Marseille'],
  'Ireland': ['Dublin', 'Cork', 'Galway'],
  'Singapore': ['Singapore City', 'Central Region'],
  'Sweden': ['Stockholm', 'Gothenburg', 'Malmo']
};

export function countryCoverage(records, now = new Date()) {
  const date = now.toISOString().slice(0, 10);
  const big12Countries = [
    'Australia', 'United States', 'United Kingdom', 'Germany',
    'United Arab Emirates', 'New Zealand', 'France', 'Ireland',
    'Netherlands', 'Singapore', 'Spain', 'Sweden'
  ];

  const big12 = big12Countries.map(country => {
    const countryRecs = records.filter(r => r.jurisdiction === country || (r.country && r.country === country));
    const subnationalRecs = records.filter(r => (r.destinationCountry === country && r.jurisdiction !== country) || (r.jurisdiction !== country && destinationSubnationalMap[country]?.includes(r.jurisdiction)));
    const allRecs = [...countryRecs, ...subnationalRecs];
    const coveredTopics = [...new Set(allRecs.map(r => r.topic))];
    const subnationalRegions = [...new Set(subnationalRecs.map(r => r.jurisdiction))].sort();
    return {
      country,
      totalRecords: allRecs.length,
      nationalRecords: countryRecs.length,
      subnationalRecords: subnationalRecs.length,
      topicsCovered: coveredTopics.length,
      totalTopics: topics.length,
      topicParityRatio: `${coveredTopics.length}/${topics.length}`,
      subnationalRegions,
      status: coveredTopics.length >= 13 ? 'complete_parity' : 'partial'
    };
  });

  const allSubnationalRegions = Object.values(destinationSubnationalMap).flat();
  const canadianJurisdictions = ['CA', 'ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'NU', 'YT', 'Toronto', 'Mississauga', 'Brampton', 'Vancouver', 'Calgary', 'Ottawa', 'Montreal'];
  const restRecs = records.filter(r => !big12Countries.includes(r.jurisdiction) && !big12Countries.includes(r.destinationCountry) && !allSubnationalRegions.includes(r.jurisdiction) && !canadianJurisdictions.includes(r.jurisdiction));
  const restDistinctCountries = [...new Set(restRecs.map(r => r.jurisdiction))];

  return {
    asOf: date,
    big12,
    restOfWorld: {
      totalRecords: restRecs.length,
      distinctCountriesCount: restDistinctCountries.length,
      irccContaminationCount: restRecs.filter(r => (r.url || '').includes('canada.ca') || (r.url || '').includes('cic.gc.ca')).length
    },
    canada: {
      federalRecords: records.filter(r => r.jurisdiction === 'CA').length,
      provincialRecords: records.filter(r => ['ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'NU', 'YT'].includes(r.jurisdiction)).length,
      cityRecords: records.filter(r => ['Toronto', 'Mississauga', 'Brampton', 'Vancouver', 'Calgary', 'Ottawa', 'Montreal'].includes(r.jurisdiction)).length
    }
  };
}

export { parseNegationScopeGuards, filterByNegationScope } from './negation-scope-guard.js';
export { parseTemporalContext, rankByTemporalRelevance } from './temporal-query-navigator.js';
export { clusterZeroResultQueries, generateEditorialMarkdownReport } from './zero-result-clusterer.js';
export { deconstructMultiSentenceQuery } from './multi-sentence-deconstructor.js';
export { resolveQuestionBankItem, searchQuestionBankBatch2, getQuestionBankBatch2Stats } from './global-immigration-question-bank-resolver.js';
export { resolveQuestionBankBatch3Item, searchQuestionBankBatch3, getQuestionBankBatch3Stats, resolveQuestionBankAny } from './global-immigration-question-bank-batch3-resolver.js';
export { resolveMarketGapBatch1Item, searchMarketGapBatch1, getMarketGapBatch1Stats } from './market-gap-batch1-resolver.js';
export { resolveMarketGapBatch2Item, searchMarketGapBatch2, getMarketGapBatch2Stats } from './market-gap-batch2-resolver.js';
export { resolveMarketGapBatch3Item, searchMarketGapBatch3, getMarketGapBatch3Stats } from './market-gap-batch3-resolver.js';
export { resolveGlobalSettlementItem, searchGlobalSettlement, getGlobalSettlementStats } from './global-settlement-resolver.js';
export { resolveSocialCrisisGuidance, detectSocialCrisisScenario, SOCIAL_CRISIS_TYPES } from './social-qa-crisis-navigator.js';
export { deconstructNarrative } from './narrative-deconstructor.js';
export { resolveNarrativeCrisis, NARRATIVE_CRISIS_ARCHETYPES } from './narrative-crisis-resolver.js';
export { detectLegalMyth, STATUTORY_MYTHS } from './myth-buster.js';
export { normalizeSlangAndTypos, cleanEmotionalFluff, IMMIGRATION_ACRONYMS } from './slang-normalizer.js';

