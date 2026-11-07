export type Conversation = {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export type ChatRole = 'user' | 'assistant' | 'system' | 'tool'

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string | null
  created_at: string
}

export type ChatResponse = {
  conversation_id: string
  message: string
}

export type Paginated<T> = {
  data: T[]
  current_page: number
  last_page: number
  total: number
}