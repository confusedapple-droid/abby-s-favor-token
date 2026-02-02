export default {
  async fetch(request, env) {
    return new Response(JSON.stringify({
      status: "ok",
      service: "index.html",
      time: new Date().toISOString()
    }), {
      headers: { "content-type": "application/json" }
    });
  }
};
