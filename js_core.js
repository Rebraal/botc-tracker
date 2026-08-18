let state = {
  players: [],
  votes: [],
  currentDay: 1,
  highestDayReached: 1,
  setupMode: true,
  nominationState: 'IDLE',
  activeNominator: null,
  activeNominee: null,
  activeVoters: [],
  nominatorToday: [],
  nomineeToday: [],
  toggledDayNVInfo: [] // Tracks active day metrics toggled on via [N/V]
};

window.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  setSetupMode(state.players.length === 0);
  
  let notesArea = document.getElementById('storyteller-notes');
  if (notesArea) {
    notesArea.addEventListener('input', () => { persistData(); });
  }
  
  syncUI();
});

function syncUI() {
  recalculateThresholdAndComposition();
  renderRoster();
  renderBoard();
  renderLedger();
}

function updateNotification(msg) {
  document.getElementById('notification-line').innerText = msg;
}

function updatePrompt(msg) {
  document.getElementById('workflow-prompt').innerText = msg;
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem('botc_tracker_state');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state.players = parsed.players || [];
      state.votes = parsed.votes || [];
      state.currentDay = parsed.currentDay || 1;
      state.highestDayReached = parsed.highestDayReached || state.currentDay;
      state.nominatorToday = parsed.nominatorToday || [];
      state.nomineeToday = parsed.nomineeToday || [];
      state.toggledDayNVInfo = parsed.toggledDayNVInfo || [];
      
      let notesArea = document.getElementById('storyteller-notes');
      if (notesArea && parsed.storynotes) {
        notesArea.value = parsed.storynotes;
      }
    } catch(e) {
      updateNotification("Error reading stored cache data.");
    }
  }
}

function persistData() {
  let notesValue = "";
  let notesArea = document.getElementById('storyteller-notes');
  if (notesArea) notesValue = notesArea.value;

  localStorage.setItem('botc_tracker_state', JSON.stringify({
    players: state.players,
    votes: state.votes,
    currentDay: state.currentDay,
    highestDayReached: state.highestDayReached,
    nominatorToday: state.nominatorToday,
    nomineeToday: state.nomineeToday,
    toggledDayNVInfo: state.toggledDayNVInfo,
    storynotes: notesValue
  }));
  updateNotification("Data auto-saved locally.");
}

function recalculateThresholdAndComposition() {
  let aliveCount = state.players.filter(p => p.status === 'ALIVE').length;
  document.getElementById('alive-val').innerText = aliveCount;
  document.getElementById('threshold-val').innerText = Math.ceil(aliveCount / 2);
  document.getElementById('votes-val').innerText = state.activeVoters.length;

  let nonTravelerCount = state.players.filter(p => !p.traveler).length;
  let c = { townsfolk: 0, outsider: 0, minion: 0, demon: 0 };
  
  const lookup = {
    5: { townsfolk: 3, outsider: 0, minion: 1, demon: 1 },
    6: { townsfolk: 3, outsider: 1, minion: 1, demon: 1 },
    7: { townsfolk: 5, outsider: 0, minion: 1, demon: 1 },
    8: { townsfolk: 5, outsider: 1, minion: 1, demon: 1 },
    9: { townsfolk: 5, outsider: 2, minion: 1, demon: 1 },
    10: { townsfolk: 7, outsider: 0, minion: 2, demon: 1 },
    11: { townsfolk: 7, outsider: 1, minion: 2, demon: 1 },
    12: { townsfolk: 7, outsider: 2, minion: 2, demon: 1 },
    13: { townsfolk: 9, outsider: 0, minion: 3, demon: 1 },
    14: { townsfolk: 9, outsider: 1, minion: 3, demon: 1 },
    15: { townsfolk: 9, outsider: 2, minion: 3, demon: 1 }
  };
  
  if (lookup[nonTravelerCount]) c = lookup[nonTravelerCount];
  
  document.getElementById('composition-panel').innerHTML = `
    <span class="fac-t">Townsfolk: ${c.townsfolk}</span>
    <span class="fac-o">Outsider: ${c.outsider}</span>
    <span class="fac-m">Minion: ${c.minion}</span>
    <span class="fac-d">Demon: ${c.demon}</span>
  `;
}

