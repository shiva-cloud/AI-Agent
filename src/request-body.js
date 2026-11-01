export class RequestBodyError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}

export function readRequestBody(req, { maxBytes = 12000, timeoutMs = 10000 } = {}) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1 || maxBytes > 1048576 || !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 15000) throw new Error('Invalid body reader configuration');
  return new Promise((resolve, reject) => {
    let size = 0, settled = false, timer;
    const chunks = [];
    const finish = (error, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      req.off('data', data); req.off('end', end); req.off('error', failed); req.off('aborted', aborted); req.off('close', closed);
      if (error) { req.pause(); chunks.length = 0; reject(error); }
      else { chunks.length = 0; resolve(result); }
    };
    const tooLarge = () => new RequestBodyError(413, 'payload_too_large', 'Request too large');
    const data = chunk => {
      size += chunk.length;
      if (size > maxBytes) return finish(tooLarge());
      chunks.push(chunk);
    };
    const end = () => finish(null, Buffer.concat(chunks, size));
    const failed = () => finish(new RequestBodyError(400, 'invalid_request', 'Incomplete request body'));
    const aborted = () => failed();
    const closed = () => { if (!req.complete) failed(); };
    const declared = req.headers['content-length'];
    if (declared && /^\d+$/.test(declared) && Number(declared) > maxBytes) return finish(tooLarge());
    if (req.destroyed || req.aborted) return failed();
    req.on('data', data); req.once('end', end); req.once('error', failed); req.once('aborted', aborted); req.once('close', closed);
    timer = setTimeout(() => finish(new RequestBodyError(408, 'request_timeout', 'Request body timed out')), timeoutMs);
    timer.unref();
  });
}
