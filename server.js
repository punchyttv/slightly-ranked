const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const DB_FILE = path.join(ROOT, 'data', 'viewers.json');
const CONFIG_FILE = path.join(ROOT, 'config.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(PUBLIC));

function loadConfig(){ return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); }
function loadDb(){ try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch { return {}; } }
function saveDb(db){ fs.mkdirSync(path.dirname(DB_FILE), {recursive:true}); fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }
function cleanUser(user){ return String(user || 'viewer').replace(/^@/, '').replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 32) || 'viewer'; }
function rankForXp(xp){
  const ranks = loadConfig().ranks;
  let current = ranks[0];
  for (const r of ranks) if (xp >= r.xp) current = r;
  const idx = ranks.findIndex(r => r.name === current.name);
  const next = ranks[idx+1] || null;
  return { ...current, index: idx, next };
}
function getImage(key){
  const folder = path.join(PUBLIC, 'assets', 'ranks');
  const files = fs.readdirSync(folder);
  const found = files.find(f => f.split('.')[0] === key);
  return found ? `/assets/ranks/${found}` : '';
}
function ensureViewer(db, username){
  if (!db[username]) {
    const now = new Date().toISOString();
    db[username] = { username, xp:0, totalFollows:0, totalGifts:0, totalChats:0, totalShares:0, firstSeen:now, lastSeen:now };
  }
  return db[username];
}
function applyEvent(type, username, amount){
  const config = loadConfig();
  const db = loadDb();
  username = cleanUser(username);
  const viewer = ensureViewer(db, username);
  const before = rankForXp(viewer.xp);
  const add = Number(amount ?? config.xp[type] ?? 0);
  viewer.xp += add;
  viewer.lastSeen = new Date().toISOString();
  if (type === 'follow') viewer.totalFollows += 1;
  if (type === 'gift' || type === 'rose') viewer.totalGifts += 1;
  if (type === 'chat') viewer.totalChats += 1;
  if (type === 'share') viewer.totalShares += 1;
  const after = rankForXp(viewer.xp);
  saveDb(db);
  const payload = {
    type, username, addXp:add, xp:viewer.xp,
    beforeRank: before.name, beforeKey: before.key, beforeImg: getImage(before.key),
    rank: after.name, rankKey: after.key, rankImg: getImage(after.key),
    nextRank: after.next?.name || null, nextXp: after.next?.xp || null,
    progress: after.next ? Math.round(((viewer.xp - after.xp) / (after.next.xp - after.xp)) * 100) : 100,
    rankedUp: before.name !== after.name,
    viewer
  };
  io.emit('rank-event', payload);
  return payload;
}

app.get('/', (req,res)=>res.sendFile(path.join(PUBLIC, 'dashboard.html')));
app.get('/overlay', (req,res)=>res.sendFile(path.join(PUBLIC, 'overlay.html')));
app.get('/leaderboard', (req,res)=>res.json(getLeaderboard()));
app.get('/player/:username', (req,res)=>{
  const db=loadDb(); const username=cleanUser(req.params.username); const v=db[username];
  if (!v) return res.status(404).json({error:'Player not found'});
  const r=rankForXp(v.xp); res.json({...v, rank:r.name, rankImg:getImage(r.key), nextRank:r.next?.name||null, nextXp:r.next?.xp||null});
});
app.get('/event/:type', (req,res)=>{
  const payload=applyEvent(req.params.type, req.query.user || req.query.username, req.query.xp);
  res.json({ok:true, ...payload});
});
app.post('/event/:type', (req,res)=>{
  const username = req.body.username || req.body.user || req.query.user || req.query.username;
  const amount = req.body.xp || req.body.amount || req.query.xp;
  const payload=applyEvent(req.params.type, username, amount);
  res.json({ok:true, ...payload});
});
app.get('/test', (req,res)=>{
  const users=['Noah','SlightlyFan','RocketViewer','RankedGrinder','ChatChamp'];
  const types=['follow','chat','share','rose','gift'];
  const payload=applyEvent(req.query.type || types[Math.floor(Math.random()*types.length)], req.query.user || users[Math.floor(Math.random()*users.length)], req.query.xp);
  res.json({ok:true, ...payload});
});
function getLeaderboard(){
  const db=loadDb();
  return Object.values(db).sort((a,b)=>b.xp-a.xp).slice(0,10).map((v,i)=>{ const r=rankForXp(v.xp); return {...v, place:i+1, rank:r.name, rankImg:getImage(r.key)}; });
}
app.get('/reset-demo', (req,res)=>{ saveDb({}); io.emit('reset'); res.json({ok:true}); });
io.on('connection', socket => { socket.emit('leaderboard', getLeaderboard()); });
setInterval(()=>io.emit('leaderboard', getLeaderboard()), 4000);

server.listen(PORT, () => {
  console.log('Slightly Ranked is running');
  console.log(`Dashboard: http://localhost:${PORT}`);
  console.log(`Overlay:   http://localhost:${PORT}/overlay`);
  console.log(`Test:      http://localhost:${PORT}/test`);
});
