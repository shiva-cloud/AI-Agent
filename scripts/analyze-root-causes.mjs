import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('scripts/scratch-user-eval-results.json', 'utf8'));

// Identify problematic cases:
// 1. Misrouted Guidance (casual/offtopic questions that got legal guidance)
// 2. Partial (where answer was held back or incomplete)
// 3. Clarification (where engine asked clarifying questions)
// 4. Unavailable (where engine refused or gave unrecognized_intent)

const groups = {
  // A. Two-country / Corridor confusion where Canada is the target but foreign country triggered clarification/unavailable
  corridorCountryGeoConfusion: [],
  // B. Express Entry / Canadian acronyms that should be recognized as Canada
  canadianAcronymOrTermsUnrecognized: [],
  // C. Processing time / timeline inquiries that got blocked
  timelineAndProcessingTimeBlocked: [],
  // D. Off-topic queries that got false guidance
  offTopicGotFalseGuidance: [],
  // E. Off-topic queries correctly marked unavailable
  offTopicUnavailable: [],
  // F. Vague forum titles ("Post ita help", "CEC - Need help")
  vagueForumTitles: [],
  // G. Legitimate immigration/settlement queries marked unavailable
  legitimateImmigrationUnavailable: [],
  // H. Partial answers that could be full guidance
  partialCouldBeGuidance: []
};

const offTopicRegex = /(?:pizza|leafs fan|loblaws.*puck|casino|oasis aqualounge|cheese|couch|mechanic.*prius|chessboxing|oil change|fruit trees|cat outside|phone cases|pokemon|fireworks|podcast|liberty for security|organizer.*single parent|samosa business|distillery ticketing|date ideas|scavenger hunt.*ttc|date for canadians|birthday gathering|danforth ave|ski trip.*alberta|fun things to do|oilsands mining|connect\?|airside transit|bag and lightstick|canadian conservatives|drone|dog fighting|psycroptic|takeout pizza|darjeeling|honeymoon|sodafit|glucolife|driftly sleep|bitstarz|survival book|survival reviews|contest|mumbai university|found cat|native edible|dentists in gta|cheap.*dentist|prius)/i;

for (const r of data) {
  const q = r.question;
  const isOffTopic = offTopicRegex.test(q);

  if (isOffTopic) {
    if (r.status === 'guidance') {
      groups.offTopicGotFalseGuidance.push({ q, sources: r.sources, claims: r.claimsCount });
    } else {
      groups.offTopicUnavailable.push({ q, status: r.status });
    }
    continue;
  }

  if (r.status === 'guidance') {
    // Check if this was a valid guidance
    continue;
  }

  if (r.status === 'partial') {
    groups.partialCouldBeGuidance.push({ q, gaps: r.gaps, sources: r.sources });
    continue;
  }

  if (r.status === 'clarification') {
    // Why did it ask for clarification?
    if (/(?:express entry|ita|crs|bowp|super visa|pnp|cec|sowp|pgwp|copr|ircc|c16|cbsa|oinp|aaip|csq|rnip)/i.test(q)) {
      groups.canadianAcronymOrTermsUnrecognized.push({ q, gaps: r.gaps, country: r.parsed?.country });
    } else if (/(?:from india|outside canada|pakistan|dubai|uae|yemen|tunisia|benin)/i.test(q)) {
      groups.corridorCountryGeoConfusion.push({ q, gaps: r.gaps, country: r.parsed?.country });
    } else {
      groups.canadianAcronymOrTermsUnrecognized.push({ q, gaps: r.gaps, country: r.parsed?.country });
    }
    continue;
  }

  if (r.status === 'unavailable') {
    if (/^(?:question|post ita help|need advice.*|hey guys.*|what should i do now|what do i pick|help me.*|urgent help.*|waste of time or what\?|please what do i do)$/i.test(q.trim())) {
      groups.vagueForumTitles.push({ q, gaps: r.gaps });
    } else if (/(?:timeline|timeline\b|processing time|aor|tracker)/i.test(q)) {
      groups.timelineAndProcessingTimeBlocked.push({ q, gaps: r.gaps });
    } else {
      groups.legitimateImmigrationUnavailable.push({ q, gaps: r.gaps, country: r.parsed?.country, intents: r.parsed?.intents });
    }
  }
}

console.log('=== ROOT CAUSE DISTRIBUTION ===');
console.log('1. Off-topic that got False Guidance (needs rejection/clean out-of-scope):', groups.offTopicGotFalseGuidance.length);
console.log('2. Canadian/Corridor Clarification Confusion (should route to Canada):', groups.canadianAcronymOrTermsUnrecognized.length + groups.corridorCountryGeoConfusion.length);
console.log('   - Canadian terms clarification:', groups.canadianAcronymOrTermsUnrecognized.length);
console.log('   - Corridor country clarification:', groups.corridorCountryGeoConfusion.length);
console.log('3. Timeline & Processing Time Blocked:', groups.timelineAndProcessingTimeBlocked.length);
console.log('4. Vague Forum Titles Refused (need helpful intake / guidance):', groups.vagueForumTitles.length);
console.log('5. Legitimate Immigration Queries Refused (Unavailable):', groups.legitimateImmigrationUnavailable.length);
console.log('6. Partial answers that could be guidance:', groups.partialCouldBeGuidance.length);

fs.writeFileSync('scripts/scratch-root-causes.json', JSON.stringify(groups, null, 2));
