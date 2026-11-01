import {humanizeGap} from './errors.js';
import {permissions,lockForm,bindIdentity} from './admin-permissions.js';

export async function mountGapWork(container,api,token,session) {
  const allowed=permissions(session).gaps;
  const node=(tag,text)=>{const element=document.createElement(tag);if(text!==undefined)element.textContent=text;return element;};
  const section=node('section');section.append(node('h2','Gap work queue'));
  section.append(node('p',`Tracks missing-answer work, not evidence approval. ${session?.mode==='individual'?'Actor identity comes from your authenticated account.':'Actor labels are self-reported under the shared admin token.'} A regression reference records an attestation; it does not run a test.`));
  container.append(section);
  const rows=node('div'),more=node('button','Load more gaps'),status=node('p');
  status.setAttribute('role','status');more.type='button';section.append(rows,more,status);
  let cursor='';
  async function load() {
    more.disabled=true;
    try {
      const page=await api('/admin/gap-work'+(cursor?'?after='+cursor:''),undefined,token);
      for(const item of page.items)render(item);
      cursor=page.nextCursor;more.hidden=!cursor;
      if(!rows.childElementCount)status.textContent='No tracked gaps yet. New answer gaps appear here.';
    }catch(error){status.textContent=error.message;}finally{more.disabled=false;}
  }
  function render(item) {
    const card=node('article');card.className='result';rows.append(card);
    const title=node('h3',`${item.scope} · ${item.topic}`),detail=node('p',humanizeGap(item.reason));
    const count=node('p');const refresh=()=>{count.textContent=`${item.occurrences} reports · ${item.status} · revision ${item.revision} · last seen ${item.last_seen}`;};refresh();
    card.append(title,detail,count);
    const form=node('form'),fields={};
    for(const [key,label,value,choices] of [
      ['owner','Owner',item.owner],['actor','Actor label',''],['priority','Priority',item.priority,['low','normal','high','urgent']],
      ['status','Status',item.status,['open','in_progress','resolved','deferred']],['regressionRef','Regression reference (test/path.test.js)',item.regression_ref],['note','Change note (10 characters minimum)','']
    ]) {
      const wrapper=node('label',label),field=node(choices?'select':'input');
      if(choices)for(const choice of choices){const option=node('option',choice.replaceAll('_',' '));option.value=choice;field.append(option);}
      else {field.maxLength=key==='note'?1000:key==='regressionRef'?300:100;}
      field.value=value;if(['actor','note'].includes(key)){field.required=true;field.minLength=key==='note'?10:2;}
      wrapper.append(field);form.append(wrapper);fields[key]=field;
    }
    const save=node('button','Save gap'),message=node('p'),reload=node('button','Reload queue');
    save.type='submit';reload.type='button';reload.hidden=true;message.setAttribute('role','status');
    reload.addEventListener('click',()=>{rows.replaceChildren();cursor='';status.textContent='';load();});
    form.append(save,reload,message);card.append(form);
    bindIdentity(form,session);lockForm(form,allowed);
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(!allowed)return;save.disabled=true;message.textContent='Saving…';
      try {
        item=await api('/admin/gap-work/'+item.id,{revision:item.revision,...Object.fromEntries(Object.entries(fields).map(([k,f])=>[k,f.value]))},token);
        refresh();fields.note.value='';message.textContent='Saved.';reload.hidden=true;
      }catch(error){message.textContent=error.message;reload.hidden=false;}finally{save.disabled=false;}
    });
    const history=node('button','Show change history'),events=node('div');history.type='button';card.append(history,events);
    history.addEventListener('click',async()=>{
      history.disabled=true;
      try {const result=await api('/admin/gap-work/'+item.id+'/history',undefined,token);events.replaceChildren();
        for(const event of result.events)events.append(node('p',`${event.at} · ${event.actor} · ${event.note}`));
        if(!result.events.length)events.append(node('p','No lifecycle changes yet.'));
      }catch(error){events.textContent=error.message;}finally{history.disabled=false;}
    });
  }
  more.addEventListener('click',load);await load();
}
