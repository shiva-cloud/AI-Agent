import fs from 'node:fs';
import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';

const rawInput = `Super Visa with a prior overstay caused by IRCC’s own system error. DIY or lawyer?
BOWP Refused Due to R10 Completeness Check Despite Receiving invite – Need Advice on Reconsideration, Restoration & Work Authorization
Got my IELTS results! First attempt. Here’s my experience and some advice
Refused Bridging Open Work Permit (BOWP) - What else can I do to stay in Canada?
Should I apply for an F-1 student visa while my F-4 immigrant visa case is pending?
Question
Does delay in providing urgent processing documentation evidence delay whole citizenship application processing?
Foreign Job Experience Verification
Is an overall band score of 7.0 enough for university admissions?
How does Outland family sponsorship work if you don’t live in the country you’re a citizen of?
COPR details visble. Is PR approved?
Post ita help
Should i apply BOWP?
Short duration of relationship - will IRCC scrutinize it?
Promotion - foreign experience Express entry
Need advice regarding my move
Hey Guys, Help me please
Proof of funds doubts
After some really helpful feedback from this wonderful community, I have improved my writing a lot. Here is a sample, what band do you think this deserves? I kept the few errors to show my actual skill level.
Confusion about sponsorship timeline
Overlapping Student & Part-time Job in Personal History? Help!
Need advice on work permit extension after receiving Alberta PNP nomination – Non-Express Entry
CEC - Need help
Express Entry Advice Needed – Foreign Work Experience in Family Business (Dubai), NOC Selection & French-Language Pathway
Eligibility and Background check completed
IELTS Band 8.0 – My Experience with Practice Tests vs. the Real Exam
What are my PR options as an outland candidate ?
Why I am not getting the 100 CRS points?
Flying Out of Canada with an Expired PR Card – Any Issues at the Airport?
November 3, 2026 IRCC Job Offer Changes – Where and What Do We Update Our Express Entry Profile?
IS THIS JOB OFFER A SCAM? NEED HELP ASAP.
Title: Husband Has Pending Asylum Case in the U.S. – I Am a U.S. Citizen and We Are Married. Looking for Advice on Marriage-Based Immigration Options.
Completing 1yr foreign experience at dad’s business What documents do I need?
How can I improve my IELTS Speaking from 5.5 to 6.5 in one month?
How to improve IELTS Writing and Speaking from 6–6.5 to 8+?
Family Sponsorship Processing Time – Spouse and Dependent Children
Family Sponsorship Processing Time – Spouse and Dependent Children
Family Sponsorship Processing Time – Spouse and Dependent Children
CEC How does the CEC Cutoff work?
Need advice
AIP and CEC at the same time?
Updates related to processing time related to study permit from india
completing 1 year foreign experience at dads business. what documents do i need?
CSQ spouse sponsorship inland timeline 2024
Super Visa with dual intent
Realistic Processing Time for C16 LMIA Exempt Work Permit from Outside Canada (Pakistan)
What is the TRV Visit Visa Timeline for Indians applying from UAE (Jul/Aug/Sep 2026)?
Ielts exam in a week...Scoring in mock tests between 6-6.5,deaf person haven't gone any practice in listening.I am cooked
Can I open a Canadian bank account as a tourist?
Can mental health get in the way of citizenship by descent?
Outland SOWP Reapplication After Refusal – Processing Time and Timeline Experiences
SOWP along with kids TRV Processing time from India
Has anyone else encountered the woman at the Church & Carlton Loblaws who asks to show you where they used to drop the puck?
Anyone Same Situation ?
June 2026 - Citizenship Application Timeline
IELTS EXAM IN 3 DAYS AND WRITING SUCKS
PA Guard soldier (21) Parents scheduled for biometrics in Syracuse for Military Parole in Place (PIP). Is this a deportation setup?
Qs about best options for PR
I'm am employee of US LLC valid for ircc?
WHAT SHOULD I DO NOW
Hello! I've just started preparing for the IELTS exam. I'm planning to take it in March. Could you please recommend some useful resources and share any advice or tips???
Should I travel with a PRTD?
Any family doctors good with mental health/menstrual issues?
Seed bank/supplier for native edible plants or weather-resistant fruit trees?
Megathread: HOUSING? (2)
Any immigration attorneys in Illinois?
Friend Currently Detained by ICE – Voluntary Departure, 90-Day Timeline, and Possibility of an Earlier Hearing?
Pending F4 visa petition from 2016 – will it ruin my chances of getting an F-1 student visa?
How to fill Work History in ITA for remote work while moving countries every few months?
Has anyone used a degree from Benin Republic for Canadian PR?
Can my partner visit the US if my family and I are the primary people supporting/sponsoring her visit?
A Swedish state of mind:  Even socialist Sweden has robust private health care and education. Why shouldn’t Canada?
How Trump's tariffs are threatening to spoil the success of Canadian cheese
Any Venezuelan Naturalized Since October 2026?
2023 PR Applications Timeline (Protected Persons & Refugees)
July 2026 - Citizenship Applications
March 2026 - Citizenship Applications
Other Relative - Sibling Sponsorship
PR Card renewal - September 2026
September 2026 Canadian Citizenship Application
Express Entry profile: how to enter one job when my weekly hours changed (plus an overlapping job)?
PR card renewal applied in October  2026
Startup Visa Program Timeline
2026 PR application timeline
2026 January - Citizenship Applicants
August 2026 Citizenship Application
2024 asylum claimants, Share timeline here
May 2026 - Citizenship Applications Time Line
Overseas spouse and dependents of protected person and convention refugee timeline - Share here
October 2026 - Citizenship Applicants
Additional documents and biometrics changed to *not applicable*  AUGUST 2022 applicant
June 2025 Citizenship Applications Time Line
2024 PR Application timeline
2025 PR Application Timeline (Protected Person)
Feb 2026 Citizenship Applicants
Work Permit applied from Pakistan
CBSA Security Screening Processing Time
Supervisa - August 2026 Timeline
Common-law sponsorship – Relationship began while I was still legally married, but cohabitation started after separation
Son's visitor visa extension
Parents Visitor Visa
LMIA Exempt work Permit for high wage Job offer under new rule starting Nov3
Express entry
July 2025 Inland Spousal Sponsorship application
February 2026-Outland spousal sponsorship
Recommended TCF/TEF Test Prep
What do I pick
‘Time after time’: Have we learned from our history of permanent DST experiments?
Where can I find the best vegan pizza in Toronto?
My visitor visa to Canada got rejected and banned for 5 years How can I appeal because I dont know why I am banned
My application for a Canada tourist visa got rejected because of subsection 16 1 because I didn t mention my previous visa refusals How do I reapply or what do I do next
Trying to help a 65-year-old friend in Toronto who drinks all day. Can't afford private rehab. What do I do next?
Chances of Returning to the US on a New F-1 Visa After Previous Cancellation?
Anyone ordered a Cozey couch recently? How reliable is their delivery window?
Can someone help me I only get 5 on reading🙏
Can anyone recommend a good mechanic who specializes in Toyota Prius?
ChatGPT keeps giving me 6.5 on writing task 2. Can someone read up and confirm if they agree with the AI assessment or not? Your score and any tips will be appreciated.
Why am I still a leafs fan 😢
Questions please help 🙋♀️
Anyone in Toronto is interested in helping start or join a chessboxing club?
Help with CRBA physical presence
Please help
ADR Received for Marital Status Kindly help - 5 days deadline
Did you get any free docs from the British council website after paying?
First Time at Oasis Aqualounge – Student Night or Bukkake Night?
Au Pair: Canada or New Zealand ?
Do ERVs (hvac) in newer condos always run continuously?
Anyone know of any cheap/reasonably priced dentists in GTA?
Changes to Express Entry for high-wage occupations.pdf
22F – Should I stay in Canada for PR or return to Pakistan for MBBS? Need honest advice.
Citizenship online application & representative form(IMM5476)
Name split on New passport but PR card same as single name.
US H1B while maintaining Canadian PR
Inland spousal sponsorship for a spouse who overstayed
i want 7 overall within short duration and my current score is 7,7,6,6.5. Which one should be retaken?
Should I go for EOR?
Any recommendations for a birthday gathering downtown?
Thoughts on 2731 Danforth Ave.
Question regarding remote marriages in Utah after May 6, 2026 – Mandatory legal notice
J-1 Intern visa for F&B Service, does my program qualify?
Fun things to do in GTA/Toronto winter
ChatGPT keeps giving me 6.5 on writing task 2. Can someone read up and confirm if they agree with the AI assessment of not? Your score and any tips will be appreciated.
Anyone wana do a ski trip this March to Alberta?
Should I go for EOR for Writing? Please guide.
How autonomous vehicles are changing oilsands mining
Anyone would like to connect?
Moving to Canada for work/study - money advice
CBS news: Trump administration does not believe immigration crackdown was the reason for midterm losses
LHR Airside Transit (T3 to T5) with Indian Passport + Austrian EU Permanent Residence Card (Daueraufenthalt - EU) - Anyone done this recently?
Proof of funds question
How to handle a study abroad / exchange year (2024–2025) within a Bachelor's degree (2022–2025) in Educational History?
Queen Elizabeth Theatre Bag and Lightstick Policy?
How to assess my speaking skills?
Hope is finally back in America, and did the U.S. just leave Canadian Conservatives behind?
Is the organisation ‘Canadian Education Council’ Legitimate? Are They Actually Affiliated with the Canadian Government?
Is it common to say "I love you" on the second date for canadians ?
Anyone in Etobicoke outside right now hear what sounds identical to airplane dog fighting going on for like 10 mins?
Psycroptic show meetup?
Ireland • Re: Assylum in Ireland with Family
Seeking Advice from U.S. Immigration Attorneys and People with Similar Experiences 🇺🇸
How long does it take for the online ice tip form to process once I have submitted?
Where’s your favorite spot in Toronto for takeout pizza with anchovies?
H&C Humanitarian Ground with/or Without Failed refugee claim
Virtual ceremony from BC
Dubai, Bali, Thailand, Vietnam or Turkey – Which Destination Is Best for a Holiday?
NOC Software Test Engineer in a lead position.
BitStarz Casino Online Casino Guide: Exploring Bonuses and Payment Methods
Driftly Sleep Patches Germany: Everything You Need to Know Before Buying
Fraud immigration (Greenlight Immigration Services private limited Kochin kerala Indial
Mussoorie Honeymoon Tour
Discover Driftly Sleep Patches Germany and Their Unique Patch-Based Formula
SodaFit
Planning a Trip to India? Don't Miss the Beautiful Himalayan Region of Darjeeling!
GlucoLife+ Blood Sugar Support: A Detailed Consumer Perspective
2018-2019 Batch IDOL Mumbai University
The ‘Scary’ 2026 Immigration Level Plan and the ‘Crazy’ 664,000 New PR’s
Guidance on Including an Adult Dependent Child in PR Application
Consult about travel consent
Gold Jewelry after becoming PR
IEC inland activation permit delivery issues twice
How to fill Work History in ITA for remote work while moving countries every few months?
How to handle a study abroad / exchange year (2024–2025) within a Bachelor's degree (2022–2025) in Educational History?
Investing in US real estate as a PR
flying with transit
QUEBEC AUG 2022 UPDATE
Refugee group of 5 applications Cairo office
Alberta opportunity stream NOC change
AOR JAN 2016 - let's get together
Photo submit is only 10kb, what should I do?
Cairo office PSR group of 5 updates
Section 44 Report after CBSA allowed Entry
Can my partner visit me in the US?
Dear Canada, how can I let you know
Dear Canada, how can I let you know
Found cat outside - what do we do?
Oil change in North York (near 401/404) recommendations?
Advise regarding conditional discharge for my PR application.
Supervisa - September 2026
Yes, the First African Distance Learning University (FADLU) is  accredited by the Education Board for Accreditation (EBA) operating under CCLP Worldwi
Planning a Trip to India from Canada – Which Places Should I Visit?
Will ESTA be denied because of previous Flagpolling ?
"First Fully 100% Online University in Mauritius*

The first fully 100% online university in Mauritius is the First African Distance Learning Universit"
First African Distance Learning University (FADLU)
PCC: what addresses to be mentioned?
Personal history
Parents & Grandparents Program(PGP) 2025
SVO shifted to the same location as PVO
July 2025 AOR
Master Application for fall 2026 Visa chances?
Study visa ontario tech
PR or PRTD eligibility based on "accompanying" spouse exception
Online Universities in MAURITIUS
PR and Restoration
Schedule A
Immigration Options for Skilled Workers
Can't log in to PR portal and never received credential
Police certificate (VOG) (Netherlands to Canada)
Europe's 72-Hour Survival Book 2026 Review – Is It Really Worth Your Money?
Europe's 72-Hour Survival Reviews – The Survival Questions Everyone Should Ask
SodaFit
Yes, the First African Distance Learning University (FADLU) is a registered and 100% Fully foreign-licensed online institution, though it does not ope
I need advice sponsoring / Ontario works debt
Canada’s Immigration Plan 2027–2029: New Targets and Key Changes Announced
The Express Entry Comprehensive Ranking System (CRS) will change on November 3, 2026: • You can get more points for eligible Canadian work experience or a qualifying job offer in a high wage occupation. • You will no longer need a labour market impac
We held an Express Entry round of invitations: • Round type: Canadian Experience Class • Number of invitations issued: 2,500 • CRS score of lowest-ranked candidate invited: 519 Learn how Express Entry works and calculate your CRS score: https://bit.ly/471
Canadian Immigration Express Entry and PNP - Canada PR
Canada invited 4,000 candidates in a French-language Express Entry draw, with a CRS cut-off of 400. So should you stop learning French because Express Entry may change? My answer: no. Keep going. French still gives you more options, more flexibility, a
Economic Outcomes of Provincial Nominees — Express Entry vs. Non‑Express Entry. A new Statistics Canada study examines how Express Entry (EE)–screened provincial nominees compare with those admitted through base Provincial Nominee Program (P
The Canadian Immigration Department has introduced updates to the Express Entry program for 2025. These changes are expected to impact skilled workers, tradespeople, and healthcare professionals who hope to obtain permanent residency in Canada. Th
What happens if you don't move to Canada after becoming a Permanent Resident?
Why do Canadians consider US immigration to be hostile but their own officers to be nice despite as a US citizen I was almost denied entry into Canada just because the officer felt like I wouldn t be a genuine
Is it common for immigrants in Canada to feel disconnected from Canadian born citizens and what can be done about it
Is it safe to assume any foreigner with an arrest record in the past would face a lifetime ban from Canada
How did settlers familiarity with certain climates influence their decision to move to Canada instead of staying in the US
What are the biggest surprises or misconceptions new immigrants face about life in Canada especially regarding job prospects and living conditions
Why does Canada forbid entry to US citizens with a DUI for 10 years Why doesnt US immigration reciprocate and forbid Canadians with a DUI
Why is it so hard for US citizens to live in Canada
I m banned for 5 years to Canada due to mispresentation Are there any chances to remove the ban
Looking for Guidance on Working in Canada as an SEO Professional
Canadian Immigration without IELTS A Practical Guide to Pathways with Fewer Language Barriers
Today I Become a ‘Zero’: How Age Affects Express Entry Scores
Canada Express Entry: Education Weighs High for Successful Canada Immigration Application
What is Misrepresentation? Canada Immigration Lawyer Evelyn Ackah Explains
Canada Express Entry 2025: Major Changes, STEM Draws, and New Scoring Dynamics
Canada’s Immigration System Faces Growing Debate Over Age-Based CRS Points
That’s It… I’m Moving to Canada: Obtaining Canadian Citizenship by Descent
How Remote Jobs Help You Qualify for Canadian Immigration
Canada Is Changing Express Entry in 2026. Here Is Exactly Who Wins and Who Loses Points.
Canada updates Express Entry points for high-wage jobs
Canada Skilled Trades Immigration Opportunity via Express Entry | Attah Salifu posted on the topic
Canada Invites 3,232 Canadian Experience Class Candidates With 2nd Express Entry Draw In 3 Days
Are you a skilled worker interested in immigrating to Canada? Here are the answers to some of the most frequently asked questions about Express Entry: (1) Who can apply through Express Entry? To be eligible, you need to meet the criteria of at least 1 of thes
🇨🇦 MORNING IMMIGRATION INSIGHT – EXPRESS ENTRY vs AIP: WHAT’S THE DIFFERENCE? Many applicants confuse Express Entry with the Atlantic Immigration Program (AIP). Let’s break it down clearly: 🔹 Express Entry (EE) ✔ Federal immigration syst
Do you not realize that Canadas welfare state crumbles under the strain of irresponsible immigration
Why are immigrants leaving Canada
I just arrived in Canada with a visitors visa How do I begin my PR processing because I dont want to come back in 2026
Do you consider moving to Canada
The flight north is underway 48 of Americas best scientists have just moved north to be part of a 17 billion talent program Carney announced in December Is this the start of more Americans exhausted by Trumps chaos
Why do so many immigrants say they were shocked after arriving in Canada because it was nothing like what had been advertised or what they had imagined a developed country would be
Whats a common Canadian perspective on why people from other nations seek to immigrate to Canada today
How could becoming part of the US affect Canadas approach to immigration and why is this important to Canadians
Is immigration to Canada now impossible
Do you consider moving to Canada
How would Canadian immigration react with US passport holders living in Point Roberts driving across BC twice everyday without a visa just to do things in Northern Washington
As a Ukrainian refugee to Canada I was told I would have to wait 4 years to have my severe injuries treated so I moved to America instead Why do people think Canadas healthcare is better than Americas
Where should a Punjabi go in 2026 for a better life Italy or Canada
Are Canadians getting tired of mass immigration
Why don t we want immigrants in Canada
Is Canada bringing too many immigrants
Why do people return from Canada after getting a PR
I moved to Canada and am unable to find a job but Im making a lot of money with my side hustle Will it be possible for me to get PR How do I do it
Refugee Vaccinations
Seniors Social Drop-in Programs
Immigration to Canada Likely to Rebound as Labour Market Improves and Economy Recovers
Relocating from the US to Canada: Immigration options for laid-off tech workers
Secondary Immigration Examination at Port of Entry when entering Canada.
Canada’s Immigration Reset: 7,777 ITAs, a Landmark BIOC Ruling, and the Rise of Category-Based Selection
Canadian Immigration Professionals - An Evolving Market and Changing Times
Bharat Paliwal RCIC, Canada Immigration, AI Consultant
Meeting New Canada Immigration Requirements
Canada Immigration Fraud: 5 Scams You Should Know How to Spot
Understanding Canada Immigration for Early Childhood Educators
How Canada (Un)made My Thinking on Immigration
Issues completing physical presence for citizenship
Work permit extension refusal
Job Rejections Related to Francophone Mobility Permit
Citizenship application gap between study and work permit
Study permit application in Canada
SVO shifted to the same location as PVO - what does it mean for my application?
Is my job on IRCC's high-wage list - will I get the new Express Entry points?
Canada's Express Entry Changes: What Applicants Need to Know Before 3 November
On Tuesday, Canada Changes Two Immigration Doors at Once
Working remotely from Ontario for a US employer - tax and PR pitfalls?
How can I get a job in Canada to move there permanently?
AAIP Law enforcement pathway - EOI or NOI?
What do the November 3 Express Entry changes mean for my CRS score and job offer?
Express Entry now rewards high wages, not shortages - is my occupation on the winning list?
Express Entry's new CRS reality - who wins and who loses under the November 3 changes?
eCoPR Recieved. Thank you all for sharing your timelines and keeping me sane.
CEC Inland PR process while on restoration ?
Should I try to boost points with high wage NOC, or hope for the best with 532?
Kindly help with the following query
I Got my PR todayyy! 🚀
Canadian RNIP / PNP options for Nurse Aide (NOC 33199) with 3 years of Canadian experience? Need advice.
Advice on bringing my brother to Canada for my wedding in 2027/2028.
Help please, last minute preparation
Urgent Foreign Experience query
Urgent help.
Canadian RNIP / PNP options for Nurse Aide (NOC 33199) with 3 years of Canadian experience? Need advice.
transit visa? urgent!
IELTS TIPS: I REALLY NEED HELP
I need help, writing task 2
Spousal Sponsorship PR (Canada): Do I need to submit employment history and pay stubs if I haven’t worked in 2 years?
Forgot to list an old student visa and visitor visas in Question 13 of my citizenship application , no AOR yet, how do I fix this?
Has Anyone Retaken IELTS in Canada While Their Previous Results Were Withheld?
Expired SIN and Work Permit Extension – Unable to Access My Service Canada Account
Express Entry New Job Offer CRS Points – Employer Refusing 1-Year Post-PR Statement. Any Alternatives?
Stuck at Band 6–6.5 for Months. How Can I Improve to Band 8 Before December?
EDITORIAL: Are Liberals repeating immigration blunders? - Sensible immigration contributes to economic growth but not if it exceeds the capacity of the economy to absorb it
Anyone got PR approved with part-time foreign remote work alongside a Canadian job?
What is next after provincial nomination
Looking for honest advice on LMIA farm jobs in Canada from overseas?
Drug possession is illegal. Why can people use openly in public? Drop in charges coincide with policy change by federal prosecution service
Why am I not receiving my results?
CEC Inland – COPR details appearing in Tracker, but no P1 yet. Is this approval?
July citizenship applicants - any updates on AOR?
Express Entry work history – foreign employer, but I moved to Canada during the same remote job. Which city should I enter?
Waste of time or what?
Would a period of separation jeopardize my ability to sponsor my wife for residency?
Anyone got approved for Foreign remote work points for CEC
BOWP with NOC 42202 (childcare teacher)& Medical Exam Exemption Question
How realistic is RCIP for PR? Has anyone received an ITA through the program, particularly in North Bay?
Express Entry work history – foreign employer, but I moved to Canada during the same remote job. Which city should I enter?
Hi everyone! Has anyone successfully received their Permanent Residency (PR) through Express Entry under NOC 42202 (Early Childhood Educators) with work experience, but without holding a specific degree in this field? I'd love to hear about your experience. Thanks!
First PR card issue timeline
Outland Spouse Sponsorship- First PR card Timelime
OINP received- BUT CRS Score Not Updating (600 Points Missing)
Gap between study permit and work permit
Non-Routine Citizenship Applications (2024–2025) – Timelines
COPR Showing in PR Tracker But No Portal Email – AOR Dec 17 (CEC Inland)
How do I improve my reading?
When will the new express entry points show up in my profile?
How many type of charts are in IELTS Academic exam Writing Task 1?
Serbian Citizenship for a Turkish Citizen Married to a Serbian Woman – What Is the Process?
How to legally keep employment and self-employment
Where can i acess progress tests
In IELTS speaking test, is it the same person who ask questions and give you scores? Or the assessment is done by someone else ?
The Asylum Backlog Dilemma: Can the U.S. fix processing delays without restricting legitimate refugee claims?
Hi everyone! Has anyone recently requested an Eor
B-2 Tourist visa / How to make a strong case
Is ESL Teaching Skilled Work?
Can I extend a passport-limited PGWP from outside Canada after renewing my passport?
Has anyone from India received a Canadian study permit using TOEFL iBT Home Edition?
Can I port my US phone number to a Canadian carrier when I move to Canada permanently?
best online IELTS prep course?
CRS 420 – What are my realistic chances in the next French-language Express Entry draws?
Express Entry Chances - 444
H&C Application Timeline
How difficult is it for a Russian man to get Fiancé’s visa through female American citizen?
Sep 2026 Outland Sponsorship Applicants
Spousal sponsorship, appeal won
Québec PR Timelines
AUGUST 2025 - CITIZENSHIP APPLICATIONS
Canada Express Entry 2026: How Can Indian Applicants Improve Their CRS Score?
March 2026 - Outland Spousal Sponsorship
36 Months Waiting for Sponsorship Approval !!!!
How to get seized documents from IRCC after PR
Application for Canadian Citizenship - A Comprehensive Guide
Can New Permanent Residents Access ABA Therapy for Their Children?
PR Card Renewal June 2026
Tef/tcf which is easy?
Stamp Received on Indian Passport in USA after Surrender on Acquiring Canadian Citizenship
April 2025 - Inland Spousal Sponsorship
SEPTEMBER 2026 PR RENEWAL TIMELINE.
October 2026 - Outland Spousal Sponsorship
August 2023 - Citizenship Applications
May 2024 - Citizenship Applications
April 2024- Citizenship Application
ANALYSIS | Amid sky-high oilpatch profits, why Danielle Smith wants to offer oil companies a new subsidy | CBC News
Lions and tigers are kept legally in Ontario backyards. No one knows how many there are
How i Get My Immigration From Yemen to Live in Europe?
Need help with writing and speaking
Help me
Help me
Help me out of my country
Help me out of my country
Help me out of my country
I'm a 25-year-old living in Tunisia, trying to find a legitimate opportunity to build a future abroad. Looking for advice, connections or organizations that could help.
Urget help.
Is there any point in getting a score higher than 7?
Effective November 3, 2026, we will update Express Entry’s Comprehensive Ranking System (CRS) to better select skilled immigrants whose experience and qualifications support Canada’s economic growth and labour market needs. This is the first step in br
What mistake did your Immigration agent made ?
I scored overall 7 but I have to get overall 7.5 for my admission. Should I target reading or writing?
Waste of time or what?
Undocumented Is Not Criminal: What the Law and the Data Say About Mass Deportation
Eligibility to enter Canada
How do you report someone for immigration fraud marriage and actually get results?
I checked my account - it says Eligibility is completed. Does this mean it is passed?
Waste of time or what?
Please what do I do
IMM 5669 Personal History : Do I need to list work I did while studying in Canada?
Quebec BOWP filed without PR AOR, IEC permit expires Nov 11. Has anyone actually been approved?
Am I allowed to reply to business emails on a J-1 visa?
Will visiting Afghanistan affect my ESTA eligibility for the US in 2027?
Man who used fraudulent passport to get in and out of Canada 16 times handed 2-year sentence
How Canada Inflicted Maximum Midterms Pain on Trump
If parents are in the late 50’s where in Canada should they relocate. Relocating from USA.
Ireland • Re: Assylum in Ireland with Family
Ireland • Re: Assylum in Ireland with Family
Long wait between FD and P1
Resolving Response from Social Assistance (PGP 2019)
Parents & Grandparents Program(PGP) 2022
Supervisa - October 2026
PR renewal for parents
Personal history/Discontinued open studies
2024 - DR2 Centralized Concurrent Processing Pilot Project - Protected person
APRIL 2026- OUTLAND Submissions
Is marrying a Canadian citizen a guarantee for obtaining permanent residency in Canada How long does it typically take to obtain PR after marriage assuming all eligibility criteria are met
Every Job That Qualifies For Canada Express Entry Immigration Through Federal Programs
For most Canadians Australians were your ancestors already there back in 1897 which was Queen Victoria s Diamond Jubilee Why did they decide to leave Europe what criteria did they even need to meet back then to
Can you guys help me come up with a scavenger hunt so I can nerd out on your TTC?
How does Toronto distillery ticketing even work. Do they go around the park and look for people without tickets at 3:59 😂?
Samosa business? saturated or no?
Has anybody successfully retrieved clothes out of a donation bin?
Events in TO tonight (November 10)?
Does anyone see a guy wearing all white, long hair on the TTC? hes in various locations around Toronto, I see him all the time.
How to best spend 3 hours in the city?
Question about dental insurance coverage for adult braces
Something to do in Toronto
Travel agent for couple in our 30s?
Where can I buy a Lake Ontario t-shirt in Toronto?
Where Are The Colourful Leaves At?
Understanding Special Priority Status and RGI units: what is your experience?
Toronto – I'd love to hear your experiences!
Registered for North York daycares late (at 3 months old) — what actually worked to get a spot or what was your Plan B?
One day date ideas anyone?
Left a 1-star rating for an insurance broker. Now my wife’s business is getting dragged into it?
What happened to the Toronto Star's podcasts?
Those who exchange liberty for security, deserve neither
Question regarding TTC day fare
Where to buy cute phone cases downtown?
Good communities?
How would you rank GTA suburbs from best to worst?
How do we as adults get into Pokemon card collecting?
Why are 2:30 am fireworks on a Monday tolerated?
Is hiring a professional organizer actually worth it for an overwhelmed single parent?`;

