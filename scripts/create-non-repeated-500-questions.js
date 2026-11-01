// scripts/create-non-repeated-500-questions.js
import fs from 'node:fs';
import { fresh500SocialSuite } from './fresh-500-social-suite.js';
import { master500EvaluationSuite } from './master-500-question-suite.js';

// Build global normalized set of all past questions
const pastQuestions = new Set();
fresh500SocialSuite.forEach(q => pastQuestions.add(q.question.trim().toLowerCase()));
master500EvaluationSuite.forEach(q => pastQuestions.add(q.q.trim().toLowerCase()));

console.log(`Loaded ${pastQuestions.size} historical questions to ensure 100% uniqueness.`);

const newSuite = [];
const seen = new Set();

function addQ({ country, city, topic, category, type, platform, question }) {
  const norm = question.trim().toLowerCase();
  if (pastQuestions.has(norm)) {
    throw new Error(`Collision with historical question: "${question}"`);
  }
  if (seen.has(norm)) {
    throw new Error(`Duplicate within new suite: "${question}"`);
  }
  seen.add(norm);
  newSuite.push({
    id: `NR500_${String(newSuite.length + 1).padStart(3, '0')}`,
    country,
    city: city || null,
    topic,
    category,
    type, // 'technical' | 'non-technical'
    platform, // 'Reddit', 'Quora', 'LinkedIn', 'X'
    question
  });
}

// ============================================================================
// 1. CANADA (CA, ON, BC, Alberta, etc.) - 80 Questions
// ============================================================================

