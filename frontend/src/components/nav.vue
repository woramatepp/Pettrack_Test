<script setup>
import Logo from "@/components/logo.vue";
import UserProfile from "@/assets/user_profile.png";
import { useRouter } from "vue-router";
import { ref, onMounted, watch } from "vue";
import axios from "axios";

const defaultImage = UserProfile;
const router = useRouter();

const selectedOption = ref("");
const user = ref({
  profile_picture: "", 
  name: "",            
});

onMounted(async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return router.push("/login");

    const res = await axios.get("/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    user.value.name = res.data.name || res.data.username || "User";
    user.value.profile_picture = res.data.profile_picture || "";
  } catch (err) {
    console.error("Failed to fetch user:", err);
  }
});

watch(selectedOption, (value) => {
  if (!value) return;
  if (value === "profile") {
    router.push("/profile");
  } else if (value === "logout") {
    localStorage.removeItem("authToken");
    router.push("/login");
  }
  selectedOption.value = "";
});
</script>

<template>
  <nav class="bg-[#FFF7E2]/62 p-4 shadow-md w-full h-18 rounded-2xl">
    <div class="container mx-auto flex items-center h-11">
      <Logo />

      <div class="flex space-x-4 ml-75">
        <router-link to="/" v-slot="{ isActive }">
          <span :class="[
            'text-[#B26D38] text-xl mr-8 px-3 py-1.5 rounded-3xl transition-all duration-300 hover:bg-[#FFF7E2]',
            isActive ? 'border-2 border-gray-300 bg-[#FFF7E2]' : 'border-2 border-transparent',
          ]">
            Overview
          </span>
        </router-link>

        <router-link to="/pets" v-slot="{ isActive }">
          <span :class="[
            'text-[#B26D38] text-xl px-3 py-1.5 rounded-3xl transition-all duration-300 hover:bg-[#FFF7E2]',
            isActive ? 'border-2 border-gray-300 bg-[#FFF7E2]' : 'border-2 border-transparent',
          ]">
            My Pet
          </span>
        </router-link>
      </div>

      <div class="ml-auto flex items-center gap-2">
        <img
          :src="user.profile_picture ? `/api/uploads/profile_pics/${user.profile_picture}` : defaultImage"
          alt="Profile" class="w-10 h-10 rounded-full object-cover border-2 border-gray-200" />
        <select v-model="selectedOption"
          class="text-[#EA580C] text-lg rounded-md transition-all duration-300 hover:text-[#613818] bg-transparent border-none focus:outline-none">
          <option disabled value="">{{ user.name || "User" }}</option>
          <option value="profile">Profile</option>
          <option value="logout">Logout</option>
        </select>
      </div>
    </div>
  </nav>
</template>
