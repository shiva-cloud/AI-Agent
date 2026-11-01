// Deliberately memory-only: no form values are persisted or transmitted.
export function mountAppLifecycle(win = window, doc = document) {
  let dirty = false, registration, updateReady = false;
  const changed = event => {
    if (event.target?.matches?.('input:not([type=button]):not([type=submit]),textarea,select')) dirty = true;
  };
  doc.addEventListener('input', changed);
  doc.addEventListener('change', changed);
  win.addEventListener('beforeunload', event => {
    if (dirty) { event.preventDefault(); event.returnValue = ''; }
  });
  const banner = doc.createElement('aside');
  banner.className = 'app-update-notice';
  banner.hidden = true;
  banner.setAttribute('role', 'status');
  const text = doc.createElement('span');
  text.textContent = 'An updated version is ready. Export any work you want to keep before reloading.';
  const reload = doc.createElement('button');
  reload.type = 'button'; reload.textContent = 'Update and reload';
  const later = doc.createElement('button');
  later.type = 'button'; later.textContent = 'Later';
  banner.append(text, reload, later);doc.body.append(banner);
  later.addEventListener('click', () => { banner.hidden = true; });
  reload.addEventListener('click', () => {
    if (dirty && !win.confirm('Reloading will discard entries in this tab. Export your work first. Reload now?')) return;
    dirty = false;
    if (registration?.waiting) {
      updateReady = true;
      registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});
    } else win.location.reload();
  });
  if (!win.navigator.serviceWorker) return;
  const workers = win.navigator.serviceWorker;
  workers.addEventListener('controllerchange', () => {
    if (updateReady) win.location.reload();
  });
  const register = async () => {
    try {
      registration = await workers.register('/sw.js');
      if (registration.waiting) banner.hidden = false;
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && workers.controller) banner.hidden = false;
        });
      });
    } catch { /* Offline use is optional; normal navigation still works. */ }
  };
  if (doc.readyState === 'complete') void register();
  else win.addEventListener('load', register, {once:true});
}
