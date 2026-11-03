import {permissions,lockForm,bindIdentity} from './admin-permissions.js';
const node=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;};
function input(form,label,value='',type='text') {
  const wrapper=node('label',label),field=node(type==='textarea'?'textarea':'input');
  if(type!=='textarea')field.type=type;field.value=value;field.required=true;
  wrapper.append(field);form.append(wrapper);return field;
}
function select(form,label,options) {
  const wrapper=node('label',label),field=node('select');
  for(const [value,text] of options){const option=node('option',text);option.value=value;field.append(option);}wrapper.append(field);form.append(wrapper);return field;
}
function button(form,label){const b=node('button',label);b.className='primary';form.append(b);return b;}
function details(parent,label){const d=node('details');d.className='record';d.append(node('summary',label));parent.append(d);return d;}
function changeReport(report){
  const box=node('div');
  if(!report){box.append(node('p','Comparison unavailable: this candidate predates change tracking.'));return box;}
  box.append(node('h3',`${report.classification.replaceAll('_',' ')} · ${report.priority} review priority`));
  box.append(node('p',report.assessment));
  if(report.flags.length)box.append(node('p',`Review flags: ${report.flags.map(f=>f.replaceAll('_',' ')).join(', ')}`));
  for(const field of report.fields){box.append(node('h4',field.field),node('pre',`Before: ${field.before ?? '(not set)'}\nAfter: ${field.after ?? '(not set)'}`));}
  if(report.excerptDiff.available){
    box.append(node('p',report.excerptDiff.changed?'Changed excerpt span (unchanged outer text omitted):':'Archived excerpt is unchanged.'));
    if(report.excerptDiff.changed){
      const removed=node('del',report.excerptDiff.before || '(empty)');removed.className='diff-rem';
      const added=node('ins',report.excerptDiff.after || '(empty)');added.className='diff-add';
      box.append(removed,added);
    }
  }else box.append(node('p',report.excerptDiff.reason));
  box.append(node('p',`Potentially affected records at import: ${report.potentiallyAffectedRecordIds.join(', ') || 'none'}`));
  return box;
}

// Text copied from a web page often carries typographic quotes, non-breaking
// spaces and invisible characters; the import accepts plain English text only.
export function cleanExcerpt(text) {
  return String(text).replace(/[\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/g,'').replace(/\u00a0/g,' ')
    .replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[ \t]+\n/g,'\n').trim();
}

const STATE_LABEL={ready:'Ready to check',awaiting_approval:'Awaiting approval',blocked:'Blocked'};

