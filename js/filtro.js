const searchInput = document.getElementById("search");
const tipoFilter = document.getElementById("filterTipo");
const excursiones = document.querySelectorAll(".card");

function filtrar() {
  const search = searchInput.value.toLowerCase();
  const tipo = tipoFilter.value;

  excursiones.forEach((card) => {
    const titulo = card.querySelector("h3").textContent.toLowerCase();
    const cardTipo = card.dataset.tipo;

    const matchSearch = titulo.includes(search);
    const matchTipo = !tipo || cardTipo === tipo;

    if (matchSearch && matchTipo) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

searchInput.addEventListener("input", filtrar);
tipoFilter.addEventListener("change", filtrar);
