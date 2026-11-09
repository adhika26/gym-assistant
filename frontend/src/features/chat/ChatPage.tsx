import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ApiError } from '../../lib/api'
import {
  errorBanner,
  inputClass,
  pageIntro,
  pageTitle,
  primaryButton,
  secondaryButton,
  sectionLabel,
} from '../../lib/ui'
import {
  getConversationMessages,
  getConversations,
  sendChatMessage,
} from './api'
import type { ChatMessage, Conversation } from './types'

const SUGGESTIONS = [
  'Apa saran makan siang saya hari ini?',
  'Review latihan terakhir saya.',
  'Bagaimana cara menaikkan berat badan dengan sehat?',
]

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false

    getConversations()
      .then((data) => {
        if (cancelled) return
        setConversations(data)
        if (data.length > 0) setActiveId(data[0].id)
      })
      .catch(() => {
        if (!cancelled) setError('Riwayat percakapan gagal dimuat.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!activeId) {
      setMessages([])
      return
    }

    let cancelled = false
    setLoadingMessages(true)

    getConversationMessages(activeId)
      .then((data) => {
        if (!cancelled) setMessages(data)
      })
      .catch(() => {
        if (!cancelled) setError('Pesan gagal dimuat.')
      })
      .finally(() => {
        if (!cancelled) setLoadingMessages(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeId])

  useEffect(() => {
    const container = messagesRef.current

    if (!container) return

    container.scrollTop = container.scrollHeight
  }, [messages, sending])

  async function refreshConversations() {
    setConversations(await getConversations())
  }

  function startNewChat() {
    setActiveId(null)
    setMessages([])
    setInput('')
    setError(null)
  }

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const text = input.trim()

    if (text === '' || sending) return

    const previousConversationId = activeId

    setInput('')
    setSending(true)
    setError(null)

    setMessages((current) => [
      ...current,
      {
        id: `local-user-${Date.now()}`,
        role: 'user',
        content: text,
        created_at: new Date().toISOString(),
      },
    ])

    try {
      const response = await sendChatMessage(text, previousConversationId)

      setMessages((current) => [
        ...current,
        {
          id: `local-assistant-${Date.now()}`,
          role: 'assistant',
          content: response.message,
          created_at: new Date().toISOString(),
        },
      ])

      if (!previousConversationId) {
        setActiveId(response.conversation_id)
      }

      await refreshConversations()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Pesan gagal dikirim.')
      }
    } finally {
      setSending(false)
    }
  }

  const visibleMessages = messages.filter(
    (message) => message.role === 'user' || message.role === 'assistant',
  )

  const conversationList = (
    <div className="mt-3">
      {loading ? (
        <p className="text-sm text-muted">Memuat riwayat...</p>
      ) : conversations.length === 0 ? (
        <p className="text-sm leading-6 text-muted">
          Belum ada percakapan. Mulai dari pertanyaan di samping.
        </p>
      ) : (
        <ul className="divide-y divide-line-soft border-y border-line-soft">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <button
                type="button"
                onClick={() => setActiveId(conversation.id)}
                className={`w-full border-l-2 px-3 py-3 text-left transition-colors ${
                  activeId === conversation.id
                    ? 'border-accent bg-surface'
                    : 'border-transparent hover:bg-surface'
                }`}
              >
                <span className="block truncate text-sm text-ink">
                  {conversation.title || 'Percakapan'}
                </span>
                <span className="mt-1 block font-mono text-[10px] text-muted">
                  {conversation.updated_at.slice(0, 10)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
            AI Coach
          </p>
          <h1 className={`${pageTitle} mt-2`}>Coach</h1>
          <p className={`${pageIntro} hidden sm:block`}>
            Tanya soal nutrisi, latihan, dan progress. Jawabannya memakai data
            yang sudah kamu catat.
          </p>
        </div>

        <button type="button" onClick={startNewChat} className={secondaryButton}>
          Chat baru
        </button>
      </header>

      {error && (
        <p className={errorBanner} role="alert">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <p className={sectionLabel}>Riwayat</p>
          {conversationList}
        </aside>

        <details className="order-2 border border-line-soft bg-surface p-4 lg:order-none lg:hidden">
          <summary className="flex min-h-11 items-center text-sm font-medium text-ink">
            Riwayat percakapan
          </summary>
          {conversationList}
        </details>

        <section
          className="order-1 flex h-[calc(100dvh-17rem)] min-h-96 flex-col border border-line-soft bg-surface lg:order-none lg:h-[calc(100dvh-13rem)]"
          aria-label="Percakapan coach"
        >
          <div ref={messagesRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {loadingMessages && (
              <p className="text-sm text-muted" aria-live="polite">
                Memuat pesan...
              </p>
            )}

            {!loadingMessages && visibleMessages.length === 0 && (
              <div className="max-w-md">
                <p className="font-display text-2xl font-semibold">
                  Mulai dari satu pertanyaan.
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Coach bisa melihat profil, sisa kalori, berat terakhir, dan
                  sesi latihanmu. Tidak perlu menjelaskan ulang dari nol.
                </p>
                <div className="mt-5 space-y-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setInput(suggestion)}
                      className="flex min-h-11 items-center text-left text-sm font-medium text-accent-strong underline underline-offset-4"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {visibleMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={
                    message.role === 'user'
                      ? 'ml-auto max-w-[85%] rounded-sm bg-accent px-4 py-2.5 text-sm text-white'
                      : 'mr-auto max-w-[88%] border border-line-soft bg-paper px-4 py-3 text-sm text-ink'
                  }
                >
                  <p className="whitespace-pre-wrap">{message.content ?? ''}</p>
                </div>
              </div>
            ))}

            {sending && (
              <p className="text-sm text-muted" aria-live="polite">
                Coach sedang menulis...
              </p>
            )}

          </div>

          <form onSubmit={handleSend} className="border-t border-line-soft p-3">
            <div className="flex gap-2">
              <label htmlFor="chat-input" className="sr-only">
                Pesan untuk coach
              </label>
              <input
                id="chat-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Tanya soal nutrisi atau latihan..."
                maxLength={2000}
                className={`${inputClass} flex-1`}
              />
              <button
                type="submit"
                disabled={sending || input.trim() === ''}
                className={primaryButton}
              >
                Kirim
              </button>
            </div>

            <p className="mt-2 text-center text-[11px] text-muted">
              AI bisa membuat kesalahan. Bukan pengganti dokter atau ahli gizi.
            </p>
          </form>
        </section>
      </div>
    </div>
  )
}
