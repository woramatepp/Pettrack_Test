<script setup>
import Nav from "@/components/nav.vue";
import { ref, reactive, onMounted } from "vue";
import api from "@/service/api";

const pets = ref([]);
const editingPet = ref(null); // pet ที่กำลังแก้ไข
const editForm = reactive({
  name: "",
  age: "",
  sex: "",
  weight: "",
  type: "",
  description: ""
});

onMounted(async () => {
  try {
    const res = await api.get("/pets", {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
    });
    pets.value = res.data;
  } catch (err) {
    console.error("Failed to fetch pets:", err);
  }
});

async function deletePet(petId) {
  if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสัตว์เลี้ยงนี้?")) return;
  try {
    await api.delete(`/pets/${petId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
    });
    pets.value = pets.value.filter(p => p.id !== petId);
    alert("ลบสัตว์เลี้ยงเรียบร้อยแล้ว");
  } catch (err) {
    console.error("Failed to delete pet:", err);
    alert("เกิดข้อผิดพลาดในการลบสัตว์เลี้ยง");
  }
}

function startEditing(pet) {
  editingPet.value = pet.id;
  editForm.name = pet.name;
  editForm.age = pet.age;
  editForm.sex = pet.sex;
  editForm.weight = pet.weight;
  editForm.type = pet.type;
  editForm.description = pet.description;
}

async function saveEdit(petId) {
  try {
    const res = await api.put(`/pets/${petId}`, editForm, {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
    });
    const index = pets.value.findIndex(p => p.id === petId);
    if (index !== -1) pets.value[index] = res.data.pet;
    editingPet.value = null;
    alert("อัปเดตข้อมูลเรียบร้อยแล้ว");
  } catch (err) {
    console.error("Failed to update pet:", err);
    alert("เกิดข้อผิดพลาดในการแก้ไขสัตว์เลี้ยง");
  }
}

function cancelEdit() {
  editingPet.value = null;
}
</script>

<template>
  <div
    class="relative min-h-screen bg-gradient-to-b from-[#FFF7E2] to-[#FCE4BE] flex flex-col items-center overflow-x-hidden">
    <Nav />

    <div class="w-11/12 md:w-4/5 mt-8 mb-10">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-mono text-[#B26D38]">🐾 รายชื่อสัตว์เลี้ยง</h1>
        <router-link to="/pets/petadd"
          class="text-[#B26D38] py-2 px-4 border border-[#E4C9A2] bg-[#FFF7E2] rounded-3xl hover:bg-[#d6caab] transition-colors duration-200">
          Add Pet
        </router-link>
      </div>

      <div class="flex flex-wrap gap-6 justify-center">
        <div v-for="pet in pets" :key="pet.id"
          class="relative flex flex-col items-center w-44 group cursor-pointer transition-transform duration-300 hover:scale-105">

          <div class="p-[3px] bg-gradient-to-tr from-[#FF7F50] to-[#FFD5B2] rounded-full shadow-lg">
            <img class="w-44 h-44 rounded-full border-4 border-white shadow-md object-cover"
              :src="`/api${pet.image}`" :alt="pet.name" />
          </div>

          <div class="mt-3 w-full text-center">
            <template v-if="editingPet === pet.id">
              <div class="bg-white p-3 rounded-xl shadow-md flex flex-col gap-2">
                <input v-model="editForm.name" placeholder="Name"
                  class="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#FF7F50]" />
                <input v-model="editForm.age" type="number" placeholder="Age"
                  class="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#FF7F50]" />
                <input v-model="editForm.sex" placeholder="Sex"
                  class="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#FF7F50]" />
                <input v-model="editForm.weight" placeholder="Weight"
                  class="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#FF7F50]" />
                <input v-model="editForm.type" placeholder="Type"
                  class="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#FF7F50]" />
                <textarea v-model="editForm.description" placeholder="Description"
                  class="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#FF7F50]"></textarea>

                <div class="flex gap-2 justify-center mt-2">
                  <button @click="saveEdit(pet.id)"
                    class="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition">บันทึก</button>
                  <button @click="cancelEdit"
                    class="bg-gray-300 text-black px-4 py-1 rounded hover:bg-gray-400 transition">ยกเลิก</button>
                </div>
              </div>
            </template>
            <template v-else>
              <p class="text-lg font-semibold text-[#B26D38] group-hover:text-[#FF7F50]">{{ pet.name }}</p>
              <div class="flex gap-2 justify-center mt-1">
                <button @click="startEditing(pet)"
                  class="py-1 px-3 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition-colors">แก้ไข</button>
                <button @click="deletePet(pet.id)"
                  class="py-1 px-3 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors">ลบ</button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.group:hover img {
  transform: scale(1.05);
  transition: transform 0.3s;
}
</style>
