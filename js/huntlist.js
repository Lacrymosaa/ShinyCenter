let pokemonData = {};
let priorities = [];

async function initialize() {
  initFooterObserver();
  document.getElementById('help-btn').addEventListener('click', showGuide);
  document.getElementById('close-guide').addEventListener('click', hideGuide);

  const text = await fetch('./encounters.txt').then(r => r.text());
  pokemonData = parseEncounters(text);
  const names = Object.keys(pokemonData)
    .filter(n => n && n.toLowerCase() !== 'undefined' && !/^[0-9]/.test(n))
    .map(n => n.trim())
    .sort((a, b) => a.localeCompare(b));

  const listEl = document.getElementById('pokemon-list');
  const searchEl = document.getElementById('pokemon-search');
  const rightEl = document.getElementById('huntlist-right');

  const saved = localStorage.getItem('huntlist-priorities');
  if (saved) {
    try {
      priorities = JSON.parse(saved).filter(n => names.includes(n));
    } catch { priorities = []; }
  }

  function cap(n) {
    return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
  }

  function renderList(filter = '') {
    listEl.innerHTML = '';
    names.filter(n => n.toLowerCase().includes(filter.toLowerCase()))
      .forEach(name => {
        const item = document.createElement('div');
        item.className = 'pokemon-item';
        item.draggable = true;
        item.dataset.name = name;
        item.title = cap(name);
        item.innerHTML = `<img src="./sprites/${name}.png" alt="${cap(name)}">`;
        item.addEventListener('dragstart', e => {
          e.dataTransfer.setData('type', 'icon');
          e.dataTransfer.setData('name', name);
        });
        listEl.appendChild(item);
      });
  }

  searchEl.addEventListener('input', () => renderList(searchEl.value));
  renderList();

  function renderPriorities() {
    container = document.getElementById('huntlist-right');
    container.querySelectorAll('.priority-row').forEach(el => el.remove());
    priorities.forEach((name, i) => {
      const best = getBestSpot(name);
      const row = document.createElement('div');
      row.className = 'priority-row';
      row.draggable = true;
      row.dataset.index = i;
      row.innerHTML = `
        <div class="cell">${i+1}</div>
        <div class="cell name-col">
          <img src="./sprites/${name}.png" alt="" style="width:24px;height:24px;margin-right:6px;">${cap(name)}
        </div>
        <div class="cell spot-col">${best.route} (${best.chance}%)</div>
      `;
      row.addEventListener('dragstart', e => {
        e.dataTransfer.setData('type', 'row');
        e.dataTransfer.setData('index', i);
      });
      container.appendChild(row);
    });
    savePriorities();
  }

  function savePriorities() {
    localStorage.setItem('huntlist-priorities', JSON.stringify(priorities));
  }

  function addPriorityRow(name) {
    if (!priorities.includes(name)) {
      priorities.push(name);
      renderPriorities();
    }
  }

  function reorderPriorities(from, to) {
    if (from === to) return;
    const item = priorities.splice(from, 1)[0];
    priorities.splice(to, 0, item);
    renderPriorities();
  }

  rightEl.addEventListener('dragover', e => e.preventDefault());
  rightEl.addEventListener('drop', e => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type');
    if (type === 'icon') {
      addPriorityRow(e.dataTransfer.getData('name'));
    }
  });
  rightEl.addEventListener('dragover', e => {
    e.preventDefault();
    const tgt = e.target.closest('.priority-row');
    if (tgt) tgt.classList.add('drag-over');
  });
  rightEl.addEventListener('dragleave', e => {
    const tgt = e.target.closest('.priority-row');
    if (tgt) tgt.classList.remove('drag-over');
  });
  rightEl.addEventListener('drop', e => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type');
    if (type === 'row') {
      const from = +e.dataTransfer.getData('index');
      const tgt = e.target.closest('.priority-row');
      if (tgt) reorderPriorities(from, +tgt.dataset.index);
    }
    rightEl.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  });

  listEl.addEventListener('dragover', e => e.preventDefault());
  listEl.addEventListener('drop', e => {
    e.preventDefault();
    if (e.dataTransfer.getData('type') === 'row') {
      const idx = +e.dataTransfer.getData('index');
      priorities.splice(idx, 1);
      renderPriorities();
    }
  });

  renderPriorities();
}

document.addEventListener('DOMContentLoaded', initialize);

function getBestSpot(name) {
  const list = pokemonData[name] || [];
  return list.reduce((b, e) => e.chance > b.chance ? e : b, { route: 'N/A', chance: 0 });
}

function parseEncounters(text) {
  const data = {};
  let route = '';
  text.split('\n').forEach(line => {
    if (line.startsWith('[')) {
      const m = line.match(/#\s(.+)/);
      route = m ? m[1] : '';
    } else if (line.trim() && !line.startsWith('#')) {
      const parts = line.split(',');
      const chance = +parts[0];
      const name = parts[1];
      if (!data[name]) data[name] = [];
      data[name].push({ route, chance });
    }
  });
  return data;
}