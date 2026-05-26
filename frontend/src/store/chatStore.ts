import { create } from 'zustand';
import type { ChatMessage, ChatSession } from '../types/api.types';

interface ChatState {
  sessions: ChatSession[];
  messages: ChatMessage[];
  activeSessionId: number | null;
  setSessions: (sessions: ChatSession[]) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setActiveSessionId: (sessionId: number | null) => void;
  appendMessages: (messages: ChatMessage[]) => void;
  replaceMessage: (message: ChatMessage) => void;
  appendAssistantDelta: (messageId: number, delta: string) => void;
}

/**
 * @description Mantiene sesiones y mensajes activos del chat.
 * @why Existe para separar estado conversacional de componentes visuales.
 * @returns Store Zustand para sesiones, mensajes y sesion activa.
 * @example const messages = useChatStore((state) => state.messages);
 */
export const useChatStore = create<ChatState>((set) => ({
  sessions: [],
  messages: [],
  activeSessionId: null,
  setSessions: (sessions: ChatSession[]): void => {
    set({ sessions });
  },
  setMessages: (messages: ChatMessage[]): void => {
    set({ messages });
  },
  setActiveSessionId: (sessionId: number | null): void => {
    set({ activeSessionId: sessionId });
  },
  appendMessages: (messages: ChatMessage[]): void => {
    set((state) => ({ messages: [...state.messages, ...messages] }));
  },
  replaceMessage: (message: ChatMessage): void => {
    set((state) => ({
      messages: state.messages.map((current) => (current.id === message.id || current.id < 0 && message.role === current.role ? message : current)),
    }));
  },
  appendAssistantDelta: (messageId: number, delta: string): void => {
    set((state) => ({
      messages: state.messages.map((message) => (
        message.id === messageId
          ? { ...message, content: `${message.content}${delta}` }
          : message
      )),
    }));
  },
}));

/**
 * Responsabilidades del archivo:
 * - Guardar historial de chat visible.
 * - Mantener sesion activa entre componentes.
 * - Agregar mensajes nuevos despues de cada pregunta.
 * - Actualizar respuestas progresivas recibidas por streaming.
 */
