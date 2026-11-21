<script setup>
import { percent } from '../format';

// Two short numbered lists built from the markets the app already loaded.
defineProps({ moved: Array, traded: Array });
const sign = (n) => (n > 0 ? '▲ +' : n < 0 ? '▼ −' : '= ') + Math.abs(n) + ' pt';
</script>

<template>
  <div class="space-y-6">
    <section aria-labelledby="movedTitle">
      <h2 id="movedTitle" class="mb-1 text-xl font-bold">Più mossi di recente</h2>
      <p v-if="!moved.length" class="text-sm text-muted">Ancora nessun movimento.</p>
      <ol v-else>
        <li v-for="(m, i) in moved" :key="m.id">
          <RouterLink :to="`/mercati/${m.id}`" class="flex min-h-[44px] items-center gap-3 py-2 text-ink no-underline hover:underline">
            <span class="w-4 text-muted" aria-hidden="true">{{ i + 1 }}</span>
            <span class="line-clamp-2 flex-1 leading-snug">{{ m.question }}</span>
            <span class="text-right"><span class="block text-2xl font-extrabold">{{ percent(m.priceYes) }}</span><span class="block text-sm font-semibold">{{ sign(m.change) }}</span></span>
          </RouterLink>
        </li>
      </ol>
    </section>
    <section aria-labelledby="tradedTitle">
      <h2 id="tradedTitle" class="mb-1 text-xl font-bold">Più scambiati</h2>
      <p v-if="!traded.length" class="text-sm text-muted">Ancora nessuna operazione.</p>
      <ol v-else>
        <li v-for="(m, i) in traded" :key="m.id">
          <RouterLink :to="`/mercati/${m.id}`" class="flex min-h-[44px] items-center gap-3 py-2 text-ink no-underline hover:underline">
            <span class="w-4 text-muted" aria-hidden="true">{{ i + 1 }}</span>
            <span class="flex-1 leading-snug"><span class="line-clamp-2 block">{{ m.question }}</span><span class="block text-sm text-muted">{{ m.category }}</span></span>
            <span class="text-sm font-semibold">{{ m.tradeCount }} op.</span>
          </RouterLink>
        </li>
      </ol>
    </section>
    <a href="#listTitle" class="btn w-full border border-edge !bg-transparent !text-ink">Esplora tutto</a>
  </div>
</template>
