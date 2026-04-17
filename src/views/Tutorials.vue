<template>
  <div class="tutorials-page min-h-screen theme-page pt-20 pb-16 relative overflow-hidden">
    <div class="container mx-auto px-4 relative z-10">
      <!-- Page Header -->
      <div class="mb-12 mt-12 text-center" v-if="API_BASE">
        <h1 class="text-4xl md:text-6xl font-black mb-6 tracking-tight theme-text-primary">{{ parentCategory.name || configData.wordpress?.categorySettings?.defaultTitle || t('nav.tutorials') }}</h1>
        <p class="theme-text-secondary max-w-2xl mx-auto text-lg leading-relaxed pb-8">
          {{ parentCategory.description || configData.wordpress?.categorySettings?.defaultDescription || '出海教程与技术指南' }}
        </p>
      </div>

      <div class="flex flex-col lg:flex-row gap-8" v-if="API_BASE">
        <!-- Left Sidebar: Categories -->
        <aside class="w-full lg:w-64 shrink-0">
          <div class="theme-panel backdrop-blur-xl border rounded-2xl p-4 sticky top-24">
            <ul class="space-y-1">
              <li>
                <button
                  @click="selectCategory(null)"
                  class="w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center justify-between group"
                  :class="selectedCategory === null ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'theme-text-secondary hover:bg-gray-50 dark:hover:bg-white/5'"
                >
                  <span>{{ configData.wordpress?.categorySettings?.allCategoriesText || '全部教程' }}</span>
                </button>
              </li>
              <li v-for="cat in categories" :key="cat.id">
                <button
                  @click="selectCategory(cat.id)"
                  class="w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center justify-between group"
                  :class="selectedCategory === cat.id ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'theme-text-secondary hover:bg-gray-50 dark:hover:bg-white/5'"
                >
                  <span>{{ cat.name }}</span>
                  <span class="text-xs opacity-60 bg-black/5 dark:bg-white/10 px-2 py-1 rounded-full">{{ cat.count }}</span>
                </button>
              </li>
            </ul>
          </div>
        </aside>

        <!-- Right Content: Posts -->
        <div class="flex-1 min-w-0">
          <!-- Loading State -->
          <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div v-for="i in 6" :key="i" class="theme-surface-muted rounded-2xl h-[320px] animate-pulse border"></div>
          </div>

          <!-- Posts Grid -->
          <div v-else-if="posts.length > 0">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <article v-for="post in posts" :key="post.id"
                class="group theme-panel backdrop-blur-xl border rounded-2xl overflow-hidden hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col"
                @click="goToPost(post.id)">
                
                <!-- Thumbnail -->
                <div v-if="getThumbnail(post)" class="h-48 overflow-hidden relative border-b theme-border">
                  <img :src="getThumbnail(post)" :alt="post.title.rendered"
                    loading="lazy" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                  <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                </div>
                <!-- Fallback Thumbnail -->
                <div v-else class="h-48 overflow-hidden relative border-b theme-border bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                   <svg class="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
                </div>

                <div class="p-8 flex flex-col flex-1">
                  <div class="flex items-center justify-between mb-6">
                    <span class="theme-badge-meta theme-badge-accent">
                    {{ configData.wordpress?.categorySettings?.badgeText || '教程' }}
                  </span>
                    <time class="text-xs theme-text-muted font-mono">
                      {{ formatDate(post.date) }}
                    </time>
                  </div>

                  <h2
                    class="text-2xl font-bold mb-4 theme-text-primary transition-colors line-clamp-2 leading-tight"
                    v-html="post.title.rendered">
                  </h2>

                  <div class="theme-text-secondary text-sm mb-8 line-clamp-3 leading-relaxed flex-1" v-html="post.excerpt.rendered">
                  </div>

                  <div
                    class="flex items-center text-sm font-medium theme-text-muted group-hover:text-gray-900 dark:group-hover:text-white transition-colors mt-auto pt-6 border-t theme-border">
                    {{ configData.wordpress?.categorySettings?.readMoreText || '阅读详情' }}
                    <svg class="w-4 h-4 ml-2 transition-transform group-hover:translate-x-2" fill="none"
                      stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </article>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="mt-16 flex justify-center">
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
          <div v-else
            class="text-center py-20 border theme-border rounded-2xl theme-panel backdrop-blur-sm">
            <svg class="w-20 h-20 mx-auto theme-text-muted mb-6" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p class="theme-text-muted text-lg">
              {{ configData.wordpress?.categorySettings?.emptyText || '暂无教程文章' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import configData from '../assets/xiabibi.json'
import { fetchWithCache } from '../utils/fetchCache'

const router = useRouter()
const { t } = useI18n()

const PARENT_CATEGORY_ID = configData.wordpress?.tutorialParentCategoryId || 243
const apiDomain = configData.wordpress?.apiBase
const API_BASE = apiDomain ? `${apiDomain.replace(/\/$/, '')}/wp-json/wp/v2` : ''

const parentCategory = ref<{ name: string; description: string }>({ name: '', description: '' })
const categories = ref<any[]>([])
const selectedCategory = ref<number | null>(null)
const posts = ref<any[]>([])
const loading = ref(true)

const currentPage = ref(1)
const pageSize = ref(6)
const totalPages = ref(0)

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Extract image url from WP embedded media, yoast_head_json or regex
const getThumbnail = (post: any) => {
  if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    return post._embedded['wp:featuredmedia'][0].source_url
  }
  if (post.yoast_head_json?.og_image?.[0]?.url) {
    return post.yoast_head_json.og_image[0].url
  }
  // Try to parse from content (some WP themes use data-src for lazy loading)
  if (post.content?.rendered) {
    const dataSrcMatch = post.content.rendered.match(/<img[^>]+data-src="([^">]+)"/)
    if (dataSrcMatch) {
      return dataSrcMatch[1]
    }
    const srcMatch = post.content.rendered.match(/<img[^>]+src="([^">]+)"/)
    if (srcMatch && !srcMatch[1].includes('load.svg')) {
      return srcMatch[1]
    }
  }
  return ''
}

