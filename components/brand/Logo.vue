<template>
  <component :is="tag" class="font-display font-bold tracking-tight" :class="sizeClass">
    coffee<span class="text-bronze"> cherry</span>
  </component>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    tag?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    tag: 'p',
    size: 'md',
  },
)

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'text-xl'
  if (props.size === 'lg') return 'text-2xl md:text-3xl'
  return 'text-xl md:text-2xl'
})
</script>