// Canada Technical Questions (40)
addQ({
  country: 'Canada', city: 'Toronto', topic: 'employment', category: 'Study_to_Work', type: 'technical', platform: 'Reddit',
  question: 'What are the exact IRCC eligibility requirements to transition from a Canadian study permit to a Post-Graduation Work Permit PGWP in Toronto?'
});
addQ({
  country: 'Canada', city: 'Vancouver', topic: 'employment', category: 'Work_Permits', type: 'technical', platform: 'Reddit',
  question: 'Under what specific circumstances does a foreign worker qualify for a Bridging Open Work Permit BOWP while awaiting PR in Vancouver?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'employment', category: 'Compliance', type: 'technical', platform: 'LinkedIn',
  question: 'How does an employer demonstrate compliance with ESDC prevailing wage rules when applying for an LMIA in Ontario?'
});
addQ({
  country: 'Canada', city: 'Mississauga', topic: 'employment', category: 'Immigration_Status', type: 'technical', platform: 'Reddit',
  question: 'What constitutes maintained status under Section 186 of the IRPR when an application to extend a work permit is pending in Mississauga?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'employment', category: 'Express_Entry', type: 'technical', platform: 'LinkedIn',
  question: 'How are Comprehensive Ranking System CRS points awarded for Canadian educational credentials versus foreign degrees assessed by WES in Toronto?'
});
addQ({
  country: 'Canada', city: 'Vancouver', topic: 'employment', category: 'PNP', type: 'technical', platform: 'Reddit',
  question: 'What are the minimum wage thresholds and eligible tech occupations under the BC Provincial Nominee Program Tech stream in Vancouver?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'housing', category: 'Tenancy_Disputes', type: 'technical', platform: 'Reddit',
  question: 'What is the exact statutory deadline for an Ontario tenant to file Form T2 at the LTB for substantial interference with quiet enjoyment in Toronto?'
});
addQ({
  country: 'Canada', city: 'Brampton', topic: 'housing', category: 'Eviction_Rules', type: 'technical', platform: 'Reddit',
  question: 'Under Section 48 of the Ontario RTA, what evidence must a purchaser provide to substantiate an N12 eviction notice for personal use in Brampton?'
});
addQ({
  country: 'Canada', city: 'Mississauga', topic: 'housing', category: 'Rent_Increases', type: 'technical', platform: 'Reddit',
  question: 'How must an Ontario landlord calculate an Above Guideline Increase AGI for major capital expenditures under Form L5 in Mississauga?'
});
addQ({
  country: 'Canada', city: 'Vancouver', topic: 'housing', category: 'Tenancy_Bonds', type: 'technical', platform: 'Reddit',
  question: 'What is the strict 15-day timeline for a BC landlord to return a security deposit under Section 38 of the Residential Tenancy Act in Vancouver?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'employment', category: 'Wage_Standards', type: 'technical', platform: 'LinkedIn',
  question: 'Under the Ontario Employment Standards Act, what are the statutory rest period requirements between work shifts for employees in Toronto?'
});
addQ({
  country: 'Canada', city: 'Mississauga', topic: 'employment', category: 'Severance_Pay', type: 'technical', platform: 'LinkedIn',
  question: 'When does an employer Ontario ESA severance pay obligation trigger for companies with an annual Ontario payroll exceeding $2.5 million in Mississauga?'
});
addQ({
  country: 'Canada', city: 'Vancouver', topic: 'employment', category: 'Overtime_Banking', type: 'technical', platform: 'LinkedIn',
  question: 'How does an employee bank overtime hours under an overtime agreement pursuant to Section 42 of the BC Employment Standards Act in Vancouver?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'money', category: 'Tax_Reporting', type: 'technical', platform: 'Reddit',
  question: 'What are the CRA Form T1135 foreign income verification reporting requirements for newcomers holding offshore property over $100,000 CAD in Toronto?'
});
addQ({
  country: 'Canada', city: 'Brampton', topic: 'money', category: 'Banking_Regulations', type: 'technical', platform: 'Reddit',
  question: 'Under the Bank Act, what minimum government identification documents are mandatory to open a personal retail bank account in Brampton?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'money', category: 'Moving_Expenses', type: 'technical', platform: 'Reddit',
  question: 'How does the CRA 40-kilometer rule determine eligibility to deduct moving expenses on Form T1-M when relocating for work in Toronto?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'health', category: 'Health_Insurance', type: 'technical', platform: 'Reddit',
  question: 'Under Regulation 552 of the Health Insurance Act, what constitutes the 153-day physical presence requirement to maintain OHIP eligibility in Toronto?'
});
addQ({
  country: 'Canada', city: 'Vancouver', topic: 'health', category: 'Medical_Wait_Period', type: 'technical', platform: 'Reddit',
  question: 'How is the two-month plus remainder of the current month waiting period calculated for BC MSP coverage for new residents in Vancouver?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'driving', category: 'Licence_Exchange', type: 'technical', platform: 'Reddit',
  question: 'Under Ministry of Transportation Ontario rules, what certified driving record authentication is required from non-reciprocal countries in Toronto?'
});
addQ({
  country: 'Canada', city: 'Vancouver', topic: 'driving', category: 'Insurance_Claims', type: 'technical', platform: 'Reddit',
  question: 'How does ICBC evaluate claims-free driving history from overseas jurisdictions to calculate individual insurance discounts in Vancouver?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'telecom', category: 'Contract_Rules', type: 'technical', platform: 'Reddit',
  question: 'Under CRTC Telecom Regulatory Policy 2017-200, what are the mandatory trial period cancellation rules for mobile contracts in Toronto?'
});
addQ({
  country: 'Canada', city: 'Mississauga', topic: 'telecom', category: 'Data_Caps', type: 'technical', platform: 'Reddit',
  question: 'What are the CRTC Wireless Code provisions regarding domestic data overage fee caps of $50 CAD per billing cycle in Mississauga?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'family', category: 'School_Law', type: 'technical', platform: 'Reddit',
  question: 'Under Section 49.1 of the Ontario Education Act, why can children of work permit holders attend publicly funded TDSB schools without paying tuition in Toronto?'
});
addQ({
  country: 'Canada', city: 'Vancouver', topic: 'family', category: 'Child_Immunization', type: 'technical', platform: 'Reddit',
  question: 'What mandatory childhood immunization records must parents submit to Vancouver Coastal Health upon school registration in Vancouver?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'arrival', category: 'Border_Compliance', type: 'technical', platform: 'Reddit',
  question: 'Under Customs Act Section 99(1)(a), what statutory standards govern CBSA secondary examinations of traveler digital devices at Toronto Pearson?'
});
addQ({
  country: 'Canada', city: 'Vancouver', topic: 'arrival', category: 'Settler_Goods', type: 'technical', platform: 'Reddit',
  question: 'What CBSA Form BSF186 accounting documentation is required to clear unaccompanied settlers effects duty-free in Vancouver?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'community', category: 'Citizenship_Act', type: 'technical', platform: 'Reddit',
  question: 'Under Section 5(1)(c) of the Citizenship Act, how are days spent in Canada as a temporary resident credited toward the 1,095 days PR requirement in Toronto?'
});
addQ({
  country: 'Canada', city: 'Brampton', topic: 'community', category: 'Photo_ID', type: 'technical', platform: 'Reddit',
  question: 'What statutory eligibility criteria govern issuance of the Ontario Photo Card under the Photo Card Act 2008 in Brampton?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'sin', category: 'SIN_Regulations', type: 'technical', platform: 'Reddit',
  question: 'Under Employment Insurance Act regulations, what is the legal significance of a 900-series Social Insurance Number expiry date in Toronto?'
});
addQ({
  country: 'Canada', city: 'Vancouver', topic: 'sin', category: 'Identity_Validation', type: 'technical', platform: 'Reddit',
  question: 'What primary immigration documents does Service Canada require to issue a Social Insurance Number to a temporary resident in Vancouver?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'childcare', category: 'CWELCC_Guidelines', type: 'technical', platform: 'Reddit',
  question: 'Under the Canada-Wide Early Learning and Child Care agreement, what is the statutory fee reduction percentage for licensed daycare spaces in Toronto?'
});
addQ({
  country: 'Canada', city: 'Mississauga', topic: 'childcare', category: 'Waitlist_Regulations', type: 'technical', platform: 'Reddit',
  question: 'Under the Child Care and Early Years Act 2014, what regulations prohibit licensed daycare providers from charging waitlist fees in Mississauga?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'transit', category: 'Transit_Fares', type: 'technical', platform: 'Reddit',
  question: 'How does the PRESTO card two-hour transfer window operate across TTC subways and buses in Toronto?'
});
addQ({
  country: 'Canada', city: 'Vancouver', topic: 'transit', category: 'Fare_Zones', type: 'technical', platform: 'Reddit',
  question: 'How are TransLink three-zone Compass Card fare structures applied on the SkyTrain network during peak versus off-peak hours in Vancouver?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'employment', category: 'Occupational_Health', type: 'technical', platform: 'LinkedIn',
  question: 'Under Occupational Health and Safety Act Section 43, what constitutes a lawful work refusal for dangerous working conditions in Toronto?'
});
addQ({
  country: 'Canada', city: 'Vancouver', topic: 'employment', category: 'Worker_Injury', type: 'technical', platform: 'LinkedIn',
  question: 'Under the BC Workers Compensation Act, what are the statutory reporting timelines for an injured worker to submit Form 6 in Vancouver?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'employment', category: 'Trade_Certification', type: 'technical', platform: 'LinkedIn',
  question: 'How does Skilled Trades Ontario verify foreign apprenticeship hours for a Certificate of Qualification Trade Equivalency Assessment in Toronto?'
});
addQ({
  country: 'Canada', city: 'Calgary', topic: 'housing', category: 'Alberta_Tenancy', type: 'technical', platform: 'Reddit',
  question: 'Under the Alberta Residential Tenancies Act, what are the statutory grounds and notice periods for a landlord to terminate a periodic tenancy in Calgary?'
});
addQ({
  country: 'Canada', city: 'Montreal', topic: 'employment', category: 'Quebec_Immigration', type: 'technical', platform: 'Reddit',
  question: 'What French language proficiency level on the Echelle quebecoise is mandatory for the Programme de lexperience quebecoise PEQ in Montreal?'
});
addQ({
  country: 'Canada', city: 'Ottawa', topic: 'family', category: 'Super_Visa', type: 'technical', platform: 'Reddit',
  question: 'What is the mandatory Low Income Cut-Off LICO plus 30 percent financial threshold to sponsor parents on a Super Visa in Ottawa?'
});

