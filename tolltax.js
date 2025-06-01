// 🌗 Theme Toggle
const themeBtn = document.getElementById("themeToggle");

themeBtn.addEventListener("click", function () {
  document.body.classList.toggle("dark-theme");
  const isDark = document.body.classList.contains("dark-theme");
  themeBtn.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("theme", isDark ? "Dark Mode" : "Light Mode");
});

document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("theme");
  if (saved === "Dark Mode") {
    document.body.classList.add("dark-theme");
    themeBtn.textContent = "☀️";
  }

  const tollForm = document.getElementById("tollForm");
  if (tollForm) {
    tollForm.addEventListener("submit", function (e) {
      e.preventDefault();
      calculateToll();
    });
  }

  const paymentForm = document.getElementById("paymentForm");
  if (paymentForm) {
    paymentForm.addEventListener("submit", function (e) {
      e.preventDefault();
      handlePayment();
    });
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      handleLogin();
    });
  }

  const startMapBtn = document.getElementById("startMapBtn");
  if (startMapBtn) {
    startMapBtn.addEventListener("click", () => {
      document.getElementById("liveMapContainer").style.display = "block";
      startLiveMap();
    });
  }
});

// 🗺 Initialize Route Map
let map, directionsService, directionsRenderer;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 28.6139, lng: 77.2090 },
    zoom: 7,
  });
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);
}
window.initMap = initMap;

// 🚘 Toll Calculation
const TOLL_RATE_PER_KM = 0.5;

function calculateToll() {
  const start = document.getElementById("start").value;
  const destination = document.getElementById("destination").value;
  const tollResult = document.getElementById("tollResult");
  const amountInput = document.getElementById("amount");

  if (!start || !destination) {
    tollResult.textContent = "Please enter both start and destination.";
    return;
  }

  directionsService.route(
    {
      origin: start,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    function (response, status) {
      if (status === "OK") {
        directionsRenderer.setDirections(response);

        const distanceInKm = response.routes[0].legs[0].distance.value / 1000;
        const tollAmount = Math.round(distanceInKm * TOLL_RATE_PER_KM);

        tollResult.innerHTML = `Distance: ${distanceInKm.toFixed(2)} km<br/>Estimated Toll: ₹${tollAmount}`;
        amountInput.value = tollAmount;
      } else {
        tollResult.textContent = "Could not calculate route. Check locations.";
      }
    }
  );
}

// 💳 Payment Form Handling + Real-Time Map Trigger
function handlePayment() {
  const amount = document.getElementById("amount").value;
  const method = document.getElementById("paymentMethod").value;
  const transactionId = document.getElementById("transactionId").value;
  const responseMessage = document.getElementById("responseMessage");

  if (!amount || !method) {
    responseMessage.textContent = "Please complete the payment form.";
    responseMessage.className = "text-danger";
    return;
  }

  if (method !== "Cash" && transactionId.trim() === "") {
    responseMessage.textContent = "Transaction ID is required for digital payments.";
    responseMessage.className = "text-danger";
    return;
  }

  responseMessage.textContent = "Payment Successful!";
  responseMessage.className = "text-success";

  // Show live map start button
  document.getElementById("startMapBtn").style.display = "inline-block";
}

// 🗺 Real-time Map After Payment
let liveMap, liveMarker, watchId;

function startLiveMap() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  liveMap = new google.maps.Map(document.getElementById("liveMap"), {
    center: { lat: 0, lng: 0 },
    zoom: 15,
  });

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      liveMap.setCenter(pos);

      if (liveMarker) {
        liveMarker.setPosition(pos);
      } else {
        liveMarker = new google.maps.Marker({
          position: pos,
          map: liveMap,
          title: "Your Real-Time Location",
        });
      }
    },
    (error) => {
      alert("Unable to retrieve your location.");
      console.error(error);
    },
    { enableHighAccuracy: true }
  );
}

// 🚦 Simulate Vehicle Speed & Compliance
let strikeCounts = {};

function simulateVehicle() {
  const table = document.getElementById("vehicleTable");
  const sensorResult = document.getElementById("sensorResult");
  const delayMessage = document.getElementById("delayMessage");

  const vehicleNo = "DL" + Math.floor(Math.random() * 9000 + 1000);
  const speed = Math.floor(Math.random() * 121); // 0-120 km/h

  const violated = speed > 70;
  const strikes = strikeCounts[vehicleNo] = (strikeCounts[vehicleNo] || 0) + (violated ? 1 : 0);
  const status = strikes >= 3 ? "Blacklisted" : violated ? "Warning" : "Clear";

  const row = table.insertRow(-1);
  row.insertCell(0).textContent = vehicleNo;
  row.insertCell(1).textContent = speed;
  row.insertCell(2).textContent = violated ? "Yes" : "No";
  row.insertCell(3).textContent = strikes;
  row.insertCell(4).textContent = status;

  if (violated) {
    sensorResult.textContent = `🚨 Overspeed detected for vehicle ${vehicleNo} at ${speed} km/h!`;
    sensorResult.className = "text-danger";
    if (status === "Blacklisted") {
      delayMessage.style.display = "block";
      delayMessage.textContent = "🚫 Vehicle blacklisted due to repeated violations!";
    } else {
      delayMessage.style.display = "none";
    }
  } else {
    sensorResult.textContent = `✅ Vehicle ${vehicleNo} passed compliance check.`;
    sensorResult.className = "text-success";
    delayMessage.style.display = "none";
  }
}

// 🔐 Login System
function handleLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("loginMessage");

  if (username === "admin" && password === "admin123") {
    message.style.color = "green";
    message.textContent = "Login successful! Redirecting...";
    setTimeout(() => {
      document.getElementById("loginSection").style.display = "none";
      document.getElementById("mainApp").style.display = "block";
    }, 1000);
  } else {
    message.style.color = "red";
    message.textContent = "Invalid username or password.";
  }
}
