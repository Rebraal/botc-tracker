let activeMoveIndex = null;

function renderRoster() {
  const list = document.getElementById('roster-list');
  list.innerHTML = '';
  
  state.players.forEach((p, idx) => {
    let row = document.createElement('div');
    row.className = 'roster-row';
    row.dataset.index = idx;
    if (activeMoveIndex === idx) row.classList.add('moving');
    
    row.onclick = (e) => {
      if (e.target.tagName === 'SPAN' || e.target.classList.contains('drag-handle')) return;
      handleRowSelectAction(idx);
    };

    row.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px; width:60%; pointer-events:none;">
        <span class="drag-handle" style="cursor:grab; padding:4px 8px; background:#444; border-radius:3px; user-select:none; pointer-events:auto;">☰</span>
        <span class="player-label-text">${p.name} ${p.traveler ? '(T)' : ''}</span>
      </div>
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="cursor:pointer; color:${p.traveler?'#00bfff':'#888'}; font-weight:bold;" onclick="toggleTravelerStatus(${idx})">Ⓣ</span>
        <span style="cursor:pointer;" onclick="deletePlayerRow(${idx})">🗑️</span>
      </div>
    `;

    let handle = row.querySelector('.drag-handle');
    bindMobileRowTouchDragMechanics(handle, row, idx);
    list.appendChild(row);
  });
  document.getElementById('input-player-name').onkeydown = (e) => { if (e.key === 'Enter') addPlayerFromInput(); };
}

function bindMobileRowTouchDragMechanics(handle, row, currentIdx) {
  let startY = 0;
  let originalIndex = currentIdx;

  handle.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    row.style.zIndex = "1000";
    row.style.position = "relative";
    row.style.boxShadow = "0 4px 12px rgba(0,0,0,0.6)";
  }, { passive: true });

  handle.addEventListener('touchmove', (e) => {
    let currentY = e.touches[0].clientY;
    let deltaY = currentY - startY;
    row.style.transform = `translateY(${deltaY}px)`;

    let elementOver = document.elementFromPoint(e.touches[0].clientX, currentY);
    if (!elementOver) return;
    
    let targetRow = elementOver.closest('.roster-row');
    if (targetRow && targetRow !== row) {
      let targetIdx = parseInt(targetRow.dataset.index, 10);
      if (!isNaN(targetIdx) && targetIdx !== originalIndex) {
        let temp = state.players[originalIndex];
        state.players[originalIndex] = state.players[targetIdx];
        state.players[targetIdx] = temp;
        originalIndex = targetIdx;
        persistData();
        startY = currentY;
        renderRoster();
      }
    }
  }, { passive: true });

  handle.addEventListener('touchend', () => {
    row.style.zIndex = "";
    row.style.position = "";
    row.style.boxShadow = "";
    row.style.transform = "";
    syncUI();
  });
}

function handleRowSelectAction(idx) {
  if (activeMoveIndex === null) {
    activeMoveIndex = idx;
    updateNotification(`Moving ${state.players[idx].name}. Tap target row to swap seats.`);
  } else {
    if (activeMoveIndex !== idx) {
      let temp = state.players[activeMoveIndex]; state.players[activeMoveIndex] = state.players[idx]; state.players[idx] = temp;
      updateNotification("Seats swapped successfully.");
    }
    activeMoveIndex = null;
  }
  syncUI(); persistData();
}

function addPlayerFromInput() {
  let input = document.getElementById('input-player-name'); let name = input.value.trim(); if (!name) return;
  state.players.push({ name: name, status: 'ALIVE', deadVoteUsed: false, traveler: false });
  input.value = ''; input.focus(); syncUI(); persistData();
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
  let notesArea = document.getElementById('storyteller-notes'); if (notesArea) notesArea.value = "";
  if (typeof resetNominationState === 'function') resetNominationState();
  setSetupMode(true); updateNotification("New game space completely wiped clean."); syncUI();
}
