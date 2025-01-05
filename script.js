let namesData = [];

function loadData() {
  const loading = document.getElementById("loading");
  loading.classList.remove("d-none");

  fetch("https://kioshappyio.github.io/nameN/data.json")
    .then(response => {
      if (!response.ok) {
        throw new Error(`Gagal memuat data JSON: ${response.statusText}`);
      }
      return response.json();
    })
    .then(names => {
      names.forEach(name => {
        if (
          !name.hasOwnProperty("name") ||
          !name.hasOwnProperty("category") ||
          !name.hasOwnProperty("gender") ||
          !name.hasOwnProperty("meaning")
        ) {
          throw new Error("Struktur data JSON tidak sesuai.");
        }
      });

      namesData = names;
      loading.classList.add("d-none");
    })
    .catch(error => {
      loading.classList.add("d-none");
      Swal.fire({
        title: "Error!",
        text: `Gagal memuat data: ${error.message}`,
        icon: "error",
        confirmButtonText: "Tutup"
      });
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  updateFavorites();
});

document.getElementById("search").addEventListener("click", () => {
  const category = document.getElementById("category").value;
  const gender = document.getElementById("gender").value;
  const nameFormat = document.getElementById("nameFormat").value;

  // Filter nama berdasarkan kategori dan jenis kelamin
  let filteredNames = namesData.filter(name => {
    return (
      (category === "all" || name.category === category) &&
      (gender === "all" || name.gender === gender)
    );
  });

  // Menampilkan hasil berdasarkan format nama
  renderResults(filteredNames, nameFormat);
});

// Fungsi untuk merender hasil pencarian berdasarkan format nama
function renderResults(names, format) {
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = ""; // Bersihkan hasil sebelumnya

  names.forEach(name => {
    let displayedName = "";
    if (format === "first") {
      displayedName = name.name.split(" ")[0]; // Menampilkan nama pertama
    } else if (format === "middle") {
      displayedName = name.name.split(" ")[1] || ""; // Menampilkan nama tengah
    } else if (format === "full") {
      displayedName = name.name; // Menampilkan nama lengkap
    }

    const resultItem = document.createElement("div");
    resultItem.classList.add("result-item");
    resultItem.innerHTML = `
      <p>${displayedName}</p>
      <p><strong>Arti:</strong> ${name.meaning}</p>
      <button class="btn btn-primary" onclick="saveToFavorites('${name.name}')">Favoritkan</button>
    `;
    resultsContainer.appendChild(resultItem);
  });
}

// Fungsi untuk menyimpan nama ke favorit
function saveToFavorites(name) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favorites.includes(name)) {
    favorites.push(name);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    updateFavorites();
    Swal.fire({
      title: "Favorit Ditambahkan!",
      text: `${name} telah ditambahkan ke favorit.`,
      icon: "success",
      confirmButtonText: "Tutup"
    });
  } else {
    Swal.fire({
      title: "Sudah Favorit!",
      text: `${name} sudah ada dalam favorit.`,
      icon: "info",
      confirmButtonText: "Tutup"
    });
  }
}

// Fungsi untuk memperbarui daftar favorit yang ditampilkan
function updateFavorites() {
  const favoritesList = document.getElementById("favorites");
  favoritesList.innerHTML = ""; // Bersihkan daftar favorit sebelumnya
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  
  favorites.forEach(name => {
    const favoriteItem = document.createElement("div");
    favoriteItem.classList.add("favorite-item");
    favoriteItem.innerHTML = `
      <p>${name}</p>
      <button class="btn btn-danger" onclick="removeFromFavorites('${name}')">Hapus</button>
    `;
    favoritesList.appendChild(favoriteItem);
  });
}

// Fungsi untuk menghapus nama dari favorit
function removeFromFavorites(name) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter(fav => fav !== name);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavorites(); // Perbarui tampilan
  Swal.fire({
    title: "Dihapus!",
    text: `${name} dihapus dari favorit.`,
    icon: "error",
    confirmButtonText: "Tutup"
  });
                          }
