const COLS = 28, ROWS = 21, CELL = 20;
const canvas = document.getElementById('spelplan');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');

let s1, s2, d1, nd1, d2, nd2, mat, bonus, bTimer, p1, p2, loop, state, pausad;

function startaSpel() {
  clearInterval(loop);
  pausad = false;
  s1 = [{x:7,y:10},{x:6,y:10},{x:5,y:10}];
  s2 = [{x:21,y:10},{x:22,y:10},{x:23,y:10}];
  d1 = nd1 = {x:1,y:0};
  d2 = nd2 = {x:-1,y:0};
  p1 = p2 = 0;
  mat = nyPos(); bonus = null; bTimer = 0;
  gomOverlay(); sattStatus('SPELAR'); state = 'kor';
  loop = setInterval(tick, getInterval());
}

function vaxlaPaus() {
  if (!['kor','paus'].includes(state)) return;
  pausad = !pausad;
  if (pausad) { clearInterval(loop); state = 'paus'; visaOverlay('PAUS','',false); }
  else { gomOverlay(); state = 'kor'; loop = setInterval(tick, getInterval()); sattStatus('SPELAR'); }
}

function getInterval() {
  return [200,150,110,80,55][(document.getElementById('hastighet')?.value || 3) - 1];
}

function uppdateraHastighet() {
  if (state === 'kor') { clearInterval(loop); loop = setInterval(tick, getInterval()); }
}

function tick() {
  d1 = nd1; d2 = nd2;
  const h1 = {x:(s1[0].x+d1.x+COLS)%COLS, y:(s1[0].y+d1.y+ROWS)%ROWS};
  const h2 = {x:(s2[0].x+d2.x+COLS)%COLS, y:(s2[0].y+d2.y+ROWS)%ROWS};

  const dead1 = krock(h1,s1) || s2.some(s=>s.x===h1.x&&s.y===h1.y);
  const dead2 = krock(h2,s2) || s1.some(s=>s.x===h2.x&&s.y===h2.y);
  const kol   = h1.x===h2.x && h1.y===h2.y;

  if (dead1||dead2||kol) {
    clearInterval(loop); state = 'slut'; rita();
    const msg = (kol||dead1&&dead2) ? 'OAVGJORT!' : (dead1 ? namnP2() : namnP1()) + ' VINNER!';
    setTimeout(() => visaOverlay('GAME OVER', msg, true), 500);
    return;
  }

  const a1=hit(h1,mat), a2=hit(h2,mat), b1=bonus&&hit(h1,bonus), b2=bonus&&hit(h2,bonus);
  s1.unshift(h1); if(!a1&&!b1) s1.pop();
  s2.unshift(h2); if(!a2&&!b2) s2.pop();
  if(a1){p1+=10; mat=nyPos();} if(a2){p2+=10; mat=nyPos();}
  if(b1){p1+=25; bonus=null;}  if(b2){p2+=25; bonus=null;}
  if(--bTimer<=0) bonus=null;
  if(!bonus&&Math.random()<0.008){bonus=nyPos(); bTimer=60;}
  uppdateraPoang(); rita();
}

const hit = (a,b) => b && a.x===b.x && a.y===b.y;
const krock = (h,s) => s.slice(0,-1).some(c=>c.x===h.x&&c.y===h.y);

function nyPos() {
  let p;
  do { p={x:Math.floor(Math.random()*COLS), y:Math.floor(Math.random()*ROWS)}; }
  while([...s1,...s2].some(s=>s.x===p.x&&s.y===p.y));
  return p;
}

function rita() {
  ctx.fillStyle='#0f150f'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle='rgba(255,255,255,0.03)'; ctx.lineWidth=0.5;
  for(let x=0;x<=COLS;x++){ctx.beginPath();ctx.moveTo(x*CELL,0);ctx.lineTo(x*CELL,ROWS*CELL);ctx.stroke();}
  for(let y=0;y<=ROWS;y++){ctx.beginPath();ctx.moveTo(0,y*CELL);ctx.lineTo(COLS*CELL,y*CELL);ctx.stroke();}
  ritaOrm(s1,'#1dff6e','#0f6e35',d1);
  ritaOrm(s2,'#37d4ff','#0a4a5a',d2);
  ritaMat(mat);
  if(bonus) ritaBonus(bonus);
}

