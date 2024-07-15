<template>
  <div class="spinner"></div>
</template>

<style>
.spinner {
  border: 16px solid #f3f3f3;
  /* Light grey */
  border-top: 16px solid #3498db;
  /* Blue */
  border-radius: 50%;
  width: 100px;
  height: 100px;
  animation: spin 2s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>

<script lang="ts">
export default {
  name: "LoginByJwt"
};
</script>

<script setup lang="ts">
// packages
import { onMounted, ref, watch } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { router } from "../router"
import { signinByJwt } from "../modules/auth";
import { getPermissions } from "../modules/users";
import { useSettingStore } from "../store/settings"
import { useUserStore } from "../store/user"

// component
const { get: siteSettings } = useSettingStore()
const { getUserId, setUser, setPermissions } = useUserStore()

const jwt = ref<string>("")

async function login() {
  try {
    const ro = router.currentRoute.value.query.token || ""
    if (typeof ro === 'string') {
      jwt.value = ro
    }
    if (!jwt.value) {
      throw new Error("Not Found JWT")
    }

    const response = await signinByJwt({
      token: jwt.value,
    });
    setUser(response.data.user)

    const permissions = await getPermissions();
    setPermissions(permissions.data.permissions);

    const route = router.currentRoute.value
    if (route.query.redirect) {
      router.push(route.query?.redirect.toString());
    } else {
      router.push("/roadmaps");
    }
  } catch (error) {
    router.push("/page-not-found");
  }
}

function checkSession() {
  if (getUserId) {
    const route = router.currentRoute.value
    if (route.query.redirect) {
      router.push(route.query?.redirect.toString());
    } else {
      router.push("/roadmaps");
    }
  } else {
    login()
  }
}

onMounted(() => {
  checkSession()
})

useHead({
  title: "Logining",
  meta: [
    {
      name: "og:title",
      content: () => `Logining • ${siteSettings.title}`
    }
  ]
})
</script>
