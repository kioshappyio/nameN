// Data nama disimpan setelah diambil dari data.json
let namesData = [];

// Fungsi untuk memuat data JSON hanya sekali
function loadData() {
  const loading = document.getElementById("loading"); // Animasi loading
  loading.classList.remove("d-none"); // Tampilkan animasi loading

  fetch("https://kioshappyio.github.io/nameN/data.json")
    .then(response => {
      console.log("Status Response:", response.status); // Debug status
      if (!response.ok) {
        throw new Error(`Gagal memuat data JSON: ${response.statusText}`);
      }
      return response.json();
    })
    .then(names => {
      if (!Array.isArray(names)) {
        throw new Error("Data JSON tidak valid (harus berupa array).");
      }

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

      namesData = names; // Simpan data di cache
      console.log("Data Loaded:", namesData); // Debug data yang dimuat
      loading.classList.add("d-none"); // Sembunyikan animasi loading
    })
    .catch(error => {
      console.error("Error loading data:", error.message);
      loading.classList.add("d-none"); // Sembunyikan loading jika gagal
      Swal.fire({
        title: "Error!",
        text: `Gagal memuat data: ${error.message}. Periksa koneksi Anda.`,
        icon: "error",
        confirmButtonText: "Tutup"
      });
    });
}

// Panggil loadData saat halaman pertama kali dimuat
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  updateFavorites();
});

// Event listener untuk pencarian nama
document.getElementById("search").addEventListener("click", () => {
  const category = document.getElementById("category").value;
  const gender = document.getElementById("gender").value;
  const nameFormat = document.getElementById("nameFormat").value;

  console.log("Kategori yang dipilih:", category);  // Debug kategori
  console.log("Gender yang dipilih:", gender);      // Debug gender

  // Filter data berdasarkan kategori dan gender
  const results = namesData.filter(name => {
    // Cek jika kategori atau gender yang dipilih adalah "all"
    const matchesCategory = (category === "all" || name.category === category);
    const matchesGender = (gender === "all" || name.gender === gender);
    
    return matchesCategory && matchesGender;
  });

  const resultsList = document.getElementById("results-list");
  resultsList.innerHTML = ""; // Bersihkan hasil pencarian sebelumnya

  if (results.length === 0) {
    // Jika tidak ada hasil
    resultsList.innerHTML = `<p class="text-center text-muted">Tidak ada nama yang cocok dengan pencarian Anda.</p>`;
    return;
  }

  // Render hasil pencarian
  renderResults(results, nameFormat, resultsList);
});

// Fungsi untuk merender hasil pencarian
function renderResults(results, nameFormat, resultsList) {
  // Tentukan berapa banyak hasil yang akan ditampilkan per halaman
  const resultsPerPage = 12;
  
  // Hitung total halaman yang diperlukan
  const totalPages = Math.ceil(results.length / resultsPerPage);

  // Loop untuk menampilkan hasil sesuai dengan halaman
  for (let page = 1; page <= totalPages; page++) {
    const startIndex = (page - 1) * resultsPerPage;
    const endIndex = Math.min(page * resultsPerPage, results.length);

    // Ambil subset hasil pencarian untuk halaman ini
    const pageResults = results.slice(startIndex, endIndex);

    // Render hasil untuk halaman ini
    pageResults.forEach(name => {
      let nameToDisplay;
      if (nameFormat === "first") {
        nameToDisplay = name.name.split(" ")[0]; // Ambil nama depan
      } else if (nameFormat === "middle") {
        nameToDisplay = name.name.split(" ").slice(0, 2).join(" "); // Ambil nama tengah
      } else if (nameFormat === "full") {
        nameToDisplay = name.name; // Ambil nama lengkap
      }

      const col = document.createElement("div");
      col.className = "col-md-4 mb-4";

      col.innerHTML = `
        <div class="card shadow">
          <div class="card-body text-center">
            <h5>${nameToDisplay}</h5>
            <p>${name.meaning}</p>
            <button class="btn btn-primary sweet-button" onclick="saveToFavorites('${nameToDisplay}')">
              <i class="fas fa-heart"></i> Simpan
            </button>
          </div>
        </div>
      `;
      resultsList.appendChild(col);
    });
  }

  // Tambahkan navigasi untuk berpindah halaman
  renderPagination(results, resultsPerPage, totalPages);
}

// Fungsi untuk merender navigasi halaman
function renderPagination(results, resultsPerPage, totalPages) {
  const paginationList = document.getElementById("pagination");
  paginationList.innerHTML = ""; // Bersihkan navigasi sebelumnya

  for (let page = 1; page <= totalPages; page++) {
    const button = document.createElement("button");
    button.className = "btn btn-secondary btn-sm mx-1";
    button.textContent = page;
    button.onclick = () => {
      const resultsList = document.getElementById("results-list");
      resultsList.innerHTML = ""; // Bersihkan hasil pencarian sebelumnya

      const startIndex = (page - 1) * resultsPerPage;
      const endIndex = Math.min(page * resultsPerPage, results.length);
      const pageResults = results.slice(startIndex, endIndex);

      pageResults.forEach(name => {
        let nameToDisplay;
        if (nameFormat === "first") {
          nameToDisplay = name.name.split(" ")[0]; // Ambil nama depan
        } else if (nameFormat === "middle") {
          nameToDisplay = name.name.split(" ").slice(0, 2).join(" "); // Ambil nama tengah
        } else if (nameFormat === "full") {
          nameToDisplay = name.name; // Ambil nama lengkap
        }

        const col = document.createElement("div");
        col.className = "col-md-4 mb-4";

        col.innerHTML = `
          <div class="card shadow">
            <div class="card-body text-center">
              <h5>${nameToDisplay}</h5>
              <p>${name.meaning}</p>
              <button class="btn btn-primary sweet-button" onclick="saveToFavorites('${nameToDisplay}')">
                <i class="fas fa-heart"></i> Simpan
              </button>
            </div>
          </div>
        `;
        resultsList.appendChild(col);
      });
    };
    paginationList.appendChild(button);
  }
}

// Fungsi untuk menyimpan nama favorit ke localStorage
function saveToFavorites(name) {
  let favorites;
  try {
    favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  } catch (e) {
    console.error("Error parsing favorites:", e.message);
    favorites = [];
  }

  if (!favorites.includes(name)) {
    favorites.push(name);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    updateFavorites(); // Perbarui tampilan favorit
    Swal.fire({
      title: "Tersimpan!",
      text: `${name} ditambahkan ke favorit.`,
      icon: "success",
      confirmButtonText: "Tutup",
      customClass: {
        confirmButton: "btn btn-success"
      }
    });
  } else {
    Swal.fire({
      title: "Nama Sudah Ada!",
      text: `${name} sudah ada di daftar favorit Anda.`,
      icon: "info",
      confirmButtonText: "Tutup",
      customClass: {
        confirmButton: "btn btn-info"
      }
    });
  }
}

// Fungsi untuk memperbarui tampilan favorit
function updateFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const list = document.getElementById("favorites-list");
  list.innerHTML = ""; // Bersihkan daftar favorit

  if (favorites.length === 0) {
    list.innerHTML = `<p class="text-center text-muted">Belum ada nama favorit.</p>`;
    return;
  }

  favorites.forEach(name => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      ${name}
      <button class="btn btn-danger btn-sm" onclick="removeFromFavorites('${name}')">
        <i class="fas fa-trash"></i>
      </button>
    `;
    list.appendChild(li);
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
    confirmButtonText: "Tutup",
    customClass: {
      confirmButton: "btn btn-danger"
    }
  });
}
