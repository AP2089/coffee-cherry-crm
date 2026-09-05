<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  defaultValue?: string | number
  modelValue?: string | number
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
  <textarea
    v-model="modelValue"
    :class="
      cn(
        'flex min-h-20 w-full resize-none border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  />
</template>