const loadCategories = async () => {
  if (!API_BASE) return
  try {
    const res = await fetchWithCache(`${API_BASE}/categories?parent=${PARENT_CATEGORY_ID}&per_page=100`, { ttl: 3600000 }) // cache 1 hour
    if (res.ok && res.data) {
      categories.value = res.data
    }
  } catch (error) {
    console.error('Failed to load categories', error)
  }
}

const loadParentCategory = async () => {
  if (!API_BASE) return
  try {
    const res = await fetchWithCache(`${API_BASE}/categories/${PARENT_CATEGORY_ID}`, { ttl: 3600000 }) // cache 1 hour
    if (res.ok && res.data) {
      parentCategory.value = {
        name: res.data.name || '',
        description: res.data.description || ''
      }
    }
  } catch (error) {
    console.error('Failed to load parent category', error)
  }
}

const loadPosts = async () => {
  if (!API_BASE) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    let categoryParam = ''
    if (selectedCategory.value) {
      categoryParam = selectedCategory.value.toString()
    } else {
      // Show posts from all child categories when "All Tutorials" is selected
      const childCategoryIds = categories.value.map(c => c.id)
      categoryParam = [PARENT_CATEGORY_ID, ...childCategoryIds].join(',')
    }

    const res = await fetchWithCache(`${API_BASE}/posts?categories=${categoryParam}&page=${currentPage.value}&per_page=${pageSize.value}&_embed=1`)
    if (res.ok && res.data) {
      posts.value = res.data
      totalPages.value = parseInt(res.headers['x-wp-totalpages'] || '1', 10)
    } else {
      posts.value = []
      totalPages.value = 0
    }
  } catch (error) {
    console.error('Failed to load posts', error)
    posts.value = []
  } finally {
    loading.value = false
  }
}

const selectCategory = (categoryId: number | null) => {
  if (selectedCategory.value === categoryId) return
  selectedCategory.value = categoryId
  currentPage.value = 1
  loadPosts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadPosts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToPost = (id: number | string) => {
  router.push(`/tutorials/${id}`)
}

onMounted(async () => {
  await Promise.all([loadCategories(), loadParentCategory()])
  loadPosts()
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

.line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
}
</style>
