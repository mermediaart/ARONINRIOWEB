document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll("#slider .slide");
  const prevBtn = document.querySelector("#slider .prev");
  const nextBtn = document.querySelector("#slider .next");
  let index = 0;

  function showSlide(i) {
    slides.forEach(slide => {
      slide.classList.remove("active");
      const video = slide.querySelector("video");
      if (video) video.pause();
    });

    slides[i].classList.add("active");
    const activeVideo = slides[i].querySelector("video");
    if (activeVideo) activeVideo.play();
  }

  prevBtn.addEventListener("click", () => {
    index = (index === 0) ? slides.length - 1 : index - 1;
    showSlide(index);
  });

  nextBtn.addEventListener("click", () => {
    index = (index === slides.length - 1) ? 0 : index + 1;
    showSlide(index);
  });

  // Inicializa el slider
  showSlide(index);
});
