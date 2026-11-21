let csrfToken = null;

async function loadCsrf() {
  const res = await fetch('/api/csrf', { credentials: 'same-origin' });
  csrfToken = (await res.json()).data.csrfToken;
}

// Returns data, or throws an Error whose message is shown to the user.
export async function api(method, path, body) {
  if (method !== 'GET' && !csrfToken) await loadCsrf();
  const options = { method, credentials: 'same-origin', headers: {} };
  if (method !== 'GET') options.headers['X-CSRF-Token'] = csrfToken;
  if (body !== undefined) options.body = JSON.stringify(body);
  const res = await fetch('/api' + path, options);
  const json = await res.json();
  if (json.error) {
    if (json.error.code === 'csrf') csrfToken = null;
    throw new Error(json.error.message);
  }
  if (json.data && json.data.csrfToken) csrfToken = json.data.csrfToken;
  return json.data;
}
