<template>
  <div class="categories-page min-h-screen theme-page pt-20 pb-16">
    <div class="container mx-auto px-4">
      <div class="mb-12 mt-12 text-center">
        <h1 class="text-4xl md:text-5xl font-black mb-4 tracking-tight theme-text-primary">{{ t('nav.categories') }}</h1>
        <p class="theme-text-secondary max-w-2xl mx-auto text-lg border-b theme-border pb-8">
          {{ t('products.subtitle') }}
        </p>
      </div>

      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div v-for="i in 10" :key="i" class="theme-panel rounded-2xl border p-6 flex flex-col items-center justify-center gap-4 min-h-[160px]">
          <div class="w-16 h-16 rounded-2xl theme-skeleton"></div>
          <div class="h-4 w-20 theme-skeleton rounded"></div>
        </div>
      </div>

      <div v-else-if="categoryGroups.length > 0" class="space-y-12">
        <div v-for="group in categoryGroups" :key="group.id" class="category-group">
          <!-- Group Title -->
          <div class="flex items-center justify-between mb-6 border-b theme-border pb-4">
            <h2 class="text-2xl font-bold theme-text-primary flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 dark:bg-white/5 flex items-center justify-center border theme-border">
                <img v-if="group.icon" :src="getImageUrl(group.icon)" :alt="getLocalizedText(group.name)" class="w-full h-full object-cover" />
                <svg v-else class="w-6 h-6 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <span>{{ getLocalizedText(group.name) }}</span>
            </h2>
            <router-link :to="`/categories/${group.slug}`" class="text-sm font-medium theme-link-muted flex items-center gap-1 group-hover:text-blue-600 transition-colors">
              查看全部
              <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </router-link>
          </div>

          <!-- Subcategories Grid -->
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            <router-link
              v-for="category in (group.children && group.children.length > 0 ? group.children : [group])"
              :key="category.id"
              :to="`/categories/${category.slug}`"
              class="theme-panel rounded-2xl border p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
            >
              <div class="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                <img v-if="category.icon" :src="getImageUrl(category.icon)" :alt="getLocalizedText(category.name)" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                <svg v-else class="w-8 h-8 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <h3 class="text-base md:text-lg font-bold theme-text-primary text-center line-clamp-2">
                {{ getLocalizedText(category.name) }}
              </h3>
            </router-link>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20 border theme-panel-soft rounded-2xl backdrop-blur-sm theme-slide-up">
        <svg class="w-20 h-20 mx-auto theme-text-muted mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <p class="theme-text-muted text-lg">{{ t('products.empty') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { categoryAPI } from '../api'
import { getImageUrl } from '../utils/image'
import { useLocalized } from '../composables/useProduct'
import { buildCategoryGroups } from '../utils/category'

const { t } = useI18n()
const { getLocalizedText } = useLocalized()
const loading = ref(true)
const categories = ref<any[]>([])

const categoryGroups = computed(() => {
  return buildCategoryGroups(categories.value)
})

onMounted(async () => {
  try {
    const response = await categoryAPI.list()
    categories.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load categories', error)
  } finally {
    loading.value = false
  }
})
</script>
