document.addEventListener('DOMContentLoaded', function () {
  const lyre = document.getElementById('lyre');
  const apolloText = document.getElementById('apollo-text');

  window.addEventListener('scroll', function () {
    const scrollValue = window.scrollY;

    // Cap scroll movement at 71.2
    const maxScroll = 58.400001525878906;
    const cappedScroll = Math.min(scrollValue, maxScroll);

    // Lyre movement
    lyre.style.top = cappedScroll * 0.9 + 'px';

  });
});
  const greekLetters = ["Α", "Β", "Γ", "Δ", "Ε", "Ζ", "Η", "Θ", "Ι", "Κ", "Λ", "Μ", "Ν", "Ξ", "Ο", "Π", "Ρ", "Σ", "Τ", "Υ", "Φ", "Χ", "Ψ", "Ω"];
const container = document.getElementById("backgroundLetters");

const isMobile = window.innerWidth <= 768;

const letterCount = isMobile ? 50 : 100;
for (let i = 0; i < letterCount; i++) 
 {
  const span = document.createElement("span");
  span.textContent = greekLetters[Math.floor(Math.random() * greekLetters.length)];

  span.style.left = Math.random() * 100 + "vw";
  span.style.top = Math.random() * 100 + "vh";

  // Smaller size for mobile
  const fontSize = isMobile ? Math.random() * 1.5 + 0.5 : Math.random() * 2 + 1;
  span.style.fontSize = fontSize + "rem";

  span.style.animationDuration = (5 + Math.random() * 10) + "s";
  container.appendChild(span);
}

  const leftBtn = document.querySelector('.scroll-btn.left');
  const rightBtn = document.querySelector('.scroll-btn.right');
  const carousel = document.querySelector('.carousel');

  leftBtn.addEventListener('click', () => {
    carousel.scrollBy({
      left: -300,
      behavior: 'smooth'
    });
  });

  rightBtn.addEventListener('click', () => {
    carousel.scrollBy({
      left: 300,
      behavior: 'smooth'
    });
  });
  
 
  const Carousel = document.getElementById('carousel');

  function autoScrollByTwoCards() {
    const card = carousel.querySelector('.card');
    const gap = 20; // Must match the CSS `gap`
    const cardWidth = card.offsetWidth + gap;
    const scrollStep = cardWidth * 2;

    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    let currentScroll = carousel.scrollLeft;

    if (currentScroll + scrollStep >= maxScroll) {
      carousel.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      carousel.scrollBy({ left: scrollStep, behavior: 'smooth' });
    }
  }
 
  const eventDate = new Date("August 31, 2025 18:00:00").getTime();
  const timer = setInterval(() => {
    const now = new Date().getTime();
    const distance = eventDate - now;

    if (distance < 0) {
      clearInterval(timer);
      document.getElementById("countdown").innerHTML = "The event has begun!";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / 1000 / 60) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    document.getElementById("countdown").innerHTML = 
      `⏳ ${days}d ${hours}h ${minutes}m ${seconds}s`;
  }, 1000);

  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  window.addEventListener('scroll', () => {
    animatedElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        el.classList.add('visible');
      }
    });
  });
 

    const tedx = document.getElementById("tedx");

    // Add hover animation
    tedx.addEventListener("mouseenter", () => {
      tedx.classList.add("hovered");
    });

    tedx.addEventListener("mouseleave", () => {
      tedx.classList.remove("hovered");
    });

    // Make TEDx follow cursor slightly
    document.addEventListener("mousemove", (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const moveX = (e.clientX - centerX) * 0.02;
      const moveY = (e.clientY - centerY) * 0.02;

      tedx.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
 const scrollAmount = () => {
  const card = document.querySelector(".carousel .card");
  const style = getComputedStyle(card);
  const gap = 20; // match your CSS gap
  return card.offsetWidth + gap;
};

leftBtn.addEventListener("click", () => {
  carousel.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
});

rightBtn.addEventListener("click", () => {
  carousel.scrollBy({ left: scrollAmount(), behavior: "smooth" });
});