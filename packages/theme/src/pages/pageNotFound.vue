<template>
  <div class="not-found">
    <div class="not-found-content">
      <img src="/error.svg" alt="Not Found" class="not-found-image" />
      <h2>Page Not Found</h2>
      <span>Sorry, the page you are looking for does not exist.</span>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "PageNotFound"
};
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  /* Full height of the viewport */
  text-align: center;
}

.not-found-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.not-found-image {
  max-width: 100%;
  height: auto;
  margin-bottom: 20px;
}
</style>
