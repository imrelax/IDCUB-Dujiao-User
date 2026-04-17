<template>
  <footer
    class="relative theme-panel-strong theme-text-secondary border-t theme-border overflow-hidden">
    <div class="container mx-auto px-4 py-6 pb-20 lg:pb-6 relative">
      <!-- Friend Links (Desktop Only) -->
      <div v-if="friendLinks.length" class="hidden md:block mb-4">
        <div class="flex items-center justify-center flex-wrap gap-x-4 gap-y-1 text-sm theme-text-muted mb-3">
          <span class="font-medium">{{ t('footer.friendLinks') }}:</span>
          <a
            v-for="link in friendLinks"
            :key="link.url"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-gray-900 dark:hover:text-gray-400"
          >{{ link.name }}</a>
        </div>
        <div class="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs theme-text-muted items-center">
        <!-- Brand -->
        <div class="flex flex-col items-center md:items-start">
          <p class="text-xs leading-relaxed max-w-xs theme-text-muted text-center md:text-left line-clamp-2">
            {{ brandDescription || t('footer.description') }}
          </p>
        </div>

        <!-- Center: Copyright & Links -->
        <div class="flex flex-col items-center text-center">
          <p class="mb-1">&copy; {{ currentYear }} {{ brandSiteName }}. {{ t('footer.rights') }}</p>
          <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <router-link to="/privacy" class="hover:text-gray-900 dark:hover:text-gray-400">{{ t('footer.privacy') || '隐私政策' }}</router-link>
            <router-link to="/terms" class="hover:text-gray-900 dark:hover:text-gray-400">{{ t('footer.terms') || '服务条款' }}</router-link>
          </div>
          <div v-if="footerLinks.length" class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-1">
            <a
              v-for="link in footerLinks"
              :key="link.name"
              :href="link.url || 'javascript:void(0)'"
              :target="link.url ? '_blank' : undefined"
              rel="noopener noreferrer"
              class="hover:text-gray-900 dark:hover:text-gray-400"
            >{{ link.name }}</a>
          </div>
        </div>

        <!-- Open Source -->
        <div class="flex flex-col items-center md:items-end text-center md:text-right">
          <p class="flex items-center justify-center md:justify-end gap-1">
            <span>Open Source:Dujiao-Next</span>
                 <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .5C5.648.5.5 5.648.5 12c0 5.084 3.292 9.4 7.86 10.922.575.106.784-.25.784-.556 0-.273-.01-1-.016-1.962-3.197.694-3.872-1.54-3.872-1.54-.522-1.326-1.274-1.678-1.274-1.678-1.042-.713.079-.699.079-.699 1.152.081 1.758 1.183 1.758 1.183 1.024 1.755 2.688 1.248 3.343.954.104-.742.401-1.248.73-1.535-2.552-.29-5.236-1.276-5.236-5.678 0-1.254.448-2.28 1.182-3.084-.118-.29-.512-1.457.112-3.04 0 0 .964-.308 3.158 1.178a10.98 10.98 0 0 1 2.876-.387c.976.004 1.96.132 2.878.387 2.192-1.486 3.154-1.178 3.154-1.178.626 1.583.232 2.75.114 3.04.736.804 1.18 1.83 1.18 3.084 0 4.413-2.688 5.384-5.248 5.668.412.354.78 1.052.78 2.12 0 1.53-.014 2.764-.014 3.14 0 .31.206.668.79.554C20.212 21.396 23.5 17.083 23.5 12 23.5 5.648 18.352.5 12 .5Z" />
              </svg>
            
              <a
              href="https://github.com/dujiao-next"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-400"
            >
              
              <span>https://github.com/dujiao-next</span>
            </a>
          </p>
          <p class="flex items-center justify-center md:justify-end gap-1">
            <span>本站主题:</span>
            <a
              href="https://github.com/imrelax/IDCUB-Dujiao-User"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-400"
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .5C5.648.5.5 5.648.5 12c0 5.084 3.292 9.4 7.86 10.922.575.106.784-.25.784-.556 0-.273-.01-1-.016-1.962-3.197.694-3.872-1.54-3.872-1.54-.522-1.326-1.274-1.678-1.274-1.678-1.042-.713.079-.699.079-.699 1.152.081 1.758 1.183 1.758 1.183 1.024 1.755 2.688 1.248 3.343.954.104-.742.401-1.248.73-1.535-2.552-.29-5.236-1.276-5.236-5.678 0-1.254.448-2.28 1.182-3.084-.118-.29-.512-1.457.112-3.04 0 0 .964-.308 3.158 1.178a10.98 10.98 0 0 1 2.876-.387c.976.004 1.96.132 2.878.387 2.192-1.486 3.154-1.178 3.154-1.178.626 1.583.232 2.75.114 3.04.736.804 1.18 1.83 1.18 3.084 0 4.413-2.688 5.384-5.248 5.668.412.354.78 1.052.78 2.12 0 1.53-.014 2.764-.014 3.14 0 .31.206.668.79.554C20.212 21.396 23.5 17.083 23.5 12 23.5 5.648 18.352.5 12 .5Z" />
              </svg>
              <span>IDCUB-Dujiao-User</span>
            </a>
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../stores/app'
import xiabibiConfig from '../assets/xiabibi.json'

const { t } = useI18n()
const appStore = useAppStore()

const config = computed(() => appStore.config)

const brandSiteName = computed(() => {
  const siteName = config.value?.brand?.site_name
  return typeof siteName === 'string' && siteName.trim() ? siteName.trim() : 'Dujiao-Next'
})

const brandDescription = computed(() => {
  const desc = config.value?.brand?.site_description
  if (desc && typeof desc === 'object') {
    const val = desc[appStore.locale] || desc['zh-CN'] || ''
    return typeof val === 'string' ? val.trim() : ''
  }
  return ''
})

const footerLinks = computed(() => {
  const links = config.value?.footer_links
  if (!Array.isArray(links)) return []
  return links.filter((item: any) => item && typeof item.name === 'string' && item.name.trim())
})

const friendLinks = computed(() => {
  const links = (xiabibiConfig.friendLinks as any)?.items
  if (!Array.isArray(links)) return []
  return links.slice(0, 10)
})

const currentYear = new Date().getFullYear()
</script>
