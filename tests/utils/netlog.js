export function getStatus(res) {
  try {
    const v = res && res.status;
    return typeof v === 'function' ? v.call(res) : v;
  } catch { return undefined; }
}

export function getUrl(res) {
  try {
    return typeof res.url === 'function' ? res.url() : res.url;
  } catch { return undefined; }
}

export function attachLogging(page, logFn = console.log) {
  page.on('console', (msg) => {
    if (['error'].includes(msg.type())) logFn(`[console.${msg.type()}] ${msg.text()}`);
  });
  
  page.on('pageerror', (err) => logFn(`[pageerror] ${err?.message || err}`));
  
  page.on('response', (res) => {
    const s = getStatus(res);
    if (s >= 500) logFn(`[response ${s}] ${getUrl(res)}`);
  });
  
  page.on('requestfailed', (req) => {
    logFn(`[requestfailed] ${req.failure()?.errorText} :: ${req.url()}`);
  });
}

