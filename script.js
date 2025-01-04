document.addEventListener('DOMContentLoaded', () => {
  // Initialize elements
  const inputText = document.getElementById('input-text');
  const outputText = document.getElementById('output-text');
  const encryptBtn = document.getElementById('encrypt-btn');
  const decryptBtn = document.getElementById('decrypt-btn');
  const copyBtn = document.getElementById('copy-btn');
  const methodSelect = document.getElementById('encryption-method');
  const shiftValue = document.getElementById('shift-value');
  const shiftDisplay = document.getElementById('shift-display');
  const shiftControl = document.getElementById('shift-control');
  const themeSwitch = document.getElementById('theme-switch');
  const historyList = document.getElementById('history-list');

  // Initialize particles background
  initParticles();

  // Theme handling with smooth transition
  document.getElementById('light-mode').addEventListener('click', () => {
    document.body.style.transition = 'background-color 0.5s ease';
    document.body.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
    
    // Animate theme change
    document.querySelectorAll('.card, textarea, button').forEach(element => {
      element.style.animation = 'pulse 0.5s ease';
      setTimeout(() => {
        element.style.animation = '';
      }, 500);
    });
  });

  document.getElementById('dark-mode').addEventListener('click', () => {
    document.body.style.transition = 'background-color 0.5s ease';
    document.body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
    
    // Animate theme change
    document.querySelectorAll('.card, textarea, button').forEach(element => {
      element.style.animation = 'pulse 0.5s ease';
      setTimeout(() => {
        element.style.animation = '';
      }, 500);
    });
  });

  // Load saved theme
  if (localStorage.getItem('theme') === 'dark') {
    themeSwitch.checked = true;
    document.body.classList.add('dark-theme');
  }

  // Interactive character counter with animations
  inputText.addEventListener('input', (e) => {
    const counter = inputText.parentElement.querySelector('.char-counter');
    const count = inputText.value.length;
    counter.textContent = `${count}/500`;
    
    // Animated warning when approaching limit
    if (count > 450) {
      counter.classList.add('warning');
      inputText.style.borderColor = '#ff4444';
      
      // Vibrate if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    } else {
      counter.classList.remove('warning');
      inputText.style.borderColor = '';
    }

    // Auto-resize animation
    autoResizeTextarea(e.target);
  });

  // Animated method selection
  methodSelect.addEventListener('change', () => {
    const isShiftNeeded = ['caesar'].includes(methodSelect.value);
    
    if (isShiftNeeded) {
      shiftControl.style.display = 'flex';
      shiftControl.style.animation = 'slideIn 0.3s ease forwards';
    } else {
      shiftControl.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => {
        shiftControl.style.display = 'none';
      }, 300);
    }
  });

  // Interactive shift value display
  shiftValue.addEventListener('input', (e) => {
    shiftDisplay.textContent = e.target.value;
    shiftDisplay.style.animation = 'pulse 0.2s ease';
    setTimeout(() => {
      shiftDisplay.style.animation = '';
    }, 200);
  });

  // Encryption with animation
  function animateEncryption(text, method, shift) {
    return new Promise((resolve) => {
      let result = '';
      const chars = text.split('');
      const interval = 50;
      
      chars.forEach((char, index) => {
        setTimeout(() => {
          result += encrypt(char, method, shift);
          outputText.value = result + '|';
          
          if (index === chars.length - 1) {
            outputText.value = result;
            resolve(result);
          }
        }, index * interval);
      });
    });
  }

  // Core encryption function
  function encrypt(text, method, shift) {
    switch (method) {
      case 'caesar':
        return text.split('').map(char => {
          if (char.match(/[a-zA-Z]/)) {
            const code = char.charCodeAt(0);
            const isUpperCase = code < 91;
            const base = isUpperCase ? 65 : 97;
            return String.fromCharCode(
              (code - base + parseInt(shift)) % 26 + base
            );
          }
          return char;
        }).join('');
      case 'base64':
        return btoa(text);
      case 'rot13':
        return encrypt(text, 'caesar', 13);
      default:
        return text;
    }
  }

  // Decryption with animation
  function animateDecryption(text, method, shift) {
    return animateEncryption(text, method, method === 'caesar' ? 26 - shift : shift);
  }

  // Enhanced history management
  function addToHistory(input, output, type) {
    const item = document.createElement('div');
    item.className = 'history-item';
    
    const timestamp = new Date().toLocaleTimeString();
    const truncatedInput = input.length > 20 ? input.substring(0, 20) + '...' : input;
    
    item.innerHTML = `
      <div class="history-content">
        <span class="history-type ${type.toLowerCase()}">${type}</span>
        <span class="history-text">${truncatedInput}</span>
        <span class="history-time">${timestamp}</span>
      </div>
      <button class="history-copy" title="Copy result">
        <i class="fas fa-copy"></i>
      </button>
    `;

    // Add copy functionality
    item.querySelector('.history-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(output);
      item.classList.add('copy-success');
      setTimeout(() => item.classList.remove('copy-success'), 2000);
    });

    // Animate insertion
    item.style.opacity = '0';
    item.style.transform = 'translateX(-20px)';
    historyList.insertBefore(item, historyList.firstChild);
    
    requestAnimationFrame(() => {
      item.style.opacity = '1';
      item.style.transform = 'translateX(0)';
    });
  }

  // Button handlers with animations
  encryptBtn.addEventListener('click', async () => {
    const text = inputText.value;
    const method = methodSelect.value;
    const shift = parseInt(shiftValue.value);
    
    if (!text) {
      inputText.classList.add('shake');
      setTimeout(() => inputText.classList.remove('shake'), 500);
      return;
    }

    encryptBtn.disabled = true;
    encryptBtn.classList.add('processing');
    
    const result = await animateEncryption(text, method, shift);
    addToHistory(text, result, 'Encrypted');
    
    encryptBtn.disabled = false;
    encryptBtn.classList.remove('processing');
  });

  decryptBtn.addEventListener('click', async () => {
    const text = inputText.value;
    const method = methodSelect.value;
    const shift = parseInt(shiftValue.value);
    
    if (!text) {
      inputText.classList.add('shake');
      setTimeout(() => inputText.classList.remove('shake'), 500);
      return;
    }

    decryptBtn.disabled = true;
    decryptBtn.classList.add('processing');
    
    const result = await animateDecryption(text, method, shift);
    addToHistory(text, result, 'Decrypted');
    
    decryptBtn.disabled = false;
    decryptBtn.classList.remove('processing');
  });

  // Enhanced copy button with feedback
