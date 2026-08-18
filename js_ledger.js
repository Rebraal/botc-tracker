function renderLedger() {
  const content = document.getElementById('ledger-content');
  content.innerHTML = '';

  let totalDaysToRender = Math.max(state.currentDay, state.highestDayReached);
  let daysMap = {};
  for (let d = 1; d <= totalDaysToRender; d++) {
    daysMap[d] = [];
  }

  state.votes.forEach((v, globalIdx) => { 
    if (daysMap[v.day]) daysMap[v.day].push({ vote: v, id: globalIdx }); 
  });

  Object.keys(daysMap).sort((a,b)=>a-b).forEach(dayKey => {
    let dayNum = parseInt(dayKey, 10);
    let header = document.createElement('div');
    header.className = 'ledger-day-header';
    
    let label = document.createElement('span');
    label.innerText = `Day ${dayNum}`;
    
    let isToggled = state.toggledDayNVInfo.includes(dayNum);
    let nvBtn = document.createElement('button');
    nvBtn.innerText = `[N/V] ${isToggled ? 'ON' : 'OFF'}`;
    nvBtn.style.fontSize = '0.7rem';
    nvBtn.style.padding = '2px 6px';
    nvBtn.style.backgroundColor = isToggled ? '#00ff66' : '#555';
    nvBtn.style.color = isToggled ? '#222' : '#fff';
    nvBtn.onclick = () => { toggleDayNVInfoState(dayNum); };

    header.appendChild(label);
    header.appendChild(nvBtn);
    content.appendChild(header);

    let dayItems = daysMap[dayNum];
    if (dayItems.length === 0) {
      let emptyRow = document.createElement('div');
      emptyRow.className = 'ledger-row';
      emptyRow.innerHTML = '<span style="color:#666; font-style:italic;">No recorded nominations.</span>';
      content.appendChild(emptyRow);
      return;
    }

    let aliveCountAtDay = state.players.filter(p => p.status === 'ALIVE').length; 
    let threshold = Math.ceil(aliveCountAtDay / 2);
    let maxVotes = -1, leaderId = -1, tie = false;

    dayItems.forEach(item => {
      let v = item.vote;
      if (v.count >= threshold && v.count > maxVotes) { maxVotes = v.count; leaderId = item.id; tie = false; }
      else if (v.count === maxVotes && v.count >= threshold) tie = true;
    });

    dayItems.forEach(item => {
      let v = item.vote;
      let row = document.createElement('div'); row.className = 'ledger-row';
      if (item.id === leaderId && !tie) row.classList.add('executed');
      
      let leftInfo = document.createElement('div');
      leftInfo.innerHTML = `<div><strong>${v.nominator}</strong> &rarr; <strong>${v.nominee}</strong>: ${v.count} votes</div>
                            <div style="color:#aaa; font-size:0.75rem;">Voters: ${v.voters.join(', ') || 'None'}</div>`;
      
      let deleteIcon = document.createElement('span');
      deleteIcon.innerText = '🗑️';
      deleteIcon.style.cursor = 'pointer';
      deleteIcon.style.marginLeft = '10px';
      deleteIcon.onclick = () => { deleteLedgerEntry(item.id); };

      row.appendChild(leftInfo);
      row.appendChild(deleteIcon);
      content.appendChild(row);
    });
  });
}

function toggleDayNVInfoState(dayNum) {
  let idx = state.toggledDayNVInfo.indexOf(dayNum);
  if (idx > -1) state.toggledDayNVInfo.splice(idx, 1);
  else state.toggledDayNVInfo.push(dayNum);
  syncUI();
  persistData();
}

function clearAllNVToggles() {
  state.toggledDayNVInfo = [];
  syncUI();
  persistData();
}

function deleteLedgerEntry(globalIdx) {
  state.votes.splice(globalIdx, 1);
  syncUI();
  persistData();
}
