async function fetchEncounters() {
    const response = await fetch('./encounters.txt');
    const text = await response.text();
    return text;
}

function parseEncounters(encounters) {
    const pokemonData = {};
    const lines = encounters.split('\n');
    let currentRoute = '';

    for (const line of lines) {
        if (line.startsWith('[')) {
            currentRoute = line.match(/#\s(.+)/)?.[1] || '';
        } else if (line.trim() && !line.startsWith('#')) {
            const parts = line.trim().split(',');
            if (parts.length >= 4) {
                const chance = parseInt(parts[0], 10);
                const name = parts[1];
                if (!pokemonData[name]) pokemonData[name] = [];
                pokemonData[name].push({ route: currentRoute, chance });
            }
        }
    }

    return pokemonData;
}

let pokemonData = {};

function showGuide() {
    const modal = document.getElementById('guide-modal');
    modal.classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function hideGuide() {
    const modal = document.getElementById('guide-modal');
    modal.classList.remove('visible');
    document.body.style.overflow = 'auto';
}

async function initialize() {
    const encounters = await fetchEncounters();
    pokemonData = parseEncounters(encounters);
    populatePokemonSelect();
    calculateChances();
    initFooterObserver()
    document.getElementById('help-btn')
        .addEventListener('click', showGuide);

    document.getElementById('close-guide')
        .addEventListener('click', hideGuide);
}

function initFooterObserver() {
    const sentinel = document.getElementById('footer-sentinel');
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            document.body.classList.toggle('footer-visible', e.isIntersecting);
        });
    }, { root: null, threshold: 0 });
    obs.observe(sentinel);
}

function populatePokemonSelect() {
    const select = document.getElementById('pokemon-select');
    const sortedNames = Object.keys(pokemonData).sort();

    select.innerHTML = sortedNames
        .map(name => `<option value="${name}">${name}</option>`)
        .join('');

    if (sortedNames.length) displayPokemonInfo();
}

function displayPokemonInfo() {
    const selectedPokemon = document.getElementById('pokemon-select').value;
    const image = document.getElementById('pokemon-image');
    const routeInfo = document.getElementById('route-info');
    const chainLength = parseInt(document.getElementById('chain-length').value) || 0;
    if (chainLength > 1023) chainLength = 1023;
    const hasShinyCharm = document.getElementById('shiny-charm').checked;
    const base = hasShinyCharm ? chainLength + 1 + 3 : chainLength + 1;

    image.src = `./sprites/${selectedPokemon}.png`;
    image.onerror = () => { image.src = './sprites/SDITTO.png'; };

    if (!pokemonData[selectedPokemon]) {
        routeInfo.innerHTML = '';
        return;
    }

    const rows = pokemonData[selectedPokemon]
        .map(entry => {
            const shinyChanceBase = base / 1024;
            const routeChance = entry.chance / 100;
            const shinyChanceFraction = `1/${Math.round(1 / (shinyChanceBase * routeChance))}`;
            const shinyChancePercent = (shinyChanceBase * routeChance * 100).toFixed(3);

            return `<tr>
        <td>${entry.route}</td>
        <td>${entry.chance}%</td>
        <td>${shinyChanceFraction}</td>
        <td>${shinyChancePercent}%</td>
      </tr>`;
        })
        .join('');

    routeInfo.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Location</th>
          <th>Chance</th>
          <th>Shiny Chance (Fraction)</th>
          <th>Shiny Chance (%)</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function calculateChances() {
    let chainLength = parseInt(document.getElementById('chain-length').value) || 0;
    if (chainLength > 1023) chainLength = 1023;
    const hasShinyCharm = document.getElementById('shiny-charm').checked;
    const base = hasShinyCharm ? chainLength + 1 + 3 : chainLength + 1;
    const fraction = `1/${Math.round(1024 / base)}`;
    const percentage = ((base / 1024) * 100).toFixed(3);

    document.getElementById('fraction-result').textContent = `Chance (Fraction): ${fraction}`;
    document.getElementById('percent-result').textContent = `Chance (%): ${percentage}%`;

    if (document.getElementById('pokemon-select')) {
        displayPokemonInfo();
    }
}

document.addEventListener('DOMContentLoaded', initialize);