function setSetupMode(val) {
  state.setupMode = val;
  let btn = document.getElementById('btn-toggle-setup');
  let panel = document.getElementById('roster-management-panel');
  btn.innerText = state.setupMode ? "Lock Setup" : "Edit Setup";
  panel.style.display = state.setupMode ? "block" : "none";
}

function toggleSetupMode() {
  setSetupMode(!state.setupMode);
  syncUI();
}
function updatePrompt(msg) {
  document.getElementById('workflow-prompt').innerText = msg;
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem('botc_tracker_state');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state.players = parsed.players || [];
      state.votes = parsed.votes || [];
      state.currentDay = parsed.currentDay || 1;
      state.nominatorToday = parsed.nominatorToday || [];
      state.nomineeToday = parsed.nomineeToday || [];
      
      let notesArea = document.getElementById('storyteller-notes');
      if (notesArea && parsed.storynotes) {
        notesArea.value = parsed.storynotes;
      }
    } catch(e) {
      updateNotification("Error reading stored cache data.");
    }
  }
}

function persistData() {
  let notesValue = "";
  let notesArea = document.getElementById('storyteller-notes');
  if (notesArea) notesValue = notesArea.value;

  localStorage.setItem('botc_tracker_state', JSON.stringify({
    players: state.players,
    votes: state.votes,
    currentDay: state.currentDay,
    nominatorToday: state.nominatorToday,
    nomineeToday: state.nomineeToday,
    storynotes: notesValue
  }));
  updateNotification("Data auto-saved locally.");
}

function recalculateThresholdAndComposition() {
  let aliveCount = state.players.filter(p => p.status === 'ALIVE').length;
  document.getElementById('alive-val').innerText = aliveCount;
  document.getElementById('threshold-val').innerText = Math.ceil(aliveCount / 2);

  let nonTravelerCount = state.players.filter(p => !p.traveler).length;
  let c = { townsfolk: 0, outsider: 0, minion: 0, demon: 0 };
  
  const lookup = {
    5: { townsfolk: 3, outsider: 0, minion: 1, demon: 1 },
    6: { townsfolk: 3, outsider: 1, minion: 1, demon: 1 },
    7: { townsfolk: 5, outsider: 0, minion: 1, demon: 1 },
    8: { townsfolk: 5, outsider: 1, minion: 1, demon: 1 },
    9: { townsfolk: 5, outsider: 2, minion: 1, demon: 1 },
    10: { townsfolk: 7, outsider: 0, minion: 2, demon: 1 },
    11: { townsfolk: 7, outsider: 1, minion: 2, demon: 1 },
    12: { townsfolk: 7, outsider: 2, minion: 2, demon: 1 },
    13: { townsfolk: 9, outsider: 0, minion: 3, demon: 1 },
    14: { townsfolk: 9, outsider: 1, minion: 3, demon: 1 },
    15: { townsfolk: 9, outsider: 2, minion: 3, demon: 1 }
  };
  
  if (lookup[nonTravelerCount]) c = lookup[nonTravelerCount];
  
  document.getElementById('composition-panel').innerHTML = `
    <span class="fac-t">Townsfolk: ${c.townsfolk}</span>
    <span class="fac-o">Outsider: ${c.outsider}</span>
    <span class="fac-m">Minion: ${c.minion}</span>
    <span class="fac-d">Demon: ${c.demon}</span>
  `;
}

function setSetupMode(val) {
  state.setupMode = val;
  let btn = document.getElementById('btn-toggle-setup');
  let panel = document.getElementById('roster-management-panel');
  btn.innerText = state.setupMode ? "Lock Setup" : "Edit Setup";
  panel.style.display = state.setupMode ? "block" : "none";
}

function toggleSetupMode() {
  setSetupMode(!state.setupMode);
  syncUI();
}
 
