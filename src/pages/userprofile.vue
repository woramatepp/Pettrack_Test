<script setup>
import apiClient from "@/service/api.js";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const name = ref("");
const email = ref("");
const age = ref("");
const phone = ref("");
const description = ref("");
const userImage = ref(null);

const fileToUpload = ref(null);

async function fetchProfileData() {
  try {
    const { data } = await apiClient.get("/profile");
    name.value = data.name || "";
    email.value = data.email || "";
    age.value = data.age || "";
    phone.value = data.phone || "";
    description.value = data.description || "";

    if (data.profile_picture) {
      userImage.value = `http://localhost:3000/uploads/profile_pics/${data.profile_picture}`;
    }
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    alert("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
  }
}

onMounted(fetchProfileData);

function handleFileChange(event) {
  const selectedFile = event.target.files[0];
  if (!selectedFile) return;
  fileToUpload.value = selectedFile;
  userImage.value = URL.createObjectURL(selectedFile);
}

async function saveAllChanges() {
  const formData = new FormData();
  formData.append("username", name.value); 
  formData.append("email", email.value);
  formData.append("age", age.value);
  formData.append("phone", phone.value);
  formData.append("description", description.value);

  if (fileToUpload.value) {
    formData.append("profile_picture", fileToUpload.value);
  }
  
  await apiClient.put('/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${localStorage.getItem("authToken")}`
    }
  });
  router.push("/");
}

function goHome() {
  router.push("/");
}
</script>

<template>
  <div class="relative min-h-screen flex items-center justify-center">
    <div class="absolute inset-0 bg-[url('@/assets/map.jpg')] bg-cover bg-center"></div>
    <div class="absolute inset-0 bg-gray-500/70"></div>

    <div class="relative bg-[#F4D9A2] p-10 rounded-2xl shadow-lg w-320 max-w-3xl">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold text-[#4A3F35]">My Profile</h2>
        <button @click="goHome"
          class="bg-[#FF7F50] text-white px-5 py-2 rounded-full hover:bg-[#ff6a3a] transition-all duration-300 shadow-md">
          🏠 Home
        </button>
      </div>

      <div class="bg-[#FFF7E2]/90 p-6 rounded-2xl shadow-md space-y-5">
        <div class="flex flex-col items-center">
          <img v-if="userImage" :src="userImage" alt="Profile Picture"
            class="w-32 h-32 object-cover rounded-full border-4 border-white shadow-md" />
          <div class="mt-4">
            <label for="fileInput"
              class="bg-[#FF7F50] text-white px-6 py-2 rounded-full cursor-pointer hover:bg-[#ff6a3a] transition-all duration-300 shadow-md">
              📸 Upload Image
            </label>
            <input id="pet-image" name="image" type="file" accept="image/*" @change="handleFileChange" class="hidden" />
          </div>
        </div>

        <!-- Name -->
        <div>
          <label class="block font-semibold text-gray-700">Name</label>
          <input v-model="name"
            class="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF7F50]"
            placeholder="Your name" />
        </div>

        <!-- Email -->
        <div>
          <label class="block font-semibold text-gray-700">Email</label>
          <input v-model="email" type="email"
            class="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF7F50]"
            placeholder="Your email" />
        </div>

        <!-- Age -->
        <div>
          <label class="block font-semibold text-gray-700">Age</label>
          <input v-model="age" type="number"
            class="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF7F50]"
            placeholder="Your age" />
        </div>

        <!-- Phone -->
        <div>
          <label class="block font-semibold text-gray-700">Phone</label>
          <input v-model="phone"
            class="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF7F50]"
            placeholder="Your phone number" />
        </div>

        <!-- Description -->
        <div>
          <label class="block font-semibold text-gray-700">Description</label>
          <textarea v-model="description" rows="3"
            class="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF7F50]"
            placeholder="Write something about yourself..."></textarea>
        </div>

        <!-- Save Button -->
        <div class="flex justify-center mt-8">
          <button @click="saveAllChanges"
            class="bg-[#FF7F50] text-white font-bold py-3 px-10 rounded-full hover:bg-[#ff6a3a] transition-colors duration-300 shadow-lg">
            💾 Save All Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input,
textarea {
  transition: all 0.2s ease;
}
</style>
