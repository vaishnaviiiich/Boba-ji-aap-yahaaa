document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initAudio();
  initClock();
  initInteractions();
});

const storage = {
  get(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const moods = [
  'He watched you rewrite the same function four times.',
  'Your laptop fan sounds like a jet engine preparing for takeoff.',
  'He checked your git commit messages and felt secondhand embarrassment.',
  'Taking a break is completely acceptable, human.',
  'Lavender Town music plays quietly in your background tabs.'
];

const pokedexNotes = [
  {
    tag: '#094 Gengar',
    title: 'The Uninvited Roommate',
    text: 'He hides in the shadows of warm rooms. If the temperature suddenly plummets, do not adjust your radiator. Just accept that you now share the apartment with a poison ghost.'
  },
  {
    tag: '#093 Haunter',
    title: 'Questionable Etiquette',
    text: 'Its tongue is made of icy gas. Getting licked causes intense shaking that will likely ruin your ability to type code or hold a cup of coffee.'
  },
  {
    tag: '#092 Gastly',
    title: 'Mostly Just Exhaust',
    text: 'Composed of 95 percent poisonous gas. It can slip through any window or crack in your house, which makes standard door locks entirely decorative.'
  },
  {
    tag: '#778 Mimikyu',
    title: 'Impostor Syndrome Icon',
    text: 'Draws a face on a rag in an attempt to be liked. Highly relatable for anyone attending their first industry networking event.'
  },
  {
    tag: '#354 Banette',
    title: 'Grudge with Cotton Fillings',
    text: 'A stuffed doll abandoned by a child that came back to life out of pure resentment. Do not throw away your old toys without a formal apology.'
  }
];

const dailyNotes = [
  { title: 'Project Planning', text: 'Spent three hours picking a color palette. Code remains completely unwritten.' },
  { title: 'Compiler Disagreement', text: 'Fixed one syntax error on line 12. Created fourteen new warnings on line 88.' },
  { title: 'Coffee Dependency', text: 'Third cup of coffee consumed. Hands are shaking but the loop is running.' },
  { title: 'The Lavender Town Syndrome', text: 'Listening to 8-bit chip music while trying to center a div element at 2 AM.' }
];

let moodIndex = 0;
let soundEnabled = storage.get('gengarSound', true);
let audioCtx = null;

function initAudio() {
  const soundBtn = document.querySelector('#sound-btn');
  if (soundBtn) {
    soundBtn.textContent = soundEnabled ? 'Sound: On' : 'Sound: Off';
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      storage.set('gengarSound', soundEnabled);
      soundBtn.textContent = soundEnabled ? 'Sound: On' : 'Sound: Off';
      showToast(soundEnabled ? 'Audio cues turned on.' : 'Audio cues muted.');
    });
  }
}

function playTone(freq = 400, type = 'sine', duration = 0.08) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {}
}

function initScrollAnimations() {
  const progress = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const top = window.scrollY || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const percent = height > 0 ? (top / height) * 100 : 0;
    if (progress) progress.style.width = percent + '%';
  }, { passive: true });

  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(el => observer.observe(el));
}

function initClock() {
  const clock = document.getElementById('clock');
  const tick = () => {
    if (clock) {
      clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  };
  setInterval(tick, 1000);
  tick();
}

const layer = document.getElementById('window-layer');
const titleEl = document.getElementById('window-title');
const contentEl = document.getElementById('window-content');
const toastEl = document.getElementById('toast');
let toastTimer = null;

function showToast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
}

function openModal(title, html) {
  if (!layer || !titleEl || !contentEl) return;
  titleEl.textContent = title;
  contentEl.innerHTML = html;
  layer.classList.add('open');
  playTone(500, 'triangle', 0.08);
}

function closeModal() {
  if (layer) layer.classList.remove('open');
}

