<script setup lang="ts">
definePageMeta({
  ssr: false,
})

await navigateTo('/products', { replace: true })
</script>
