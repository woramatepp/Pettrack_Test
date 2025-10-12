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
      email: "",
      password: "",
      confirmPassword: "",
      pictureLogin,
    };
  },
  methods: {
    async handleSubmit() {
      if (this.password !== this.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      if (!this.username || !this.email || !this.password) {
        alert("Please fill in all fields!");
        return;
      }

      if (this.password.length < 6) {
        alert("Password must be at least 6 characters long!");
        return;
      }

      if (!this.email.includes("@")) {
        alert("Please enter a valid email address!");
        return;
      }

      const formData = {
        username: this.username,
        email: this.email,
        password: this.password,
      };
      console.log("Submitting:", formData);
      try {
        const res = await api.post("/auth/signup", formData);
        console.log("Registered:", res.data);
        alert("Sign up successful!");
        this.$router.push("/login")
      } catch (err) {
        console.error(err);
        alert("Something went wrong");
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
        <h2 class="text-4xl font-semibold mb-6 ml-70">Sign Up</h2>

        <TextInput class="w-100 ml-30 mb-4" label="Username" placeholder="Enter your username" v-model="username" />
        <TextInput class="w-100 ml-30 mb-4" label="Email" type="email" placeholder="Enter your email" v-model="email" />
        <TextInput class="w-100 ml-30 mb-4" label="Password" type="password" placeholder="Enter your password"
          v-model="password" />
        <TextInput class="w-100 ml-30 mb-4" label="Confirm Password" type="password" placeholder="Confirm your password"
          v-model="confirmPassword" />
        <!-- <a href="#" class="text-sm text-[#EA580C]/60 ml-35 mt-0 transition-all duration-300 hover:text-[#EA580C]">Forgot Password?</a> -->
        <button @click="handleSubmit"
          class="w-100 bg-[#EA580C] text-white py-2 rounded-3xl transition-all duration-300 hover:bg-[#EA580C]/80 ml-30 mt-5">
          Sign Up
        </button>

        <router-link to="/login" class="ml-40 mt-4 flex items-center text-sm group">
          <svg class="w-6 h-6 mr-2 text-gray-700 group-hover:text-[#EA580C] transition-colors duration-150 ease-in-out"
            fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18">
            </path>
          </svg>
          <span class="text-gray-700 group-hover:text-[#EA580C] transition-colors duration-150 ease-in-out">I already
            have a Account</span>
        </router-link>
      </div>

      <div class="flex-1 flex justify-center items-center">
        <img class="w-140 h-auto rounded-2xl" :src="pictureLogin" alt="" />
      </div>
    </div>
  </div>
</template>
