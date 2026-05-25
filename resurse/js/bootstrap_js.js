// Reveal pt clasele cards din #produse .col.produs
document.addEventListener('DOMContentLoaded', function () {
  const t = 100; // delay in ms intre aparitii
  const selector = '#produse .col.produs';
  const cards = Array.from(document.querySelectorAll(selector));

  if (!cards.length) return;

  cards.forEach((card, i) => {
    // safety stuff daca cumva prin absurd nu primesc stilul inline de la sv
    if (!card.style.transition) {
      card.style.transition = 'opacity 300ms ease, transform 300ms ease';
    }
    if (!card.style.opacity) card.style.opacity = '0';
    if (!card.style.transform) card.style.transform = 'translateY(10px)';

    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, (i + 1) * t);
  });
});
