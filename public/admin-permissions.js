// Presentation only: server authorization remains authoritative.
export function permissions(session) {
  const role=session?.role;
  return {policy:role==='admin',import:role==='admin'||role==='editor',review:role==='admin'||role==='reviewer',gaps:role==='admin'||role==='editor'};
}
export function lockForm(form,allowed) {
  if(allowed)return;
  for(const control of form.querySelectorAll('input,select,textarea,button'))control.disabled=true;
  form.setAttribute('aria-label','Read-only: your role cannot perform this action');
}
export function bindIdentity(form,session) {
  if(session?.mode!=='individual')return;
  for(const label of form.querySelectorAll('label')) {
    if(!label.textContent.startsWith('Reviewer name')&&!label.textContent.startsWith('Actor label'))continue;
    const field=label.querySelector('input');if(field){field.value=session.id;field.readOnly=true;}
  }
}
