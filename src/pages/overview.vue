<script setup>
import Nav from "@/components/nav.vue";
import { ref, onMounted } from "vue";
import api from "@/service/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pets = ref([]);
const selectedPet = ref(null);
const radius = ref(300);
const latestLocation = ref({ latitude: null, longitude: null });
let map = null;
let zoneCircle = null;
let marker = null;
let zoneCenter = null;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

onMounted(async () => {
  try {
    const res = await api.get("/pets");
    pets.value = res.data;
  } catch (err) {
    console.error(err);
  }
});

function selectPet(pet) {
  selectedPet.value = pet;
  setTimeout(() => {
    initMap();
    startTrackingLatestLocation();
  }, 300);
}

function initMap() {
  if (map) map.remove();
  map = L.map("map").setView([13.7563, 100.5018], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

  map.on("click", (e) => {
    if (zoneCenter) return;
    zoneCenter = [e.latlng.lat, e.latlng.lng];
    zoneCircle = L.circle(zoneCenter, {
      radius: parseInt(radius.value),
      color: "#FF7F50",
      fillColor: "#FFBFA3",
      fillOpacity: 0.3,
    }).addTo(map);

    const statusEl = document.getElementById("status");
    statusEl.textContent = "🟢 กำหนดโซนแล้ว กำลังติดตาม...";
    statusEl.style.color = "#2E8B57";
  });

  fetchLatestLocation();
}
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

let updateInterval = null;

async function fetchLatestLocation() {
  try {
    const res = await fetch("http://localhost:5000/locations/latest");
    if (!res.ok) return;

    const loc = await res.json();
    if (!loc.latitude || !loc.longitude) return;

    latestLocation.value = { latitude: loc.latitude, longitude: loc.longitude };

    const newPos = [loc.latitude, loc.longitude];

    if (!marker) {
      marker = L.marker(newPos).addTo(map);
      map.setView(newPos, 15);
    } else {
      marker.setLatLng(newPos);
    }

    if (zoneCenter) {
      const distance = getDistanceFromLatLonInMeters(
        zoneCenter[0],
        zoneCenter[1],
        newPos[0],
        newPos[1]
      );

      const statusEl = document.getElementById("status");
      if (distance > radius.value) {
        statusEl.textContent = `🔴 ออกนอกโซน (${Math.round(distance)} ม.)`;
        statusEl.style.color = "#D70040";

        // แสดง alert เมื่อออกนอกโซน
        if (!window.hasAlerted) {
          window.hasAlerted = true;
          alert(`สัตว์ออกนอกโซน! ระยะทาง: ${Math.round(distance)} เมตร`);
        }
      } else {
        statusEl.textContent = `🟢 อยู่ในโซน (${Math.round(distance)} ม.)`;
        statusEl.style.color = "#2E8B57";
        window.hasAlerted = false;
      }
    }
  } catch (err) {
    console.error("ไม่สามารถดึงพิกัดล่าสุดได้:", err);
  }
}


function startTrackingLatestLocation() {
  if (updateInterval) clearInterval(updateInterval);

  // อัปเดตทุก 5 วินาที
  updateInterval = setInterval(fetchLatestLocation, 5000);
}

function goToMarker() {
  if (marker) {
    map.setView(marker.getLatLng(), 17, { animate: true });
  }
}
</script>


<template>
  <div
    class="relative min-h-screen bg-gradient-to-b from-[#FFF7E2] to-[#FCE4BE] flex flex-col items-center overflow-x-hidden">
    <Nav />

    <div class="flex flex-wrap gap-6 justify-center mt-6 mb-6">
      <div v-for="pet in pets" :key="pet.id"
        class="relative flex flex-col items-center w-44 group cursor-pointer transition-transform duration-300 hover:scale-110"
        @click="selectPet(pet)">
        <div class="p-[3px] bg-gradient-to-tr from-[#FF7F50] to-[#FFD5B2] rounded-full">
          <img class="w-44 h-44 rounded-full border-4 border-white shadow-md object-cover"
            :src="`http://localhost:3000${pet.image}`" :alt="pet.name" />
        </div>
        <p class="mt-3 text-lg font-semibold text-[#B26D38] group-hover:text-[#FF7F50]">{{ pet.name }}</p>
      </div>
    </div>

    <!-- แผนที่ + ข้อมูลสัตว์ -->
    <transition name="fade">
      <div v-if="selectedPet" class="flex flex-col md:flex-row gap-6 m-6 w-11/12 md:w-4/5">
        <!-- Map -->
        <div class="bg-[#FFF7E2]/80 p-4 rounded-3xl shadow-lg w-full md:w-2/3 flex flex-col border border-[#E4C9A2]/50">
          <div class="mb-3 flex justify-center items-center gap-2">
            <label class="font-mono text-[#B26D38]">รัศมี (เมตร):</label>
            <input v-model="radius" type="number" min="50" max="1000" step="50"
              class="border border-[#FF7F50] rounded-lg px-2 py-1 w-24 text-center focus:outline-none focus:ring-2 focus:ring-[#FF7F50]/60" />
            <button @click="goToMarker"
              class="bg-[#FF7F50] text-white px-4 py-2 rounded-lg shadow hover:bg-[#e6733d] transition"
              :disabled="!latestLocation.latitude || !latestLocation.longitude">
              ไปที่หมุด
            </button>
          </div>
          <div id="map" class="w-full h-[500px] rounded-2xl shadow-inner"></div>
          <div id="status" class="mt-3 text-center font-mono text-[#B26D38]">🟡 รอการสร้างโซน...</div>
          <div class="mt-2 text-center text-[#B26D38] font-mono">
            <template v-if="latestLocation.latitude && latestLocation.longitude">
              พิกัดล่าสุด: {{ latestLocation.latitude.toFixed(6) }}, {{ latestLocation.longitude.toFixed(6) }}
            </template>
            <template v-else>
              รอพิกัดล่าสุด...
            </template>
          </div>

        </div>

        <!-- Pet Info -->
        <div
          class="bg-[#FFF7E2]/80 p-4 rounded-3xl shadow-lg w-full md:w-1/3 flex flex-col items-center border border-[#E4C9A2]/50">
          <img :src="`http://localhost:3000${selectedPet.image}`"
            class="w-52 h-auto rounded-2xl border-4 border-white shadow-md mb-4" />
          <p class="text-2xl font-mono text-[#FF7F50] mb-3 border-b border-[#E4C9A2] pb-1">Pet Info</p>
          <div class="text-[#B26D38] text-lg space-y-1 text-center">
            <div><b>Type:</b> {{ selectedPet.type }}</div>
            <div><b>Age:</b> {{ selectedPet.age }}</div>
            <div><b>Weight:</b> {{ selectedPet.weight }}</div>
            <div><b>Sex:</b> {{ selectedPet.sex }}</div>
            <div><b>Description:</b> {{ selectedPet.description }}</div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
