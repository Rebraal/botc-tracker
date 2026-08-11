function handleNominateClick() {
  if (state.nominationState === 'IDLE') {
    state.nominationState = 'NOMINATOR_SELECT';
    document.getElementById('btn-nominate').innerText = "Cancel Nom";
    updatePrompt("Click Nominator Token");
  } else if (state.nominationState === 'VOTING') {
    handleNominateClickEnd();
  } else {
    resetNominationState();
  }
  syncUI();
}

function resetNominationState() {
  state.nominationState = 'IDLE';
  state.activeNominator = null; state.activeNominee = null; state.activeVoters = [];
  document.getElementById('btn-nominate').innerText = "Nominate";
  updatePrompt("Workflow Prompt");
}

function handleTokenClick(player, idx) {
  if (state.nominationState === 'NOMINATOR_SELECT') {
    state.activeNominator = player.name; state.nominationState = 'NOMINEE_SELECT';
    updatePrompt("Click Nominee Token");
  } else if (state.nominationState === 'NOMINEE_SELECT') {
    state.activeNominee = player.name; state.nominationState = 'VOTING';
    document.getElementById('btn-nominate').innerText = "End Nomination";
    updatePrompt("Select Voters, then Click End");
  } else if (state.nominationState === 'VOTING') {
    if (player.status === 'DEAD' && player.deadVoteUsed) return;
    let vIndex = state.activeVoters.indexOf(player.name);
    if (vIndex > -1) state.activeVoters.splice(vIndex, 1);
    else state.activeVoters.push(player.name);
  }
  syncUI();
}

function handleNominateClickEnd() {
  // Capture historical track flags into persistent daily cache blocks before wipeout
  if (state.activeNominator && !state.nominatorToday.includes(state.activeNominator)) {
    state.nominatorToday.push(state.activeNominator);
  }
  if (state.activeNominee && !state.nomineeToday.includes(state.activeNominee)) {
    state.nomineeToday.push(state.activeNominee);
  }

  state.activeVoters.forEach(vName => {
    let pObj = state.players.find(p => p.name === vName);
    if (pObj && pObj.status === 'DEAD') pObj.deadVoteUsed = true;
  });

  state.votes.push({
    day: state.currentDay, nominator: state.activeNominator,
    nominee: state.activeNominee, count: state.activeVoters.length, voters: [...state.activeVoters]
  });
  resetNominationState();
  syncUI();
  persistData();
}

function evaluateBlockLeader() {
  let dayVotes = state.votes.filter(v => v.day === state.currentDay);
  let threshold = Math.ceil(state.players.filter(p => p.status === 'ALIVE').length / 2);
  let maxVotes = -1, leaderNominee = null, tie = false;

  dayVotes.forEach(v => {
    if (v.count >= threshold) {
      if (v.count > maxVotes) { maxVotes = v.count; leaderNominee = v.nominee; tie = false; }
      else if (v.count === maxVotes) tie = true;
    }
  });

  if (leaderNominee && !tie) {
    let nodes = document.getElementsByClassName('token');
    for (let node of nodes) {
      if (node.innerText.includes(leaderNominee)) {
        let overlay = document.createElement('div'); overlay.className = 'skull-overlay';
        overlay.innerHTML = '💀'; node.appendChild(overlay);
      }
    }
  }
}

function triggerNextDay() {
  state.currentDay += 1;
  state.nominatorToday = [];
  state.nomineeToday = [];
  syncUI();
  persistData();
}
