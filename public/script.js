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

socket.on('rank-event', function (event) {
  queue.push(event);
  runQueue();
});

socket.on('leaderboard', function (rows) {
  renderLeaderboard(rows);
});

async function runQueue() {
  if (showing || queue.length === 0) {
    return;
  }

  showing = true;

  const event = queue.shift();

  showEvent(event);

  await sleep(event.rankedUp ? 6200 : 4200);

  overlay.classList.add('hidden');

  await sleep(450);

  showing = false;

  runQueue();
}

function showEvent(event) {
  usernameEl.textContent = '@' + event.username;
  rankImg.src = event.rankImg;
  rankName.textContent = String(event.rank || '').toUpperCase();
  xpLine.textContent = '+' + event.addXp + ' XP';

  const progress = Math.max(
    0,
    Math.min(100, event.progress || 0)
  );

  progressBar.style.width = progress + '%';

  if (event.nextRank) {
    nextLine.textContent =
      event.xp + ' XP • Next: ' + event.nextRank;
  } else {
    nextLine.textContent =
      event.xp + ' XP • MAX RANK';
  }

  title.textContent = event.rankedUp
    ? 'RANK UP!'
    : eventTitle(event.type);

  actionText.textContent = event.rankedUp
    ? 'just ranked up!'
    : eventText(event.type);

  confetti.innerHTML = '';

  if (
    event.rankedUp ||
    event.rank === 'Supersonic Legend'
  ) {
    burst(
      event.rank === 'Supersonic Legend'
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
  const titles = {
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
  const messages = {
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

  leaderRows.innerHTML = (rows || [])
    .map(function (row) {
      return (
        '<div class="leader-row">' +
          '<span class="place">' +
            row.place +
          '</span>' +
          '<span class="viewer">' +
            row.username +
          '</span>' +
          '<img src="' +
            row.rankImg +
            '" alt="' +
            row.rank +
          '">' +
          '<span class="xp">' +
            row.xp +
            ' XP' +
          '</span>' +
        '</div>'
      );
    })
    .join('');
}

function burst(numberOfPieces) {
  for (let i = 0; i < numberOfPieces; i++) {
    const piece = document.createElement('i');

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

function sleep(milliseconds) {
  return new Promise(function (resolve) {
    setTimeout(resolve, milliseconds);
  });
}
