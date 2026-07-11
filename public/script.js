const socket = io();
const overlay = document.getElementById('overlay');
const usernameEl = document.getElementById('username');
const actionText = document.getElementById('actionText');
const rankImg = document.getElementById('rankImg');
const rankName = document.getElementById('rankName');
const xpLine = document.getElementById('xpLine');
const progressBar = document.getElementById('progressBar');
const nextLine = document.getElementById('nextLine');
const title = document.getElementById('title');
const confetti = document.getElementById('confetti');
const leaderRows = document.getElementById('leaderRows');
let queue = [];
let showing = false;

socket.on('rank-event', e => { queue.push(e); runQueue(); });
socket.on('leaderboard', rows => renderLeaderboard(rows));

async function runQueue(){
  if (showing || queue.length === 0) return;
  showing = true;
  const e = queue.shift();
  showEvent(e);
  await sleep(e.rankedUp ? 6200 : 4200);
  overlay.classList.add('hidden');
  await sleep(450);
  showing = false;
  runQueue();
}
function showEvent(e){
  usernameEl.textContent = '@' + e.username;
  rankImg.src = e.rankImg;
  rankName.textContent = e.rank.toUpperCase();
  xpLine.textContent = `+${e.addXp} XP`;
  progressBar.style.width = `${Math.max(0, Math.min(100, e.progress || 0))}%`;
  nextLine.textContent = e.nextRank ? `${e.xp} XP • Next: ${e.nextRank}` : `${e.xp} XP • MAX RANK`;
  title.textContent = e.rankedUp ? 'RANK UP!' : eventTitle(e.type);
  actionText.textContent = e.rankedUp ? 'just ranked up!' : eventText(e.type);
  confetti.innerHTML = '';
  if (e.rankedUp || e.rank === 'Supersonic Legend') burst(e.rank === 'Supersonic Legend' ? 100 : 45);
  overlay.classList.remove('hidden');
  rankImg.classList.remove('pop'); void rankImg.offsetWidth; rankImg.classList.add('pop');
}
function eventTitle(type){
  return ({follow:'NEW PLAYER', chat:'XP GAINED', share:'SHARE BONUS', rose:'ROSE BONUS', gift:'GIFT BONUS', like:'LIKE BONUS'}[type] || 'XP GAINED');
}
function eventText(type){
  return ({follow:'joined ranked!', chat:'earned chat XP!', share:'shared the live!', rose:'sent a rose!', gift:'sent a gift!', like:'dropped likes!'}[type] || 'earned XP!');
}
function renderLeaderboard(rows){
  if (!leaderRows) return;
  leaderRows.innerHTML = (rows||[]).map(r => `
    <div class="leader-row">
      <span class="place">${r.place}</span>
      <span class="viewer">${r.username}</span>
      <img src="${r.rankImg}" alt="${r.rank}">
      <span class="xp">${r.xp} XP</span>
    </div>`).join('');
}
function burst(n){
  for(let i=0;i<n;i++){
    const p=document.createElement('i');
    p.style.left=Math.random()*100+'%';
    p.style.animationDelay=Math.random()*0.35+'s';
    p.style.transform=`rotate(${Math.random()*360}deg)`;
    confetti.appendChild(p);
  }
}
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
.hidden {
  display: none !important;
}

#overlay.hidden {
  display: none !important;
}

html,
body,
#overlay {
  background: transparent !important;
  background-color: transparent !important;
}
