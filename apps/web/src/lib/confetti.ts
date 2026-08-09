import confetti from 'canvas-confetti';

export function triggerQuizConfetti() {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#00E676', '#FFD700', '#00B0FF'],
  });
}

export function triggerBadgeUnlockConfetti() {
  confetti({
    particleCount: 80,
    spread: 90,
    origin: { y: 0.6 },
    colors: ['#8A2BE2', '#FFD700', '#00E676', '#FF1744'],
  });
}

export function triggerTrophyWinConfetti() {
  const duration = 2.5 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#FFD700', '#FFA000', '#FFD54F'],
    });

    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#FFD700', '#FFA000', '#FFD54F'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
