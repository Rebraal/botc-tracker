let activeMoveIndex = null;

function renderRoster() {
  const list = document.getElementById('roster-list');
  list.innerHTML = '';
  
  state.players.forEach((p, idx) => {
    let row = document.createElement('div');
    row.className = 'roster-row';
    if (activeMoveIndex === idx) row.classList.add('moving');
    
    // Tap Row to handle Seating Chart Re-arrangements
    row.onclick = (e) => {
      if (e.target.tagName === 'SPAN') return; // Don't trigger when clicking icons
      handleRowSelectAction(idx);
    };

    row.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="cursor:pointer; color:${activeMoveIndex===idx?'#00bfff':'#fff'}; font-weight:bold;">☰</span>
        <span>${p.name} ${p.traveler ? '(T)' : ''}</span>
      </div>
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="cursor:pointer; color:${p.traveler?'#00bfff':'#888'}; font-weight:bold;" onclick="toggleTravelerStatus(${idx})">Ⓣ</span>
        <span style="cursor:pointer;" onclick="deletePlayerRow(${idx})">🗑️</span>
      </div>
    `;
    list.appendChild(row);
  });
  document.getElementById('input-player-name').onkeydown = (e) => { if (e.key === 'Enter') addPlayerFromInput(); };
}

function handleRowSelectAction(idx) {
  if (activeMoveIndex === null) {
    activeMoveIndex = idx;
    updateNotification(`Moving ${state.players[idx].name}. Tap target row to swap seats.`);
  } else {
    if (activeMoveIndex !== idx) {
      let temp = state.players[activeMoveIndex];
      state.players[activeMoveIndex] = state.players[idx];
      state.players[idx] = temp;
      updateNotification("Seats swapped successfully.");
    }
    activeMoveIndex = null;
  }
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

function deletePlayerRow(idx) { state.players.splice(idx, 1); if(activeMoveIndex===idx) activeMoveIndex=null; syncUI(); persistData(); }
function toggleTravelerStatus(idx) { state.players[idx].traveler = !state.players[idx].traveler; syncUI(); persistData(); }

function triggerRestartGame() {
  state.votes = []; state.currentDay = 1; state.nominatorToday = []; state.nomineeToday = [];
  state.players.forEach(p => { p.status = 'ALIVE'; p.deadVoteUsed = false; });
  if (typeof resetNominationState === 'function') resetNominationState();
  updateNotification("Game restarted. Roster kept, data reset."); syncUI(); persistData();
}

function triggerNewGame() {
  state = { players: [], votes: [], currentDay: 1, setupMode: true, nominationState: 'IDLE', nominatorToday: [], nomineeToday: [] };
  localStorage.removeItem('botc_tracker_state'); activeMoveIndex = null;
  if (typeof resetNominationState === 'function') resetNominationState();
  setSetupMode(true); updateNotification("New game space completely wiped clean."); syncUI();
}
