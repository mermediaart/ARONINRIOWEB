const searchInput = document.getElementById("search");
const tipoFilter = document.getElementById("filterTipo");
const personasFilter = document.getElementById("filterPersonas");
const alojamientos = document.querySelectorAll(".card");

function filtrar() {
  const search = searchInput.value.toLowerCase();
  const tipo = tipoFilter.value;
  const personas = personasFilter.value;

  alojamientos.forEach((card) => {
    const titulo = card.querySelector("h3").textContent.toLowerCase();
    const cardTipo = card.dataset.tipo;
    const cardPersonas = card.dataset.personas.split(",");

    const matchSearch = titulo.includes(search);
    const matchTipo = !tipo || cardTipo === tipo;
    const matchPersonas = !personas || cardPersonas.includes(personas);

    if (matchSearch && matchTipo && matchPersonas) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

searchInput.addEventListener("input", filtrar);
tipoFilter.addEventListener("change", filtrar);
personasFilter.addEventListener("change", filtrar);
