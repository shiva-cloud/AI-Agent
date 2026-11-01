import {globalDestinations,explicitCountryPatterns,resolveInputCountry,isValidCityForCountry,destinationCities,destinationCountries} from './destinations.js';
import {normalizeEnglishQuestion} from './question-normalization.js';
import {ValidationError} from './api-errors.js';
import { randomUUID } from 'node:crypto';
import { assertEnglishText, assertEnglishRecord } from './language.js';
import { cities, topics } from './knowledge.js';
import { queryTerms, rankLexically } from './search.js';
import {housingQuestionSubjects,recordHousingSubject} from './housing.js';
import {licenceContext, originCountryContext} from './licence-context.js';
import {highRiskTopics} from './evidence-policy.js';
import {telecomContext} from './telecom.js';
import {hasUnsupportedDestination,supportedCitiesIn,supportedRegionsIn,describeLocationClarification,resolveClauseGeography,GEOGRAPHY_VERSION} from './geography.js';
import {queryRequirements,assessAnswerability} from './query-contract.js';
import {resolveQuestionBankItem, searchQuestionBankBatch2, getQuestionBankBatch2Stats} from './global-immigration-question-bank-resolver.js';
import {resolveQuestionBankBatch3Item, searchQuestionBankBatch3, getQuestionBankBatch3Stats, resolveQuestionBankAny} from './global-immigration-question-bank-batch3-resolver.js';
import {resolveMarketGapBatch1Item, searchMarketGapBatch1, getMarketGapBatch1Stats} from './market-gap-batch1-resolver.js';
import {resolveMarketGapBatch2Item, searchMarketGapBatch2, getMarketGapBatch2Stats} from './market-gap-batch2-resolver.js';
import {resolveMarketGapBatch3Item, searchMarketGapBatch3, getMarketGapBatch3Stats} from './market-gap-batch3-resolver.js';
import {resolveGlobalSettlementItem, searchGlobalSettlement, getGlobalSettlementStats} from './global-settlement-resolver.js';
import {resolveSocialCrisisGuidance, detectSocialCrisisScenario} from './social-qa-crisis-navigator.js';
import {detectAndTranslateMultilingualQuery} from './multilingual-layer.js';
import {resolveNarrativeCrisis} from './narrative-crisis-resolver.js';
import {deconstructNarrative} from './narrative-deconstructor.js';
import {detectLegalMyth} from './myth-buster.js';
import {cleanEmotionalFluff, normalizeSlangAndTypos} from './slang-normalizer.js';

