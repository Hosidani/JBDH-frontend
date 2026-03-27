import { useState, useEffect } from 'react';
import { SERVICE_MESSAGES, type ServiceMessage } from '../config/serviceMessages';

function storageKey(userId: string | undefined) {
  return userId ? `jbdh_read_messages_${userId}` : 'jbdh_read_messages';
}

function getReadIds(userId: string | undefined): string[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey(userId)) || '[]');
  } catch {
    return [];
  }
}

function persistReadId(id: string, userId: string | undefined): string[] {
  const ids = getReadIds(userId);
  if (ids.includes(id)) return ids;
  const updated = [...ids, id];
  localStorage.setItem(storageKey(userId), JSON.stringify(updated));
  return updated;
}

export function useServiceMessages(userId: string | undefined) {
  const [readIds, setReadIds] = useState<string[]>(() => getReadIds(userId));

  // Reload read-ids when the logged-in user changes
  useEffect(() => {
    setReadIds(getReadIds(userId));
  }, [userId]);

  const pendingMessages: ServiceMessage[] = SERVICE_MESSAGES.filter(
    m => m.requiresAck && !readIds.includes(m.id)
  );

  const currentMessage: ServiceMessage | null = pendingMessages[0] ?? null;

  const acknowledge = (id: string) => {
    setReadIds(persistReadId(id, userId));
  };

  const isRead = (id: string) => readIds.includes(id);

  return { currentMessage, acknowledge, isRead, allMessages: SERVICE_MESSAGES };
}
