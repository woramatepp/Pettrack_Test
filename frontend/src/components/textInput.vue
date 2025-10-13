<script>
export default {
  name: "TextInput",
  props: {
    label: String,
    type: {
      type: String,
      default: "text",
    },
    placeholder: String,
    modelValue: String,
  },
  emits: ["update:modelValue"],
};
</script>
<template>
  <div class="mb-0">
    <label v-if="label" class="block text-gray-700 mb-1 ml-5">{{ label }}</label>
    <input :type="type" :placeholder="placeholder" :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full p-2 border rounded-3xl focus:outline-none focus:ring-1 focus:ring-[#a79d9d] pl-4" />
  </div>
</template>
