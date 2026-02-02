export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Get current favor state
    if (request.method === 'GET') {
      const state = await env.FAVORS.get('state') || '000000';
      return json({ state });
    }

    // Mark a favor as used
    if (request.method === 'POST' && url.pathname === '/use') {
      const { index } = await request.json();
      let state = (await env.FAVORS.get('state')) || '000000';
      state = state.split('');
      state[index] = '1';
      await env.FAVORS.put('state', state.join(''));
      return json({ ok: true });
    }

    // Reset all favors (SECRET CODE)
    if (request.method === 'POST' && url.pathname === '/reset') {
      const { code } = await request.json();
      if (code.toLowerCase() !== 'apple') {
        return json({ error: 'wrong code' }, 403);
      }
      await env.FAVORS.put('state', '000000');
      return json({ ok: true });
    }

    return new Response('Not Found', { status: 404 });
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}
