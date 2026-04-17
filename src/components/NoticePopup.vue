<template>
  <Teleport to="body">
    <Transition name="popup-fade">
      <div v-if="visible" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="close"></div>
        <div class="relative w-full max-w-md theme-panel rounded-2xl shadow-2xl overflow-hidden">
          <div class="p-6 flex flex-col items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <svg class="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>

            <div v-if="notice" class="w-full text-left">
              <h3 class="text-lg font-bold theme-text-primary mb-2 text-center">
                {{ getLocalizedText(notice.title) }}
              </h3>
              <div class="text-sm theme-text-secondary leading-relaxed whitespace-pre-line"
                v-html="renderContent(getLocalizedText(notice.content))">
              </div>
            </div>

            <div v-else class="w-full text-left py-4">
              <p class="theme-text-muted">{{ t('noticePopup.noContent') }}</p>
            </div>

            <button
              @click="close"
              class="w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95"
              style="background: linear-gradient(135deg, #4096ff, #1677ff)">
              {{ t('noticePopup.acknowledged') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { postAPI } from '../api'
import { useLocalized } from '../composables/useProduct'
import xiabibiConfig from '../assets/xiabibi.json'

const { t } = useI18n()
const { getLocalizedText } = useLocalized()

const visible = ref(false)
const notice = ref<any>(null)

const POPUP_STORAGE_KEY = 'notice_popup_read'

const renderContent = (content: string) => {
  if (!content) return ''
  return content.replace(/\n/g, '<br>')
}

const close = () => {
  visible.value = false
  if (notice.value?.id) {
    localStorage.setItem(POPUP_STORAGE_KEY, String(notice.value.id))
  }
}

onMounted(async () => {
  const noticeSettings = (xiabibiConfig as any).noticeSettings || {}
  if (noticeSettings.popupEnabled === false) return

  const popupNoticeId = noticeSettings.popupNoticeId
  if (!popupNoticeId) return

  const lastReadId = localStorage.getItem(POPUP_STORAGE_KEY)
  if (lastReadId === String(popupNoticeId)) return

  try {
    const response = await postAPI.getById(popupNoticeId)
    notice.value = response.data.data || null
    if (notice.value) {
      visible.value = true
      return
    }
  } catch (_) {}

  try {
    const response = await postAPI.list({ type: 'notice', page: 1, page_size: 20 })
    const allNotices = response.data.data || []
    notice.value = allNotices.find((n: any) => Number(n.id) === Number(popupNoticeId)) || null
    if (notice.value) {
      visible.value = true
    }
  } catch (e) {
    console.error('Failed to load popup notice:', e)
  }
})
</script>

<style scoped>
.popup-fade-enter-active {
  transition: all 0.3s ease-out;
}
.popup-fade-leave-active {
  transition: all 0.2s ease-in;
}
.popup-fade-enter-from {
  opacity: 0;
}
.popup-fade-leave-to {
  opacity: 0;
}
</style>