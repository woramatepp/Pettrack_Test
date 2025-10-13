<script>
import TextInput from "@/components/textInput.vue";
import Logo from "@/components/logo.vue";
import pictureLogin from "@/assets/pict_login.jpg";
import api from "@/service/api.js";

export default {
  components: { TextInput, Logo },
  data() {
    return {
      username: "",
      password: "",
      pictureLogin,
    };
  },
  methods: {
    async handleLogin() {
      const loginData = {
        username: this.username,
        password: this.password,
      };

      try {
        const res = await api.post("/auth/login", loginData);

        localStorage.setItem("authToken", res.data.token);

        localStorage.setItem("user", JSON.stringify(res.data.user));

        alert(`Welcome, ${res.data.user.username}!`);
        this.$router.push("/");
      } catch (err) {
        console.error("Login failed:", err);
        alert("Login failed: " + (err.response?.data?.error || "Something went wrong"));
      }
    },
  },
};
</script>
<template>
  <div class="bg-[#E0D2B6] min-h-screen flex items-center justify-center">
    <div class="bg-[#FFF7E2] p-8 rounded-2xl shadow-lg flex w-320 h-200">
      <div class="flex-1">
        <Logo />
        <h2 class="text-4xl font-semibold mb-6 ml-70">Sign In</h2>

        <TextInput class="w-100 ml-30 mb-4" label="Username / Email" placeholder="Enter your username"
          v-model="username" />
        <TextInput class="w-100 ml-30" label="Password" type="password" placeholder="Enter your password"
          v-model="password" />
        <button @click="handleLogin"
          class="w-100 bg-[#EA580C] text-white py-2 rounded-3xl transition-all duration-300 hover:bg-[#EA580C]/80 ml-30 mt-5">
          Login
        </button>

        <p class="mt-4 text-xs ml-55">
          Don't have an account?
          <router-link to="/signup" class="text-[#EA580C]">Sign Up</router-link>
        </p>
      </div>

      <div class="flex-1 flex justify-center items-center">
        <img class="w-140 h-auto rounded-2xl" :src="pictureLogin" alt="" />
      </div>
    </div>
  </div>
</template>
