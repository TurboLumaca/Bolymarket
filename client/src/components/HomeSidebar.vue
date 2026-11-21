<script setup>
// Two short lists built from the markets the app already loaded.
defineProps({ moved: Array, traded: Array });
const sign = (n) => (n > 0 ? '▲ +' : n < 0 ? '▼ −' : '= ') + Math.abs(n) + ' punti';
</script>

<template>
  <div class="space-y-4">
    <section class="card" aria-labelledby="movedTitle">
      <h2 id="movedTitle" class="mb-2 font-bold">Più mossi di recente</h2>
      <p v-if="!moved.length" class="text-sm text-muted">Ancora nessun movimento.</p>
      <ol v-else class="divide-y divide-line">
        <li v-for="m in moved" :key="m.id">
          <RouterLink :to="`/mercati/${m.id}`" class="block min-h-[44px] py-2 text-ink no-underline hover:underline">
            <span class="block text-sm leading-snug">{{ m.question }}</span>
            <span class="block text-sm font-bold">{{ sign(m.change) }}</span>
          </RouterLink>
        </li>
      </ol>
    </section>
    <section class="card" aria-labelledby="tradedTitle">
      <h2 id="tradedTitle" class="mb-2 font-bold">Più scambiati</h2>
      <p v-if="!traded.length" class="text-sm text-muted">Ancora nessuna operazione.</p>
      <ol v-else class="divide-y divide-line">
        <li v-for="m in traded" :key="m.id">
          <RouterLink :to="`/mercati/${m.id}`" class="block min-h-[44px] py-2 text-ink no-underline hover:underline">
            <span class="block text-sm leading-snug">{{ m.question }}</span>
            <span class="block text-sm text-muted">{{ m.category }} · {{ m.tradeCount }} operazioni</span>
          </RouterLink>
        </li>
      </ol>
    </section>
  </div>
</template>