// Withheld high-risk records, health and housing first. Each card takes the
// editor from the official page to a submitted candidate, and lets a reviewer
// approve that candidate in place, which is what publishes the record.
function mountPublishQueue(parent,api,token,publishing,queue,allowed,session,reload) {
  const section=node('section');section.className='editorial';parent.append(section);
  section.append(node('h2','Publish queue: withheld high-risk records'));
  section.append(node('p',`${publishing.total} approved high-risk records are hidden from public answers until an editor checks each one against its official page. Health and housing come first.`));
  const steps=node('ol');for(const step of publishing.steps)steps.append(node('li',step));section.append(steps);
  const filters=node('div');filters.className='editorial-form';section.append(filters);
  const topicsWithWork=publishing.topicOrder.filter(t=>publishing.topics[t]);
  const topic=select(filters,'Topic',topicsWithWork.map(t=>{const c=publishing.topics[t];return [t,`${t} — ${c.withheld} withheld (${c.ready} ready, ${c.awaiting_approval} awaiting approval, ${c.blocked} blocked)`];}));
  const state=select(filters,'Show',[['','All states'],['ready',STATE_LABEL.ready],['awaiting_approval',STATE_LABEL.awaiting_approval],['blocked',STATE_LABEL.blocked]]);
  const status=node('p');status.setAttribute('role','status');section.append(status);
  const list=node('div');list.setAttribute('aria-live','polite');section.append(list);
  const more=node('button','Show 20 more');more.type='button';section.append(more);
  const PAGE=20;let shown=PAGE;
  function guard(form,permission,action){
    bindIdentity(form,session);lockForm(form,allowed[permission]);
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(!allowed[permission])return;
      const b=form.querySelector('button');b.disabled=true;
      try{await action();status.textContent='Saved. Reloading the desk.';status.className='';await reload();}
      catch(e){status.textContent=e.message;status.className='warning';b.disabled=false;}
    });
  }
  function card(row){
    const box=details(list,`${row.title} · ${row.jurisdiction} · ${STATE_LABEL[row.state]}`);
    const link=node('a','Open the official page');link.href=row.url;link.target='_blank';link.rel='noopener noreferrer';
    box.append(link,node('p',`Summary shown to users: ${row.summary}`));
    const quote=node('blockquote',row.quote);box.append(node('p','The excerpt you paste must contain this exact quote:'),quote);
    box.append(node('small',`${row.id} · source ${row.sourceId ?? 'not registered'} · tier ${row.sourceTier ?? '—'} · expires ${row.expiresAt}`));
    if(row.blockers.length){const ul=node('ul');for(const b of row.blockers)ul.append(node('li',b));box.append(node('p','Fix these first:'),ul);}
    for(const id of row.pendingCandidates){
      const c=queue.candidates.find(x=>x.id===id);
      const f=node('form');f.className='editorial-form';
      if(c)f.append(node('p','Submitted excerpt:'),node('pre',c.content));
      input(f,'Reviewer name');const reason=input(f,'Evidence support, exceptions and English-quality review');
      const decision=select(f,'Decision',[['approve','Approve and publish'],['reject','Reject']]);button(f,'Save evidence decision');
      const name=f.querySelector('input');
      guard(f,'review',()=>api(`/admin/candidates/${id}/decision`,{decision:decision.value,reviewer:name.value,note:reason.value},token));
      box.append(f);
    }
    if(row.state==='ready'){
      const f=node('form');f.className='editorial-form';
      const content=input(f,'Paste the official page text that contains the quote','','textarea');content.maxLength=8000;
      const edit=node('details');edit.append(node('summary','Edit the record before submitting (optional)'));
      const draft=node('textarea');draft.value=JSON.stringify(row.draft,null,2);draft.rows=12;edit.append(draft);f.append(edit);
      button(f,'Submit excerpt for approval');
      guard(f,'import',()=>{
        const excerpt=cleanExcerpt(content.value),record=JSON.parse(draft.value);
        if(!excerpt.includes(record.quote))throw new Error('The pasted text does not contain the exact quote. Copy a larger part of the page, or correct the quote in the record if the page wording changed.');
        return api('/admin/ingestion/run',{sourceId:row.sourceId,requestKey:`publish-${row.id}-${Date.now()}`.slice(0,80),content:excerpt,record},token);
      });
      box.append(f);
    }
  }
  function render(){
    list.replaceChildren();
    const rows=publishing.rows.filter(r=>r.topic===topic.value&&(!state.value||r.state===state.value));
    list.append(node('p',`${rows.length} records`));
    for(const row of rows.slice(0,shown))card(row);
    more.hidden=rows.length<=shown;
  }
  topic.addEventListener('change',()=>{shown=PAGE;render();});state.addEventListener('change',()=>{shown=PAGE;render();});
  more.addEventListener('click',()=>{shown+=PAGE;render();});
  render();
}

