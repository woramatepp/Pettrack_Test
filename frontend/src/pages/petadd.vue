<script setup>
import Nav from "@/components/nav.vue";
import TextInput from "@/components/textInput.vue";
import ChooseImage from "@/assets/choose_image.png";
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/service/api";

const router = useRouter();

const petName = ref("");
const petAge = ref("");
const petSex = ref("");
const petWeight = ref("");
const petType = ref("");
const petDescription = ref("");
const petImage = ref(null);
const file = ref(null);

function handleFileChange(event) {
  const selectedFile = event.target.files[0];
  if (!selectedFile) return;

  if (petImage.value) URL.revokeObjectURL(petImage.value);
  file.value = selectedFile;
  petImage.value = URL.createObjectURL(selectedFile);
}

async function handleSubmit() {
  if (!file.value) return alert("Please select an image.");
  if (!petName.value.trim()) return alert("Enter pet name.");

  const formData = new FormData();
  formData.append("name", petName.value);
  formData.append("age", petAge.value);
  formData.append("sex", petSex.value);
  formData.append("weight", petWeight.value);
  formData.append("type", petType.value);
  formData.append("description", petDescription.value);
  formData.append("image", file.value);

  try {
    await api.post("/pets/petadd", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    alert("Pet added successfully!");
    router.push("/pets");
  } catch (err) {
    console.error("Error adding pet:", err);
    alert("Failed to add pet.");
  }
}
</script>

<template>
  <div class="relative min-h-screen flex items-center justify-center">
    <div class="absolute inset-0 bg-gray-500/70"></div>
    <div class="relative bg-[#F4D9A2] p-8 rounded-2xl shadow-lg w-320 max-h-[90vh] overflow-auto">
      <Nav />
      <div class="flex gap-8 items-start mt-8">
        <div class="flex flex-col items-center">
          <input id="pet-image" type="file" accept="image/*" @change="handleFileChange" name="image" />
          <label for="pet-image" class="cursor-pointer">
            <img :src="petImage || ChooseImage" alt="Choose Image"
              class="w-48 h-48 rounded-full object-cover border border-gray-300" />
          </label>
          <p class="mt-2 text-sm text-gray-400">Click to upload</p>
        </div>

        <div class="flex flex-col flex-1 gap-4">
          <TextInput v-model="petName" label="Name" placeholder="Enter pet name" />
          <TextInput v-model="petAge" label="Age" placeholder="Enter pet age" />
          <div>
            <label class="text-gray-700">Pet Sex</label>
            <select v-model="petSex" class="w-full p-2 border border-black rounded-3xl">
              <option disabled value="">Select sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <TextInput v-model="petWeight" label="Weight" placeholder="Enter pet weight" />
          <TextInput v-model="petType" label="Type" placeholder="Enter type of pet" />
          <TextInput v-model="petDescription" label="Description" placeholder="Enter pet description" />

          <button @click="handleSubmit"
            class="w-full bg-[#FF7F50] text-white py-2 rounded-3xl mt-4 hover:bg-[#FF7F50] transition">
            Accept
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
