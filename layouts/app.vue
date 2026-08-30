<template>
  <div class="flex h-dvh flex-col overflow-hidden bg-background text-foreground md:flex-row">
    <div class="hidden md:flex md:shrink-0">
      <LayoutSidebar />
    </div>

    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <slot />
    </div>

    <Toaster />
  </div>
</template>

<script setup lang="ts"></script>