// ... (previous code remains the same until copyBtn event listener)

  // Enhanced copy button with feedback
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(outputText.value);
      copyBtn.innerHTML = '<i class="fas fa-check"></i>';
      copyBtn.classList.add('success');
      
      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate([50]);
      }

      setTimeout(() => {
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.classList.remove('success');
      }, 2000);
    } catch (err) {
      copyBtn.innerHTML = '<i class="fas fa-times"></i>';
      copyBtn.classList.add('error');
      
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.classList.remove('error');
      }, 2000);
    }
  });

  // Auto-resize textarea function
  function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  // Initialize auto-resize for textareas
  [inputText, outputText].forEach(textarea => {
    textarea.addEventListener('input', (e) => autoResizeTextarea(e.target));
    // Initial resize
    autoResizeTextarea(textarea);
  });

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to encrypt
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      encryptBtn.click();
    }
    // Ctrl/Cmd + Shift + Enter to decrypt
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
      e.preventDefault();
      decryptBtn.click();
    }
    // Ctrl/Cmd + C to copy when output is focused
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement === outputText) {
      e.preventDefault();
      copyBtn.click();
    }
  });

  // Initialize particles background
  function initParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-background';
    document.body.prepend(particlesContainer);

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.setProperty('--speed', Math.random() * 20 + 10 + 's');
      particle.style.setProperty('--size', Math.random() * 10 + 5 + 'px');
      particle.style.left = Math.random() * 100 + 'vw';
      particle.style.animationDelay = Math.random() * 20 + 's';
      particlesContainer.appendChild(particle);
    }
  }

  // Add ripple effect to buttons
  function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    ripple.className = 'ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 1000);
  }

  // Add ripple effect to all buttons
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', createRipple);
  });

  // Add floating labels animation
  function initFloatingLabels() {
    document.querySelectorAll('.input-wrapper').forEach(wrapper => {
      const input = wrapper.querySelector('input, textarea');
      const label = wrapper.querySelector('label');
      
      if (input && label) {
        input.addEventListener('focus', () => {
          label.classList.add('active');
        });
        
        input.addEventListener('blur', () => {
          if (!input.value) {
            label.classList.remove('active');
          }
        });
        
        // Initialize state
        if (input.value) {
          label.classList.add('active');
        }
      }
    });
  }

  // Initialize tooltips
  function initTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(element => {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = element.dataset.tooltip;
      
      element.addEventListener('mouseenter', () => {
        document.body.appendChild(tooltip);
        const rect = element.getBoundingClientRect();
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
        tooltip.style.left = `${rect.left + (element.offsetWidth - tooltip.offsetWidth) / 2}px`;
        setTimeout(() => tooltip.classList.add('visible'), 10);
      });
      
      element.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
        setTimeout(() => tooltip.remove(), 200);
      });
    });
  }

  // Save state to localStorage
  function saveState() {
    const state = {
      method: methodSelect.value,
      shift: shiftValue.value,
      history: Array.from(historyList.children).map(item => ({
        input: item.querySelector('.history-text').textContent,
        type: item.querySelector('.history-type').textContent,
        time: item.querySelector('.history-time').textContent
      }))
    };
    localStorage.setItem('appState', JSON.stringify(state));
  }

  // Load state from localStorage
  function loadState() {
    const state = JSON.parse(localStorage.getItem('appState'));
    if (state) {
      methodSelect.value = state.method;
      shiftValue.value = state.shift;
      shiftDisplay.textContent = state.shift;
      
      // Restore history
      state.history.reverse().forEach(item => {
        addToHistory(item.input, '', item.type);
      });
    }
  }

  // Initialize everything
  function init() {
    initParticles();
    initFloatingLabels();
    initTooltips();
    loadState();
    
    // Add state saving on changes
    [methodSelect, shiftValue].forEach(element => {
      element.addEventListener('change', saveState);
    });
  }

  // Run initialization
  init();
});