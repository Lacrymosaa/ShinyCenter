async function initialize() {
    initFooterObserver();
    document.getElementById('help-btn').addEventListener('click', showGuide);
    document.getElementById('close-guide').addEventListener('click', hideGuide);

    const selectEl         = document.getElementById('pokemon-select');
    const counterEl        = document.getElementById('counter');
    const spaceBtn         = document.getElementById('space-btn');
    const resetBtn         = document.getElementById('reset-btn');
    const nursery          = document.getElementById('nursery');
    const resetModal       = document.getElementById('reset-modal');
    const confirmResetBtn  = document.getElementById('confirm-reset');
    const cancelResetBtn   = document.getElementById('cancel-reset');

    let count = parseInt(localStorage.getItem('softreset-count')) || 0;

    let sprite = null;
    let position = { x: 0, y: 0 };
    const jumpSize = 15;
    const jumpInterval = 600;
    const hopHeight = 10;
    const hopDuration = 200;

    const bgMap = {
      sprigatito: "./img/grassnorock.png",
      gimmighoul: "./img/grassground.png",
      moltres:    "./img/magmamountain.png",
      zapdos:     "./img/mountain.png",
      shaymin:    "./img/grass.png",
      cobalion:   "./img/cave.png",
      thundurus:  "./img/farm.png",
      tornadus:   "./img/farm.png",
      landorus:   "./img/farm.png",
      cosmog:     "./img/casino.png"
    };

    function updateCounter() {
        counterEl.textContent = count;
        localStorage.setItem('softreset-count', count);
    }

    function updateBackground() {
        const val = selectEl.value;
        const url = bgMap[val] || bgMap['SPRIGATITO'];
        nursery.style.backgroundImage = `url('${url}')`;
    }

    function initSprite() {
        nursery.innerHTML = '';
        updateBackground();

        sprite = new Image();
        sprite.src = `./sprites/${selectEl.value.toUpperCase()}.png`;
        sprite.style.position = 'absolute';
        sprite.style.width = '80px';
        sprite.style.height = '80px';
        sprite.style.transition = `top ${hopDuration}ms ease-out, left ${hopDuration}ms ease-out`;
        sprite.style.transform = 'scaleX(1)';
        position.x = (nursery.clientWidth - 80) / 2;
        position.y = (nursery.clientHeight - 80) / 2;
        sprite.style.left = position.x + 'px';
        sprite.style.top  = position.y + 'px';
        nursery.appendChild(sprite);
    }

    function randomJump() {
        if (!sprite) return;
        let dx = (Math.random() * 2 - 1) * jumpSize;
        let dy = (Math.random() * 2 - 1) * jumpSize;
        position.x = Math.max(0, Math.min(position.x + dx, nursery.clientWidth - 80));
        position.y = Math.max(0, Math.min(position.y + dy, nursery.clientHeight - 80));
        sprite.style.left = position.x + 'px';
        sprite.style.top  = position.y + 'px';
        const dirScale = dx > 0 ? -1 : 1;
        sprite.animate([
            { transform: `scaleX(${dirScale}) translateY(0)` },
            { transform: `scaleX(${dirScale}) translateY(-${hopHeight}px)` },
            { transform: `scaleX(${dirScale}) translateY(0)` }
        ], {
            duration: hopDuration,
            easing: 'ease-out',
            fill: 'forwards'
        });
    }

    function increment() {
        count++;
        updateCounter();
    }

    resetBtn.addEventListener('click', () => resetModal.classList.add('visible'));
    cancelResetBtn.addEventListener('click', () => resetModal.classList.remove('visible'));
    confirmResetBtn.addEventListener('click', () => {
        count = 0;
        updateCounter();
        resetModal.classList.remove('visible');
    });

    document.addEventListener('keydown', e => {
        if (e.code === 'Space') {
            e.preventDefault();
            increment();
        }
    });
    spaceBtn.addEventListener('click', increment);

    selectEl.addEventListener('change', () => initSprite());

    updateCounter();
    initSprite();
    setInterval(randomJump, jumpInterval);
}

document.addEventListener('DOMContentLoaded', initialize);
