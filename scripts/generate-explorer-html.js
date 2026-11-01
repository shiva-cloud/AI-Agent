import { readFileSync, writeFileSync } from 'node:fs';

const qaData = JSON.parse(readFileSync('artifacts/qa-dataset.json', 'utf8'));

function buildHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Northstar Q&A Explorer — Live Verification Dashboard</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    /* Custom scrollbar and smooth transitions */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(150,150,150,0.3); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(150,150,150,0.5); }
    .tab-active { background: #3b82f6; color: white !important; font-weight: 600; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen antialiased p-3 sm:p-5 font-sans">

  <!-- Top Header -->
  <header class="max-w-7xl mx-auto mb-5 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="inline-block w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-xs font-semibold tracking-wider uppercase text-emerald-400">Live Browser Q&A Explorer</span>
          <span class="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">100 Technical Scenarios</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Northstar <span class="text-blue-400">Settlement & Immigration</span> Audit
        </h1>
        <p class="text-sm text-slate-400 mt-1">
          लाइव परीक्षण: व्यक्तिगत प्रोफाइल, फैमिली स्पॉन्सरशिप, CRS गणना, N12 बेदखली और देश-वार पुलिस क्लीयरेंस के सटीक सरकारी जवाब।
        </p>
      </div>

      <!-- Quick Metrics Counter -->
      <div class="grid grid-cols-3 gap-3 w-full md:w-auto text-center">
        <div class="bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2">
          <div class="text-2xl font-black text-emerald-400">80%</div>
          <div class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Guidance Rate</div>
        </div>
        <div class="bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2">
          <div class="text-2xl font-black text-blue-400">78.3</div>
          <div class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Avg Score / 100</div>
        </div>
        <div class="bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2">
          <div class="text-2xl font-black text-indigo-400">55</div>
          <div class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Direct & Perfect</div>
        </div>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="mt-5 pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
      <div class="relative flex-1 max-w-md">
        <input id="searchInput" type="text" placeholder="सर्च करें: mother, N12, CRS, licence, PCC, WES, rent..."
          class="w-full bg-slate-900/90 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-400 outline-none transition">
      </div>
      
      <!-- Category Pills -->
      <div id="categoryFilters" class="flex flex-wrap gap-1.5 text-xs">
        <button data-cat="all" class="cat-btn tab-active px-3 py-1.5 rounded-lg border border-slate-600 transition">All (100)</button>
        <button data-cat="Family & Parents" class="cat-btn bg-slate-800 text-slate-300 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition">Family & Parents (20)</button>
        <button data-cat="Work Experience & CRS" class="cat-btn bg-slate-800 text-slate-300 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition">Work & CRS (25)</button>
        <button data-cat="Tenancy & Housing" class="cat-btn bg-slate-800 text-slate-300 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition">Tenancy (15)</button>
        <button data-cat="Driving & Licence" class="cat-btn bg-slate-800 text-slate-300 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition">Driving (10)</button>
        <button data-cat="Multi-Country & PCC" class="cat-btn bg-slate-800 text-slate-300 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition">PCC & Multi-Country (15)</button>
        <button data-cat="Education & ECA" class="cat-btn bg-slate-800 text-slate-300 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition">Education (15)</button>
      </div>
    </div>
  </header>

  <!-- Main Dual Panel -->
  <main class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5">
    
    <!-- Left Column: Questions List -->
    <section class="lg:col-span-5 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 shadow-lg flex flex-col h-[750px]">
      <div class="px-2 py-1 mb-2 flex items-center justify-between text-xs text-slate-400 font-medium border-b border-slate-700/60 pb-2">
        <span>प्रश्न सूची (<span id="visibleCount">100</span> दिख रहे हैं)</span>
        <span>क्लिक करके विवरण देखें</span>
      </div>

      <div id="questionsList" class="flex-1 overflow-y-auto space-y-2 pr-1">
        <!-- Rendered by JS -->
      </div>
    </section>

    <!-- Right Column: Detail & Reply Inspector -->
    <section class="lg:col-span-7 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col h-[750px] overflow-y-auto" id="detailPanel">
      <div id="emptyDetailPrompt" class="m-auto text-center py-16 text-slate-400">
        <div class="text-4xl mb-3">👈</div>
        <h3 class="text-lg font-semibold text-white">कोई भी प्रश्न चुनें</h3>
        <p class="text-sm mt-1 max-w-sm">बाईं ओर किसी भी सवाल पर क्लिक करें ताकि उसका सटीक सरकारी जवाब, दावे और स्रोत यहाँ देख सकें।</p>
      </div>

      <div id="detailContent" class="hidden space-y-5">
        <!-- Header & Badges -->
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-4">
          <div class="flex items-center gap-2">
            <span id="detailId" class="text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded">ID</span>
            <span id="detailCategory" class="text-xs font-medium bg-slate-700 text-slate-300 px-2 py-0.5 rounded">Category</span>
          </div>
          <div class="flex items-center gap-2">
            <span id="detailStatus" class="text-xs font-semibold px-2.5 py-0.5 rounded-full">STATUS</span>
            <span id="detailScore" class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Score: 95</span>
          </div>
        </div>

        <!-- Scenario & Question Box -->
        <div>
          <div class="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Scenario</div>
          <h2 id="detailScenario" class="text-lg font-bold text-white mb-2"></h2>
          
          <div class="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-1">User Question Asked</div>
          <div class="bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 text-sm font-medium text-slate-200 leading-relaxed relative">
            <p id="detailQuestion"></p>
          </div>
        </div>

        <!-- System Response / Verified Claims -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="text-xs uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
              <span>🏛️ System Verified Response (सरकारी उत्तर)</span>
            </div>
            <span id="detailLatency" class="text-[11px] text-slate-400 font-mono">32 ms</span>
          </div>

          <div id="detailClaimsContainer" class="space-y-3">
            <!-- Claims rendered here -->
          </div>

          <!-- Clarification fallback if any -->
          <div id="detailClarificationBox" class="hidden bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm text-amber-200">
            <div class="font-bold mb-1">⚠️ Clarification Requested:</div>
            <p id="detailClarificationText"></p>
          </div>
        </div>

        <!-- Official Sources Cited -->
        <div>
          <div class="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
            📑 Official Authorities & Sources Cited (उद्धृत सरकारी स्रोत)
          </div>
          <div id="detailSourcesContainer" class="space-y-2">
            <!-- Sources rendered here -->
          </div>
        </div>

        <!-- Perfection Audit Note -->
        <div class="bg-slate-900/90 border border-slate-700 rounded-xl p-4 text-xs space-y-1.5">
          <div class="text-slate-300 font-semibold flex items-center gap-1.5">
            <span>🔍 Perfection & Directness Audit</span>
          </div>
          <p id="detailPerfectionAnalysis" class="text-slate-400 leading-relaxed"></p>
        </div>
      </div>
    </section>

  </main>

  <script>
    const DATASET = ${JSON.stringify(qaData)};
    let activeCategory = 'all';
    let searchQuery = '';
    let selectedId = null;

    const questionsList = document.getElementById('questionsList');
    const searchInput = document.getElementById('searchInput');
    const visibleCount = document.getElementById('visibleCount');
    const catButtons = document.querySelectorAll('.cat-btn');

    // Detail Panel Elements
    const emptyDetailPrompt = document.getElementById('emptyDetailPrompt');
    const detailContent = document.getElementById('detailContent');
    const detailId = document.getElementById('detailId');
    const detailCategory = document.getElementById('detailCategory');
    const detailStatus = document.getElementById('detailStatus');
    const detailScore = document.getElementById('detailScore');
    const detailScenario = document.getElementById('detailScenario');
    const detailQuestion = document.getElementById('detailQuestion');
    const detailLatency = document.getElementById('detailLatency');
    const detailClaimsContainer = document.getElementById('detailClaimsContainer');
    const detailClarificationBox = document.getElementById('detailClarificationBox');
    const detailClarificationText = document.getElementById('detailClarificationText');
    const detailSourcesContainer = document.getElementById('detailSourcesContainer');
    const detailPerfectionAnalysis = document.getElementById('detailPerfectionAnalysis');

    function filterDataset() {
      return DATASET.filter(item => {
        const matchesCat = activeCategory === 'all' || item.category === activeCategory;
        const qText = (item.question + ' ' + item.scenario + ' ' + item.id).toLowerCase();
        const matchesSearch = !searchQuery || qText.includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
      });
    }

    function renderList() {
      const filtered = filterDataset();
      visibleCount.textContent = filtered.length;
      questionsList.innerHTML = '';

      if (filtered.length === 0) {
        questionsList.innerHTML = '<div class="text-center py-10 text-slate-400 text-sm">कोई सवाल नहीं मिला।</div>';
        return;
      }

      filtered.forEach(item => {
        const isSelected = item.id === selectedId;
        const card = document.createElement('div');
        card.className = \`p-3 rounded-xl border transition cursor-pointer text-left \${
          isSelected 
            ? 'bg-blue-600/20 border-blue-500 shadow-md' 
            : 'bg-slate-900/60 border-slate-700/70 hover:bg-slate-700/40 hover:border-slate-600'
        }\`;

        let statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">GUIDANCE</span>';
        if (item.status === 'partial') statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">PARTIAL</span>';
        else if (item.status === 'clarification') statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">CLARIFICATION</span>';
        else if (item.status === 'unavailable') statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">UNAVAILABLE</span>';

        card.innerHTML = \`
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="font-mono text-xs font-bold text-slate-300">\${item.id}</span>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-medium text-slate-400">\${item.category}</span>
              \${statusBadge}
            </div>
          </div>
          <div class="text-xs font-semibold text-white leading-snug mb-1 line-clamp-1">\${item.scenario}</div>
          <div class="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">\${item.question}</div>
        \`;

        card.addEventListener('click', () => {
          selectedId = item.id;
          renderList();
          renderDetail(item);
        });

        questionsList.appendChild(card);
      });
    }

    function renderDetail(item) {
      emptyDetailPrompt.classList.add('hidden');
      detailContent.classList.remove('hidden');

      detailId.textContent = item.id;
      detailCategory.textContent = item.category;
      detailScenario.textContent = item.scenario;
      detailQuestion.textContent = item.question;
      detailLatency.textContent = item.latencyMs + ' ms';
      detailScore.textContent = 'Perfection: ' + item.perfectionScore + ' / 100';

      // Status Badge
      detailStatus.className = 'text-xs font-semibold px-2.5 py-0.5 rounded-full border ';
      if (item.status === 'guidance') {
        detailStatus.textContent = 'GUIDANCE (APPROVED)';
        detailStatus.className += 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      } else if (item.status === 'partial') {
        detailStatus.textContent = 'PARTIAL GUIDANCE';
        detailStatus.className += 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      } else if (item.status === 'clarification') {
        detailStatus.textContent = 'CLARIFICATION NEEDED';
        detailStatus.className += 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      } else {
        detailStatus.textContent = 'UNAVAILABLE';
        detailStatus.className += 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      }

      // Claims
      detailClaimsContainer.innerHTML = '';
      if (item.claims && item.claims.length > 0) {
        detailClarificationBox.classList.add('hidden');
        item.claims.forEach((claim, idx) => {
          const claimBox = document.createElement('div');
          claimBox.className = 'bg-slate-900 border border-slate-700/80 rounded-xl p-4 text-xs sm:text-sm text-slate-100 leading-relaxed shadow-sm';
          claimBox.innerHTML = \`
            <div class="flex items-center gap-2 mb-2 text-xs font-mono font-bold text-emerald-400">
              <span>Verified Claim #\${idx + 1}</span>
              <span class="text-slate-500">·</span>
              <span class="text-slate-400 font-sans">\${claim.status.toUpperCase()}</span>
            </div>
            <p class="text-slate-200">\${claim.text}</p>
          \`;
          detailClaimsContainer.appendChild(claimBox);
        });
      } else if (item.clarification) {
        detailClarificationBox.classList.remove('hidden');
        detailClarificationText.textContent = item.clarification;
      } else {
        detailClaimsContainer.innerHTML = '<div class="text-xs text-slate-400 italic bg-slate-900 p-3 rounded-lg border border-slate-700">ज्ञानकोश में इस विशिष्ट गणना/शर्त का सत्यापित सरकारी प्रमाण उपलब्ध नहीं है।</div>';
      }

      // Sources
      detailSourcesContainer.innerHTML = '';
      if (item.sources && item.sources.length > 0) {
        item.sources.forEach(src => {
          const srcBox = document.createElement('div');
          srcBox.className = 'bg-slate-900/60 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between gap-3 text-xs';
          srcBox.innerHTML = \`
            <div>
              <div class="font-semibold text-white mb-0.5">\${src.title}</div>
              <div class="text-[11px] text-slate-400 truncate max-w-md">\${src.url}</div>
            </div>
            <a href="\${src.url}" target="_blank" rel="noopener noreferrer"
              class="shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-medium px-3 py-1.5 rounded-lg transition text-[11px] flex items-center gap-1">
              <span>View Source</span>
              <span>↗</span>
            </a>
          \`;
          detailSourcesContainer.appendChild(srcBox);
        });
      } else {
        detailSourcesContainer.innerHTML = '<div class="text-xs text-slate-500 italic">कोई स्रोत उद्धृत नहीं।</div>';
      }

      // Audit Analysis
      detailPerfectionAnalysis.innerHTML = \`
        <strong>Rating:</strong> \${item.perfectionRating}<br>
        <strong>Analysis:</strong> \${
          item.perfectionScore >= 90 
            ? 'सिस्टम ने सरकारी कानूनों (RTA, IRCC, LTB, DriveTest) की सटीक धाराओं और प्रक्रियाओं के साथ सीधा, बिना घुमाए उत्तर दिया।' 
            : item.perfectionScore >= 75
            ? 'सिस्टम ने आधिकारिक नियामक प्राधिकरण की गाइडेंस दी है, हालांकि व्यक्तिगत गणना के लिए आधिकारिक टूल्स देखने की सिफारिश की गई है।'
            : 'प्रश्नोत्तरी में या तो क्लैरिफिकेशन की आवश्यकता है या वर्तमान में ज्ञानकोश में विशिष्ट गणना उपलब्ध नहीं है।'
        }
      \`;
    }

    // Category button click handlers
    catButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        catButtons.forEach(b => b.classList.remove('tab-active'));
        btn.classList.add('tab-active');
        activeCategory = btn.getAttribute('data-cat');
        renderList();
      });
    });

    // Search handler
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderList();
    });

    // Initial render
    renderList();
    // Select first item by default
    if (DATASET.length > 0) {
      selectedId = DATASET[0].id;
      renderList();
      renderDetail(DATASET[0]);
    }
  </script>
</body>
</html>`;
}

const html = buildHtml();
writeFileSync('public/explorer.html', html);
console.log('Saved public/explorer.html');

// Also write as an artifact in conversation artifact directory
const artifactPath = 'C:\\\\Users\\\\shiva\\\\.gemini\\\\antigravity\\\\brain\\\\37e39c42-9d23-4149-b061-4879848a1553\\\\interactive-qa-explorer.html';
writeFileSync(artifactPath, html);
console.log('Saved artifact:', artifactPath);
