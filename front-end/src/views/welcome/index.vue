<script setup lang="ts">
import { ref } from "vue";
import { useUserStoreHook } from "@/store/modules/user";

defineOptions({
  name: "Welcome"
});

const username = ref(useUserStoreHook()?.username);
const compName = ref(useUserStoreHook()?.compName);
</script>

<template>
  <div>
    <h1 class="ml-8 mt-3 mb-2">{{ compName }}</h1>
    <h2 class="ml-8">欢迎您 {{ username }}</h2>
  </div>
</template>
