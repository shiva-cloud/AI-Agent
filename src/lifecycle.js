// One shutdown operation owns draining, connection closure and final cleanup.
export function createShutdown(server, options = {}) {
  const safeOptions = (options && typeof options === 'object') ? options : {};
  const { cleanup = () => {}, graceMs = 15000 } = safeOptions;
  if(!Number.isInteger(graceMs)||graceMs<1||graceMs>60000)throw new Error('graceMs must be 1–60000');
  let pending;
  return function shutdown() {
    if(pending)return pending;
    server.beginDrain?.();
    pending=new Promise((resolve,reject)=>{
      const deadline=setTimeout(()=>server.closeAllConnections(),graceMs);
      deadline.unref();
      server.close(error=>{
        clearTimeout(deadline);
        try {cleanup();}catch(failure){reject(failure);return;}
        if(error && error.code!=='ERR_SERVER_NOT_RUNNING')reject(error);else resolve();
      });
      server.closeIdleConnections();
    });
    return pending;
  };
}