export async function mountEditorial(parent,api,token,records,reload,session) {
  const allowed=permissions(session);
  // catalog/metrics/labelCatalog degrade to null on failure so the desk still
  // renders; the coverage-tasks section reports its own unavailability.
  const [registry,queue,triage,catalog,metrics,labelCatalog,publishing]=await Promise.all([api('/admin/sources',null,token),api('/admin/candidates',null,token),api('/admin/review-queue',null,token),api('/v1/coverage',null,token).catch(()=>null),api('/admin/metrics',null,token).catch(()=>null),api('/v1/topics').catch(()=>null),api('/admin/publish-queue',null,token).catch(()=>null)]);
  if(publishing)mountPublishQueue(parent,api,token,publishing,queue,allowed,session,reload);
  const dashboard=node('section');dashboard.className='editorial';
  dashboard.append(node('h2','Review priorities'),node('p',`As of ${triage.asOf} UTC · ${triage.counts.total} records · ${triage.counts.expired||0} expired · ${triage.counts.expires_soon||0} expiring within ${triage.thresholds?.expiresSoonDays ?? 7} days · ${triage.counts.pending_review||0} pending review · ${triage.counts.editor_review_needed||0} approved without an editor’s review`),node('p',triage.notice));
  parent.append(dashboard);
  const filters=node('div');filters.className='editorial-form';dashboard.append(filters);
  const flag=select(filters,'Review need',[['','All records'],...Object.keys(triage.counts).filter(k=>k!=='total').sort().map(k=>[k,k.replaceAll('_',' ')])]);
  const topic=select(filters,'Topic',[['','All topics'],...[...new Set(triage.rows.map(r=>r.topic))].sort().map(t=>[t,t])]);
  // Triage export: the filtered records currently on screen, as CSV built
  // entirely in this tab. Nothing is uploaded and nothing local is stored.
  let visibleRows=[];
  const csvCell=v=>`"${String(v ?? '').replaceAll('"','""')}"`;
  const exportBtn=node('button','Download triage CSV');exportBtn.type='button';
  const exportNote=node('small','Exports the records filtered below. Generated in this tab; never uploaded or retained.');exportNote.className='copy-note';
  dashboard.append(exportBtn,exportNote);
  exportBtn.addEventListener('click',()=>{
    const lines=[['id','title','topic','jurisdiction','risk','status','expiresAt','daysUntilExpiry','priority','reasonCode','sourceId','candidates','flags']];
    for(const r of visibleRows)lines.push([r.id,r.title,r.topic,r.jurisdiction,r.risk,r.status,r.expiresAt,r.daysUntilExpiry,r.priority,r.reasonCode,r.sourceId??'',r.candidateIds.join(' / '),r.flags.join(' / ')]);
    const csv=lines.map(cells=>cells.map(csvCell).join(',')).join('\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    const a=node('a');a.href=url;a.download='northstar-triage.csv';document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),500);
    exportNote.textContent=`Saved northstar-triage.csv with ${visibleRows.length} records. Nothing is stored by the pilot.`;
  });
  const list=node('div');list.setAttribute('aria-live','polite');dashboard.append(list);
  // The review queue ranks rows numerically: 0 suspended, 1 expired,
  // 2 expiring soon, 3 high-risk pending or bulk-approved, 4 routine. Rows render as
  // priority bands so reviewers scan urgent work first without sorting menus.
  function bandLabel(priority) {
    if (priority === 0) return 'Suspended sources';
    if (priority === 1) return 'Expired evidence';
    if (priority === 2) return `Expiring within ${triage.thresholds?.expiresSoonDays ?? 7} days`;
    if (priority === 3) return 'High risk: pending, or approved without an editor’s review';
    return 'Routine records';
  }
  function renderTriage(){
    list.replaceChildren();
    const rows=triage.rows.filter(r=>(!flag.value||r.flags.includes(flag.value))&&(!topic.value||r.topic===topic.value))
      .sort((a,b)=>a.priority-b.priority||a.title.localeCompare(b.title));
    // The export writes exactly what the filter just showed.
    visibleRows=rows;
    list.append(node('p',`${rows.length} matching records`));
    for(const priority of [0,1,2,3,4]) {
      const band=rows.filter(r=>r.priority===priority);
      if(!band.length)continue;
      const section=node('details');section.className='priority-band';
      // Urgent bands stay open; routine records collapse under their count.
      section.open=priority<4;
      section.append(node('summary',`${bandLabel(priority)} (${band.length})`));
      for(const row of band){
        const card=details(section,`${row.title} · ${row.jurisdiction} · ${row.status}`);
        // "N days remaining" only reads correctly for positive numbers; an
        // already-expired record says overdue and carries the chip as well.
        const remaining=row.daysUntilExpiry<0?`overdue by ${-row.daysUntilExpiry} day${row.daysUntilExpiry===-1?'':'s'}`:`${row.daysUntilExpiry} days remaining`;
        const dates=node('p',`${row.id} · ${row.risk} risk · Expires ${row.expiresAt} · ${remaining}`);
        if(row.daysUntilExpiry<0){const chip=node('span','Overdue');chip.className='prio';dates.append(' · ',chip);}
        card.append(dates,node('p',row.flags.map(f=>f.replaceAll('_',' ')).join(' · ')||'No triage flags'));
        card.append(node('small',`Queued: ${row.reasonCode.replaceAll('_',' ')}`));
        const actions=node('ol');for(const action of row.actions)actions.append(node('li',action));card.append(actions);
        if(row.candidateIds.length)card.append(node('p',`Pending candidates: ${row.candidateIds.join(', ')}`));
      }
      list.append(section);
    }
  }
  flag.addEventListener('change',renderTriage);topic.addEventListener('change',renderTriage);renderTriage();
  if(triage.newCandidates.length)dashboard.append(node('p',`${triage.newCandidates.length} pending candidates introduce new records. Review them in the imported-candidate queue below.`));
  // Coverage tasks: the demand-to-action bridge. Ranks topics by how many
  // cities lack a fully published record (missing counts double), then pairs
  // the ranking with the anonymous unrecognized-demand counter. Derived
  // entirely from data the pilot already publishes; nothing is stored.
  const tasksSection=node('section');tasksSection.className='editorial';
  tasksSection.append(node('h2','Coverage tasks'),node('p','Least-covered topics first, derived from the live coverage view and anonymous demand counters. Treat the top row as the next import target in the source registry below.'));
  const taskNote=node('small','Aggregate counters only — no question text is retained anywhere. Demand metrics reset on server restart.');
  taskNote.className='copy-note';
  tasksSection.append(taskNote);
  if(!catalog||!metrics) {
    tasksSection.append(node('p','Coverage tasks unavailable this session — the underlying data did not answer. Reload the desk to retry.'));
  } else {
    const labelById=new Map((labelCatalog?.topics??[]).map(t=>[t.id,t.label]));
    // Gap weight per city: missing = 2 (no guidance at all), needing review or
    // refresh = 1. A higher total weight is the more urgent import target.
    const scoreOf={missing:2,review_or_refresh_needed:1};
    const citiesOrder=catalog.coverage.map(c=>c.city);
    const byTopic=new Map();
    for(const cityData of catalog.coverage) {
      for(const row of cityData.topics) {
        const entry=byTopic.get(row.topic)??{topic:row.topic,cityStatus:new Map()};
        entry.cityStatus.set(cityData.city,row.status);
        byTopic.set(row.topic,entry);
      }
    }
    const ranking=[...byTopic.values()]
      .map(entry=>{
        let gaps=0;
        for(const s of entry.cityStatus.values())gaps+=scoreOf[s]??0;
        return {...entry,gaps};
      })
      .sort((a,b)=>b.gaps-a.gaps||a.topic.localeCompare(b.topic))
      .filter(r=>r.gaps>0)
      .slice(0,5);
    const taskList=node('ol');taskList.className='task-list';
    for(const rank of ranking) {
      const perCity=citiesOrder.map(c=>`${c}: ${(rank.cityStatus.get(c)??'missing').replaceAll('_',' ')}`).join(' · ');
      taskList.append(node('li',`${labelById.get(rank.topic)??rank.topic} — gap weight ${rank.gaps} of ${citiesOrder.length*2}. ${perCity}.`));
    }
    if(taskList.children.length)tasksSection.append(taskList);
    else tasksSection.append(node('p','Every topic currently carries source guidance in every pilot city. Watch the demand counter below instead.'));
    const unmet=metrics.unrecognizedIntent?.total??0;
    tasksSection.append(node('p',`${unmet} question${unmet===1?'':'s'} since this server started named something outside the pilot's coverage. That demand counter is anonymous and resets on restart — it captures intent this coverage ranking cannot see.`));
  }
  parent.append(tasksSection);
  const section=node('section');section.className='editorial';
  section.append(node('h2','Source registry and evidence imports'),node('p','Manual English excerpts only. Imported summaries stay out of public answers until reviewed.'));
  parent.append(section);
  const status=node('p');status.setAttribute('role','status');section.append(status);
  function submit(form,action,permission='review'){bindIdentity(form,session);lockForm(form,allowed[permission]);form.addEventListener('submit',async event=>{event.preventDefault();if(!allowed[permission])return;const b=form.querySelector('button');b.disabled=true;try{await action();await reload();}catch(e){status.textContent=e.message;status.className='warning';b.disabled=false;}});}

  const register=details(section,'Register a source after reviewing its access policy');
  const sourceForm=node('form');sourceForm.className='editorial-form';register.append(sourceForm);
  const id=input(sourceForm,'Source ID'),url=input(sourceForm,'Canonical HTTPS URL','','url'),owner=input(sourceForm,'Source owner');
  const tier=select(sourceForm,'Authority tier',[['A','A — Government authority'],['B','B — Public or regulated institution'],['C','C — Verified nonprofit'],['D','D — Context only']]);
  const reviewer=input(sourceForm,'Reviewer name'),note=input(sourceForm,'Document permission to store an excerpt');
  button(sourceForm,'Register for manual imports');
  submit(sourceForm,()=>api('/admin/sources',{id:id.value,url:url.value,owner:owner.value,tier:tier.value,language:'en',reviewer:reviewer.value,note:note.value},token),'policy');

  const sources=details(section,`${registry.sources.length} registered sources — inspect permissions`);
  for(const source of registry.sources) {
    const card=node('article');card.className='source';const link=node('a',source.owner);link.href=source.url;link.target='_blank';link.rel='noopener noreferrer';
    card.append(link,node('p',`${source.id} · ${source.tier} · ${source.policy}`),node('small',source.note));
    if(source.policy==='unreviewed') {
      const form=node('form');form.className='editorial-form';const name=input(form,'Reviewer name'),reason=input(form,'Permission and access-policy rationale');
      const level=select(form,'Reviewed source tier',[['A','A — Government'],['B','B — Public/regulated'],['C','C — Nonprofit'],['D','D — Context only']]);
      button(form,'Confirm manual excerpt permission');submit(form,()=>api(`/admin/sources/${source.id}/policy`,{reviewer:name.value,note:reason.value,tier:level.value},token),'policy');card.append(form);
    }
    if(!source.suspended) {
      const form=node('form');form.className='editorial-form';const name=input(form,'Reviewer name'),reason=input(form,'Reason to suspend this source and withdraw its active guidance');
      button(form,'Suspend source and withdraw guidance');submit(form,()=>api(`/admin/sources/${source.id}/suspend`,{reviewer:name.value,note:reason.value},token),'policy');card.append(form);
    }
    sources.append(card);
  }
  const intake=details(section,'Import an English evidence excerpt');
  const form=node('form');form.className='editorial-form';intake.append(form);
  const available=registry.sources.filter(s=>s.policy==='manual_permitted');
  if(!available.length) {intake.append(node('p','Review a source access policy before importing evidence.'));}
  else {
    const source=select(form,'Permitted source',available.map(s=>[s.id,`${s.owner} — ${s.id}`]));
    const key=input(form,'Unique import key',`import-${Date.now()}`);
    const content=input(form,'Exact English source excerpt','','textarea');content.maxLength=8000;
    const draft=input(form,'Proposed evidence record (English JSON)','','textarea');
    const draftNote=node('small');draftNote.className='draft-note';form.append(draftNote);
    // Live pre-flight for the draft record: the same shape and date rules the
    // server enforces, surfaced while typing. It never replaces the server's
    // full policy, review-gate and English-only checks at import time.
    const validateDraft=()=>{
      const text=draft.value.trim();
      if(!text){draftNote.textContent='The proposed record JSON is filled in automatically; edit it or paste your own.';return;}
      try {
        const candidate=JSON.parse(text);
        const missing=['id','topic','jurisdiction','title','summary','quote','risk','language','checkedAt','expiresAt']
          .filter(k=>typeof candidate[k]!=='string'||!candidate[k].trim());
        if(missing.length){draftNote.textContent=`JSON reads, but ${missing.length===1?'this field is':'these fields are'} missing or empty: ${missing.join(', ')}.`;return;}
        const badDate=['checkedAt','expiresAt'].filter(k=>!/^\d{4}-\d{2}-\d{2}$/.test(candidate[k]));
        if(badDate.length){draftNote.textContent=`${badDate.join(' and ')} must be calendar dates like 2026-12-31.`;return;}
        if(!['high','medium','low'].includes(candidate.risk)){draftNote.textContent='risk must be high, medium or low.';return;}
        if(candidate.expiresAt<=candidate.checkedAt){draftNote.textContent='expiresAt must be after checkedAt.';return;}
        draftNote.textContent='Draft JSON reads as a complete record. The server still applies its full policy and English review at import.';
      } catch(e) {draftNote.textContent=`JSON problem: ${e.message}. Check for missing commas or brackets.`;}
    };
    draft.addEventListener('input',validateDraft);validateDraft();
    const fill=()=>{
      const selected=available.find(s=>s.id===source.value),existing=records.find(r=>r.url===selected.url);
      const base=existing?{...existing}:{id:'new-evidence',topic:'community',jurisdiction:'CA',title:'Source title',url:selected.url,summary:'Write a source-supported English summary.',quote:'Exact quote from the source excerpt.',risk:'low',language:'en',checkedAt:new Date().toISOString().slice(0,10),expiresAt:new Date(Date.now()+7*86400000).toISOString().slice(0,10),effectiveFrom:null,effectiveTo:null};
      delete base.sourceId;delete base.snapshotId;delete base.reviewedAt;delete base.reviewMethod;base.status='pending';draft.value=JSON.stringify(base,null,2);
    };
    source.addEventListener('change',fill);fill();
    button(form,'Submit for evidence review');submit(form,()=>api('/admin/ingestion/run',{sourceId:source.value,requestKey:key.value,content:content.value,record:JSON.parse(draft.value)},token),'import');
  }
  const pending=queue.candidates.filter(c=>c.status==='pending');
  const review=details(section,`${pending.length} imported candidates awaiting review`);
  for(const c of pending) {
    const card=node('article');card.className='source';card.append(node('h3',c.record.title),node('p',c.record.summary),node('p',`Quote: ${c.record.quote}`),node('small',`Snapshot ${c.snapshot_id} · SHA-256 ${c.content_hash}`));
    const excerpt=node('pre',c.content);card.append(excerpt);
    card.append(changeReport(c.changeReport));
    const previous=records.find(r=>r.id===c.record_id);card.append(node('p',previous?`Currently published summary: ${previous.summary}`:'This is a new evidence record.'));
    const f=node('form');f.className='editorial-form';const name=input(f,'Reviewer name'),reason=input(f,'Evidence support, exceptions and English-quality review');
    const decision=select(f,'Decision',[['reject','Reject'],['approve','Approve and publish']]);button(f,'Save evidence decision');
    submit(f,()=>api(`/admin/candidates/${c.id}/decision`,{decision:decision.value,reviewer:name.value,note:reason.value},token));card.append(f);review.append(card);
  }
  const changeHistory=details(section,'Import change history');
  for(const c of queue.candidates){const event=details(changeHistory,`${c.record.title} · ${c.status} · ${c.created_at}`);event.append(changeReport(c.changeReport));}
  const versions=details(section,'Inspect published version history');
  const historyForm=node('form');historyForm.className='editorial-form';const recordId=select(historyForm,'Evidence record',records.map(r=>[r.id,r.title]));button(historyForm,'Load version history');versions.append(historyForm);const output=node('div');versions.append(output);
  historyForm.addEventListener('submit',async e=>{
    e.preventDefault();const selectedId=recordId.value;
    try{
      const state=await api(`/admin/records/${selectedId}/history`,null,token);
      output.replaceChildren(node('h3','Current evidence'),node('p',state.currentRecord.summary),node('small',`Status: ${state.currentRecord.status} · Source checked ${state.currentRecord.checkedAt} · Expires ${state.currentRecord.expiresAt}`));
      if(!state.versions.length)output.append(node('p','No imported publication versions. Original research seeds have no archived source snapshots.'));
      for(const v of state.versions){
        const card=node('article');card.className='source';
        card.append(node('h3',`Publication ${v.id}`),node('p',v.record.summary),node('small',`${v.at} · Snapshot ${v.snapshot_id} · Expires ${v.record.expiresAt}`));
        const restoreForm=node('form');restoreForm.className='editorial-form';
        const name=input(restoreForm,'Reviewer name'),reason=input(restoreForm,'Why this previous version is accurate and appropriate now');
        const requestKey=`restore-${crypto.randomUUID()}`;
        button(restoreForm,'Restore this reviewed version');
        submit(restoreForm,()=>api(`/admin/records/${selectedId}/restore`,{publicationId:v.id,expectedHash:state.currentHash,requestKey,reviewer:name.value,note:reason.value},token));
        card.append(restoreForm);output.append(card);
      }
      output.append(node('h3','Restoration audit'));
      for(const event of state.restorations)output.append(node('p',`Restored publication ${event.target_publication_id} · ${event.reviewer} · ${event.at} · ${event.note}`));
    }catch(error){output.textContent=error.message;}
  });
}