function initInteractions() {
  document.getElementById('close-window')?.addEventListener('click', closeModal);
  layer?.addEventListener('click', e => {
    if (e.target === layer) closeModal();
  });

  document.getElementById('scroll-to-desktop')?.addEventListener('click', () => {
    playTone(480, 'sine', 0.1);
    document.getElementById('desktop')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('sanity-check-btn')?.addEventListener('click', () => {
    playTone(280, 'sawtooth', 0.2);
    showToast('Sanity check returned 404: Not Found.');
  });

  const gengarArt = document.getElementById('gengar-art');
  if (gengarArt) {
    gengarArt.addEventListener('click', () => {
      playTone(600, 'sine', 0.1);
      moodIndex = (moodIndex + 1) % moods.length;
      document.getElementById('mood-message').textContent = moods[moodIndex];
      showToast('Gengar acknowledged your click.');
    });
  }

  document.getElementById('mood-btn')?.addEventListener('click', () => {
    playTone(540, 'triangle', 0.08);
    moodIndex = (moodIndex + 1) % moods.length;
    document.getElementById('mood-message').textContent = moods[moodIndex];
    showToast('Gengar rotated his opinion.');
  });

  document.querySelectorAll('[data-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.open;
      if (type === 'lore') {
        const listHtml = pokedexNotes.map(n => `
          <div style="margin-bottom:14px; padding-bottom:12px; border-bottom:1px solid var(--line);">
            <span style="font-family:monospace; color:var(--pink); font-size:12px;">${n.tag}</span>
            <h4 style="margin:4px 0 6px; font-size:16px;">${n.title}</h4>
            <p style="margin:0; font-size:14px; color:var(--muted);">${n.text}</p>
          </div>
        `).join('');
        openModal('Pokedex Field Observations', listHtml);
      } else if (type === 'terminal') {
        const termHtml = `
          <p>Type "help" for a list of things you can ask.</p>
          <div class="terminal-box">
            <div class="terminal-log" id="term-log">gengar-shell v1.0. ready.</div>
            <form class="terminal-form" id="term-form">
              <span>&gt;</span>
              <input id="term-input" autocomplete="off" spellcheck="false" placeholder="type here..." />
            </form>
          </div>
        `;
        openModal('Terminal Shell', termHtml);
        setupTerminal();
      } else if (type === 'notes') {
        const notesHtml = dailyNotes.map(d => `
          <div style="margin-bottom:12px; padding:12px; background:#100b1a; border-radius:8px; border:1px solid var(--line);">
            <h4 style="margin:0 0 4px; font-size:14px; color:var(--text);">${d.title}</h4>
            <p style="margin:0; font-size:13px; color:var(--muted);">${d.text}</p>
          </div>
        `).join('');
        openModal('Daily Log & Warnings', notesHtml);
      } else if (type === 'game') {
        const gameHtml = `
          <p>Catch moving red dots. Avoid clicking outside. Arrow keys move your purple square.</p>
          <canvas id="game-canvas" class="canvas-game" width="600" height="280"></canvas>
          <div style="display:flex; justify-content:space-between; margin-top:10px; font-family:monospace; font-size:13px;">
            <span>Score: <b id="g-score">0</b></span>
            <button class="primary-btn" id="g-start" type="button">Start</button>
          </div>
        `;
        openModal('Bug Chaser', gameHtml);
        setupMiniGame();
      }
    });
  });
}

function setupTerminal() {
  const log = document.getElementById('term-log');
  const form = document.getElementById('term-form');
  const input = document.getElementById('term-input');
  if (!log || !form || !input) return;

  const replies = {
    help: 'Commands: help, status, gengar, coffee, clear, exit',
    status: 'System health: Survived another day. Bugs: Too many to count.',
    gengar: 'Gengar is currently staring directly at your browser tabs.',
    coffee: 'Cup 4 is brewing. Productivity remains hypothetical.',
    exit: 'You cannot exit this window through software. Close the tab.'
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    const val = input.value.trim().toLowerCase();
    if (!val) return;
    if (val === 'clear') {
      log.textContent = '';
      input.value = '';
      return;
    }
    const reply = replies[val] || 'Command not found. Try "help" to see available options.';
    log.textContent += '\n> ' + val + '\n' + reply;
    log.scrollTop = log.scrollHeight;
    input.value = '';
    playTone(340, 'triangle', 0.05);
  });
  input.focus();
}

function setupMiniGame() {
  const canvas = document.getElementById('game-canvas');
  const startBtn = document.getElementById('g-start');
  const scoreEl = document.getElementById('g-score');
  if (!canvas || !startBtn || !scoreEl) return;

  const ctx = canvas.getContext('2d');
  let running = false;
  let score = 0;
  const player = { x: 290, y: 130, size: 16 };
  let target = { x: 100, y: 80, size: 12 };
  const keys = {};

  const repositionTarget = () => {
    target.x = 20 + Math.random() * (canvas.width - 40);
    target.y = 20 + Math.random() * (canvas.height - 40);
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#8f65eb';
    ctx.fillRect(player.x, player.y, player.size, player.size);
    ctx.fillStyle = '#e65ca7';
    ctx.fillRect(target.x, target.y, target.size, target.size);
  };

  const loop = () => {
    if (!running) return;
    const speed = 4;
    if (keys.ArrowLeft) player.x = Math.max(0, player.x - speed);
    if (keys.ArrowRight) player.x = Math.min(canvas.width - player.size, player.x + speed);
    if (keys.ArrowUp) player.y = Math.max(0, player.y - speed);
    if (keys.ArrowDown) player.y = Math.min(canvas.height - player.size, player.y + speed);

    if (
      player.x < target.x + target.size &&
      player.x + player.size > target.x &&
      player.y < target.y + target.size &&
      player.y + player.size > target.y
    ) {
      score++;
      scoreEl.textContent = score;
      playTone(550, 'sine', 0.06);
      repositionTarget();
    }

    draw();
    requestAnimationFrame(loop);
  };

  window.addEventListener('keydown', e => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) keys[e.key] = true;
  });
  window.addEventListener('keyup', e => {
    if (keys[e.key]) keys[e.key] = false;
  });

  startBtn.addEventListener('click', () => {
    score = 0;
    scoreEl.textContent = '0';
    running = true;
    repositionTarget();
    loop();
    startBtn.textContent = 'Reset';
  });

  draw();
}
