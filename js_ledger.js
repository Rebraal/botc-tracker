function renderLedger() {
  const content = document.getElementById('ledger-content');
  content.innerHTML = '';
  if (state.votes.length === 0) { content.innerHTML = '<div style="padding:10px; color:#666;">No nominations.</div>'; return; }

  let daysMap = {};
  state.votes.forEach((v, globalIdx) => { 
    if (!daysMap[v.day]) daysMap[v.day] = []; 
    daysMap[v.day].push({ vote: v, id: globalIdx }); 
  });

  Object.keys(daysMap).sort((a,b)=>a-b).forEach(dayNum => {
    let header = document.createElement('div'); header.className = 'ledger-day-header'; header.innerText = `Day ${dayNum}`; content.appendChild(header);
    let aliveCountAtDay = state.players.filter(p => p.status === 'ALIVE').length; 
    let threshold = Math.ceil(aliveCountAtDay / 2);
    let maxVotes = -1, leaderId = -1, tie = false;

    daysMap[dayNum].forEach(item => {
      let v = item.vote;
      if (v.count >= threshold && v.count > maxVotes) { maxVotes = v.count; leaderId = item.id; tie = false; }
      else if (v.count === maxVotes && v.count >= threshold) tie = true;
    });

    daysMap[dayNum].forEach(item => {
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

function deleteLedgerEntry(globalIdx) {
  state.votes.splice(globalIdx, 1);
  syncUI();
  persistData();
}
