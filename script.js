const signalButton = document.querySelector('#signal-button');
const signalStatus = document.querySelector('#signal-status');

signalButton.addEventListener('click', () => {
  signalStatus.textContent = 'Signal received. Vesper is watching.';
});
