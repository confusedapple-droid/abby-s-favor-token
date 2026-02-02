const slots = document.getElementById('slots');
const card = document.getElementById('card');
const unlock = document.getElementById('unlock');

function flip(v){
  v ? card.classList.add('flipped') : card.classList.remove('flipped');
}

/* ---------- CREATE SLOTS ---------- */
for(let i=1;i<=6;i++){
  slots.innerHTML += `
    <div class="favor-slot">
      <span>FAVOR #${i}</span>
      <canvas></canvas>
      <div class="used-stamp">FAVOR USED</div>
      <button class="lock-btn">Lock</button>
    </div>`;
}

/* ---------- SYNC FROM SERVER ---------- */
async function syncFromServer(){
  const res = await fetch('/');
  const { state } = await res.json();

  document.querySelectorAll('.favor-slot').forEach((slot,i)=>{
    slot.classList.toggle('used', state[i] === '1');
  });
}

syncFromServer();
setInterval(syncFromServer, 3000);

/* ---------- SLOT LOGIC ---------- */
document.querySelectorAll('.favor-slot').forEach((slot,i)=>{
  const canvas = slot.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const lockBtn = slot.querySelector('.lock-btn');

  canvas.width = canvas.offsetWidth;
  canvas.height = 60;

  let drawing = false;

  async function updateState(){
    await fetch('/use', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ index: i })
    });
  }

  function start(e){
    if(slot.classList.contains('used')) return;
    drawing = true;
    ctx.beginPath();
    draw(e);
  }

  function end(){
    if(!drawing) return;
    drawing = false;
    slot.classList.add('used');
    updateState();
  }

  function draw(e){
    if(!drawing) return;
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - r.left;
    const y = (e.clientY || e.touches[0].clientY) - r.top;

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffd700';
    ctx.lineCap = 'round';
    ctx.lineTo(x,y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x,y);
  }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', end);
  canvas.addEventListener('touchstart', e=>{e.preventDefault();start(e)});
  canvas.addEventListener('touchmove', e=>{e.preventDefault();draw(e)});
  canvas.addEventListener('touchend', end);

  lockBtn.onclick = e=>{
    e.stopPropagation();
    if(slot.classList.contains('used')) return;
    slot.classList.add('used');
    updateState();
  };
});

/* ---------- SECRET RESET ---------- */
unlock.addEventListener('input', async ()=>{
  if(unlock.value.toLowerCase() === 'apple'){
    const res = await fetch('/reset', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: unlock.value })
    });

    if(res.ok){
      unlock.value = '';
      await syncFromServer();
      alert('All favors reset (global)');
    }
  }
});
