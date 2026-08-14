function handleTokenLongPress(player, idx) {
  if (state.nominationState !== 'IDLE') return;
  player.status = (player.status === 'ALIVE') ? 'DEAD' : 'ALIVE';
  player.deadVoteUsed = false;
  updateNotification(`${player.name} cycle adjusted.`);
  syncUI();
  persistData();
}

function bindLifecycleTap(element, player, idx) {
  let tapTimer = null;
  element.addEventListener('touchstart', () => {
    tapTimer = setTimeout(() => {
      handleTokenLongPress(player, idx);
      tapTimer = null;
    }, 700);
  });
  element.addEventListener('touchend', () => {
    if (tapTimer) {
      clearTimeout(tapTimer);
      tapTimer = null;
    }
  });
}
