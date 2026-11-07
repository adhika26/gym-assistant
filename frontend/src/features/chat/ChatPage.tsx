import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { ApiError } from '../../lib/api'
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

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false

    getConversations()
      .then((data) => {
        if (cancelled) return
        setConversations(data)
        if (data.length > 0) setActiveId(data[0].id)
      })
      .catch(() => {
        if (!cancelled) setError('Gagal memuat percakapan.')
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
        if (!cancelled) setError('Gagal memuat pesan.')
      })
      .finally(() => {
        if (!cancelled) setLoadingMessages(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
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
        setError('Gagal mengirim pesan.')
      }
    } finally {
      setSending(false)
    }
  }

  const visibleMessages = messages.filter(
    (message) => message.role === 'user' || message.role === 'assistant',
  )

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-slate-100 md:p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">AI Coach</h1>
            <p className="text-sm text-slate-400">
              Tanya soal nutrisi, latihan, dan progres Anda.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={startNewChat}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-emerald-500 hover:text-emerald-400"
            >
              Chat baru
            </button>
            <Link
              to="/"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-emerald-500 hover:text-emerald-400"
            >
              Dashboard
            </Link>
          </div>
        </header>

        {error && (
          <p className="rounded-lg bg-red-950 p-3 text-sm text-red-300">{error}</p>
        )}

        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
            <h2 className="px-2 text-sm font-medium text-slate-300">
              Percakapan
            </h2>

            {loading ? (
              <p className="mt-3 px-2 text-sm text-slate-500">Memuat...</p>
            ) : conversations.length === 0 ? (
              <p className="mt-3 px-2 text-sm text-slate-500">
                Belum ada percakapan.
              </p>
            ) : (
              <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto lg:max-h-[60vh]">
                {conversations.map((conversation) => (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(conversation.id)}
                      className={`w-full rounded-lg px-2 py-2 text-left transition ${
                        activeId === conversation.id
                          ? 'bg-slate-800'
                          : 'hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="block truncate text-sm text-slate-200">
                        {conversation.title || 'Percakapan'}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {conversation.updated_at.slice(0, 10)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <section className="flex min-h-[60vh] flex-col rounded-2xl border border-slate-800 bg-slate-900">
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {loadingMessages && (
                <p className="text-sm text-slate-500">Memuat pesan...</p>
              )}

              {!loadingMessages && visibleMessages.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-700 p-4">
                  <p className="text-sm text-slate-300">
                    Mulai percakapan. Coba salah satu pertanyaan ini:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setInput(suggestion)}
                        className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-emerald-500 hover:text-emerald-400"
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
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                      message.role === 'user'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">
                      {message.content ?? ''}
                    </p>
                  </div>
                </div>
              ))}

              {sending && (
                <p className="animate-pulse text-sm text-slate-500">
                  Coach sedang mengetik...
                </p>
              )}

              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="border-t border-slate-800 p-3"
            >
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Tanya sesuatu tentang nutrisi atau latihan..."
                  maxLength={2000}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={sending || input.trim() === ''}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Kirim
                </button>
                 <p className="mt-2 text-center text-[11px] text-slate-500">
                AI bisa membuat kesalahan. Bukan pengganti dokter atau ahli gizi.
              </p>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  )
}