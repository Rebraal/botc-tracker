let state = {
  players: [],
  votes: [],
  currentDay: 1,
  setupMode: true,
  nominationState: 'IDLE',
  activeNominator: null,
  activeNominee: null,
  activeVoters: [],
  nominatorToday: [],
  nomineeToday: []
};

window.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  setSetupMode(state.players.length === 0);
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
      state.nominatorToday = parsed.nominatorToday || [];
      state.nomineeToday = parsed.nomineeToday || [];
    } catch(e) {
      updateNotification("Error reading stored cache data.");
    }
  }
}

function persistData() {
  localStorage.setItem('botc_tracker_state', JSON.stringify({
    players: state.players,
    votes: state.votes,
    currentDay: state.currentDay,
    nominatorToday: state.nominatorToday,
    nomineeToday: state.nomineeToday
  }));
  updateNotification("Data auto-saved locally.");
}

function recalculateThresholdAndComposition() {
  let aliveCount = state.players.filter(p => p.status === 'ALIVE').length;
  document.getElementById('threshold-val').innerText = Math.ceil(aliveCount / 2);

  let n = state.players.length;
  let c = { townsfolk: 0, outsider: 0, minion: 0, demon: 0 };
  const lookup = {
    5:, 6:, 7:,
    8:, 9:, 10:,
    11:, 12:, 13:,
    14:, 15: [9, 2, 3, 1]
  };
  
  if (lookup[n]) {
    let arr = lookup[n];
    c = { townsfolk: arr[0], outsider: arr[1], minion: arr[2], demon: arr[3] };
  }
  
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
