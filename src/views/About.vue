<template>
  <div class="about-page min-h-screen theme-page pt-20 pb-16">
    <div class="hero-section relative overflow-hidden py-8 md:py-14">
      <div class="absolute inset-0 bg-gradient-to-br from-[var(--ui-accent-soft)] via-transparent to-transparent opacity-50"></div>
      <div class="container mx-auto px-4 max-w-5xl relative">
        <div class="text-center">
          <h1 class="text-3xl md:text-4xl font-black mb-3 tracking-tight theme-text-primary">{{ heroTitle }}</h1>
          <p class="theme-text-secondary max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            {{ heroSubtitle }}
          </p>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 max-w-5xl">
      <div v-if="hasIntroduction" class="mb-10">
        <div class="theme-panel backdrop-blur-xl border rounded-2xl p-5 md:p-7 shadow-md">
          <p class="theme-text-secondary text-[15px] leading-[2] whitespace-pre-line">
            {{ introductionText }}
          </p>
        </div>
      </div>

      <div v-if="hasServices" class="mb-16">
        <div class="theme-panel backdrop-blur-xl border rounded-3xl p-8 md:p-12 shadow-2xl">
          <h2 v-if="servicesTitle" class="text-2xl md:text-3xl font-bold theme-text-primary mb-8 flex items-center gap-3">
            <span class="w-1.5 h-8 theme-accent-stick rounded-full"></span>
            {{ servicesTitle }}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(service, index) in serviceItems"
              :key="`about-service-${index}`"
              class="flex items-start gap-3 p-4 theme-surface-soft rounded-xl border theme-border transition-colors">
              <svg class="w-6 h-6 theme-text-accent flex-shrink-0 mt-0.5" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="theme-text-secondary">{{ service }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="hasContact" class="mb-16">
        <div class="theme-panel backdrop-blur-xl border rounded-3xl p-8 md:p-12 shadow-2xl">
          <h2 v-if="contactTitle" class="text-2xl md:text-3xl font-bold theme-text-primary mb-6 flex items-center gap-3">
            <span class="w-1.5 h-8 theme-accent-stick rounded-full"></span>
            {{ contactTitle }}
          </h2>
          <p v-if="contactText" class="theme-text-secondary mb-8 whitespace-pre-line text-lg">
            {{ contactText }}
          </p>
          <div v-if="hasContactLinks" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a v-if="contactConfig?.telegram" :href="contactConfig.telegram" target="_blank" rel="noopener noreferrer"
              class="group flex items-center justify-center space-x-3 theme-surface-soft border theme-border theme-text-secondary px-6 py-4 rounded-xl transition-colors hover:theme-text-primary">
              <svg class="w-6 h-6 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
              </svg>
              <span class="font-bold">Telegram</span>
            </a>
            <a v-if="contactConfig?.whatsapp" :href="contactConfig.whatsapp" target="_blank" rel="noopener noreferrer"
              class="group flex items-center justify-center space-x-3 theme-surface-soft border theme-border theme-text-secondary px-6 py-4 rounded-xl transition-colors hover:theme-text-primary">
              <svg class="w-6 h-6 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <span class="font-bold">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      <div v-if="hasFriendLinks" class="mb-8">
        <div class="text-center mb-10">
          <h2 class="text-2xl md:text-3xl font-bold theme-text-primary mb-3">{{ t('footer.friendLinks') }}</h2>
        </div>
        <div class="friend-links-wrapper overflow-hidden relative">
          <div class="friend-links-fade-left"></div>
          <div class="friend-links-fade-right"></div>
          <div class="friend-links-scroll flex gap-8">
            <a
              v-for="(link, index) in friendLinksList"
              :key="`friend-link-${index}`"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="friend-link-item flex-shrink-0 w-28 h-28 md:w-32 md:h-32 theme-surface-soft rounded-2xl border theme-border flex items-center justify-center p-4 transition-all hover:border-[var(--ui-accent)] hover:shadow-lg">
              <img
                v-if="link.logo"
                :src="link.logo"
                :alt="link.name"
                class="max-w-full max-h-full object-contain filter dark:brightness-110"
                loading="lazy"
              />
              <span v-else class="theme-text-secondary font-medium text-sm text-center">{{ link.name }}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../stores/app'
import xiabibiConfig from '../assets/xiabibi.json'

const { locale, t } = useI18n()
const appStore = useAppStore()

const aboutData = computed(() => appStore.config?.about || null)
const contactConfig = computed(() => appStore.config?.contact || null)

const resolveLocalizedText = (raw: unknown): string => {
  if (!raw || typeof raw !== 'object') {
    return ''
  }

  const record = raw as Record<string, unknown>
  const lang = String(locale.value || appStore.locale || 'zh-CN')
  const candidates = [record[lang], record['zh-CN'], record['zh-TW'], record['en-US']]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim() !== '') {
      return candidate.trim()
    }
  }

  return ''
}

const heroTitle = computed(() => resolveLocalizedText(aboutData.value?.hero?.title))
const heroSubtitle = computed(() => resolveLocalizedText(aboutData.value?.hero?.subtitle))
const introductionText = computed(() => resolveLocalizedText(aboutData.value?.introduction))
const servicesTitle = computed(() => resolveLocalizedText(aboutData.value?.services?.title))
const contactTitle = computed(() => resolveLocalizedText(aboutData.value?.contact?.title))
const contactText = computed(() => resolveLocalizedText(aboutData.value?.contact?.text))

const serviceItems = computed(() => {
  const raw = aboutData.value?.services?.items
  if (!Array.isArray(raw)) {
    return []
  }

  return raw
    .map((item) => resolveLocalizedText(item))
    .filter((item) => item !== '')
})

const hasIntroduction = computed(() => introductionText.value !== '')
const hasServices = computed(() => servicesTitle.value !== '' || serviceItems.value.length > 0)
const hasContactLinks = computed(() => !!(contactConfig.value?.telegram || contactConfig.value?.whatsapp))
const hasContact = computed(() => contactTitle.value !== '' || contactText.value !== '' || hasContactLinks.value)

const friendLinksItems = computed(() => {
  const items = (xiabibiConfig as any).friendLinks?.items
  if (!Array.isArray(items)) {
    return []
  }
  return items
})
const friendLinksList = computed(() => {
  const items = friendLinksItems.value
  if (items.length === 0) return []
  return [...items, ...items]
})
const hasFriendLinks = computed(() => friendLinksItems.value.length > 0)

onMounted(async () => {
  if (!appStore.config) {
    await appStore.loadConfig()
  }
})
</script>

<style scoped>
.friend-links-wrapper {
  position: relative;
}

.friend-links-fade-left,
.friend-links-fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 80px;
  z-index: 10;
  pointer-events: none;
}

.friend-links-fade-left {
  left: 0;
  background: linear-gradient(to right, var(--ui-bg-page) 0%, transparent 100%);
}

.friend-links-fade-right {
  right: 0;
  background: linear-gradient(to left, var(--ui-bg-page) 0%, transparent 100%);
}

.friend-links-scroll {
  animation: scroll-left 40s linear infinite;
  width: max-content;
}

.friend-links-scroll:hover {
  animation-play-state: paused;
}

@keyframes scroll-left {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.friend-link-item img {
  transition: transform 0.3s ease;
}

.friend-link-item:hover img {
  transform: scale(1.1);
}
</style>
