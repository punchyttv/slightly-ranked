var socket = io();

var overlay = document.getElementById('overlay');
var usernameEl = document.getElementById('username');
var actionText = document.getElementById('actionText');
var rankImg = document.getElementById('rankImg');
var rankName = document.getElementById('rankName');
var xpLine = document.getElementById('xpLine');
var progressBar = document.getElementById('progressBar');
var nextLine = document.getElementById('nextLine');
var title = document.getElementById('title');
var confetti = document.getElementById('confetti');
var leaderRows = document.getElementById('leaderRows');

var queue = [];
var showing = false;

socket.on('connect', function () {
  console.log('Slightly Ranked overlay connected');
});

socket.on('rank-event', function (eventData) {
  queue.push(eventData);
  runQueue();
});

socket.on('leaderboard', function (rows) {
  renderLeaderboard(rows);
});

socket.on('reset', function () {
  queue = [];
  showing = false;

  if (overlay) {
    overlay.classList.add('hidden');
  }

  if (leaderRows) {
    leaderRows.innerHTML = '';
  }
});

function runQueue() {
  if (showing || queue.length === 0) {
    return;
  }

  showing = true;

  var eventData = queue.shift();

  showEvent(eventData);

  var displayTime = eventData.rankedUp ? 6200 : 4200;

  setTimeout(function () {
    overlay.classList.add('hidden');

    setTimeout(function () {
      showing = false;
      runQueue();
    }, 450);
  }, displayTime);
}

function showEvent(eventData) {
  var viewerName = eventData.username || 'viewer';
  var currentRank = eventData.rank || 'Unranked';
  var gainedXp = Number(eventData.addXp || 0);
  var totalXp = Number(eventData.xp || 0);
  var progress = Number(eventData.progress || 0);

  usernameEl.textContent = '@' + viewerName;

  title.textContent = eventData.rankedUp
    ? 'RANK UP!'
    : eventTitle(eventData.type);

  actionText.textContent = eventData.rankedUp
    ? 'just ranked up!'
    : eventText(eventData.type);

  rankName.textContent = String(currentRank).toUpperCase();
  xpLine.textContent = '+' + gainedXp + ' XP';

  if (eventData.rankImg) {
    rankImg.src = eventData.rankImg;
    rankImg.style.display = 'block';
    rankImg.style.visibility = 'visible';
  } else {
    rankImg.removeAttribute('src');
    rankImg.style.display = 'none';
  }

  if (progress < 0) {
    progress = 0;
  }

  if (progress > 100) {
    progress = 100;
  }

  progressBar.style.width = progress + '%';

  if (eventData.nextRank) {
    nextLine.textContent =
      totalXp + ' XP • Next: ' + eventData.nextRank;
  } else {
    nextLine.textContent =
      totalXp + ' XP • MAX RANK';
  }

  confetti.innerHTML = '';

  if (
    eventData.rankedUp ||
    currentRank === 'Supersonic Legend'
  ) {
    burst(
      currentRank === 'Supersonic Legend'
        ? 100
        : 45
    );
  }

  overlay.classList.remove('hidden');

  rankImg.classList.remove('pop');
  void rankImg.offsetWidth;
  rankImg.classList.add('pop');
}

function eventTitle(type) {
  var titles = {
    follow: 'NEW PLAYER',
    chat: 'XP GAINED',
    share: 'SHARE BONUS',
    rose: 'ROSE BONUS',
    gift: 'GIFT BONUS',
    like: 'LIKE BONUS'
  };

  return titles[type] || 'XP GAINED';
}

function eventText(type) {
  var messages = {
    follow: 'joined ranked!',
    chat: 'earned chat XP!',
    share: 'shared the live!',
    rose: 'sent a rose!',
    gift: 'sent a gift!',
    like: 'dropped likes!'
  };

  return messages[type] || 'earned XP!';
}

function renderLeaderboard(rows) {
  if (!leaderRows) {
    return;
  }

  if (!Array.isArray(rows)) {
    rows = [];
  }

  var html = '';

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];

    var place =
      row.place !== undefined && row.place !== null
        ? row.place
        : i + 1;

    var viewerName = row.username || 'viewer';
    var xp = Number(row.xp || 0);
    var rank = row.rank || 'Unranked';
    var rankImage = row.rankImg || '';

    html += '<div class="leader-row">';

    html +=
      '<span class="place">' +
      escapeHtml(String(place)) +
      '</span>';

    html +=
      '<span class="viewer">' +
      escapeHtml(viewerName) +
      '</span>';

    if (rankImage) {
      html +=
        '<img src="' +
        escapeHtml(rankImage) +
        '" alt="' +
        escapeHtml(rank) +
        '">';
    } else {
      html += '<span class="rank-placeholder"></span>';
    }

    html +=
      '<span class="xp">' +
      escapeHtml(String(xp)) +
      ' XP</span>';

    html += '</div>';
  }

  leaderRows.innerHTML = html;
}

function burst(numberOfPieces) {
  for (var i = 0; i < numberOfPieces; i++) {
    var piece = document.createElement('i');

    piece.style.left =
      Math.random() * 100 + '%';

    piece.style.animationDelay =
      Math.random() * 0.35 + 's';

    piece.style.transform =
      'rotate(' +
      Math.random() * 360 +
      'deg)';

    confetti.appendChild(piece);
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