// Canada Non-Technical Questions (40)
addQ({
  country: 'Canada', city: 'Toronto', topic: 'community', category: 'First_Steps', type: 'non-technical', platform: 'Reddit',
  question: 'Where can a newly landed immigrant find free English conversation classes through Toronto Public Library branches in Toronto?'
});
addQ({
  country: 'Canada', city: 'Mississauga', topic: 'community', category: 'Settlement_Agencies', type: 'non-technical', platform: 'Reddit',
  question: 'What free newcomer settlement services does the YMCA Newcomer Information Centre provide for families in Mississauga?'
});
addQ({
  country: 'Canada', city: 'Brampton', topic: 'community', category: 'Community_Hubs', type: 'non-technical', platform: 'Reddit',
  question: 'How do new residents in Brampton register for free community library programs and access computer facilities in Brampton?'
});
addQ({
  country: 'Canada', city: 'Vancouver', topic: 'community', category: 'Helplines', type: 'non-technical', platform: 'Reddit',
  question: 'What kinds of everyday settlement assistance can newcomers receive by dialing 211 British Columbia in Vancouver?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'arrival', category: 'Airport_Arrival', type: 'non-technical', platform: 'Reddit',
  question: 'What should a newly arrived permanent resident do immediately after clearing customs at Pearson Airport in Toronto?'
});
addQ({
  country: 'Canada', city: 'Vancouver', topic: 'arrival', category: 'First_Week', type: 'non-technical', platform: 'Reddit',
  question: 'What are the recommended first three administrative tasks a newcomer should complete in their first week in Vancouver?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'health', category: 'Finding_A_Doctor', type: 'non-technical', platform: 'Reddit',
  question: 'How can a newcomer register for the Health Care Connect program to be matched with a family doctor in Toronto?'
});
addQ({
  country: 'Canada', city: 'Mississauga', topic: 'health', category: 'Walk_In_Clinics', type: 'non-technical', platform: 'Reddit',
  question: 'Do newcomers without an OHIP card have to pay upfront when visiting a walk-in medical clinic in Mississauga?'
});
addQ({
  country: 'Canada', city: 'Vancouver', topic: 'health', category: 'Urgent_Care', type: 'non-technical', platform: 'Reddit',
  question: 'Where can someone in Vancouver go for non-life-threatening medical care on weekends without visiting an emergency room in Vancouver?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'housing', category: 'Apartment_Hunting', type: 'non-technical', platform: 'Reddit',
  question: 'What documents should a newcomer prepare in advance to show prospective landlords when viewing rental apartments in Toronto?'
});
addQ({
  country: 'Canada', city: 'Mississauga', topic: 'housing', category: 'Basement_Suites', type: 'non-technical', platform: 'Reddit',
  question: 'What are the main warning signs of an illegal basement apartment rental that newcomers should watch out for in Mississauga?'
});
addQ({
  country: 'Canada', city: 'Brampton', topic: 'housing', category: 'Roommate_Living', type: 'non-technical', platform: 'Reddit',
  question: 'What precautions should an international student take when signing a shared accommodation lease with roommates in Brampton?'
});
addQ({
  country: 'Canada', city: 'Vancouver', topic: 'housing', category: 'Heating_Comfort', type: 'non-technical', platform: 'Reddit',
  question: 'What should a tenant do if their landlord turns off the heat during cold winter months in Vancouver?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'money', category: 'Credit_Building', type: 'non-technical', platform: 'Reddit',
  question: 'How can a newcomer with zero Canadian credit history get their first secured credit card in Toronto?'
});
addQ({
  country: 'Canada', city: 'Mississauga', topic: 'money', category: 'Bank_Accounts', type: 'non-technical', platform: 'Reddit',
  question: 'Do Canadian major banks offer newcomer banking packages with free chequing accounts and fee waivers in Mississauga?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'money', category: 'Money_Transfers', type: 'non-technical', platform: 'Reddit',
  question: 'What is the safest and most cost-effective way for a newcomer to transfer savings from abroad to Canada in Toronto?'
});
addQ({
  country: 'Canada', city: 'Vancouver', topic: 'money', category: 'Tax_Filing', type: 'non-technical', platform: 'Reddit',
  question: 'Why should newcomers file a Canadian income tax return even if they had zero income during their first year in Vancouver?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'driving', category: 'Winter_Driving', type: 'non-technical', platform: 'Reddit',
  question: 'When should drivers in Ontario install winter snow tires on their cars and are they legally mandatory in Toronto?'
});
addQ({
  country: 'Canada', city: 'Mississauga', topic: 'driving', category: 'Road_Tests', type: 'non-technical', platform: 'Reddit',
  question: 'How can a driver book their Ontario G2 road test appointment online without using third-party scalper websites in Mississauga?'
});
addQ({
  country: 'Canada', city: 'Vancouver', topic: 'driving', category: 'Driving_Lessons', type: 'non-technical', platform: 'Reddit',
  question: 'Do new drivers in British Columbia get insurance discounts by completing an ICBC approved driving school course in Vancouver?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'telecom', category: 'SIM_Cards', type: 'non-technical', platform: 'Reddit',
  question: 'Where can a newcomer buy a cheap prepaid SIM card upon arrival without signing a multi-year contract in Toronto?'
});
addQ({
  country: 'Canada', city: 'Vancouver', topic: 'telecom', category: 'Home_Internet', type: 'non-technical', platform: 'Reddit',
  question: 'How long does it usually take to get home broadband internet installed in a newly rented apartment in Vancouver?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'transit', category: 'Public_Transit', type: 'non-technical', platform: 'Reddit',
  question: 'How do riders pay fares on TTC streetcars and subways using contactless credit cards or PRESTO cards in Toronto?'
});
addQ({
  country: 'Canada', city: 'Mississauga', topic: 'transit', category: 'Bus_Commuting', type: 'non-technical', platform: 'Reddit',
  question: 'Can commuters use the same PRESTO card to transfer between MiWay buses and the TTC without paying double in Mississauga?'
});
addQ({
  country: 'Canada', city: 'Vancouver', topic: 'transit', category: 'SeaBus_Commute', type: 'non-technical', platform: 'Reddit',
  question: 'How does the SeaBus ferry connect downtown Vancouver to the North Shore using Compass Card in Vancouver?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'groceries', category: 'Food_Shopping', type: 'non-technical', platform: 'Reddit',
  question: 'What are the main budget grocery supermarket chains in the Greater Toronto Area for international staples in Toronto?'
});
addQ({
  country: 'Canada', city: 'Brampton', topic: 'groceries', category: 'Ethnic_Markets', type: 'non-technical', platform: 'Reddit',
  question: 'Where can newcomers find South Asian and multicultural grocery stores with authentic spices in Brampton?'
});
addQ({
  country: 'Canada', city: 'Vancouver', topic: 'groceries', category: 'Local_Markets', type: 'non-technical', platform: 'Reddit',
  question: 'What affordable grocery stores and farmers markets are popular among newcomers in Vancouver?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'family', category: 'School_Registration', type: 'non-technical', platform: 'Reddit',
  question: 'How do newcomer parents find which public school catchment area their home address falls into in Toronto?'
});
addQ({
  country: 'Canada', city: 'Mississauga', topic: 'family', category: 'Kindergarten', type: 'non-technical', platform: 'Reddit',
  question: 'At what age can children enroll in junior kindergarten under the Peel District School Board in Mississauga?'
});
addQ({
  country: 'Canada', city: 'Vancouver', topic: 'family', category: 'Recreation_Programs', type: 'non-technical', platform: 'Reddit',
  question: 'How can parents register children for subsidized municipal swimming lessons and community center programs in Vancouver?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'employment', category: 'Resume_Style', type: 'non-technical', platform: 'LinkedIn',
  question: 'What is the standard Canadian resume format and why should job seekers omit photographs and personal dates in Toronto?'
});
addQ({
  country: 'Canada', city: 'Mississauga', topic: 'employment', category: 'Networking', type: 'non-technical', platform: 'LinkedIn',
  question: 'How can newcomer professionals connect with local industry mentors through TRIEC mentoring programs in Mississauga?'
});
addQ({
  country: 'Canada', city: 'Vancouver', topic: 'employment', category: 'Job_Fairs', type: 'non-technical', platform: 'LinkedIn',
  question: 'Where can job seekers find government-funded employment workshops and hiring events in Vancouver?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'community', category: 'Winter_Clothing', type: 'non-technical', platform: 'Reddit',
  question: 'Where can newcomer families find affordable winter jackets and boots before freezing temperatures begin in Toronto?'
});
addQ({
  country: 'Canada', city: 'Calgary', topic: 'community', category: 'Settlement_Help', type: 'non-technical', platform: 'Reddit',
  question: 'What settlement assistance does the Calgary Catholic Immigration Society provide to new permanent residents in Calgary?'
});
addQ({
  country: 'Canada', city: 'Ottawa', topic: 'community', category: 'Bilingual_Services', type: 'non-technical', platform: 'Reddit',
  question: 'Where can newcomers access bilingual English and French government settlement services in Ottawa?'
});
addQ({
  country: 'Canada', city: 'Montreal', topic: 'community', category: 'Francisation', type: 'non-technical', platform: 'Reddit',
  question: 'How do new immigrants apply for free full-time French language courses through Francisation Quebec in Montreal?'
});
addQ({
  country: 'Canada', city: 'Toronto', topic: 'community', category: 'Scam_Prevention', type: 'non-technical', platform: 'Reddit',
  question: 'How can newcomers spot common telephone scams where callers impersonate IRCC or the CRA threatening deportation in Toronto?'
});
addQ({
  country: 'Canada', city: 'Vancouver', topic: 'community', category: 'Rental_Scams', type: 'non-technical', platform: 'Reddit',
  question: 'What precautions should renters take to avoid fake landlord deposit wire transfer scams on Facebook Marketplace in Vancouver?'
});

console.log(`Generated ${newSuite.length} Canada questions.`);
fs.writeFileSync('scripts/data/non-repeated-part1.json', JSON.stringify(newSuite, null, 2), 'utf8');