function ritaCell(x,y,f){
  ctx.fillStyle=f; ctx.beginPath();
  ctx.roundRect(x*CELL+1,y*CELL+1,CELL-2,CELL-2,3); ctx.fill();
}

function ritaOrm(s,kf,hf,d){
  s.forEach((c,i)=>ritaCell(c.x,c.y,i===0?hf:kf));
  const cx=s[0].x*CELL+CELL/2, cy=s[0].y*CELL+CELL/2;
  const ex=cx+d.x*4, ey=cy+d.y*4, ox=d.y*3, oy=d.x*3;
  ctx.fillStyle='rgba(255,255,255,0.85)';
  [1,-1].forEach(t=>{ctx.beginPath();ctx.arc(ex+ox*t,ey-oy*t,2.5,0,Math.PI*2);ctx.fill();});
  ctx.fillStyle='#111';
  [1,-1].forEach(t=>{ctx.beginPath();ctx.arc(ex+ox*t+d.x,ey-oy*t+d.y,1.2,0,Math.PI*2);ctx.fill();});
}

function ritaMat(p){
  ctx.fillStyle=ctx.shadowColor='#ff4545'; ctx.shadowBlur=8;
  ctx.beginPath(); ctx.arc(p.x*CELL+CELL/2,p.y*CELL+CELL/2,CELL/2-2,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur=0; ctx.fillStyle='rgba(255,255,255,0.35)';
  ctx.beginPath(); ctx.arc(p.x*CELL+CELL/2-2,p.y*CELL+CELL/2-3,3,0,Math.PI*2); ctx.fill();
}

function ritaBonus(p){
  const cx=p.x*CELL+CELL/2, cy=p.y*CELL+CELL/2;
  ctx.fillStyle='#ffb830'; ctx.globalAlpha=0.85+0.15*Math.sin(Date.now()/150);
  ctx.shadowColor='#ffb830'; ctx.shadowBlur=10; ctx.beginPath();
  for(let i=0;i<5;i++){
    const a=(i*4-1)*Math.PI/5-Math.PI/2, b=a+Math.PI/5;
    i===0?ctx.moveTo(cx+7*Math.cos(a),cy+7*Math.sin(a)):ctx.lineTo(cx+7*Math.cos(a),cy+7*Math.sin(a));
    ctx.lineTo(cx+3.5*Math.cos(b),cy+3.5*Math.sin(b));
  }
  ctx.closePath(); ctx.fill(); ctx.globalAlpha=1; ctx.shadowBlur=0;
}

const uppdateraPoang = () => {
  document.getElementById('poang1').textContent = p1;
  document.getElementById('poang2').textContent = p2;
};
const sattStatus = t => { const e=document.getElementById('status'); if(e) e.textContent=t; };
const namnP1 = () => document.getElementById('namn1')?.textContent || 'SPELARE 1';
const namnP2 = () => document.getElementById('namn2')?.textContent || 'SPELARE 2';

function visaOverlay(titel, text, knapp) {
  document.getElementById('overlay-titel').textContent = titel;
  document.getElementById('overlay-text').textContent  = text;
  document.getElementById('overlay-knapp').style.display = knapp ? 'block' : 'none';
  overlay.style.display = 'flex';
}
const gomOverlay = () => { overlay.style.display = 'none'; };

document.addEventListener('keydown', e => {
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
  if(state !== 'kor') return;
  const map = {
    'w':{x:0,y:-1},'s':{x:0,y:1},'a':{x:-1,y:0},'d':{x:1,y:0},
    'W':{x:0,y:-1},'S':{x:0,y:1},'A':{x:-1,y:0},'D':{x:1,y:0},
    'ArrowUp':{x:0,y:-1},'ArrowDown':{x:0,y:1},'ArrowLeft':{x:-1,y:0},'ArrowRight':{x:1,y:0}
  };
  const r = map[e.key];
  if(!r) return;
  const wasWASD = ['w','s','a','d','W','S','A','D'].includes(e.key);
  if(wasWASD && !(r.x===-d1.x&&r.y===-d1.y)) nd1=r;
  if(!wasWASD && !(r.x===-d2.x&&r.y===-d2.y)) nd2=r;
});