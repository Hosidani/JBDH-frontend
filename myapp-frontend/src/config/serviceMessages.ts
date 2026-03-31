import betaDisclaimerSv from '../content/messages/beta-disclaimer.sv.md?raw';
import betaDisclaimerEn from '../content/messages/beta-disclaimer.en.md?raw';

export type MessageCategory = 'beta' | 'ai' | 'update' | 'maintenance';

export interface ServiceMessage {
  id: string;
  date: string;
  category: MessageCategory;
  titleSv: string;
  titleEn: string;
  requiresAck: boolean;
  contentSv: string;
  contentEn: string;
}

// Add new messages by appending to this array.
// Never change or remove an existing id — doing so will cause all users to see that message again.
export const SERVICE_MESSAGES: ServiceMessage[] = [
  {
    id: 'beta-and-ai-disclaimer-v1',
    date: '2026-03-27',
    category: 'beta',
    titleSv: 'Välkommen till JBDH Beta',
    titleEn: 'Welcome to JBDH Beta',
    requiresAck: true,
    contentSv: betaDisclaimerSv,
    contentEn: betaDisclaimerEn,
  },
];
