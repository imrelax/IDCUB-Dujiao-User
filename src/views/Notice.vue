<template>
  <div class="notice-page min-h-screen theme-page pt-20 pb-16">
    <div class="container mx-auto px-4">
      <!-- Page Header -->
      <div class="mb-12 mt-12">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <svg class="w-7 h-7 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h1 class="text-3xl md:text-4xl font-black tracking-tight theme-text-primary">{{ t('nav.notice') }}</h1>
            <p class="theme-text-secondary text-sm mt-1">{{ t('notice.subtitle') }}</p>
          </div>
        </div>
        <div class="h-px theme-border"></div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 6" :key="i"
          class="theme-surface-muted rounded-2xl h-28 animate-pulse border">
        </div>
      </div>

      <!-- Notices List -->
      <div v-else-if="notices.length > 0" class="space-y-3">
        <article v-for="notice in notices" :key="notice.id"
          class="group theme-panel border rounded-2xl transition-all duration-300 hover:shadow-lg cursor-pointer overflow-hidden"
          @click="goToNotice(notice.slug)">
          <div class="p-5 md:p-6 flex items-start gap-4 md:gap-5">
            <!-- Icon / Thumbnail -->
            <div
              class="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden bg-amber-50 dark:bg-amber-900/20 border theme-border flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <img v-if="notice.thumbnail" :src="getImageUrl(notice.thumbnail)" :alt="getLocalizedText(notice.title)"
                loading="lazy" class="w-full h-full object-cover">
              <svg v-else class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 uppercase tracking-wider">
                  {{ t('nav.notice') }}
                </span>
                <time class="text-xs theme-text-muted font-mono">
                  {{ formatDate(notice.created_at) }}
                </time>
              </div>

              <h2
                class="text-base md:text-lg font-bold theme-text-primary group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 mb-1.5">
                {{ getLocalizedText(notice.title) }}
              </h2>

              <p v-if="getLocalizedText(notice.summary)" class="theme-text-secondary text-sm line-clamp-2 leading-relaxed">
                {{ getLocalizedText(notice.summary) }}
              </p>
            </div>

            <!-- Arrow -->
            <div
              class="flex-shrink-0 theme-text-muted group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors group-hover:translate-x-1 duration-300 mt-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </article>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-12 flex justify-center">
          <nav
            class="flex items-center space-x-2 theme-panel-soft backdrop-blur-md p-2 rounded-2xl border">
            <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
              class="w-10 h-10 flex items-center justify-center rounded-xl border theme-btn-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <span class="px-4 py-2 font-mono theme-text-muted">
              <span class="theme-text-primary font-bold">{{ currentPage }}</span>
              <span class="mx-2 opacity-50">/</span>
              <span>{{ totalPages }}</span>
            </span>

            <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
              class="w-10 h-10 flex items-center justify-center rounded-xl border theme-btn-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20 theme-panel rounded-2xl border">
        <div class="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6">
          <svg class="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <p class="theme-text-muted text-lg">{{ t('notice.empty') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../stores/app'
import { postAPI } from '../api'
import { getImageUrl } from '../utils/image'
import { debounceAsync } from '../utils/debounce'

const router = useRouter()
const { t } = useI18n()
const appStore = useAppStore()

const loading = ref(true)
const notices = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const totalPages = ref(0)

const getLocalizedText = (jsonData: any) => {
  if (!jsonData) return ''
  const locale = appStore.locale
  return jsonData[locale] || jsonData['zh-CN'] || jsonData['en-US'] || ''
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(appStore.locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const loadNotices = async () => {
  loading.value = true
  try {
    const response = await postAPI.list({
      type: 'notice',
      page: currentPage.value,
      page_size: pageSize.value,
    })
    notices.value = response.data.data || []
    if (response.data.pagination) {
      total.value = response.data.pagination.total || 0
      totalPages.value = response.data.pagination.total_page || 0
    }
  } catch (error) {
    console.error('Failed to load notices:', error)
  } finally {
    loading.value = false
  }
}

const debouncedLoadNotices = debounceAsync(loadNotices, 300)

const goToNotice = (slug: string) => {
  router.push(`/notice/${slug}`)
}

const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  debouncedLoadNotices()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  loadNotices()
})

onUnmounted(() => {
  debouncedLoadNotices.cancel()
})
</script>

<style scoped>
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
</style>