const lines = rawInput.split('\n').map(l => l.trim()).filter(Boolean);
console.log(`Total raw lines: ${lines.length}`);

// Count unique
const uniqueLines = [...new Set(lines)];
console.log(`Total unique lines: ${uniqueLines.length}`);

const dbPath = 'data/test-settlement.sqlite';
const store = openStore(dbPath);
const records = store.records();
const fixedNow = new Date('2026-11-10T12:00:00.000Z');

const results = [];
for (let i = 0; i < lines.length; i++) {
  const q = lines[i];
  let ans;
  try {
    ans = answer({ question: q }, records, fixedNow);
  } catch (err) {
    ans = { status: 'error', error: err.message, claims: [], sources: [], gaps: [] };
  }
  results.push({
    index: i + 1,
    question: q,
    status: ans.status,
    claimsCount: ans.claims?.length || 0,
    sourcesCount: ans.sources?.length || 0,
    parsed: ans.parsed,
    gaps: ans.gaps?.map(g => g.reason) || [],
    claims: ans.claims?.map(c => ({ id: c.evidenceId, text: c.claim })) || [],
    sources: ans.sources?.map(s => s.title) || []
  });
}

fs.writeFileSync('scripts/scratch-user-eval-results.json', JSON.stringify(results, null, 2));
console.log('Saved results to scripts/scratch-user-eval-results.json');

const counts = { guidance: 0, partial: 0, clarification: 0, unavailable: 0, error: 0 };
for (const r of results) {
  counts[r.status] = (counts[r.status] || 0) + 1;
}
console.log('Overall Status Distribution:', counts);
store.db.close();
