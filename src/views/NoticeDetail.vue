<template>
  <div class="notice-detail-page min-h-screen theme-page pt-24 pb-16">
    <div class="container mx-auto px-4 relative z-10">
      <!-- Loading State -->
      <div v-if="loading" class="animate-pulse space-y-8">
        <div class="h-6 theme-surface-muted rounded w-1/3"></div>
        <div class="h-12 theme-surface-muted rounded w-3/4"></div>
        <div class="h-96 theme-surface-muted rounded-2xl"></div>
      </div>

      <!-- Notice Content -->
      <article v-else-if="post">
        <!-- Breadcrumb -->
        <nav class="mb-8 flex items-center space-x-2 text-sm theme-text-muted font-medium">
          <router-link to="/" class="theme-link-muted">{{ t('nav.home') }}</router-link>
          <span>/</span>
          <router-link to="/notice" class="theme-link-muted">{{ t('nav.notice') }}</router-link>
          <span>/</span>
          <span class="theme-text-primary truncate max-w-[200px]">{{ getLocalizedText(post.title) }}</span>
        </nav>

        <!-- Notice Header -->
        <header class="mb-10 border-b theme-border pb-10">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <span class="theme-badge theme-badge-info text-xs font-bold uppercase tracking-wider">
              {{ t('nav.notice') }}
            </span>
            <time class="text-sm theme-text-muted font-mono">
              {{ formatDate(post.created_at) }}
            </time>
          </div>

          <h1 class="text-3xl md:text-4xl font-black theme-text-primary leading-tight tracking-tight">
            {{ getLocalizedText(post.title) }}
          </h1>

          <p v-if="post.summary" class="mt-4 text-lg theme-text-secondary leading-relaxed">
            {{ getLocalizedText(post.summary) }}
          </p>
        </header>

        <!-- Notice Content -->
        <div v-html="processHtmlForDisplay(getLocalizedText(post.content))"
          class="prose prose-lg max-w-none dark:prose-invert theme-prose text-left">
        </div>

        <!-- Footer -->
        <footer class="mt-16 pt-10 border-t theme-border flex justify-center">
          <router-link to="/notice"
            class="group inline-flex items-center space-x-3 theme-link-muted px-6 py-3 border theme-btn-secondary rounded-full">
            <svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span class="font-medium">{{ t('noticeDetail.backToList') }}</span>
          </router-link>
        </footer>
      </article>

      <!-- Error State -->
      <div v-else class="text-center py-24 theme-panel rounded-2xl border">
        <div class="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6">
          <svg class="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="theme-text-muted text-xl mb-8">{{ t('noticeDetail.notFound') }}</p>
        <router-link to="/notice"
          class="inline-block theme-btn-primary px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">
          {{ t('noticeDetail.backToList') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../stores/app'
import { postAPI } from '../api'
import { processHtmlForDisplay } from '../utils/content'
import { debounceAsync } from '../utils/debounce'

const route = useRoute()
const { t } = useI18n()
const appStore = useAppStore()

const loading = ref(true)
const post = ref<any>(null)

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

const loadPost = async () => {
  loading.value = true
  try {
    const slug = route.params.slug as string
    const response = await postAPI.detail(slug)
    post.value = response.data.data || null
  } catch (error) {
    console.error('Failed to load notice:', error)
    post.value = null
  } finally {
    loading.value = false
  }
}

const debouncedLoadPost = debounceAsync(loadPost, 300)

onMounted(() => {
  loadPost()
})

onUnmounted(() => {
  debouncedLoadPost.cancel()
})
</script>