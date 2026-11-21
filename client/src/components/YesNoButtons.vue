<script setup>
import SideIcon from './SideIcon.vue';
import { credits } from '../format';

defineProps({ marketId: Number, priceYes: Number, priceNo: Number, disabled: Boolean });
</script>

<template>
  <div class="grid grid-cols-2 gap-3">
    <RouterLink :to="{ path: `/mercati/${marketId}`, query: { side: 'yes' } }"
      class="side-pill side-yes" :aria-disabled="disabled || undefined">
      <SideIcon side="yes" /> Sì · {{ credits(priceYes) }}
    </RouterLink>
    <RouterLink :to="{ path: `/mercati/${marketId}`, query: { side: 'no' } }"
      class="side-pill side-no" :aria-disabled="disabled || undefined">
      <SideIcon side="no" /> No · {{ credits(priceNo) }}
    </RouterLink>
  </div>
</template>
