<template>
  <header
    class="flex shrink-0 items-center justify-between gap-4 border-b border-border px-4 py-3 md:px-6"
  >
    <div class="min-w-0">
      <h1 class="truncate font-display text-lg tracking-tight">{{ title }}</h1>
      <p v-if="subtitle" class="truncate text-xs text-muted-foreground">{{ subtitle }}</p>
    </div>

    <div class="flex items-center gap-3">
      <div class="hidden text-right sm:block">
        <p class="text-sm">{{ auth.user?.username }}</p>
        <p class="text-xs text-muted-foreground">{{ roleLabel }}</p>
      </div>
      <Button variant="outline" size="sm" @click="onLogout">Выйти</Button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { UserRole } from '~/types/auth'

defineProps<{
  title: string
  subtitle?: string
}>()

const auth = useAuthStore()

const roleLabel = computed(() => {
  if (auth.user?.role === UserRole.Admin) return 'Администратор'
  if (auth.isGuest) return 'Гость'
  return 'Оператор'
})

async function onLogout() {
  auth.logout()
  await navigateTo('/login')
}
</script>
