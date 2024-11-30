// document.addEventListener('DOMContentLoaded', function() {
//   // Load saved settings
//   chrome.storage.sync.get({
//     customPatterns: '',
//     maskEmails: true,
//     maskPhones: true,
//     maskAddresses: true,
//     maskingChar: 'X'
//   }, function(items) {
//     document.getElementById('customPatterns').value = items.customPatterns;
//     document.getElementById('maskEmails').checked = items.maskEmails;
//     document.getElementById('maskPhones').checked = items.maskPhones;
//     document.getElementById('maskAddresses').checked = items.maskAddresses;
//     document.getElementById('maskingChar').value = items.maskingChar;
//   });

//   // Save settings
//   document.getElementById('settingsForm').addEventListener('submit', function(e) {
//     e.preventDefault();
    
//     const settings = {
//       customPatterns: document.getElementById('customPatterns').value,
//       maskEmails: document.getElementById('maskEmails').checked,
//       maskPhones: document.getElementById('maskPhones').checked,
//       maskAddresses: document.getElementById('maskAddresses').checked,
//       maskingChar: document.getElementById('maskingChar').value || 'X'
//     };

//     chrome.storage.sync.set(settings, function() {
//       const status = document.getElementById('status');
//       status.textContent = 'Settings saved!';
//       status.className = 'status success';
      
//       // Notify background script of settings change
//       chrome.runtime.sendMessage({
//         type: 'SETTINGS_UPDATED',
//         settings: settings
//       });

//       setTimeout(function() {
//         status.textContent = '';
//         status.className = 'status';
//       }, 2000);
//     });
//   });
// }); 