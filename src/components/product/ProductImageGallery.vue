<template>
  <div class="p-4 md:p-6 lg:p-8 theme-surface-soft border-r theme-border flex flex-col">
    <div class="mb-4 md:mb-6 relative group flex-1 min-h-[300px] md:min-h-[400px]"
      @touchstart="onImageTouchStart"
      @touchend="onImageTouchEnd">
      <div v-if="badge" class="absolute top-3 right-3 z-20">
        <span
          class="px-3 py-1.5 text-sm font-bold text-white rounded-lg shadow-lg"
          :style="{ background: badge.gradient }"
        >
          {{ badge.label }}
        </span>
      </div>
      <img v-if="currentImage" :src="currentImage" :alt="productTitle"
        class="absolute inset-0 w-full h-full object-contain rounded-xl border theme-border z-10 shadow-lg" />
      <div v-else
        class="absolute inset-0 w-full h-full theme-surface-muted rounded-xl border theme-border flex items-center justify-center z-10">
        <svg class="w-24 h-24 theme-text-muted" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <div v-if="images.length > 1" class="flex md:grid md:grid-cols-5 gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-1 px-1 snap-x snap-mandatory">
      <div v-for="(image, index) in images" :key="index" @click="$emit('update:currentImage', image)"
        class="cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 shrink-0 w-16 h-16 md:w-auto md:h-auto md:aspect-square snap-start"
        :class="currentImage === image ? 'theme-thumb-selected opacity-100' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'">
        <img :src="image" :alt="`Image ${index + 1}`" loading="lazy" class="w-full h-full object-cover" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getProductBadge, resolveLocalizedText } from '../../utils/productBadge'

const props = defineProps<{
  images: string[]
  currentImage: string
  productTitle: string
  productId?: number
}>()

const emit = defineEmits<{
  'update:currentImage': [value: string]
}>()

const { locale } = useI18n()

const badge = computed(() => {
  if (!props.productId) return null
  const badgeData = getProductBadge(props.productId)
  if (!badgeData) return null
  return {
    ...badgeData,
    label: resolveLocalizedText(badgeData.label, locale.value)
  }
})

let touchStartX = 0
const onImageTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0]?.clientX ?? 0
}
const onImageTouchEnd = (e: TouchEvent) => {
  const touchEndX = e.changedTouches[0]?.clientX ?? 0
  const diff = touchStartX - touchEndX
  if (Math.abs(diff) < 50) return
  if (props.images.length <= 1) return
  const currentIdx = props.images.indexOf(props.currentImage)
  if (currentIdx === -1) return
  if (diff > 0) {
    emit('update:currentImage', props.images[(currentIdx + 1) % props.images.length] ?? '')
  } else {
    emit('update:currentImage', props.images[(currentIdx - 1 + props.images.length) % props.images.length] ?? '')
  }
}
</script>
