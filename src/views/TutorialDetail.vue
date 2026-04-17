<template>
  <div class="tutorial-detail-page min-h-screen theme-page pt-24 pb-16 relative overflow-hidden">
    <div class="container mx-auto px-4 max-w-5xl relative z-10" v-if="API_BASE">
      <!-- Loading State -->
      <div v-if="loading" class="animate-pulse space-y-8">
        <div class="h-8 theme-surface-muted rounded w-1/3"></div>
        <div class="space-y-4">
          <div class="h-12 theme-surface-muted rounded w-3/4"></div>
          <div class="h-6 theme-surface-muted rounded w-1/2"></div>
        </div>
        <div class="h-96 theme-surface-muted rounded-3xl"></div>
      </div>

      <!-- Post Content -->
      <article v-else-if="post">
        <!-- Breadcrumb -->
        <nav class="mb-8 flex items-center space-x-2 text-sm theme-text-muted font-medium">
          <router-link to="/" class="theme-link-muted">{{ t('nav.home') }}</router-link>
          <span>/</span>
          <router-link to="/tutorials" class="theme-link-muted">{{ configData.wordpress?.categorySettings?.defaultTitle || t('nav.tutorials') }}</router-link>
          <span>/</span>
          <span class="theme-text-primary truncate max-w-[200px]" v-html="post.title.rendered"></span>
        </nav>

        <div
          class="theme-panel backdrop-blur-xl border rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          
          <!-- Post Header -->
          <header class="mb-12 border-b theme-border pb-12 mt-6">
            <h1 class="text-3xl md:text-5xl font-black theme-text-primary leading-tight tracking-tight mb-6" v-html="post.title.rendered"></h1>
            
            <div class="flex flex-wrap items-center gap-4">
              <span class="theme-badge-meta theme-badge-accent">
                {{ configData.wordpress?.categorySettings?.badgeText || t('nav.tutorials') }}
              </span>
              <time class="text-sm theme-text-muted font-mono">
                {{ formatDate(post.date) }}
              </time>
            </div>
          </header>

          <!-- Post Content -->
          <div v-html="processedContent" @click="handleContentClick"
            class="prose prose-lg max-w-none dark:prose-invert theme-prose tutorial-content">
          </div>

          <!-- Footer -->
          <footer class="mt-8 pt-6 border-t theme-border flex justify-center">
            <router-link to="/tutorials"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border theme-btn-secondary text-sm font-medium transition-all hover:shadow-md active:scale-95">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>{{ configData.wordpress?.categorySettings?.backToListText || '返回教程列表' }}</span>
            </router-link>
          </footer>
        </div>
      </article>

      <!-- Error State -->
      <div v-else
        class="text-center py-24 theme-panel rounded-3xl border backdrop-blur-sm">
        <svg class="w-20 h-20 mx-auto theme-text-muted mb-6" fill="none" stroke="currentColor"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="theme-text-muted text-xl mb-8">
          {{ configData.wordpress?.categorySettings?.notFoundText || '未找到该教程' }}
        </p>
        <router-link to="/tutorials"
          class="inline-block theme-btn-primary px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">
          {{ configData.wordpress?.categorySettings?.backToListText || '返回教程列表' }}
        </router-link>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="previewImage" 
        class="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        @click="closeGallery">
        
        <!-- Header Controls -->
        <div class="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/50 to-transparent">
          <div class="text-white/80 font-mono text-sm">
            {{ galleryImages.length > 1 ? `${currentImageIndex + 1} / ${galleryImages.length}` : '' }}
          </div>
          <button class="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            @click.stop="closeGallery">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Navigation Prev -->
        <button v-if="galleryImages.length > 1" 
          class="absolute left-4 md:left-8 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors z-10 group"
          @click.stop="showPrevImage">
          <svg class="w-8 h-8 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <!-- Image -->
        <div class="relative max-w-full max-h-full flex items-center justify-center">
          <img :src="previewImage" 
            class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl transform transition-transform duration-300 hover:scale-[1.02]"
            @click.stop />
        </div>

        <!-- Navigation Next -->
        <button v-if="galleryImages.length > 1" 
          class="absolute right-4 md:right-8 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors z-10 group"
          @click.stop="showNextImage">
          <svg class="w-8 h-8 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { processHtmlForDisplay } from '../utils/content'
import configData from '../assets/xiabibi.json'
import { fetchWithCache } from '../utils/fetchCache'

const route = useRoute()
const { t } = useI18n()

const apiDomain = configData.wordpress?.apiBase
const API_BASE = apiDomain ? `${apiDomain.replace(/\/$/, '')}/wp-json/wp/v2` : ''

