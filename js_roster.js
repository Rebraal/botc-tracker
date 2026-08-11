function renderRoster() {
  const list = document.getElementById('roster-list');
  list.innerHTML = '';
  state.players.forEach((p, idx) => {
    let row = document.createElement('div');
    row.className = 'roster-row';
    row.dataset.index = idx;
    row.draggable = true;
    
    row.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', idx); });
    row.addEventListener('dragover', e => e.preventDefault());
    row.addEventListener('drop', handleRosterDrop);

    row.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="cursor:grab;">☰</span><span>${p.name} ${p.traveler ? '(T)' : ''}</span>
      </div>
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="cursor:pointer; color:${p.traveler?'#00bfff':'#888'};" onclick="toggleTravelerStatus(${idx})">Ⓣ</span>
        <span style="cursor:pointer;" onclick="deletePlayerRow(${idx})">🗑️</span>
      </div>
    `;
    list.appendChild(row);
  });
  document.getElementById('input-player-name').onkeydown = (e) => { if (e.key === 'Enter') addPlayerFromInput(); };
}

function handleRosterDrop(e) {
  e.preventDefault();
  let srcIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
  let targetIdx = parseInt(this.dataset.index, 10);
  if (isNaN(srcIdx) || srcIdx === targetIdx) return;
  
  let item = state.players.splice(srcIdx, 1)[0];
  state.players.splice(targetIdx, 0, item);
  syncUI();
  persistData();
}

function addPlayerFromInput() {
  let input = document.getElementById('input-player-name');
  let name = input.value.trim();
  if (!name) return;
  state.players.push({ name: name, status: 'ALIVE', deadVoteUsed: false, traveler: false });
  input.value = ''; input.focus();
  syncUI(); persistData();
}

function deletePlayerRow(idx) { state.players.splice(idx, 1); syncUI(); persistData(); }
function toggleTravelerStatus(idx) { state.players[idx].traveler = !state.players[idx].traveler; syncUI(); persistData(); }

function triggerNewGame() {
  state = { players: [], votes: [], currentDay: 1, setupMode: true, nominationState: 'IDLE' };
  localStorage.removeItem('botc_tracker_state');
  resetNominationState(); setSetupMode(true); syncUI();
}
