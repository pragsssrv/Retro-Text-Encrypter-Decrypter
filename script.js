// Function to encrypt text using selected method
function encrypt() {
  const inputText = document.getElementById('input-text').value;
  const shift = parseInt(document.getElementById('shift-value').value) || 0;
  const method = document.getElementById('encryption-method').value;
  const caseFormat = document.getElementById('case-format').value;
  const password = document.getElementById('password').value;
  let encryptedText;

  switch (method) {
    case 'caesar':
      encryptedText = inputText.split('').map(char => {
        const charCode = char.charCodeAt(0);
        return String.fromCharCode(((charCode - 32 + shift) % 95 + 95) % 95 + 32);
      }).join('');
      break;
    case 'base64':
      encryptedText = btoa(inputText);
      break;
    case 'rot13':
      encryptedText = inputText.split('').map(char => {
        const charCode = char.charCodeAt(0);
        return String.fromCharCode(((charCode - 32 + 13) % 95 + 95) % 95 + 32);
      }).join('');
      break;
    case 'base32':
      encryptedText = base32Encode(inputText);
      break;
    default:
      alert('Invalid encryption method!');
      return;
  }

  // Apply case format
  if (caseFormat === 'uppercase') {
    encryptedText = encryptedText.toUpperCase();
  } else if (caseFormat === 'lowercase') {
    encryptedText = encryptedText.toLowerCase();
  }

  // Apply password-based transformation
  if (password) {
    encryptedText = applyPasswordTransformation(encryptedText, password);
  }

  document.getElementById('output-text').value = encryptedText;
  localStorage.setItem('savedText', encryptedText);
  addToHistory(inputText, encryptedText, 'encrypt');
  analyzeFrequency(encryptedText);
}

// Function to decrypt text using selected method
function decrypt() {
  const inputText = document.getElementById('input-text').value;
  const shift = parseInt(document.getElementById('shift-value').value) || 0;
  const method = document.getElementById('encryption-method').value;
  const password = document.getElementById('password').value;
  let decryptedText;

  switch (method) {
    case 'caesar':
      decryptedText = inputText.split('').map(char => {
        const charCode = char.charCodeAt(0);
        return String.fromCharCode(((charCode - 32 - shift + 95) % 95 + 95) % 95 + 32);
      }).join('');
      break;
    case 'base64':
      decryptedText = atob(inputText);
      break;
    case 'rot13':
      decryptedText = inputText.split('').map(char => {
        const charCode = char.charCodeAt(0);
        return String.fromCharCode(((charCode - 32 - 13 + 95) % 95 + 95) % 95 + 32);
      }).join('');
      break;
    case 'base32':
      try {
        decryptedText = base32Decode(inputText);
      } catch (e) {
        alert('Invalid Base32 encoded text!');
        return;
      }
      break;
    default:
      alert('Invalid decryption method!');
      return;
  }

  // Apply password-based transformation
  if (password) {
    decryptedText = applyPasswordTransformation(decryptedText, password, false);
  }

  document.getElementById('output-text').value = decryptedText;
  localStorage.setItem('savedText', decryptedText);
  addToHistory(inputText, decryptedText, 'decrypt');
  analyzeFrequency(decryptedText);
}

// Function to apply password-based transformation
function applyPasswordTransformation(text, password, encrypt = true) {
  const passwordChars = password.split('').map(char => char.charCodeAt(0));
  const textChars = text.split('').map(char => char.charCodeAt(0));
  const passwordLength = passwordChars.length;
  return textChars.map((charCode, index) => {
    const passwordCharCode = passwordChars[index % passwordLength];
    return encrypt ? charCode ^ passwordCharCode : charCode ^ passwordCharCode;
  }).map(charCode => String.fromCharCode(charCode)).join('');
}

// Base32 Encoding function
function base32Encode(input) {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let binary = '';

  for (const char of input) {
    binary += char.charCodeAt(0).toString(2).padStart(8, '0');
  }

  let output = '';
  let padding = '';
  for (let i = 0; i < binary.length; i += 5) {
    const segment = binary.slice(i, i + 5);
    output += base32Chars[parseInt(segment, 2)];
  }

  if (binary.length % 8 !== 0) {
    padding = '='.repeat((8 - (binary.length % 8)) / 5);
    output += padding;
  }

  return output;
}

