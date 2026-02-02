export default {
  async fetch(request, env) {
    return new Response(JSON.stringify({
      status: "ok",
      service: "favor-cards-worker",
      time: new Date().toISOString()
    }), {
      headers: { "content-type": "application/json" }
    });
  }
};
