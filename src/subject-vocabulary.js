// What a question can be about, finer than a topic. `ask` recognises the subject in
// a question; it also proposes tags from a record's title and summary unless `about`
// says otherwise. These are routing labels: they state no fact and are never shown.
// `example` is a question the pattern must recognise (test/subject-tags.test.js).
const s = (topic, id, ask, example, about, recordTopics = [topic]) => Object.freeze({topic, id, ask, example, about: about || ask, recordTopics});

export const SUBJECTS = Object.freeze([
  // Employment: pay and hours
  s('employment', 'minimum-wage', /\bminimum wages?\b/i, 'What is the lowest legal pay, the minimum wage?'),
  s('employment', 'unpaid-wages', /\bunpaid (?:wages?|pay|overtime)\b|\bwage theft\b|\b(?:not|never|hasn'?t|haven'?t|won'?t|didn'?t) (?:been )?(?:paid|pay(?:ing)?)\b|\bwithh(?:eld|olding) (?:my )?(?:pay|wages?)\b|\bboss won'?t pay\b/i, 'My boss won\'t pay me', /\bunpaid wages?\b|\bwage theft\b|\bwages? (?:owed|claim)\b|\bemployment standards claim\b|\bunpaid\b/i),
  s('employment', 'wage-deductions', /\bdeduct(?:ions?|ed|ing)?\b|\btake money from my (?:pay|paycheque|paycheck)\b|\btill shortages?\b/i, 'Can they make deductions from my wages?'),
  s('employment', 'overtime', /\bovertime\b/i, 'Is overtime paid after 40 hours?'),
  s('employment', 'vacation-pay', /\bvacation (?:pay|time|days?)\b|\bpaid vacation\b/i, 'When do I get vacation pay?'),
  s('employment', 'statutory-holiday', /\b(?:statutory|public|stat) holidays?\b/i, 'Do I work on a stat holiday?'),
  s('employment', 'hours-and-breaks', /\b(?:meal|rest|coffee|lunch) breaks?\b|\bgive me a break\b|\bhours of work\b|\bcut my hours\b|\breduced? (?:my )?hours\b|\bschedul(?:e|ing)\b|\bshifts?\b/i, 'Do I get a meal break?', /\b(?:meal|rest) (?:breaks?|periods?)\b|\bhours of work\b|\bshift limits?\b|\bscheduling\b|\bhours cut\b|\breduc(?:ed|tion) (?:of )?hours\b/i),
  s('employment', 'sick-leave', /\bsick (?:days?|leave|note)\b|\bfired for being sick\b/i, 'How many sick days are there?'),
  s('employment', 'parental-leave', /\b(?:maternity|parental|pregnancy) (?:leave|benefits?)\b/i, 'Can I take parental leave?'),
  // Employment: ending work
  s('employment', 'termination-notice', /\bfir(?:ed|ing)\b|\blaid off\b|\blay(?:ing)? off\b|\blet go\b|\bterminat(?:ed|ion)\b|\bnotice period\b|\bdismiss(?:ed|al)\b|\bwrongful dismissal\b|\bquit\b|\bresign(?:ed|ation)?\b/i, 'I was let go', /\bterminat(?:ion|ed)\b|\bnotice of termination\b|\bdismissal\b|\blay[- ]?offs?\b|\bjust cause\b|\bresign/i),
  s('employment', 'severance', /\bseverance\b/i, 'Do I get severance?'),
  s('employment', 'record-of-employment', /\brecord of employment\b|\broe\b/i, 'Where is my record of employment?'),
  s('employment', 'employment-insurance', /\bemployment insurance\b|\bei benefits?\b|\bapply for ei\b/i, 'Can I get EI benefits?'),
  // Employment: rights at work
  s('employment', 'workplace-safety', /\bunsafe work|\bworkplace (?:safety|injur)|\bwork refusal\b|\brefuse unsafe\b|\bworkers?'? compensation\b|\bwsib\b|\bworksafe\b|\bhealth and safety\b/i, 'Can I refuse unsafe work?'),
  s('employment', 'workplace-discrimination', /\bdiscriminat\w+ (?:at work|at my job|in hiring|at interview)|\bharass\w+ at work\b|\bworkplace (?:harassment|discrimination)\b|\bhuman rights\b.*\b(?:work|job|employer)\b/i, 'Is this workplace harassment?', /\bdiscriminat|\bhuman rights\b|\bharassment\b/i),
  s('employment', 'worker-classification', /\bindependent contractor\b|\bmisclassif|\bgig (?:work|worker)\b|\buber\b|\bskip the dishes\b|\bdelivery driver\b|\bemployee or (?:a |an )?contractor\b/i, 'Am I an independent contractor?', /\bindependent contractor\b|\bmisclassif|\bgig\b|\bplatform work/i),
  s('employment', 'recruiter-fees', /\brecruit\w+\b.*\bfees?\b|\bfees?\b.*\brecruit\w+\b|\bpay(?:ing)? for (?:a |my )?(?:job offer|lmia)\b|\blmia fee\b|\bbuy(?:ing)? (?:an )?lmia\b/i, 'Can a recruiter charge a fee?', /\brecruit\w* fees?\b|\bfee prohibition\b|\blmia\b.*\bfees?\b/i),
  s('employment', 'cash-work', /\bcash jobs?\b|\bunder the table\b|\bpaid in cash\b|\bundocumented work\b/i, 'Is a cash job legal?', /\bcash (?:jobs?|work)\b|\bunder[- ]the[- ]table\b|\bunauthori[sz]ed work\b/i),
  s('employment', 'job-search', /\bfind(?:ing)? (?:a )?jobs?\b|\bjob search\b|\bcanadian experience\b|\bresume\b|\bjob bank\b/i, 'How do I start a job search?', /\bjob bank\b|\bjob search\b|\bfinding (?:a )?(?:work|jobs?)\b|\bemployment services\b/i),
  s('employment', 'credential-recognition', /\bcredentials?\b|\bforeign (?:degree|diploma|qualification)|\beca\b|\bwes\b|\bregulated profession|\blicensure\b|\bnursing\b|\bnurse\b|\bengineering (?:degree|licen)|\bp\.?eng\b|\bteacher certif/i, 'How are my credentials recognized?'),
  // Employment: status for work
  s('employment', 'work-permit-general', /\bwork permits?\b|\bworking holiday\b|\biec\b/i, 'How do I get a work permit?'),
  s('employment', 'open-work-permit', /\bopen work permits?\b|\bbowp\b|\bsowp\b|\bvulnerable worker\b|\bvwowp\b|\bchange (?:jobs|employers)\b|\btied to (?:one|my) employer\b/i, 'Is this an open work permit?', /\bopen work permits?\b|\bbowp\b|\bsowp\b|\bvulnerable worker/i),
  s('employment', 'study-work', /\bstudy permits?\b|\bstudent work|\boff[- ]campus\b|\bon a student visa\b|\b24 hours\b/i, 'Can I work on a study permit?'),
  s('employment', 'post-graduation-permit', /\bpgwp\b|\bpost[- ]grad(?:uation)?\b|\bopt\b|\bgraduate route\b|\bpost[- ]study\b/i, 'How long is a PGWP?', /\bpgwp\b|\bpost[- ]graduation\b|\bf-?1\b.*\bopt\b|\bopt\b|\bgraduate route\b|\bpost[- ]study\b/i),
  s('employment', 'economic-immigration', /\bexpress entry\b|\bcrs\b|\bfsw\b|\bcec\b|\bcomprehensive ranking\b/i, 'What is Express Entry?'),
  s('employment', 'provincial-nominee', /\bprovincial nominee\b|\bpnp\b|\boinp\b|\bbc pnp\b|\bsinp\b/i, 'How does a PNP work?'),
  s('employment', 'maintained-status', /\b(?:maintained|implied) status\b|\bsection 186\b|\bpermit expir/i, 'What is implied status?', /\bmaintained status\b|\bimplied status\b|\bsection 186\b/i),
  s('employment', 'visitor-status', /\bvisitor (?:record|visa|status)\b|\btourist visa\b|\bextend my (?:stay|visit)\b/i, 'Can I extend my visitor record?'),
  s('employment', 'police-certificate', /\bpolice (?:certificate|clearance|check)s?\b|\bvulnerable sector\b|\bpcc\b/i, 'Do I need a police certificate?'),
  s('employment', 'pr-status', /\bpr card\b|\bresidency obligation\b|\bkeep my pr\b|\b730 days\b|\bprtd\b|\bpermanent resident card\b/i, 'How do I renew my PR card?'),
  s('employment', 'dual-intent', /\bdual intent\b/i, 'Is dual intent allowed?'),
  s('employment', 'right-to-work', /\bright to work\b|\bshare code\b|\bwork authori[sz]ation\b|\bemployment authori[sz]ation\b|\bead\b/i, 'How do I prove my right to work?'),
  s('employment', 'business-immigration', /\bstart[- ]?up (?:visa|permit)\b|\binvestor visa\b|\beb-?5\b|\binnovator founder\b|\bbusiness (?:visa|innovation)\b|\bself[- ]employment (?:visa|residence)\b|\bsubclass 188\b/i, 'Is there a start-up visa?'),
  s('employment', 'settlement-permit', /\bgreen card\b|\bindefinite leave\b|\bilr\b|\bniederlassungserlaubnis\b|\bsettlement permit\b|\bstraight to residence\b|\bskilled migrant\b/i, 'When can I apply for a green card?'),
  s('employment', 'blue-card', /\bblue card\b/i, 'What is a Blue Card?'),
  s('employment', 'chancenkarte', /\bchancenkarte\b|\bopportunity card\b/i, 'What is an opportunity card?'),
  s('employment', 'skilled-work-visa', /\bskilled worker\b|\bh-?1b\b|\bsubclass (?:482|186|189|190)\b|\bcritical skills\b|\bcsep\b|\bemployment pass\b|\bkennismigrant\b|\bgolden visa\b/i, 'Is this a skilled worker visa?'),

  // Housing
  s('housing', 'rent-increase', /\brent (?:increase|hike)\b|\b(?:raise|raising|increase|increasing) (?:my |the )?rent\b|\babove[- ]guideline\b|\bguideline increase\b/i, 'Can they raise the rent?', /\brent increase\b|\bguideline\b|\babove[- ]guideline\b|\bn1\b/i),
  s('housing', 'rent-level', /\baverage rent\b|\bhow much (?:is|does)\b.*\brent\b|\brent cost\b|\baffordab/i, 'What is the average rent?', /\baverage rent\b|\bcmhc\b|\brental market\b|\bvacancy\b/i),
  s('housing', 'deposit', /\bdeposits?\b|\bfirst and last\b|\blast month'?s rent\b|\bmonths? of rent (?:up front|upfront|in advance)\b|\bpay(?:ing)? rent in advance\b/i, 'How much is a rental deposit?', /\bdeposits?\b|\blast month'?s rent\b/i),
  s('housing', 'eviction', /\bevict(?:ed|ion|ing)?\b|\bkick(?:ed|ing)? (?:me |us )?out\b|\bn12\b|\bn13\b|\bn4\b|\bown use\b|\bpersonal use\b|\brenoviction\b/i, 'Can they evict me?'),
  s('housing', 'lockout', /\block(?:ed)? (?:(?:me|us) )?out\b|\blockout\b|\bchang(?:ed|ing) (?:the |my )?locks?\b/i, 'They changed the locks'),
  s('housing', 'repairs', /\brepairs?\b|\bmou?ld\b|\bwon'?t fix\b|\bwill not fix\b|\bmaintenance\b|\bpests?\b|\bbed ?bugs?\b|\bcockroach|\bno (?:heat|hot water)\b|\bheat(?:ing)?\b/i, 'Who pays for repairs?'),
  s('housing', 'lease', /\bleases?\b|\brental agreement\b|\btenancy agreement\b|\bbreak(?:ing)? (?:my |the )?lease\b|\bend(?:ing)? (?:my |the )?tenancy\b/i, 'Do I need a lease?'),
  s('housing', 'sublet', /\bsublet(?:ting)?\b|\bassign(?:ing|ment)? (?:my |the )?(?:lease|tenancy)\b/i, 'Can I sublet?'),
  s('housing', 'landlord-entry', /\b(?:enter|entry|come in|walk in)\b.*\b(?:apartment|unit|home|without notice)\b|\blandlord entry\b/i, 'Can the landlord enter my apartment?', /\blandlord entry\b|\bentry notice\b|\bright of entry\b|\bentering\b.*\bunit\b/i),
  s('housing', 'tenant-screening', /\bcredit (?:history|check)\b.*\b(?:landlord|rent|apartment)\b|\b(?:landlord|rent|apartment)\b.*\bcredit (?:history|check)\b|\brental application\b/i, 'Can a landlord do a credit check?', /\brental application\b|\btenant screening\b|\bcredit history\b/i),
  s('housing', 'pets-in-rental', /\bpets?\b.*\b(?:apartment|rent|landlord|lease|tenant)\b|\b(?:apartment|rent|landlord|lease|tenant)\b.*\bpets?\b/i, 'Can my landlord ban pets?', /\bno[- ]pets?\b|\bpet (?:ban|deposit|clause)\b/i),
  s('housing', 'rental-tribunal', /\blandlord and tenant board\b|\bltb\b|\brtb\b|\bresidential tenancy branch\b|\bt[1-7] (?:form|application)\b/i, 'How do I apply to the LTB?'),
  s('housing', 'rental-scam', /\brental scam\b|\brent(?:al)? (?:listing|fraud)\b.*\bscam\b|\bscam\b.*\b(?:rental|listing|apartment)\b/i, 'Is this a rental scam?', /\brental (?:scam|fraud)\b/i),
  s('housing', 'rental-charges', /\bnebenkosten\b|\butility (?:bills?|charges?)\b.*\b(?:landlord|rent|tenant)\b|\b(?:landlord|rent|tenant)\b.*\butility (?:bills?|charges?)\b|\boperating costs\b/i, 'Can my landlord charge utility bills?'),
  s('housing', 'guarantor', /\bguarantors?\b|\bcaution locative\b|\bco-?signer\b/i, 'Does a landlord need a guarantor?'),
  s('housing', 'energy-standard', /\bepc\b|\bmees\b|\benergy (?:rating|efficiency)\b/i, 'What EPC rating must a rental have?'),
  s('housing', 'shelter', /\bshelter\b|\bhomeless\b|\bnowhere to (?:sleep|stay)\b|\bemergency housing\b/i, 'Where is an emergency shelter?'),

  // Health
  s('health', 'public-coverage', /\bohip\b|\bmsp\b|\bnhs\b|\bmedicare\b|\bhealth (?:card|coverage|insurance)\b|\bwaiting period\b|\bbc services card\b|\bpublic health (?:care|insurance)\b|\bahcip\b|\bgkv\b/i, 'Am I eligible for OHIP?'),
  s('health', 'refugee-coverage', /\bifhp\b|\binterim federal\b|\brefugee claimants?\b.*\b(?:health|coverage|doctor)\b/i, 'What does the IFHP cover?'),
  s('health', 'finding-care', /\bfamily doctors?\b|\bfind (?:a )?(?:doctor|gp|physician)\b|\bwalk[- ]in\b|\bgp\b|\bclinics?\b|\burgent care\b|\bwithout (?:a )?(?:doctor|health card)\b|\bhealth care connect\b/i, 'Where is a walk-in clinic?'),
  s('health', 'mental-health', /\bmental health\b|\btherap(?:y|ist)\b|\bcounsel(?:l)?ing\b|\bdepress|\b988\b/i, 'Who helps with mental health?'),
  s('health', 'prescriptions', /\bprescriptions?\b|\brefills?\b|\bdrug (?:coverage|plan)\b|\bpharmac(?:y|ist)\b|\btrillium drug\b/i, 'Are prescriptions covered?'),
  s('health', 'dental-vision', /\bdental\b|\bdentists?\b|\beye (?:exam|test|care)\b|\boptometr/i, 'Is dental covered?'),
  s('health', 'pregnancy-care', /\bpregnan|\bprenatal\b|\bmidwi|\bbirth (?:cost|care)\b|\bgiving birth\b/i, 'Is prenatal care covered?'),
  s('health', 'vaccines', /\bvaccin|\bimmuni[sz]|\bflu shots?\b/i, 'Where do I get vaccines?'),
  s('health', 'emergency-care', /\bemergency (?:room|department)\b|\bambulance\b|\bhospital bill\b|\b911\b/i, 'Who pays for an ambulance?'),
  s('health', 'immigration-medical', /\bmedical (?:exam|inadmissib)|\bexcessive demand\b|\bpanel physician\b|\bimmigration medical\b/i, 'What is an immigration medical exam?'),

  // Money
  s('money', 'first-tax-return', /\btax returns?\b|\bfil(?:e|ing) (?:my )?taxes\b|\bnotice of assessment\b|\bnoa\b|\bcra my account\b|\bmy account\b.*\bcra\b/i, 'How do I file my taxes?', /\btax returns?\b|\bfil(?:e|ing) (?:a |your )?(?:income )?tax\b|\bnotice of assessment\b|\bcra my account\b/i),
  s('money', 'tax-residency', /\btax resid|\bresident for tax\b|\bdeparture tax\b|\bworldwide income\b|\bforeign income\b|\bfamily (?:is )?(?:still )?abroad\b/i, 'Am I a tax resident?', /\btax resid|\bresidence ties\b|\bresidential ties\b|\bworldwide income\b/i),
  s('money', 'foreign-property', /\bforeign (?:property|assets?)\b|\bt1135\b/i, 'Do I file a T1135?'),
  s('money', 'benefits', /\bchild benefit\b|\bccb\b|\bgst (?:credit|hst)\b|\brc151\b|\btrillium\b|\bcra benefits?\b/i, 'Can I get the child benefit?'),
  s('money', 'bank-account', /\bbank accounts?\b|\bopen(?:ing)? (?:an? )?account\b|\bbanking\b|\bmy bank\b/i, 'How do I open a bank account?'),
  s('money', 'credit-building', /\bcredit (?:score|history|card|file|bureau)\b|\bbuild(?:ing)? credit\b|\bequifax\b|\btransunion\b/i, 'How do I build credit?'),
  s('money', 'cash-declaration', /\bdeclar\w+ (?:cash|money|currency)\b|\b(?:bring|carry)(?:ing)? (?:cash|money)\b|\be677\b|\b10,?000\b|\bcash at the (?:airport|border)\b/i, 'Do I declare cash at the border?', /\bcurrency\b.*\bdeclar|\bdeclar\w*\b.*\bcurrency\b|\be677\b|\bmonetary instruments?\b/i),
  s('money', 'money-transfer', /\bsend(?:ing)? money\b|\bremittances?\b|\bwire transfers?\b|\bmoney transfers?\b|\bfintrac\b|\bfrom overseas\b/i, 'Is a wire transfer reported?'),
  s('money', 'gifts', /\bgifts?\b.*\b(?:money|parents?|family|abroad|tax)\b|\bdeed of gift\b|\b(?:parents?|family) send(?:s)? me\b/i, 'Is a gift from my parents taxed?', /\bgift deed\b|\bdeed of gift\b|\bgifts?\b/i),
  s('money', 'registered-savings', /\brrsp\b|\btfsa\b|\bfhsa\b|\bfirst home savings\b|\bresp\b/i, 'Can I open a TFSA?'),
  s('money', 'moving-expenses', /\bmoving expenses?\b/i, 'Can I deduct moving expenses?'),
  s('money', 'proof-of-funds', /\bproof of funds\b|\bsettlement funds\b|\blico\b/i, 'How much are settlement funds?'),
  s('money', 'student-loans', /\bosap\b|\bstudent loans?\b|\bstudent aid\b/i, 'Can I get OSAP?'),
  s('money', 'income-tax-abroad', /\btax (?:number|id|identification)\b|\bpan card\b|\btfn\b|\btax file number\b|\bsteuer[- ]id\b|\bincome tax\b/i, 'How do I get a tax number?'),

  // Identity and arrival
  s('sin', 'sin-application', /\bsin\b|\bsocial insurance\b|\b900[- ]series\b/i, 'How do I apply for a SIN?'),
  s('sin', 'national-id-abroad', /\bssn\b|\bsocial security\b|\bnational insurance\b|\bnino?\b|\bbsn\b|\bburgerservice|\bpersonnummer\b|\bemirates id\b|\bpps number\b|\bird number\b|\bnie\b/i, 'How do I get a Social Security Number?'),
  s('arrival', 'first-days', /\bfirst (?:week|weeks?|days?|two weeks)\b|\bjust (?:arrived|landed)\b|\bafter i (?:arrive|land)\b|\bchecklist\b/i, 'What do I do in my first week?'),
  s('arrival', 'at-the-border', /\bat the (?:airport|border)\b|\bport of entry\b|\bwhen i land\b|\blanding\b|\bcopr\b|\bsecondary inspection\b|\bflagpol/i, 'What happens at the border?'),
  s('arrival', 'customs-goods', /\bduty[- ]free\b|\bsettlers?'?s? effects\b|\bcustoms\b|\bbsf186\b/i, 'What is duty-free for settlers?'),
  s('arrival', 'bringing-pets', /\b(?:dog|cat|pets?)\b.*\b(?:land|arrive|bring|import|fly)\b|\b(?:bring|import)\b.*\b(?:dog|cat|pets?)\b/i, 'Can I bring my dog?', /\bimport(?:ing)? (?:a )?(?:dog|cat|pets?)\b|\bmoving with pets\b|\bbiosecurity\b/i),
  s('community', 'address-registration', /\banmeldung\b|\bregister my address\b|\bb(?:ü|ue)rgeramt\b|\bempadronamiento\b/i, 'How do I do Anmeldung?'),

  // Driving and transit
  s('driving', 'licence-exchange', /\bexchang\w+ (?:my |a )?(?:\w+ )?(?:driv\w*'?s? )?licen[cs]e\b|\bforeign (?:driv\w*'?s? )?licen[cs]e\b|\b\w+ (?:driver'?s? )?licen[cs]e\b.*\b(?:exchange|in (?:ontario|bc|british columbia|canada))\b|\bdrive\b.*\bwith my\b.*\blicen[cs]e\b/i, 'Can I exchange my foreign licence?', /\blicen[cs]e exchange\b|\bexchang\w+\b.*\blicen[cs]e\b|\breciprocal\b|\bforeign licen[cs]e\b/i),
  s('driving', 'getting-a-licence', /\bg[12]\b|\bfull g\b|\broad test\b|\bknowledge test\b|\bdriv(?:er'?s?|ing) licen[cs]e\b|\bclass [57]\b|\bgraduated licen/i, 'How do I get a G1?'),
  s('driving', 'car-insurance', /\b(?:car|auto|vehicle) insurance\b|\bicbc\b/i, 'How much is car insurance?'),
  s('driving', 'vehicle-import', /\bimport(?:ing)? (?:my |a )?(?:car|vehicle)\b|\briv\b|\bbring my car\b/i, 'Can I import my car?'),
  s('transit', 'fares-and-passes', /\bfares?\b|\bpass(?:es)?\b|\bcompass\b|\bpresto\b|\bfair pass\b|\bmonthly pass\b/i, 'How much is a transit pass?'),
  s('transit', 'trip-planning', /\bplan (?:a |my )?(?:\w+ )?(?:trip|journey|route)\b|\btrip planner\b|\bbus routes?\b|\bbus trip\b|\bschedule\b/i, 'How do I plan a trip?', /\btrip planner\b|\bplan (?:a |your )?(?:trip|journey)\b/i),

  // Family
  s('family', 'spousal-sponsorship', /\bspous(?:e|al)\b.*\b(?:sponsor|canada|come)\b|\bsponsor\b.*\b(?:spouse|wife|husband|partner)\b|\bspousal sponsorship\b/i, 'Can I sponsor my spouse?', /\bspousal sponsorship\b|\bsponsor(?:ing)? (?:a |your )?spouse\b/i),
  s('family', 'parents-and-relatives', /\bsuper visa\b|\bpgp\b|\bparents? and grandparents?\b|\b(?:bring|sponsor)\b.*\b(?:parents?|mother|father|brother|sister|relative)\b/i, 'What is a super visa?', /\bsuper visa\b|\bpgp\b|\bparents? and grandparents?\b|\brelative sponsorship\b/i),
  s('family', 'birth-and-custody', /\bnewborn\b|\bbirth (?:registration|certificate)\b|\bregister the birth\b|\bcustody\b/i, 'How do I register the birth?'),
  s('childcare', 'childcare-cost', /\bdaycare\b|\bchild ?care\b|\bcwelcc\b|\$10 a day\b/i, 'How much is daycare?'),
  s('childcare', 'childcare-subsidy', /\b(?:child ?care|daycare) (?:subsid|fee)|\bfee subsid/i, 'Is there a childcare subsidy?'),
  // School questions are recognised under family; school records are filed under either.
  s('family', 'school-registration', /\bschools?\b|\bkindergarten\b|\btdsb\b|\bvsb\b|\bpdsb\b/i, 'How do I register for school?', null, ['family', 'schooling']),

  // Everyday services
  s('telecom', 'phone-plans', /\bphone (?:plan|contract|company)\b|\bcell ?phone\b|\bwireless\b|\bmobile plan\b|\bunlock\b|\bdevice\b/i, 'How do I pick a phone plan?'),
  s('telecom', 'telecom-complaints', /\bccts\b|\bcomplain\w*\b.*\b(?:internet|phone|provider)\b|\b(?:internet|phone) company\b/i, 'Where do I complain about my phone company?', /\bccts\b|\bcommission for complaints\b/i),
  s('groceries', 'food-banks', /\bfood banks?\b|\bfree food\b|\bdaily bread\b/i, 'Where is a food bank?'),
  s('groceries', 'food-costs', /\bgrocer(?:y|ies)\b|\bfood (?:cost|budget|basket)\b|\bspend on food\b/i, 'What do groceries cost?', /\bfood cost|\bfood basket\b|\bgrocer/i),
  s('community', 'settlement-services', /\bsettlement (?:services?|agenc)|\bnewcomer services?\b|\bfree (?:newcomer|settlement)\b/i, 'Where are newcomer services?', /\bsettlement services?\b|\bnewcomer services?\b/i),
  s('community', 'language-classes', /\bengl(?:ish)? (?:class|course|lesson)|\blinc\b|\besl\b|\blanguage (?:class|training)/i, 'Where are ESL classes?'),
  s('community', 'libraries', /\blibrar(?:y|ies)\b/i, 'How do I get a library card?'),
  s('community', 'fraud-reporting', /\bscams?\b|\bfraud\b|\bphishing\b|\bcafc\b/i, 'How do I report a scam?'),
  s('community', 'citizenship', /\bcitizenship\b|\bnaturali[sz]/i, 'When can I get citizenship?'),
  s('community', 'legal-help', /\blegal (?:aid|help|clinic)\b|\bfree lawyer\b/i, 'Where is free legal help?')
]);

export const SUBJECT_IDS = new Set(SUBJECTS.map(subject => subject.id));

/** Subjects named in a question, optionally limited to the topics already recognised. */
export function questionSubjects(question, topics = null) {
  if (typeof question !== 'string' || !question.trim()) return [];
  return SUBJECTS.filter(subject => (!topics || topics.includes(subject.topic)) && subject.ask.test(question)).map(subject => subject.id);
}

/** Subjects a record's own title and summary appear to be about. A suggestion only. */
export function proposeRecordSubjects(record) {
  const text = `${record?.title || ''} ${record?.summary || ''}`;
  return SUBJECTS.filter(subject => subject.recordTopics.includes(record?.topic) && subject.about.test(text)).map(subject => subject.id);
}
