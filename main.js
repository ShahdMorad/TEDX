document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".carousel");
  const leftBtn = document.querySelector(".scroll-btn.left");
  const rightBtn = document.querySelector(".scroll-btn.right");

  if (!carousel || !leftBtn || !rightBtn) return;

  // width of 1 card + gap
  const getScrollAmount = () => {
    const card = carousel.querySelector(".card");
    if (!card) return 300; // fallback
    const cardStyle = window.getComputedStyle(card);
    const cardWidth = card.offsetWidth;
    const gap = parseInt(window.getComputedStyle(carousel).gap) || 20;
    return cardWidth + gap;
  };

  leftBtn.addEventListener("click", () => {
    carousel.scrollBy({ left: -getScrollAmount(), behavior: "smooth" });
  });

  rightBtn.addEventListener("click", () => {
    carousel.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
  });
});





  /** ===================== 🎶 LYRE SCROLL ===================== **/
  const lyre = document.getElementById("lyre");
  const apolloText = document.getElementById("apollo-text");

  window.addEventListener("scroll", function () {
    const scrollValue = window.scrollY;
    const maxScroll = 58.4; // Cap scroll movement
    const cappedScroll = Math.min(scrollValue, maxScroll);

    lyre.style.top = cappedScroll * 0.9 + "px";
  });


  /** ===================== 🔠 GREEK LETTER BACKGROUND ===================== **/
  const greekLetters = [
    "Α", "Β", "Γ", "Δ", "Ε", "Ζ", "Η", "Θ", "Ι", "Κ", "Λ",
    "Μ", "Ν", "Ξ", "Ο", "Π", "Ρ", "Σ", "Τ", "Υ", "Φ", "Χ", "Ψ", "Ω"
  ];
  const container = document.getElementById("backgroundLetters");

  const isMobile = window.innerWidth <= 768;
  const letterCount = isMobile ? 50 : 100;

  for (let i = 0; i < letterCount; i++) {
    const span = document.createElement("span");
    span.textContent = greekLetters[Math.floor(Math.random() * greekLetters.length)];

    span.style.left = Math.random() * 100 + "vw";
    span.style.top = Math.random() * 100 + "vh";

    // Smaller size for mobile
    const fontSize = isMobile ? Math.random() * 1.5 + 0.5 : Math.random() * 2 + 1;
    span.style.fontSize = fontSize + "rem";

    span.style.animationDuration = 5 + Math.random() * 10 + "s";
    container.appendChild(span);
  }


  /** ===================== ⏳ COUNTDOWN TIMER ===================== **/
  const eventDate = new Date("September 26, 2025 18:00:00").getTime();
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


  /** ===================== ✨ SCROLL ANIMATIONS ===================== **/
  const animatedElements = document.querySelectorAll(".animate-on-scroll");

  window.addEventListener("scroll", () => {
    animatedElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        el.classList.add("visible");
      }
    });
  });


  /** ===================== 🔴 TEDx HOVER + FOLLOW ===================== **/
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


