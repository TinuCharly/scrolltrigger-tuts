import { servicesCopy } from "./services.js";

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
    ScrollTrigger.update();
  });

  gsap.ticker.lagSmoothing(0);

  const stickySection = document.querySelector(".sticky");
  const stickyHeight = window.innerHeight * 8;
  const services = document.querySelectorAll(".service");
  const indicator = document.querySelector(".indicator");
  const currentCount = document.querySelector(".current-count");
  const serviceImg = document.querySelector(".service-img");
  const serviceCopy = document.querySelector(".service-copy p");

  const serviceHeight = 60;
  const imgHeight = 250;

  serviceCopy.textContent = servicesCopy[0][0];
  let currentSplitText = new SplitType(serviceCopy, { types: "lines" });

  const measureContainer = document.createElement("div");
  measureContainer.style.cssText = `
    position:absolute;
    visibility: hidden;
    height:auto;
    width: auto;
    white-space: nowrap;
    font-size: 60px;
    font-weight: 600;
    text-transform: uppercase;`;

  document.body.appendChild(measureContainer);
  const serviceWidths = Array.from(services).map((service) => {
    measureContainer.textContent = service.querySelector("p").textContent;
    return measureContainer.offsetWidth + 8;
  });

  document.body.removeChild(measureContainer);

  gsap.set(indicator, {
    width: serviceWidths[0],
    xPercent: -50,
    left: "50%",
  });

  const scrollPerService = window.innerHeight;
  let currentIndex = 0;

  const animateTextChange = (index) => {
    return new Promise((resolve) => {
      gsap.to(currentSplitText.lines, {
        opacity: 0,
        y: -20,
        duration: 0.5,
        stagger: 0.03,
        ease: "power3.inOut",
        onComplete: () => {
          currentSplitText.revert();

          const newText = servicesCopy[index][0];
          serviceCopy.textContent = newText;

          currentSplitText = new SplitType(serviceCopy, {
            types: "lines",
          });

          gsap.set(currentSplitText.lines, {
            opacity: 0,
            y: 20,
          });

          gsap.to(currentSplitText.lines, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.03,
            ease: "power3.out",
            onComplete: resolve,
          });
        },
      });
    });
  };

  ScrollTrigger.create({
    trigger: stickySection,
    start: "top top",
    end: `${stickyHeight}px`,
    pin: true,
    scrub: 1, // Makes scrolling smooth
    onUpdate: async (self) => {
      const progress = self.progress;
      gsap.set(".progress", { scaleY: progress });

      const scrollPosition = Math.max(0, self.scroll() - window.innerHeight);
      const activeIndex = Math.floor(scrollPosition / scrollPerService);

      if (
        activeIndex >= 0 &&
        activeIndex < services.length &&
        currentIndex !== activeIndex
      ) {
        currentIndex = activeIndex;

        services.forEach((service) => service.classList.remove("active"));
        services[activeIndex].classList.add("active");

        await Promise.all([
          gsap.to(indicator, {
            y: activeIndex * serviceHeight,
            width: serviceWidths[activeIndex],
            duration: 0.5,
            ease: "power3.inOut",
            overwrite: true,
          }),

          gsap.to(serviceImg, {
            y: -(activeIndex * imgHeight),
            duration: 0.5,
            ease: "power3.inOut",
            overwrite: true
          }),

          gsap.to(currentCount, {
            innerText: activeIndex + 1,
            snap: {
              innerText: 1
            },
            duration: 0.3,
            ease: "power3.out",
          }),

          animateTextChange(activeIndex),
        ]);
      }
    },
  });

  

services.forEach((service, index) => {
  service.addEventListener("click", () => {
    const targetScroll = window.innerHeight + index * scrollPerService;

    lenis.scrollTo(targetScroll, {
      duration: 1, // Smooth scroll duration
      easing: (t) => 1 - Math.pow(1 - t, 4), // Ease-out effect
    });
  });
});

});
