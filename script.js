let schools = [];
let filteredData = [];
let currentPage = 1;
const entriesPerPage = 10;

// Fungsi Haversine untuk menghitung jarak antara dua titik koordinat
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius Bumi dalam kilometer
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Fungsi untuk mendapatkan lokasi pengguna
function getUserLocation(callback) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      callback(position.coords.latitude, position.coords.longitude);
    });
  } else {
    alert("Geolocation tidak didukung oleh browser ini.");
  }
}

// Fungsi untuk memuat data dari CSV
function loadCSVData() {
  fetch("Data GIS Sekolah.csv")
    .then((response) => response.text())
    .then((data) => {
      Papa.parse(data, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          schools = results.data.map((school) => ({
            no: school.no,
            name: school.sekolah,
            latitude: parseFloat(school.latitude),
            longitude: parseFloat(school.longitude),
            mapLink: `https://www.google.com/maps?q=${school.latitude},${school.longitude}`,
            img: `assets/${school.nama_gambar}`,
          }));

          getUserLocation((userLat, userLon) => {
            schools = schools.map((school) => {
              school.distance = calculateDistance(
                userLat,
                userLon,
                school.latitude,
                school.longitude
              ).toFixed(2); // jarak dalam km
              return school;
            });
            filteredData = schools;
            displayTableData();
          });
        },
      });
    });
}

// Fungsi untuk menampilkan data di tabel dengan pagination
function displayTableData() {
  const tableBody = document.getElementById("schoolTable");
  tableBody.innerHTML = "";

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, filteredData.length);

  for (let i = startIndex; i < endIndex; i++) {
    const school = filteredData[i];
    const row = document.createElement("tr");

    row.innerHTML = `
      <td class="px-4 py-2 border-b border-gray-200 text-center">${school.no}</td>
      <td class="px-4 py-2 border-b border-gray-200">${school.name}</td>
      <td class="px-4 py-2 border-b border-gray-200 text-center">
        <a href="${school.mapLink}" target="_blank" class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-full text-sm">Buka Map</a>
      </td>
      <td class="px-4 py-2 border-b border-gray-200 text-center">${school.distance} km</td>
      <td class="px-4 py-2 border-b border-gray-200 text-center">
        <img src="${school.img}" alt="${school.name}" class="w-16 h-12 rounded-md object-cover">
      </td>
    `;

    tableBody.appendChild(row);
  }

  document.getElementById("entriesInfo").textContent = `Showing ${
    startIndex + 1
  } to ${endIndex} of ${filteredData.length} entries`;

  document.getElementById("prevButton").disabled = currentPage === 1;
  document.getElementById("nextButton").disabled =
    currentPage === Math.ceil(filteredData.length / entriesPerPage);
}

// Fungsi untuk navigasi halaman sebelumnya
function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    displayTableData();
  }
}

// Fungsi untuk navigasi halaman berikutnya
function nextPage() {
  if (currentPage < Math.ceil(filteredData.length / entriesPerPage)) {
    currentPage++;
    displayTableData();
  }
}

// Fungsi untuk mencari data berdasarkan input pada search bar
function searchFunction() {
  const searchQuery = document.getElementById("search").value.toLowerCase();
  filteredData = schools.filter((school) =>
    school.name.toLowerCase().includes(searchQuery)
  );
  currentPage = 1; // Reset ke halaman pertama saat mencari
  displayTableData();
}

// Muat data dari CSV saat halaman pertama kali dimuat
window.onload = loadCSVData;