const loading = ref(true)
const post = ref<any>(null)
const previewImage = ref<string | null>(null)
const galleryImages = ref<string[]>([])
const currentImageIndex = ref(0)

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const processedContent = computed(() => {
  if (!post.value || !post.value.content?.rendered) return ''
  let html = post.value.content.rendered
  
  // Fix lazy-loaded images from WordPress
  // Replace src="...load.svg" with the actual image URL from data-src
  html = html.replace(/src="[^"]*load\.svg"[^>]*data-src="([^"]+)"/g, 'src="$1"')
  html = html.replace(/data-src="([^"]+)"[^>]*src="[^"]*load\.svg"/g, 'src="$1"')
  
  // Sometimes src and data-src aren't adjacent, safer to just replace any load.svg with data-src value for the whole img tag
  html = html.replace(/<img([^>]*)data-src="([^"]+)"([^>]*)>/g, (match: string, _p1: string, p2: string, _p3: string) => {
    // If it has a load.svg src, replace the src entirely
    if (match.includes('load.svg')) {
      let newTag = match.replace(/src="[^"]*load\.svg"/, `src="${p2}"`)
      return newTag
    }
    return match
  })
  
  // Basic replacements to make WP content look better
  // Remove fixed widths/heights from images to make them responsive
  html = html.replace(/width="\d+"/g, '')
  html = html.replace(/height="\d+"/g, '')
  
  // Use existing content processor if any, otherwise return raw html
  try {
    return processHtmlForDisplay(html)
  } catch (e) {
    return html
  }
})

const handleContentClick = (e: Event) => {
  const target = e.target as HTMLElement
  if (target.tagName.toLowerCase() === 'img') {
    const src = target.getAttribute('src')
    if (src) {
      const index = galleryImages.value.indexOf(src)
      if (index !== -1) {
        currentImageIndex.value = index
      } else {
        // Fallback if image isn't in gallery list for some reason
        galleryImages.value = [src]
        currentImageIndex.value = 0
      }
      previewImage.value = src
    }
  }
}

const showPrevImage = () => {
  if (galleryImages.value.length === 0) return
  currentImageIndex.value = (currentImageIndex.value - 1 + galleryImages.value.length) % galleryImages.value.length
  previewImage.value = galleryImages.value[currentImageIndex.value] || null
}

const showNextImage = () => {
  if (galleryImages.value.length === 0) return
  currentImageIndex.value = (currentImageIndex.value + 1) % galleryImages.value.length
  previewImage.value = galleryImages.value[currentImageIndex.value] || null
}

const closeGallery = () => {
  previewImage.value = null
}

const handleKeydown = (e: KeyboardEvent) => {
  if (!previewImage.value) return
  if (e.key === 'Escape') closeGallery()
  if (e.key === 'ArrowLeft') showPrevImage()
  if (e.key === 'ArrowRight') showNextImage()
}

const extractGalleryImages = () => {
  const contentEl = document.querySelector('.tutorial-content')
  if (contentEl) {
    const imgs = contentEl.querySelectorAll('img')
    galleryImages.value = Array.from(imgs).map(img => img.src).filter(Boolean)
  }
}

const loadPost = async () => {
  if (!API_BASE) {
    loading.value = false
    post.value = null
    return
  }
  loading.value = true
  try {
    const id = route.params.id as string
    const res = await fetchWithCache(`${API_BASE}/posts/${id}?_embed=1`, { ttl: 3600000 }) // cache 1 hour
    if (res.ok && res.data) {
      const data = res.data
      if (data && !data.code) { // Check if it's a valid post and not an error response
        post.value = data
        nextTick(() => {
          extractGalleryImages()
        })
      } else {
        post.value = null
      }
    } else {
      post.value = null
    }
  } catch (error) {
    console.error('Failed to load post', error)
    post.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPost()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style>
/* Make WP content images responsive */
.tutorial-content {
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
}

.tutorial-content p {
  word-break: break-word;
  overflow-wrap: break-word;
}

.tutorial-content img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1.5rem auto;
  cursor: zoom-in;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.tutorial-content img:hover {
  transform: scale(1.01);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

.tutorial-content iframe,
.tutorial-content video {
  max-width: 100%;
  border-radius: 0.5rem;
}

.tutorial-content pre {
  background-color: var(--color-surface-muted, #f3f4f6);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}
.dark .tutorial-content pre {
  background-color: var(--color-surface-muted, #1f2937);
}

/* WP specific alignment classes */
.tutorial-content .aligncenter {
  display: block;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}
.tutorial-content .alignleft {
  float: left;
  margin-right: 1.5rem;
  margin-bottom: 1rem;
}
.tutorial-content .alignright {
  float: right;
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}
.tutorial-content figure {
  margin: 1.5rem 0;
  max-width: 100%;
}
.tutorial-content figure img {
  margin-bottom: 0.5rem;
}
.tutorial-content figcaption, 
.tutorial-content .wp-caption-text {
  text-align: center;
  font-size: 0.875rem;
  color: var(--theme-text-muted, #6b7280);
  margin-top: 0.5rem;
}
.tutorial-content blockquote {
  border-left: 4px solid var(--theme-border, #e5e7eb);
  padding-left: 1.5rem;
  margin-left: 0;
  margin-right: 0;
  color: var(--theme-text-muted, #6b7280);
  font-style: italic;
}
.tutorial-content .wp-block-image {
  margin: 1.5rem 0;
}
.tutorial-content .wp-block-image img {
  margin-bottom: 0;
}
.tutorial-content .wp-block-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  list-style: none;
  padding: 0;
}
</style>