const lexicon = {
 sin: /\bsin\b|social insurance|\bsin disclosure\b|\b900[- ]series\b|\bssn\b|\bsocial security(?:\s+number)?\b|\bnin\b|\bnational insurance(?:\s+number)?\b|\btfn\b|\btax file number\b|\bsteuer[- ]id\b|\bemirates id\b|\bird number\b|\bpps number\b|\bppsn\b|\bitin\b|\bform w[- ]?7\b|\bcpf\b|\bdigid\b|\bfin\b|\bpersonnummer\b|\bnie\b|\btie\b|\bcarte vitale\b|\bburgerservicenummer\b|\bbsn\b|\bsin number\b|\bsin card\b|\bnin number\b|\bssn card\b/iu,
 health: /\bohip\b|\bdoctors?\b|\boptometrists?\b|\beye (?:exams?|doctors?|tests?)\b|\btherapists?\b|\bflu shots?\b|\bfamily doctors?\b|\bwalk[- ]in clinics?\b|\bwalk-in\b|\bclinics?\b|\bprescriptions?\b|\brefills?\b|\bhospitals?\b|\bemergency rooms?\b|\burgent care\b|\bemergency departments?\b|\bdentists?\b|\bdental\b|\bnurse practitioners?\b|\bvaccin(?:e|es|ated|ation|ations)\b|\bmsp\b|\bhealth(?:care)?\b|\bmedical\b|\bhealth insurance\b|\bmedical exam\b|\bexcessive demand\b|\binadmissib(?:le|ility)\b|\bphysicians?\b|\bregulation 552\b|\blist [abc]\b|\bnewborn\b|\bbirth registration\b|\b5-in-1\b|\baddress change\b|\bchange of address\b|\bispa\b|\baffidavit\b|\bstatement of conscience\b|\bbc services card\b|\bcarecard\b|\bwaiting period\b|\baca\b|\bhealthcare\.gov\b|\bmarketplace insurance\b|\bnhs\b|\bgp\b|\bgp surgery\b|\bmedicare\b|\bgkv\b|\bgesetzliche krankenversicherung\b|\bkrankenkasse\b|\btechniker krankenversicherung\b|\btk\b|\baok\b|\bdha\b|\bdoh\b|\bessential benefits plan\b|\bacc\b|\bhse\b|\bmedicare levy\b|\bmedicare entitlement statement\b|\bmes\b|\bportabilit(?:y|ies)\b|\bbill 175\b|\breciprocal health(?: care)?\b|\brhca\b|\bameli\b|\bcpam\b|\bmutuelle\b|\bbasisverzekering\b|\bzorgverzekering\b|\bförsäkringskassan\b|\btarjeta sanitaria\b|\bt[si]\b|\bsns\b|\bsistema nacional de salud\b|\bprimary care plan\b|\bhuisarts\b|\bvårdcentral\b|\bhögkostnadsskydd\b|\beigen risico\b|\bzorgtoeslag\b/iu,
 housing: /\blandlords?\b|\bapartments?\b|\bshelters?\b|\bhomeless(?:ness)?\b|\bcondos?\b|\bbasement (?:units?|apartments?|suites?)\b|\broommates?\b|\bsublet(?:s|ting)?\b|\b(?:one|two|three|1|2|3)[- ]bedrooms?\b|\beviction\b|\bevictions\b|\bevicted\b|\bevict\b|\brent(?:als?|ing)?\b|\btenants?\b|\bhousing\b|\btenanc(?:y|ies)\b|\bleases?\b|\b(?:security|damage|pet) deposits?\b|\blocked out\b|\block[ -]?outs?\b|\billegal lock[ -]?outs?\b|\bchanging locks\b|\bchanged locks\b|\bshut off (?:heat|hydro|utilities|power|water)\b|\bcut (?:heat|hydro|utilities|power|water)\b|\bhydro(?: bills?)?\b|\belectricity bills?\b|\bwater bills?\b|\butility bills?\b|\bwithhold(?:ing)? rent\b|\bkeep(?:ing)? deposit\b|\bforfeit(?:ed|ing)? deposit\b|\bguest fees?\b|\broommate fees?\b|\bovernight guests?\b|\bnotice\b|\bn12\b|\bn13\b|\bguideline\b|\brent increase\b|\blandlord entry\b|\brenoviction\b|\bmaintenance\b|\bheat(?:ing)?\b|\bno[- ]pet\b|\bscreening\b|\bbackground checks?\b|\bequifax\b|\btransunion\b|\bsinglekey\b|\bfrontlobby\b|\bnaborly\b|\bguarantors?\b|\bco[- ]signers?\b|\bkey deposits?\b|\bt2\b|\bharass(?:ment)?\b|\bquiet enjoyment\b|\bunlawful entry\b|\bfair housing act\b|\btenancy deposit scheme\b|\btds\b|\bdps\b|\bmydeposits\b|\btenant fees act\b|\bresidential tenancies authority\b|\brta bond\b|\brental bonds online\b|\bmietkaution\b|\bmietpreisbremse\b|\bejari\b|\brera\b|\btenancy tribunal\b|\bassign(?:ment|ing)?\b|\bbreak lease\b|\bterminate early\b|\bn9\b|\bsection 21\b|\bform 6a\b|\bnebenkosten\b|\boperating costs?\b|\brent pressure zones?\b|\brpz\b|\bnotary public\b|\bholding deposits?\b|\bprohibited payments?\b|\bright to rent\b|\blandlord checking service\b|\bstatutory excuse\b|\bhuman rights code\b|\bohrc\b|\bvormiete\b|\brecord (?:phone )?calls?\b|\bone[- ]party consent\b|\bmonetary (?:claim )?limit\b|\bair condition(?:er|ing)?\b|\bwindow unit\b|\bura\b|\bhdb\b|\bbail d'habitation\b|\bloi alur\b|\bvisale\b|\bhuurcommissie\b|\bwws\b|\bhyresgästföreningen\b|\bhyresnämnden\b|\blau\b|\bley de arrendamientos\b|\bfianza\b|\bandrahand\b|\bförstahand\b|\bbruksvärde\b|\bivima\b|\bincasòl\b|\brlto\b|\brrio\b|\brtdrs\b|\bjust cause eviction\b|\brepair and deduct\b|\bcivil code (?:section\s+)?1942\b|\bsubstandard\b|\bmees\b|\bepc rating\b|\bncat\b|\bdecree 43\b|\bdecree no\.?\s*43\b|\bfirb\b|\bforeign investment review board\b|\bhealthy homes\b|\bunderfloor insulation\b|\bheating capacity\b|\bencadrement des loyers\b|état des lieux|etat des lieux|\bcondition reports?\b|\bwws\b|\bhuurcommissie\b|\brent hikes?\b/iu,
 community: /\blibrar(?:y|ies)\b|\besl\b|\blinc\b|\benglish (?:classes|courses|lessons)\b|\bsettlement(?:\s+(?:services?|support|help|programs?|agenc(?:y|ies)))?\b|\bnewcomers?(?:\s+(?:services?|support|help|programs?|agenc(?:y|ies)))?\b|\bcommunity\b|\banti[- ]fraud\b|\bcafc\b|\bscams?\b|\bdeportation\b|\bfraud\b|\bextortion\b|\bphishing\b|\bphoto card\b|\bontario photo card\b|\bnon[- ]driver\b|\bnon[- ]drivers\b|\bftc\b|\baction fraud\b|\bscamwatch\b|\bbsi\b|\banmeldung\b|\bbürgeramt\b|\beinwohnermeldeamt\b|\bwohnungsgeberbestätigung\b|\bsingpass\b|\brundfunkbeitrag\b|\bbeitragsservice\b|\bgez\b|\bupdate (?:my )?address\b|\bcitizenship\b|\bnaturalis(?:e|ation)\b|\bstaatsangehörigkeit\b|\blife in the uk\b|\bcitizenship test\b|\banti[- ]spam\b|\bcasl\b|\bdncr\b|\bdo not call\b|\bcollection agenc(?:y|ies)\b|\bconsumer protection\b|\bconsumer guarantees\b|\bfair trading\b|\bempadronamiento\b|\bpadrón\b|\bfolkbokföring\b|\bcir\b|\bcontrat d'intégration\b|\binburgering\b|\binburgeringsexamen\b|\bswish\b|\bbankid\b|\bgemeente\b|\bskatteverket\b|\bayuntamiento\b|\bpolicía nacional\b|\bpolicia nacional\b|\bn-?400\b|\bphysical presence\b|\baustralian consumer law\b|\bacl\b|\bconsumer guarantee\b|\bwarrant(?:y|ies)\b|\bsworn translations?\b|\bcourt[- ]certified translators?\b|\bbeglaubigte übersetzung\b|\bdata sharing\b|\bprivacy complaint\b|\bgdpr\b|\bprivacy\b|\bdata protection\b|\bcommunity cent(?:er|re)\b|\bidentity theft\b|\bidentity fraud\b|\bsim swap\b/iu,
 arrival: /\blanded\b|\barriv(?:al|e|ed|ing)\b|\bfirst (?:week|weeks?|two weeks|2 weeks|7 days|14 days)\b|\bthis week\b|\bemergency (?:telephone|phone)?\s*number\b|\bdigital device\b|\bdevice search\b|\bphone search\b|\bpasscode\b|\bduty[- ]free\b|\bhousehold (?:items|goods|effects)\b|\bsettlers?(?:'s)? effects\b|\bused personal (?:effects|belongings)\b|\bcustoms duty exemption\b|\bduty[- ]free customs\b|\bcustoms clearance\b|\btransfer of residence\b|\btor\b|\btor01\b|\bform 0350\b|\bform c&e\b|\bmpi\b|\bbiosecurity\b|\bsoft landing\b|\bfirst landing\b|\bflagpoling\b|\bflagpole\b|\blanding interview\b|\buebersiedlungsgut\b|\bübersiedlungsgut\b|\belectronic travel authori[sz]ation\b|\beta\b|\binfringement notice\b|\bundeclared\b|\bimport (?:a )?(?:dog|cat|pet)\b|\bmickleham\b|\bquarantine\b|\brnat\b|\bhousehold belongings\b|\bmoving with pets\b|\bpets?\b|\banimals?\b|\bveterinar(?:y|ian)\b/iu,
 employment: /\bjobs?\b|\bminimum wages?\b|\bwork(?:ers?|ing|ed)?\b|\bmoonlighting\b|\bcash jobs?\b|\bside hustle\b|\bundocumented work\b|\bundocumented worker\b|\bundocumented employment\b|\bunder[- ]the[- ]table\b|\bgig work\b|\bunpaid overtime\b|\bwage theft\b|\bwithholding wages\b|\bnurs(?:e|es|ing)\b|\bcredentials?\b|\bemployment\b|\bexpress entry\b|\bcrs\b|\bfsw\b|\bcec\b|\bpnp\b|\boinp\b|\bwork permit\b|\bpgwp\b|\bbowp\b|\blmia\b|\bnoc\b|\bteer\b|\bsection 186\b|\bmaintained status\b|\breference letters?\b|\bpolice (?:certificate|clearance)s?\b|\bpcc\b|\bbiometrics\b|\bfbi\b|\bnbi\b|\bciid\b|\bprtd\b|\bpr card\b|\bland border\b|\bdual intent\b|\bresidency obligation\b|\bpebc\b|\boct\b|\bpeo\b|\bpharmac(?:y|ist)\b|\bengineers?\b|\bteachers?\b|\bdegree\b|\bdiploma\b|\bmaster(?:'?s)?\b|\bbachelor(?:'?s)?\b|\beca\b|\bwes\b|\bright to work\b|\bwp-ext\b|\bimm 5429\b|\bimm 5988\b|\bonboarding\b|\bvulnerable sector\b|\bvsc\b|\bpolice reference check\b|\b900[- ]series\b|\bh-1b\b|\bead\b|\bgreen card\b|\bform i-9\b|\be-verify\b|\bskilled worker visa\b|\bshare code\b|\bvevo\b|\bsubclass (?:189|190|482|485|491|500|600|820|186)\b|\bgraduate visa\b|\bstudent visa\b|\bgenuine student\b|\bgst\b|\bskillselect\b|\beu blue card\b|\bblaue karte\b|\bchancenkarte\b|\bgolden visa\b|\bgreen visa\b|\bmohre\b|\bsmc\b|\baewv\b|\bcsep\b|\bstamp 4\b|\bgrace period\b|\bopt\b|\bcap[- ]gap\b|\bilr\b|\bindefinite leave to remain\b|\bcontinuous residence\b|\bcondition 8607\b|\bsponsor transfer\b|\bgratuity\b|\bend[- ]of[- ]service\b|\bredundanc(?:y|ies)?\b|\bvariation of conditions\b|\bvoc\b|\b90[- ]day rule\b|\bmisrepresentation\b|\badjustment of status\b|\bi-485\b|\b540[- ]days?\b|\bautomatic extension\b|\bworking holiday\b|\b88[- ]days?\b|\bregional work\b|\bpiece rate\b|\bhorticulture\b|\bnotice periods?\b|\bkündigungsfrist\b|\bprobation(?:ary)?\b|\b1560 hours\b|\b52 weeks\b|\bi-94\b|\bform i-94\b|\badmit until date\b|\bseverance\b|\bseverance pay\b|\btermination pay\b|\bnotice of termination\b|\bsalary threshold\b|\bgrandfather(?:ed)?\b|\b38,?700\b|\bprobearbeit\b|\bopportunity card\b|\bintent to reside\b|\b245\(k\)\b|\bstatus violations?\b|\bunauthorized work\b|\bunauthorized employment\b|\bresumes?\b|\bcvs?\b|\baccount(?:ants?|ing)\b|\bcpa\b|\bweb form\b|\bircc web form\b|\bvisitor record\b|\bvisitor status\b|\btourist visa\b|\bextend (?:status|stay|visitor)\b|\brestoration\b|\brestore status\b|\bo[- ]?1a?\b|\beb[- ]?[123]\b|\bniw\b|\bnational interest waiver\b|\bperm\b|\bform i[- ]?140\b|\bj[- ]?1\b|\b212\(e\)\b|\bds[- ]?3035\b|\bb[- ]?[12]\b|\bbrp\b|\bevisa\b|\bdigital evisa\b|\bisl\b|\bimmigration salary list\b|\bssp\b|\bstatutory sick pay\b|\bsick pay\b|\bsick leave\b|\bmaternity leave\b|\bmaternity pay\b|\bsmp\b|\bmutterschutz\b|\bpaternity leave\b|\bannual leave\b|\bpaid leave\b|\bholidays act\b|\bloe\b|\brecord of employment\b|\broe\b|\bsole trader\b|\bpty ltd\b|\bdelaware c[- ]corp\b|\bincorporat(?:e|ion)\b|\bllc\b|\bs[- ]corp\b|\bc[- ]corp\b|\bfreiberufler\b|\bduale ausbildung\b|\bvocational training\b|\bteaching council\b|\bnzqa\b|\biqa\b|\bsqe\b|\bpres\b|\bnmbi\b|\bapprobation\b|\bfachsprachprüfung\b|\bpartner visa\b|\bsubclass 820\b|\bde facto\b|\bresident return visa\b|\brrv\b|\bsubclass 155\b|\badministrative review tribunal\b|\bart\b|\birp\b|\birish residence permit\b|\boverstay\b|\blong service leave\b|\bat[- ]will\b|\bconsular\b|\b221\(g\)\b|\bsevis\b|\be[- ]2\b|\biloe\b|\bsection 3c\b|\b3c leave\b|\bstudy visa\b|\bstudy permit\b|\bstudent visa\b|\bstudent permit\b|\bf[- ]?1 visa\b|\bf[- ]?1\b|\bj[- ]?1\b|\bm[- ]?1\b|\bi[- ]?20\b|\bcas letter\b|\bgraduate route\b|\bpsw\b|\bpost[- ]study work\b|\bpost[- ]graduation work\b|\bsubclass 500\b|\bsubclass 485\b|\bstamp 2\b|\bstamp 1g\b|\bstudent'?s pass\b|\bvls[- ]ts\b|\bpal\b|\bprovincial attestation letter\b|\boff[- ]campus work\b|\bpr\b|\bpermanent residen(?:ce|cy|t|ts)\b|\bapply for pr\b|\bpr application\b|\bpr status\b|\bpr visa\b|\bpr pathway\b|\bpoints[- ]based (?:system|immigration)\b|\bstraight to residence\b|\bwork to residence\b|\bsmc resident visa\b|\bpts scheme\b|\bbusiness visa\b|\binvestor visa\b|\bstartup visa\b|\bstart[- ]up visa\b|\bentrepreneur visa\b|\binnovator founder\b|\beb[- ]?5\b|\be[- ]?2 investor\b|\bsubclass 188\b|\bactive investor plus\b|\bstep program\b|\bpasseport talent\b|\bfrench tech visa\b|\bcommercial freelance\b|\bfreiberufler visa\b|\bsuv\b|\bwork visa\b|\bimmigrat(?:e|ion)\b|\bvisa options?\b|\bvisa programs?\b|\bimmigration programs?\b|\bcompass\b|\bs[- ]?pass\b|\bone pass\b|\bentrepass\b|\bkennismigrant\b|\bhighly skilled migrant\b|\bzoekjaar\b|\borientation year\b|\barbetstillstånd\b|\bput\b|\bdigital nomad\b|\bteletrabajador\b|\bprofesionales altamente cualificados\b|\bpac\b|\bl[- ]?1\b|\bl[- ]?1a\b|\bl[- ]?1b\b|\bo[- ]?1\b|\bo[- ]?1a\b|\bo[- ]?1b\b|\bscale[- ]up worker\b|\bhpi\b|\bhigh potential individual\b|\b186 ens\b|\bgep\b|\bgeneral employment permit\b|\baewv\b|\baccredited employer\b|\bcarte de résident\b|\b10-year residency\b|\bresidencia de larga duración\b|\benisa\b|\bkollektivavtal\b|\befa\b|\btjänstepension\b|\brvo\b|\berkend referent\b|\brecognized sponsor\b|\blanguage requirements?\b|\bielts\b|\btoefl\b|\bpte\b|\bcelpip\b|\bclb\b|\bnclc\b|\bcefr\b|\btcf\b|\btef\b|\bgoethe\b|\bdele\b|\bsiele\b|\bfbi idhs\b|\bacro\b|\bafp\b|\bführungszeugnis\b|\bpolice clearance\b|\bpolice certificate\b|\bcredential assessment\b|\beca\b|\bwes\b|\bvetassess\b|\banabin\b|\bzas\b|\becctis\b|\bnuffic\b|\buhr\b|\bhomologación\b|\bhomologacion\b|\bpr card landing\b|\blanding day\b|\beconomic reality\b|\bflsa\b|\bindependent contractor\b|\b29 cfr part 795\b|\bsqe[12]?\b|\blawyers?\b|\bsolicitors?\b|\bglobal talent\b|\btech nation\b|\bfee waiver\b|\brehabilitation of offenders\b|\btzbfg\b|\bfixed[- ]term contracts?\b|\bbefristeter arbeitsvertrag\b|\bbridging visa\b|\bbva\b|\bbvb\b|\bsection 501\b|\bcharacter test\b|\bvisa cancellation\b|\bdegree attestation\b|\bmofa\b|\bapprenticeship\b|\bskilled trades\b|\btrade equivalency\b|\bcertificate of qualification\b|\bpolicy guidance\b|\blegislat(?:ion|ive)\b|\bstatutory interpretation\b/iu,
 money: /(?<!food )\bbank(?:ing|s)?\b|\bosap\b|\bstudent loans?\b|\bsend(?:ing)? money\b|\bmoney transfers?\b|\bremittances?\b|\btax(?:es)?\b|\bcra\b|\bcbsa\b|\bcash\b|\bport of entry\b|\bcredit\b|\bbenefits?\b|\bproof of funds?\b|\bpof\b|\bsettlement funds?\b|\bnoa\b|\bnotice of assessment\b|\blico\b|\bkyc\b|\bidentity verification\b|\bbank act\b|\bfintrac\b|\bwire transfers?\b|\bsource of funds\b|\blarge cash\b|\baml\b|\bsecured credit\b|\bcredit file\b|\bpredatory (?:loans?|lending)\b|\be677\b|\bdeclare\b|\bbring(?:ing)? money\b|\bcash declaration\b|\bcarrying cash\b|\brc151\b|\brc66\b|\bgifts?\b|\bdeed of gift\b|\bgift deed\b|\binterac sign[- ]in\b|\bsign[- ]in partner\b|\bcra my account\b|\bcra security code\b|\bfraud alert\b|\bcredit bureau\b|\bequifax\b|\btransunion\b|\bpatriot act\b|\bcip\b|\bfdic\b|\bctr\b|\bfca\b|\b100[- ]point\b|\baustrac\b|\bsuperannuation\b|\bbafin\b|\bsperrkonto\b|\bwps\b|\bwages protection system\b|\bexperian\b|\bfico\b|\bschufa\b|\baecb\b|\bt1135\b|\bforeign property\b|\bpersonal[- ]use property\b|\bfica\b|\bsocial security taxes?\b|\bmedicare taxes?\b|\bfhsa\b|\bfirst home savings account\b|\bdual[- ]status\b|\bfirst[- ]year choice\b|\b6013\(g\)\b|\bcgt\b|\bcapital gains tax\b|\bmoving expenses?\b|\bt1-m\b|\bline 21900\b|\b40 kilometres\b|\b40 km\b|\bfincen(?:\s+form\s+105)?\b|\bcesg\b|\bresp\b|\bkiwisaver\b|\bsubstantial presence\b|\bform 8843\b|\bfatca\b|\bform 8938\b|\bfbar\b|\bform 114\b|\bvat\b|\bcorporate tax\b|\bsmall business relief\b|\busc\b|\buniversal social charge\b|\bhelp loan\b|\bstudent debt\b|\bfirst home guarantee\b|\bfhbg\b|\blisa\b|\blifetime isa\b|\bsdlt\b|\bstamp duty\b|\bfirst[- ]time buyer relief\b|\bsepa\b|\bdirect debit\b|\blastschrift\b|\bhundesteuer\b|\bdog tax\b|\b30% ruling\b|\b30%-regeling\b|\bbeckham law\b|\bsettlement funds\b|\bproof of funds\b|\bmaintenance funds\b|\bshow money\b|\bdroit au compte\b|\bkvk\b|\bforeign income\b|\bcash gifts?\b|\bbringing cash across border\b|\bwire transfer limits?\b|\binternational transfer limits?\b|\bforeign bank accounts?\b|\bfragebogen zur steuerlichen erfassung\b|\bfinanzamt\b|\bbounced (?:rental )?cheque\b|\bcurrent account\b|\bdroit au compte\b|\bdgpip\b|\bdgfip\b|\btax domicile\b|\bf[- ]skatt\b|\bsink\b|\bbeckham law\b|\bmodelo 720\b|\bstatutory residence test\b|\bsrt\b|\btax residency\b|\bsuper fund\b|\bretail fund\b|\bindustry super\b/iu,
 family: /\bchild(?:ren)?\b(?![ -]?care)|\bschools?\b|\bkindergarten\b|\bfamily\b|\bopen access\b|\bmother\b|\bfather\b|\bspous(?:e|al)\b|\bpartner\b|\bsiblings?\b|\bbrother\b|\bsister\b|\bsponsor(?:ship|s|ed|ing)?\b|\bsuper visa\b|\bpgp\b|\bschool enrollment\b|\bschool registration\b|\btdsb\b|\bpdsb\b|\bvsb\b|\bimmunization\b|\bdaughter\b|\bson\b|\bcustody\b|\bimm 5604\b|\bnon[- ]accompanying\b|\bcommon[- ]law\b|\bcohabitation\b|\bconjugal\b|\bplunket\b|\bschool (?:zone|enrolment|enrollment)\b|\bsponsor (?:unmarried )?daughters?\b|\b4,?000\s*(?:aed|dirhams?)\b|\bfamily visa\b|\bparental leave\b|\bföräldrapenning\b|\bforaldrapenning\b|\bsgi\b|\bmutterschutz(?:gesetz)?\b|\bchild custody\b|\bcustody across borders\b|\bhague convention\b|\bcare for elderly parent\b|\belderly parent\b|\bdependent parent\b|\bparental\b/iu,
 childcare: /\bchild[ -]?care\b|\bday[ -]?care\b|\bdaycare subsid(?:y|ies)\b|\bchildcare subsid(?:y|ies)\b|\bnursery schools?\b|\bafter[- ]school care\b|\bbabysitters?\b|\bkita\b|\bkita[- ]gutschein\b|\bjugendamt\b|\bncs\b|\bnational childcare scheme\b/iu,
 telecom: /\bsim\b|\b(?:phone|cell(?:phone)?|mobile|internet) contracts?\b|\bdata plans?\b|\bphone (?:plans?|bills?|providers?|carriers?)\b|(?<!emergency )\bphone numbers?\b|\bphone plans?\b|\bmobile\b|\bcell[ -]?phone\b|\bwireless\b|\binternet\b|\bbroadband\b|\bwi[ -]?fi\b|\btelecom\b|\bccts\b|\bunlocking fee\b|\bunlock(?:ed|ing)?\b|\bwireless code\b|\bcancellation fee\b|\becf\b|\bcooling[- ]off\b|\bconsumer contracts regulations\b|\bccr 2013\b|\bcritical information summary\b|\bcis\b|\bbreitbandmessung\b|\bdesktop app\b|\btdra\b|\bport phone numbers?\b|\bport(?:ing)?\b|\btext[- ]to[- ]switch\b|\bauto[- ]switch\b|\bnetwork coverage\b|\bcoverage differences\b|\bcarrier\b|\bcarriers\b|\bmvno\b|\bmvnos\b/iu,
 groceries: /\bgrocer(?:y|ies|s)?\b|\bfood stores?\b|\bfood(?:\s+(?:basket|costs?|insecurity))?\b/iu,
 driving: /\bdriv(?:e|ing|er|ers)\b|\bwinter (?:tires?|tyres?)\b|\blicen[cs]es?\b|\broad tests?\b|\bg[12]\b|\bg test\b|\bfull g\b|\batio\b|\bstibc\b|\bcertified translations?\b|\bdocument authentication\b|\bauto insurance\b|\bcar insurance\b|\bclaims[- ]free\b|\bdriving extract\b|\bexperience extract\b|\bexperience credit\b|\btüv\b|\bhauptuntersuchung\b|\bnct\b|\bnational car test\b|\bsalik\b|\btoll tag\b|\bliability coverage\b|\bfev\b|\bannex 11\b|\bedt\b|\bessential driver training\b|\bpip\b|\bpersonal injury protection\b|\bproperty damage liability\b|\bpdl\b|\bvehicles?\b|\bcars?\b|\bvehicle registration\b|\bsafety inspection\b/iu,
 transit: /\btransit\b|\bsubways?\b|\bstreetcars?\b|\bpresto\b|\bcompass card\b|\bpublic transport(?:ation)?\b|\bfares?\b|\bbus(?:es)?\b|\btrains?\b|\btrip plann(?:er|ing)\b|\bttc\b|\bmiway\b|\btranslink\b|\bskytrain\b|\bomny\b|\bmetrocard\b|\boyster(?:\s+card)?\b|\bopal(?:\s+card)?\b|\bmyki(?:\s+card)?\b|\bnol(?:\s+card)?\b|\bbvg\b|\btap(?:\s+card)?\b|\bclipper(?:\s+card)?\b|\bbee network\b|\bleap(?:\s+card)?\b|\bat hop\b|\bovpay\b|\bov[- ]chipkaart\b|\bhafilat\b|\bt[- ]mobilitat\b|\bt[- ]usual\b|\bt[- ]casual\b|\bdeutschlandticket\b|\bnavigo\b|\borca(?:\s+card)?\b|\bventra\b|\bcharliecard\b|\bcapmetro\b|\bctrain\b|\bo[- ]train\b|\bopus(?:\s+card)?\b|\blight rail\b|\bcommuter rail\b|\bconcession opal\b/iu
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
  [/\bburgerservice\b/gi, 'burgerservicenummer']
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

export function parse(input) {
  if (!input || typeof input.question !== 'string' || !input.question.trim() || input.question.length > 2000) throw new ValidationError('question must contain 1–2000 characters');
  const inputCountry=resolveInputCountry(input?.country);
  if (input.city && !isValidCityForCountry(input.city, inputCountry)) throw new ValidationError('Choose a supported pilot city');
  if (input.language !== undefined && input.language !== 'en') throw new ValidationError('Only English (en) is supported in this release');
  const multilingual = detectAndTranslateMultilingualQuery(input.question);
  const effectiveQuestion = multilingual ? multilingual.canonicalStatutoryQuery : input.question;
  if (!multilingual) {
    assertEnglishText(input.question, 'Question');
  }
  const hasPromptInjection = INJECTION_PATTERNS.some(pat => pat.test(effectiveQuestion));
  const sanitizedQuestion=sanitizePromptInjection(effectiveQuestion);
  const q=normalizeEnglishQuestion(sanitizedQuestion || effectiveQuestion), language='en';
  const queryForMatching=normalizeNewcomerTypos(q);
  const relocation=resolveClauseGeography(q);
  const found=supportedCitiesIn(q);
  const city=(relocation?.isDestSupported && relocation.destCity) ? relocation.destCity : (found.length===1?found[0]:input.city || null);
  let region=city?cities[city]:(relocation?.isDestSupported && relocation.destRegion ? relocation.destRegion : null);
  const explicitRegions=supportedRegionsIn(q);
  if (!region && explicitRegions.length===1) region=explicitRegions[0];
  const intents=Object.entries(lexicon).filter(([,r])=>r.test(queryForMatching)).map(([t])=>t);
  // Internet access at a library is a community facility question. Separate
  // commercial service requests still retain their telecom intent.
  if(intents.includes('community') && /\blibrar(?:y|ies)\b/i.test(q) && /\binternet\b|\bwi[ -]?fi\b/i.test(q)
    && !/\b(?:plans?|providers?|contracts?|rights?|complaints?|ccts|broadband|mobile|sim|home)\b/i.test(q)) {
    const index=intents.indexOf('telecom');if(index!==-1)intents.splice(index,1);
  }
  // Inquiries about opening a bank account or signing a lease without a job are
  // financial or housing eligibility questions, not employment search asks.
  if((intents.includes('money') || intents.includes('housing')) && intents.includes('employment')
    && /\b(?:no job|without (?:a )?job|unemployed|unemployment|jobless)\b/i.test(q)
    && !/\b(?:job search|(?:find|finding|seek|seeking|look(?:ing)? for|search(?:ing)? for) (?:a )?(?:jobs?|work|employment)|resume|work permit|lmia|noc|teer|credential|experience)\b/i.test(q)) {
    const empIdx=intents.indexOf('employment');
    if(empIdx!==-1) intents.splice(empIdx,1);
  }
  // Credit building, fraud alerts, or banking inquiries are financial money questions,
  // not housing tenancy questions, unless housing terms are explicitly present.
  if(intents.includes('housing') && intents.includes('money')
    && /\b(?:fraud alert|credit score|secured credit|credit file|credit bureau|credit card)\b/i.test(q)
    && !/\b(?:landlords?|tenants?|leases?|rent(?:als?|ing)?|deposits?|eviction|screening|singlekey|naborly|frontlobby)\b/i.test(q)) {
    const hIdx=intents.indexOf('housing');
    if(hIdx!==-1) intents.splice(hIdx,1);
  }
  // Consumer financing inquiries are financial money questions, not telecom,
  // unless telecom services (mobile, internet, broadband, phone, SIM) are explicitly mentioned.
  if(intents.includes('telecom') && /\bconsumer financing\b|\bfinancing contract\b/i.test(q)
    && !/\b(?:broadband|mobile|sim|phone|internet|carrier|ccts)\b/i.test(q)) {
    const tIdx = intents.indexOf('telecom');
    if(tIdx !== -1) intents.splice(tIdx, 1);
    if(!intents.includes('money')) intents.push('money');
  }
  // Professional licences (nursing, engineering, teaching, medical) are employment questions, not vehicle driving.
  if(intents.includes('driving') && /\b(?:professional|occupational|business|trade|teaching|nursing|medical)\s+licen[cs]es?\b/i.test(q)) {
    const dIdx=intents.indexOf('driving');
    if(dIdx!==-1) intents.splice(dIdx,1);
    if(!intents.includes('employment')) intents.push('employment');
  }
  // Certified translations for legal documents or applications are general immigration/employment documentation, not vehicle driving.
  if(intents.includes('driving') && /\bcertified translations?\b/i.test(q) && !/\b(?:licen[cs]e|driv|road test|car|vehicle)\b/i.test(q)) {
    const dIdx=intents.indexOf('driving');
    if(dIdx!==-1) intents.splice(dIdx,1);
    if(!intents.includes('employment')) intents.push('employment');
  }
  // Airport transit, transit passengers or transit visas are international border/arrival, not municipal public bus/train transit.
  if(intents.includes('transit') && /\b(?:airport|flight|plane|terminal|transit visas?|direct airside|layover|transiting|in transit|transit passengers?|transit without visa|twov)\b/i.test(q)
    && !/\b(?:bus|subway|train|presto|fare|translink|ttc|metro|station)\b/i.test(q)) {
    const tIdx=intents.indexOf('transit');
    if(tIdx!==-1) intents.splice(tIdx,1);
    if(!intents.includes('arrival')) intents.push('arrival');
  }
  // Immigration removal orders, due process, or asylum/refugee country condition reports are community/immigration questions, not housing tenancy.
  if(intents.includes('housing') && /\b(?:removal orders?|deportation|asylum|refugee|admissibility|country[- ]condition reports?)\b/i.test(q)) {
    const hIdx=intents.indexOf('housing');
    if(hIdx!==-1) intents.splice(hIdx,1);
    if(!intents.includes('community')) intents.push('community');
  }
  // Border screening accuracy is border arrival, not rental housing screening.
  if(intents.includes('housing') && /\bborder[- ]screening\b/i.test(q)) {
    const hIdx=intents.indexOf('housing');
    if(hIdx!==-1) intents.splice(hIdx,1);
    if(!intents.includes('arrival')) intents.push('arrival');
  }
  // Foreign rental property taxation is financial taxation (money), not tenancy eviction/housing.
  if(intents.includes('housing') && /\b(?:taxation|taxes?|cra|t1135|foreign income)\b/i.test(q)) {
    const hIdx=intents.indexOf('housing');
    if(hIdx!==-1) intents.splice(hIdx,1);
    if(!intents.includes('money')) intents.push('money');
  }
  const licence=intents.includes('driving')?licenceContext(q):{licenceCountry:null,licenceCountryAmbiguous:false,destinationText:q};
  const inputGlobal=inputCountry&&inputCountry!=='CA'?inputCountry:null;
  const rawGlobals=globalDestinations.filter(([, pattern]) => pattern.test(licence.destinationText)).map(([c]) => c);
  const isCanadianCity = Boolean(city && Object.hasOwn(cities, city));
  const explicitCanadianPlace = Boolean(isCanadianCity || region || explicitRegions.length > 0 || /\b(?:canada|(?<!\b(?:without|no|zero|lack of|prior|previous|past)\s+)canadian|toronto|mississauga|brampton|vancouver|ontario|british columbia)\b/iu.test(q));
  const canadianTerms = /\b(?:canada|(?<!\b(?:without|no|zero|lack of|prior|previous|past)\s+)canadian|toronto|mississauga|brampton|vancouver|ontario|british columbia|bc|ohip|msp|sin|social insurance number|g[12]|n12|n13|cra|fintrac|cbsa|lmia|pgwp|bowp|oinp|pnp|ttc|miway|translink)\b/iu;
  const hasCanadianGeo = inputGlobal ? explicitCanadianPlace : Boolean(inputCountry==='CA' || explicitCanadianPlace || canadianTerms.test(q));
  const isDirectGlobal = Boolean((inputGlobal || rawGlobals.length === 1) && !hasCanadianGeo);
  const origin = isDirectGlobal ? {originCountry:null, destinationText:licence.destinationText} : originCountryContext(licence.destinationText);
  let destText=origin.destinationText || licence.destinationText;
  if (relocation?.isDestSupported && relocation.maskPattern) {
    destText = destText.replace(relocation.maskPattern, ' '.repeat(10));
  }

  const textGlobals = isDirectGlobal ? rawGlobals : globalDestinations.filter(([, pattern]) => pattern.test(destText)).map(([c]) => c);
  const detectedGlobal = inputGlobal || (textGlobals.length === 1 ? textGlobals[0] : null);
  // A country already identified as where the person comes from ("lived in California on an H-1B")
  // is history, not a second destination competing with the Canadian place in the question.
  const onlyOriginCountry = Boolean(origin.originCountry && textGlobals.length && textGlobals.every(c=>c===origin.originCountry));
  const explicitForeignMatches = explicitCountryPatterns.filter(([, pattern]) => pattern.test(destText)).map(([c]) => c);
  const explicitForeignConflict = Boolean(inputGlobal && explicitForeignMatches.some(c => c !== inputGlobal));
  const hasGlobalConflict = inputGlobal
    ? Boolean(explicitCanadianPlace || explicitForeignConflict)
    : (Boolean(detectedGlobal && hasCanadianGeo && !onlyOriginCountry) || textGlobals.length > 1);
  const isGlobalDestination = Boolean(detectedGlobal && !hasCanadianGeo && !hasGlobalConflict);
  const foreignCountry = Boolean(!hasCanadianGeo && !detectedGlobal && origin.originCountry);
  const isSupportedForeign = foreignCountry && (destinationCountries.includes(origin.originCountry) || origin.originCountry === 'Canada' || origin.originCountry === 'CA');
  const country = inputGlobal ? inputGlobal : (isGlobalDestination ? detectedGlobal : (foreignCountry && isSupportedForeign ? origin.originCountry : 'CA'));

  let resolvedCity = city;
  if (!resolvedCity && country && country !== 'CA') {
    const candidateCities = destinationCities[country] || [];
    const matchedCity = candidateCities.find(c => new RegExp(`\\b${c}\\b`, 'i').test(q));
    if (matchedCity) resolvedCity = matchedCity;
  }

  const unsupported=hasUnsupportedDestination(destText, isGlobalDestination) || (foreignCountry && !isSupportedForeign);
  const ambiguous=(found.length>1) || explicitRegions.length>1 || (region && explicitRegions.some(r=>r!==region)) || (!foreignCountry && unsupported) || (foreignCountry && !isSupportedForeign) || hasGlobalConflict;
  const resolvedLicenceCountry = licence.licenceCountry || origin.originCountry || (relocation?.originCountry || null);
  const missingSlots=[];
  if((ambiguous && !foreignCountry) || (foreignCountry && !isSupportedForeign)) missingSlots.push('location');
  const isStrictlyLocalTopic = intents.some(t => ['housing', 'transit', 'childcare'].includes(t))
    || (intents.includes('health') && !/\b(?:inadmissib|excessive demand|medical exam|medical clearance)\b/i.test(q))
    || (intents.includes('driving') && !/\b(?:riv|import|transport canada|customs|safety inspection)\b/i.test(q))
    || (intents.includes('employment') && /\b(?:minimum wages?|overtime pay|statutory holiday pay|vacation pay|severance pay)\b/i.test(q));

  const isConceptualOrFederal = isConceptualOrFederalQuestion(q);

  if(!isGlobalDestination && !foreignCountry && !resolvedCity && !region && isStrictlyLocalTopic && !isConceptualOrFederal) missingSlots.push('location');
  if(intents.includes('driving') && (resolvedCity || region) && !resolvedLicenceCountry) missingSlots.push('licence_country');
  const parsedResult = {intents,city:resolvedCity,region,country,language,licenceCountry:resolvedLicenceCountry,licenceCountryAmbiguous:licence.licenceCountryAmbiguous,risk:intents.some(t=>highRiskTopics.has(t))?'high':'low',missingSlots:[...new Set(missingSlots)],ambiguous,queryTerms:queryTerms(q),housingSubjects:housingQuestionSubjects(q),telecom:telecomContext(q),...queryRequirements(q,intents),thresholds:extractStatutoryThresholds(q),parserVersion:'english-rules-0.12',geographyVersion:GEOGRAPHY_VERSION,relocation:relocation?{origin:relocation.originName,originCountry:relocation.originCountry,destination:relocation.destName,destCountry:relocation.destCountry}:null};
  return parsedResult;
}
// "approved" alone does not say who approved it. Only the editorial review
// paths (store.review, ingestion decisions) stamp reviewMethod; records that
// arrive approved from seed files or bulk scripts are labelled as such.
function reviewMethodOf(r) {
  if(r.status!=='approved') return 'none';
  return r.reviewMethod==='editorial_review' || r.reviewMethod==='source_verified' ? r.reviewMethod : 'bulk_approval';
}
export function retrieve(parsed, records, now=new Date(),searchIndex) {
  if(!parsed || parsed.ambiguous || parsed.missingSlots?.includes('location')) return [];
  const safeRecords = Array.isArray(records) ? records : [];
  const safeNow = (now instanceof Date && !isNaN(now.getTime())) ? now : new Date();
  const date=safeNow.toISOString().slice(0,10);
  const isGlobal = parsed.country && parsed.country !== 'CA';
  // Global destinations scope strictly to the target country (and licence country if applicable),
  // while Canadian pilot questions scope to CA, province, and city.
  const scope = isGlobal
    ? new Set([parsed.country, parsed.city, parsed.licenceCountry].filter(Boolean))
    : new Set(['CA', parsed.region, parsed.city, parsed.licenceCountry].filter(Boolean));
  const scoped=safeRecords.filter(r=>{
    // Reject out-of-scope records before expensive English/policy validation.
    // Every record that can reach ranking still passes the full validator.
    if(!r || !scope.has(r.jurisdiction) || !parsed.intents.includes(r.topic))return false;
    try {assertEnglishRecord(r);} catch {return false;}
    return (r.topic!=='housing' || parsed.housingSubjects===undefined || parsed.housingSubjects.length===0 || !recordHousingSubject(r) || parsed.housingSubjects.includes(recordHousingSubject(r)))
      && (r.topic!=='telecom' || parsed.telecom===undefined || parsed.telecom.subjects.includes(r.telecomSubject));
  });
  return (searchIndex?searchIndex.rank(scoped,parsed.queryTerms):rankLexically(scoped,parsed.queryTerms)).map(r=>({...r,
    available:['research_seed','approved'].includes(r.status) && r.checkedAt<=date && r.expiresAt>=date && (!r.effectiveFrom || r.effectiveFrom<=date) && (!r.effectiveTo || date<r.effectiveTo),
    reason:r.status==='pending'?'awaiting_human_review':r.status==='rejected'?'rejected':r.checkedAt>date?'future_check_date':r.expiresAt<date?'stale':(r.effectiveFrom && r.effectiveFrom>date)||(r.effectiveTo && date>=r.effectiveTo)?'outside_effective_dates':'source_guidance',
    scopeScore:r.jurisdiction===parsed.city?3:r.jurisdiction===parsed.region?2:(isGlobal&&r.jurisdiction===parsed.country)?2:1,
    score:r.lexicalScore+(r.jurisdiction===parsed.city?0.6:r.jurisdiction===parsed.region?0.3:(isGlobal&&r.jurisdiction===parsed.country)?0.4:0),
    retrievalVersion:r.retrievalVersion||'lexical-bm25-0.1'
  })).sort((a,b)=>b.score-a.score || b.scopeScore-a.scopeScore || a.id.localeCompare(b.id));
}
export function answer(input,records,now=new Date(),searchIndex,options={}) {
  const safeOptions = (options && typeof options === 'object') ? options : {};
  const safeRecords = Array.isArray(records) ? records : [];
  const safeNow = (now instanceof Date && !isNaN(now.getTime())) ? now : new Date();
  const started=performance.now();
  const qbMatch = !input?.gmsId && !input?.marketGapId ? resolveQuestionBankAny(input?.questionBankId || input?.question) : null;
  const mkt1Match = !input?.gmsId && !input?.questionBankId ? resolveMarketGapBatch1Item(input?.marketGapId || input?.question) : null;
  const mkt2Match = !input?.gmsId && !input?.questionBankId ? resolveMarketGapBatch2Item(input?.marketGapId || input?.question) : null;
  const mkt3Match = !input?.gmsId && !input?.questionBankId ? resolveMarketGapBatch3Item(input?.marketGapId || input?.question) : null;
  const gmsMatch = !input?.marketGapId && !input?.questionBankId ? resolveGlobalSettlementItem(input?.gmsId || input?.question) : null;
  const directResolved = Boolean(qbMatch || mkt1Match || mkt2Match || mkt3Match || gmsMatch);
  const narrativeDecon = deconstructNarrative(input?.question);
  const narrativeCrisis = !directResolved ? resolveNarrativeCrisis(input?.question, input) : null;
  const directHandled = directResolved;
  const parsed = directResolved
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
  const result={traceId:randomUUID(),parsed,status:'unavailable',claims:[],sources:[],gaps:[],clarification:null,
    notice:'Limited research pilot. These are relevant source summaries, not a complete answer to every detail of your question.'};
  // Narrative matches are research hints, never substitutes for reviewed evidence.
  if (narrativeCrisis) result.gaps.push({topic:narrativeCrisis.topic,reason:'awaiting_human_review'});
  if(Array.isArray(safeOptions.liveAlerts)){
    result.liveAlerts=safeOptions.liveAlerts;
  } else if(safeOptions.realtimeStore?.findActiveAlerts){
    result.liveAlerts=safeOptions.realtimeStore.findActiveAlerts({
      country:parsed.country,
      region:parsed.region,
      city:parsed.city,
      topic:parsed.intents[0]
    });
  }
  if (detectAndTranslateMultilingualQuery(input?.question)?.requiresConfirmation) {
    result.status='clarification';
    result.clarification='Please confirm your question in English, including the destination, dates and immigration status. Automatic translation could change these details.';
    result.gaps.push({topic:null,reason:'translation_confirmation_required'});
  } else if(parsed.missingSlots.includes('location')) {
    const place=describeLocationClarification(normalizeEnglishQuestion(input.question),parsed);
    result.status='clarification'; result.clarification=place.message; result.placeClarification=place;
    result.gaps.push({topic:null,reason:'missing_or_unsupported_geography'});
  } else {
    const hasInjection = INJECTION_PATTERNS.some(pat => pat.test(input?.question || ''));
    const isConceptual = !hasInjection && isConceptualOrFederalQuestion(normalizeEnglishQuestion(input?.question));
    const searchIntents = directHandled ? [] : (parsed.intents.length ? parsed.intents : (isConceptual ? ['employment', 'community', 'arrival', 'housing', 'money'] : []));
    const candidates = searchIntents.length ? retrieve({...parsed, intents: searchIntents},safeRecords,safeNow,searchIndex) : [];
    result.retrieval={version:candidates[0]?.retrievalVersion||'lexical-bm25-0.1',candidates:candidates.map(r=>({id:r.id,score:r.score,matchedTerms:r.matchedTerms,available:r.available,reason:r.reason}))};
    for(const topic of searchIntents) {
      // Broad topic matches must not masquerade as answers to unrelated legal subquestions.
      const relevant=candidates.filter(r=>{
        if(r.topic !== topic) return false;
        if(parsed.intents.length) return true;
        const substantive = (r.matchedTerms || []).filter(t => t !== (parsed.city || '').toLowerCase() && t !== (parsed.country || '').toLowerCase());
        return substantive.length > 0;
      });
      const usable=relevant.filter(r=>r.available);
      const conflicts=new Set(usable.filter(r=>usable.some(s=>s.id!==r.id && s.topic===r.topic && s.jurisdiction===r.jurisdiction && s.claimKey && s.claimKey===r.claimKey && s.summary!==r.summary)).map(r=>r.id));
      if(conflicts.size) result.gaps.push({topic,reason:'conflicting_evidence'});
      else for(const r of usable.slice(0,2)) {
        // P1-5: an ordered checklist is provided only when the question asks
        // for one AND the evidence itself declares ordered steps. Support is
        // never inferred from keywords alone.
        const kind=parsed.requestedOutput==='checklist' && Array.isArray(r.steps) && r.steps.length ? 'checklist' : 'source_guidance';
        result.claims.push({id:`claim-${result.claims.length+1}`,text:r.summary,evidenceId:r.id,status:r.status,kind,topic:r.topic,...(kind==='checklist'?{steps:r.steps}:{})});
      }
      const selectedIds=new Set(result.claims.map(c=>c.evidenceId));
      const cited=[...new Map([...relevant.filter(r=>selectedIds.has(r.id)),...relevant.slice(0,3)].map(r=>[r.id,r])).values()];
      for(const r of cited) result.sources.push({id:r.id,title:r.title,url:r.url,quote:r.quote,checkedAt:r.checkedAt,expiresAt:r.expiresAt,status:r.available?r.status:r.reason,reviewMethod:r.available?reviewMethodOf(r):'none',jurisdiction:r.jurisdiction,snapshotId:r.snapshotId ?? null});
      if(!usable.length) result.gaps.push({topic,reason:relevant[0]?.reason || 'missing_evidence'});
      if(topic==='telecom' && parsed.telecom.priceRequest)result.gaps.push({topic,reason:'missing_live_price_data'});
      if(topic==='housing' && usable.length) for(const subject of parsed.housingSubjects) {
        if(!result.claims.some(c=>relevant.some(r=>r.id===c.evidenceId && recordHousingSubject(r)===subject))) {
          result.gaps.push({topic,subject,reason:relevant.find(r=>recordHousingSubject(r)===subject)?.reason || 'missing_evidence'});
        }
      }
    }
    if(!parsed.intents.length && !result.claims.length) result.gaps.push({topic:null,reason:'unrecognized_intent'});
    // P1-5: a facet whose demand the evidence explicitly declares (ordered
    // steps for the facet's topic, or for any topic when the question spans
    // several) no longer reports a gap.
    const checklistTopics=new Set(result.claims.filter(c=>c.kind==='checklist').map(c=>c.topic));
    for(const facet of parsed.facets){
      if(facet.id==='ordered_checklist' && (facet.topic===null ? checklistTopics.size>0 : checklistTopics.has(facet.topic)))continue;
      result.gaps.push({topic:facet.topic,subject:facet.id,reason:facet.reason});
    }
    if(parsed.missingSlots.includes('licence_country')) result.clarification=parsed.licenceCountryAmbiguous?'You mentioned more than one licence country. Which current licence do you want to ask about?':'Which country issued your current driving licence?';
    result.status=result.claims.length?(result.gaps.length?'partial':'guidance'):'unavailable';
  }
  const crisisMatch = !narrativeCrisis ? resolveSocialCrisisGuidance(input?.question, parsed) : null;
  const leads = [
    ['questionBankMatch', qbMatch], ['marketGapMatch', mkt1Match || mkt2Match || mkt3Match],
    ['globalSettlementMatch', gmsMatch], ['crisisMatch', crisisMatch]
  ];
  for (const [key, match] of leads) if (match) {
    // Internal diagnostic metadata is intentionally excluded from public JSON.
    Object.defineProperty(result, key, {value: match, enumerable: false});
    result.gaps.push({topic: match.topic || null, reason: 'awaiting_human_review'});
  }
  if (leads.some(([,match])=>match) && result.status !== 'clarification')
    result.status = result.claims.length ? 'partial' : 'unavailable';
  result.message=result.claims.length?result.message||'Here is starting guidance from the available sources.':'A verified answer to this question is not yet available.';
  const multilingual = detectAndTranslateMultilingualQuery(input?.question);
  if (multilingual) result.multilingual = multilingual;
  result.answerability=assessAnswerability(parsed,result.claims,result.gaps);
  // Why this status: citation mix plus honest unverified counts, so the UI can
  // explain a "partial"/"unavailable" verdict without hiding behind a chip.
  const approvedClaims=result.claims.filter(c=>c.status==='approved').length;
  const editorReviewed=new Set(result.sources.filter(s=>s.reviewMethod==='editorial_review').map(s=>s.id));
  const editorReviewedClaims=result.claims.filter(c=>editorReviewed.has(c.evidenceId)).length;
  const sourceVerified=new Set(result.sources.filter(s=>s.reviewMethod==='source_verified').map(s=>s.id));
  const sourceVerifiedClaims=result.claims.filter(c=>sourceVerified.has(c.evidenceId)).length;
  result.verification={
    claimsTotal:result.claims.length,
    approvedClaims,
    editorReviewedClaims,
    sourceVerifiedClaims,
    bulkApprovedClaims:approvedClaims-editorReviewedClaims-sourceVerifiedClaims,
    seedClaims:result.claims.length-approvedClaims,
    reviewPendingTopics:result.gaps.filter(g=>g.reason==='awaiting_human_review').length,
    unverifiedTopics:result.gaps.length
  };
  result.latencyMs=Number((performance.now()-started).toFixed(2));
  return result;
}
export function coverage(records,now=new Date()) {
 return Object.keys(cities).map(city=>({city,region:cities[city],
   // This pilot publishes evidence summaries in English only; say so per city.
   language:'en',
   topics:topics.map(topic=>{
   const matches=retrieve({city,region:cities[city],intents:[topic]},records,now);
   return {topic,status:matches.some(r=>r.available)?'source_guidance':matches.length?'review_or_refresh_needed':'missing',count:matches.filter(r=>r.available).length};
 })}));
}
// One city's sheet with the actual records behind its status, so "why does
// this tile say review needed?" is answerable publicly, not just internally.
export function coverageDetail(city,records,now=new Date()) {
  if(!Object.hasOwn(cities,city)) throw new ValidationError('Unknown pilot city');
  const region=cities[city];
  return {city,region,language:'en',topics:topics.map(topic=>{
    const matches=retrieve({city,region,intents:[topic]},records,now);
    return {topic,
      status:matches.some(r=>r.available)?'source_guidance':matches.length?'review_or_refresh_needed':'missing',
      count:matches.filter(r=>r.available).length,
      evidence:matches.slice(0,4).map(r=>({id:r.id,title:r.title,url:r.url,
        status:r.available?r.status:r.reason,checkedAt:r.checkedAt,expiresAt:r.expiresAt}))};
  })};
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

