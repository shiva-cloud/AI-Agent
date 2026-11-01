const questions = [
  { label: 'Parent Super Visa & Income', city: 'Toronto', q: 'My mother is 62 and my father is 65. Can I sponsor both parents on a Super Visa in Toronto?' },
  { label: 'N12 1-Month Rent Compensation', city: 'Toronto', q: 'Does my landlord legally owe me one month rent compensation for N12 in Toronto?' },
  { label: 'Work Experience & CRS Points', city: 'Toronto', q: 'How many CRS points do I get with 3 years foreign experience and 1 year in Toronto?' },
  { label: 'Multi-Country PCC (India, UK, UAE)', city: 'Toronto', q: 'I lived in India for 24 years, lived in the UK for 3 years, and in Dubai UAE for 2 years. Which countries do I need Police Clearance Certificates PCC from for Canada PR in Toronto?' },
  { label: 'Indian Licence & Sarathi Road Test Bypass', city: 'Toronto', q: 'Can I exchange my Indian driving licence with a Sarathi extract in Toronto?' },
  { label: 'Medical Exam & Diabetes Admissibility', city: 'Toronto', q: 'Will type 2 diabetes cause medical inadmissibility for Canada PR in Toronto?' },
  { label: '2015 Building Rent Increase Cap', city: 'Toronto', q: 'Can my landlord raise rent by 8% in a 2015 building in Toronto?' }
];

console.log('Sending live requests to http://localhost:3000/v1/answers ...\n');

for (const item of questions) {
  const start = performance.now();
  const res = await fetch('http://localhost:3000/v1/answers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: item.q, city: item.city })
  });
  const ms = (performance.now() - start).toFixed(1);
  const data = await res.json();
  
  console.log('================================================================');
  console.log(`📌 ${item.label} [${ms} ms]`);
  console.log(`Question: "${item.q}"`);
  console.log(`HTTP Status: ${res.status} | Result Status: ${data.status}`);
  console.log(`Lead Source: ${data.sources[0]?.title || 'None'}`);
  if (data.claims?.length) {
    console.log(`Verified Claim #1:\n"${data.claims[0].text}"\n`);
  }
  if (data.claims?.length > 1) {
    console.log(`Verified Claim #2:\n"${data.claims[1].text}"\n`);
  }
  console.log(`Sources Cited (${data.sources.length}): ${data.sources.map(s => s.title).join(' | ')}`);
  console.log('');
}
