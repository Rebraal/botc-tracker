function renderBoard() {
  const container = document.getElementById('game-board-container');
  const board = document.getElementById('game-board');
  const layer = document.getElementById('tokens-layer');
  layer.innerHTML = '';

  let w = container.offsetWidth || 360;
  let h = Math.max(w, 200 + state.players.length * 40);
  board.style.width = w + 'px';
  board.style.height = h + 'px';

  let rectTop = 40, rectLeft = 40, rectWidth = w - 80, rectHeight = h - 100;
  let tokens = [{ type: 'st', name: 'Storyteller', index: -1 }];
  state.players.forEach((p, idx) => tokens.push({ type: 'player', data: p, index: idx }));

  let perimeter = 2 * (rectWidth + rectHeight);
  let segmentLen = perimeter / tokens.length;

  tokens.forEach((t, i) => {
    let pos = getRectangularPosition(i * segmentLen, rectWidth, rectHeight, rectLeft, rectTop);
    let div = document.createElement('div');
    div.className = 'token';
    div.style.left = (pos.x - 32.5) + 'px';
    div.style.top = (pos.y - 32.5) + 'px';

    if (t.type === 'st') {
      div.classList.add('st');
      div.innerText = 'ST';
    } else {
      configurePlayerTokenNode(div, t.data, t.index);
    }
    layer.appendChild(div);
  });
  evaluateBlockLeader();
}

function getRectangularPosition(dist, rw, rh, offsetLeft, offsetTop) {
  let halfW = rw / 2;
  let perimeter = 2 * (rw + rh);
  dist = dist % perimeter;
  let x = 0, y = 0;
  let sBottom = halfW + rh, sLeft = halfW + rh + rw, sTopLeft = halfW + rh + rw + rh;

  if (dist >= 0 && dist < halfW) { x = halfW + dist; y = 0; }
  else if (dist >= halfW && dist < sBottom) { x = rw; y = dist - halfW; }
  else if (dist >= sBottom && dist < sLeft) { x = rw - (dist - sBottom); y = rh; }
  else if (dist >= sLeft && dist < sTopLeft) { x = 0; y = rh - (dist - sLeft); }
  else { x = dist - sTopLeft; y = 0; }
  return { x: x + offsetLeft, y: y + offsetTop };
}

function configurePlayerTokenNode(div, p, idx) {
  div.innerText = p.name;
  div.classList.add(p.status === 'ALIVE' ? 'alive' : 'dead');
  if (p.status === 'DEAD') div.classList.add(!p.deadVoteUsed ? 'dv-available' : 'dv-spent');
  if (p.traveler) div.classList.add('traveler');

  // Persistent Nominator Tracker Dots
  if (state.nominatorToday.includes(p.name) || state.activeNominator === p.name) {
    let d = document.createElement('div'); d.className = 'dot-nominator'; div.appendChild(d);
  }
  // Persistent Nominee Tracker Dots
  if (state.nomineeToday.includes(p.name) || state.activeNominee === p.name) {
    let d = document.createElement('div'); d.className = 'dot-nominee'; div.appendChild(d);
  }

  // Live Voting Nomination Halo Run Profiles
  if (state.nominationState !== 'IDLE') {
    if (state.activeNominator === p.name) div.classList.add('halo-nominator');
    if (state.activeNominee === p.name) div.classList.add('halo-nominee');
    if (state.activeVoters.includes(p.name)) div.classList.add('halo-voter');
  }

  // Inline Optional Role Badge Display Row
  if (p.role) {
    let rBadge = document.createElement('div');
    rBadge.className = 'role-badge';
    rBadge.innerText = p.role;
    div.appendChild(rBadge);
  }

  div.addEventListener('click', () => handleTokenClick(p, idx));
  div.addEventListener('dblclick', (e) => { e.preventDefault(); openRoleAssignPrompt(idx); });
  div.addEventListener('contextmenu', (e) => { e.preventDefault(); handleTokenLongPress(p, idx); });
  bindLifecycleTap(div, p, idx);
}

function openRoleAssignPrompt(idx) {
  let p = state.players[idx];
  let container = document.getElementById('role-input-container');
  let input = document.getElementById('input-token-role');
  let btn = document.getElementById('btn-save-role');
  
  container.style.display = 'block';
  input.value = p.role || '';
  input.focus();

  const processRoleSave = () => {
    p.role = input.value.trim();
    container.style.display = 'none';
    syncUI();
    persistData();
  };

  btn.onclick = processRoleSave;
  input.onkeydown = (e) => { if (e.key === 'Enter') processRoleSave(); };
}
