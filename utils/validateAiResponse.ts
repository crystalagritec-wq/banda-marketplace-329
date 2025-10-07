import screens from '@/constants/banda-screens.json';

export interface AiAction {
  label: string;
  type: 'navigation' | 'modal' | 'link' | 'deeplink';
  screen?: string;
  url?: string;
  params?: Record<string, any>;
}

export interface AiResponse {
  text: string;
  actions: AiAction[];
}

export interface ValidatedAiResponse {
  text: string;
  actions: AiAction[];
}

export function validateAiResponse(aiResponse: any): ValidatedAiResponse {
  if (!aiResponse || typeof aiResponse !== 'object') {
    return { text: 'Sorry, something went wrong.', actions: [] };
  }

  const text = typeof aiResponse.text === 'string'
    ? aiResponse.text
    : 'I\'m here to help.';

  let actions: AiAction[] = [];
  if (Array.isArray(aiResponse.actions)) {
    actions = aiResponse.actions.filter((a: any) => {
      if (!a.label || typeof a.label !== 'string') return false;
      if (!a.type) return false;

      switch (a.type) {
        case 'navigation':
        case 'deeplink':
          return typeof a.screen === 'string' && (screens.properties as any)[a.screen];
        case 'modal':
          return true;
        case 'link':
          return typeof a.url === 'string' && a.url.startsWith('https://');
        default:
          return false;
      }
    }).slice(0, 3); // Max 3 actions
  }

  return { text, actions };
}