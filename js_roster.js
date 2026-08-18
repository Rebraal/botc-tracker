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
  let startY = 0, currentTargetIdx = currentIdx;
  let rowHeight = 0, siblings = [];

  handle.addEventListener('touchstart', (e) => {
    startY = e.touches.clientY;
    currentTargetIdx = currentIdx;
    rowHeight = row.offsetHeight + 4;
    row.style.zIndex = "1000";
    row.style.boxShadow = "0 6px 14px rgba(0,0,0,0.6)";
    row.style.transition = "none";
    siblings = Array.from(document.querySelectorAll('.roster-row')).filter(s => s !== row);
    siblings.forEach(s => s.style.transition = "transform 0.2s ease");
  }, { passive: true });

  handle.addEventListener('touchmove', (e) => {
    let currentY = e.touches.clientY;
    let deltaY = currentY - startY;
    row.style.transform = `translateY(${deltaY}px)`;

    let calculatedOffsetIndex = Math.round(deltaY / rowHeight);
    let newTargetIdx = currentIdx + calculatedOffsetIndex;
    newTargetIdx = Math.max(0, Math.min(newTargetIdx, state.players.length - 1));

    if (newTargetIdx !== currentTargetIdx) currentTargetIdx = newTargetIdx;

    siblings.forEach(sibling => {
      let sIdx = parseInt(sibling.dataset.index, 10);
      if (currentIdx < sIdx && sIdx <= currentTargetIdx) {
        sibling.style.transform = `translateY(-${rowHeight}px)`;
      } else if (currentIdx > sIdx && sIdx >= currentTargetIdx) {
        sibling.style.transform = `translateY(${rowHeight}px)`;
      } else {
        sibling.style.transform = "";
      }
    });
  }, { passive: true });

  handle.addEventListener('touchend', () => {
    row.style.zIndex = ""; row.style.boxShadow = ""; row.style.transform = "";
    siblings.forEach(s => { s.style.transition = ""; s.style.transform = ""; });
    
    if (currentTargetIdx !== currentIdx && !isNaN(currentTargetIdx)) {
      let [movedItem] = state.players.splice(currentIdx, 1);
      state.players.splice(currentTargetIdx, 0, movedItem);
      persistData();
    }
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
  state.players.forEach(p => { 
    p.status = 'ALIVE'; 
    p.deadVoteUsed = false; 
    p.role = ""; // Clears assigned character roles on restart
  });
  if (typeof resetNominationState === 'function') resetNominationState();
  updateNotification("Game restarted. Roster kept, data and roles reset."); syncUI(); persistData();
}

function triggerNewGame() {
  state = { players: [], votes: [], currentDay: 1, setupMode: true, nominationState: 'IDLE', nominatorToday: [], nomineeToday: [] };
  localStorage.removeItem('botc_tracker_state'); activeMoveIndex = null;
  let notesArea = document.getElementById('storyteller-notes'); if (notesArea) notesArea.value = "";
  if (typeof resetNominationState === 'function') resetNominationState();
  setSetupMode(true); updateNotification("New game space completely wiped clean."); syncUI();
}
