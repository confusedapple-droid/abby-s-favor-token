const slots = document.getElementById('slots');
const card = document.getElementById('card');
const unlock = document.getElementById('unlock');

function flip(v){ v ? card.classList.add('flipped') : card.classList.remove('flipped'); }

function getStateFromURL(){
  const hash = location.hash.replace('#state=','');
  if(hash.length !== 6) return '000000';
  return hash;
}

function setStateToURL(state){
  location.hash = 'state=' + state;
}

function resetAll(){
  setStateToURL('000000');
  document.querySelectorAll('.favor-slot').forEach(slot=>{
    slot.classList.remove('used');
    slot.querySelector('canvas').getContext('2d')
      .clearRect(0,0,400,100);
  });
}

for(let i=1;i<=6;i++){
  slots.innerHTML += `
  <div class="favor-slot">
    <span>FAVOR #${i}</span>
    <canvas></canvas>
    <div class="used-stamp">FAVOR USED</div>
    <button class="lock-btn">Lock</button>
  </div>`;
}

function syncFromURL(){
  const state = getStateFromURL();
  document.querySelectorAll('.favor-slot').forEach((slot,i)=>{
    slot.classList.toggle('used', state[i] === '1');
  });
}
syncFromURL();

document.querySelectorAll('.favor-slot').forEach((slot,i)=>{
  const canvas = slot.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const lockBtn = slot.querySelector('.lock-btn');
  canvas.width = canvas.offsetWidth;
  canvas.height = 60;

  let drawing = false;

  function updateState(){
    let state = getStateFromURL().split('');
    state[i] = '1';
    setStateToURL(state.join(''));
  }

  function start(e){
    if(slot.classList.contains('used')) return;
    drawing = true;
    draw(e);
  }

  function end(){
    if(!drawing) return;
    drawing = false;
    ctx.beginPath();
    slot.classList.add('used');
    updateState();
  }

  function draw(e){
    if(!drawing) return;
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX||e.touches[0].clientX)-r.left;
    const y = (e.clientY||e.touches[0].clientY)-r.top;
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffd700';
    ctx.lineCap = 'round';
    ctx.lineTo(x,y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x,y);
  }

  canvas.addEventListener('mousedown',start);
  canvas.addEventListener('mousemove',draw);
  canvas.addEventListener('mouseup',end);
  canvas.addEventListener('touchstart',e=>{e.preventDefault();start(e)});
  canvas.addEventListener('touchmove',e=>{e.preventDefault();draw(e)});
  canvas.addEventListener('touchend',end);

  lockBtn.onclick = e=>{
    e.stopPropagation();
    slot.classList.add('used');
    updateState();
  };
});

unlock.addEventListener('input',()=>{
  if(unlock.value === 'Apple'){
    resetAll();
    unlock.value='';
    alert('All favors reset (global)');
  }
});

window.addEventListener('hashchange', syncFromURL);
