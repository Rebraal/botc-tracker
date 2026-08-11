function renderLedger() {
  const content = document.getElementById('ledger-content');
  content.innerHTML = '';
  if (state.votes.length === 0) { content.innerHTML = '<div style="padding:10px; color:#666;">No nominations.</div>'; return; }

  let daysMap = {};
  state.votes.forEach(v => { if (!daysMap[v.day]) daysMap[v.day] = []; daysMap[v.day].push(v); });

  Object.keys(daysMap).sort((a,b)=>a-b).forEach(dayNum => {
    let header = document.createElement('div'); header.className = 'ledger-day-header'; header.innerText = `Day ${dayNum}`; content.appendChild(header);
    let threshold = Math.ceil(state.players.filter(p => p.status === 'ALIVE').length / 2);
    let maxVotes = -1, leaderIdx = -1, tie = false;

    daysMap[dayNum].forEach((v, i) => {
      if (v.count >= threshold && v.count > maxVotes) { maxVotes = v.count; leaderIdx = i; tie = false; }
      else if (v.count === maxVotes && v.count >= threshold) tie = true;
    });

    daysMap[dayNum].forEach((v, i) => {
      let row = document.createElement('div'); row.className = 'ledger-row';
      if (i === leaderIdx && !tie) row.classList.add('executed');
      row.innerHTML = `<div><strong>${v.nominator}</strong> &rarr; <strong>${v.nominee}</strong>: ${v.count} votes</div>
                       <div style="color:#aaa; font-size:0.75rem;">Voters: ${v.voters.join(', ') || 'None'}</div>`;
      content.appendChild(row);
    });
  });
}