// Base32 Decoding function
function base32Decode(input) {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let binary = '';

  for (const char of input) {
    if (char !== '=') {
      const index = base32Chars.indexOf(char);
      if (index === -1) {
        throw new Error('Invalid Base32 character');
      }
      binary += index.toString(2).padStart(5, '0');
    }
  }

  let output = '';
  for (let i = 0; i < binary.length; i += 8) {
    const segment = binary.slice(i, i + 8);
    output += String.fromCharCode(parseInt(segment, 2));
  }

  return output;
}

// Function to add text to history
function addToHistory(input, output, type) {
  const historyList = document.getElementById('history-list');
  const listItem = document.createElement('li');
  listItem.textContent = `${type.toUpperCase()}: ${input} -> ${output} (Date: ${new Date().toLocaleString()})`;

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.onclick = () => listItem.remove();

  listItem.appendChild(deleteButton);
  historyList.appendChild(listItem);
}

// Function to copy text to clipboard
function copyToClipboard() {
  const outputText = document.getElementById('output-text').value;
  navigator.clipboard.writeText(outputText)
    .then(() => alert('Copied to clipboard'))
    .catch(err => alert('Failed to copy: ' + err));
}

// Function to clear text areas
function clearText() {
  document.getElementById('input-text').value = '';
  document.getElementById('output-text').value = '';
}

// Function to save settings to local storage
function saveSettings() {
  const settings = {
    method: document.getElementById('encryption-method').value,
    shift: document.getElementById('shift-value').value,
    format: document.getElementById('case-format').value,
    password: document.getElementById('password').value
  };
  localStorage.setItem('encryptionSettings', JSON.stringify(settings));
  alert('Settings saved!');
}

// Function to load settings from local storage
function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('encryptionSettings'));
  if (settings) {
    document.getElementById('encryption-method').value = settings.method;
    document.getElementById('shift-value').value = settings.shift;
    document.getElementById('case-format').value = settings.format;
    document.getElementById('password').value = settings.password;
    alert('Settings loaded!');
  } else {
    alert('No settings found!');
  }
}

// Function to clear history
function clearHistory() {
  document.getElementById('history-list').innerHTML = '';
}

// Function to export history to JSON file
function exportHistory() {
  const historyItems = document.querySelectorAll('#history-list li');
  const historyArray = Array.from(historyItems).map(item => item.textContent);
  const blob = new Blob([JSON.stringify(historyArray)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'history.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Function to import history from JSON file
function importHistory() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = event => {
      const historyArray = JSON.parse(event.target.result);
      const historyList = document.getElementById('history-list');
      historyArray.forEach(itemText => {
        const listItem = document.createElement('li');
        listItem.textContent = itemText;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => listItem.remove();

        listItem.appendChild(deleteButton);
        historyList.appendChild(listItem);
      });
    };
    reader.readAsText(file);
  };
  input.click();
}

// Function to generate QR code from text
function generateQRCode() {
  const text = document.getElementById('output-text').value;
  const qrCodeContainer = document.getElementById('qr-code-result');
  qrCodeContainer.innerHTML = ''; // Clear previous QR code
  new QRCode(qrCodeContainer, {
    text: text,
    width: 128,
    height: 128
  });
}

// Function to save encrypted/decrypted text to file
function saveToFile() {
  const text = document.getElementById('output-text').value;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'text.txt';
  a.click();
  URL.revokeObjectURL(url);
}

// Function to toggle night mode
function toggleNightMode() {
  document.body.classList.toggle('night-mode');
}

// Function to analyze frequency of characters
function analyzeFrequency(text) {
  const frequency = {};
  for (const char of text) {
    frequency[char] = (frequency[char] || 0) + 1;
  }

  const result = Object.entries(frequency)
    .map(([char, count]) => `<strong>${char}</strong>: ${count}`)
    .join('<br>');

  document.getElementById('frequency-result').innerHTML = result;
}

// Function to filter history based on search input
function filterHistory() {
  const searchTerm = document.getElementById('search-history').value.toLowerCase();
  const historyItems = document.querySelectorAll('#history-list li');

  historyItems.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(searchTerm) ? 'block' : 'none';
  });
}
