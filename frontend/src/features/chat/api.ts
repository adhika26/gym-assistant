import { apiFetch } from '../../lib/api'
import type { ChatMessage, ChatResponse, Conversation, Paginated } from './types'

export async function getConversations(): Promise<Conversation[]> {
  const data = await apiFetch<Paginated<Conversation>>('/ai/conversations')

  return data.data
}

export async function getConversationMessages(
  id: string,
): Promise<ChatMessage[]> {
  const data = await apiFetch<{
    conversation_id: string
    messages: ChatMessage[]
  }>(`/ai/conversations/${id}/messages`)

  return data.messages
}

export async function sendChatMessage(
  message: string,
  conversationId: string | null,
): Promise<ChatResponse> {
  return apiFetch<ChatResponse>('/ai/chat', {
    method: 'POST',
    body: {
      message,
      conversation_id: conversationId,
    },
  })
}