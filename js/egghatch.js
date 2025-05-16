async function initialize() {
    initFooterObserver();
    document.getElementById('help-btn').addEventListener('click', showGuide);
    document.getElementById('close-guide').addEventListener('click', hideGuide);

    const counterEl = document.getElementById('counter');
    const spaceBtn = document.getElementById('space-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resetModal = document.getElementById('reset-modal');
    const confirmResetBtn = document.getElementById('confirm-reset');
    const cancelResetBtn = document.getElementById('cancel-reset');

    let count = (() => {
        const stored = localStorage.getItem('egghatch-count');
        const parsed = parseInt(stored);
        return !isNaN(parsed) ? parsed : 0;
    })();


    function updateCounter() {
        counterEl.textContent = count;
        localStorage.setItem('egghatch-count', count);
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

    updateCounter();
    initSprite();
}

document.addEventListener('DOMContentLoaded', initialize);
