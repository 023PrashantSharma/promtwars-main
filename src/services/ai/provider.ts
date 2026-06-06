/* ============================================
   AI Service — Provider Factory
   ============================================ */

import type { AIProvider, AIConfig } from './types';
import { MockAIProvider } from './mock';

let providerInstance: AIProvider | null = null;

/**
 * Get the AI provider instance (singleton).
 * Falls back to MockAIProvider when no API key is configured.
 */
export function getAIProvider(config?: AIConfig): AIProvider {
  if (providerInstance) return providerInstance;

  const apiKey = config?.apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

  if (apiKey) {
    // Dynamic import to avoid bundling OpenAI SDK when not needed
    // Will be initialized lazily
    providerInstance = createOpenAIProviderProxy(apiKey, config);
  } else {
    providerInstance = new MockAIProvider();
  }

  return providerInstance;
}

/**
 * Reset the provider instance (useful for testing or config changes)
 */
export function resetAIProvider(): void {
  providerInstance = null;
}

/**
 * Creates a proxy that lazily loads the OpenAI provider
 */
function createOpenAIProviderProxy(apiKey: string, config?: AIConfig): AIProvider {
  let realProvider: AIProvider | null = null;
  const mock = new MockAIProvider();

  const handler: ProxyHandler<AIProvider> = {
    get(_target, prop) {
      return async (...args: unknown[]) => {
        if (!realProvider) {
          try {
            const { OpenAIProvider } = await import('./openai');
            realProvider = new OpenAIProvider({
              apiKey,
              model: config?.model || 'gpt-4o-mini',
              temperature: config?.temperature || 0.7,
              maxTokens: config?.maxTokens || 1000,
            });
          } catch {
            console.warn('Failed to load OpenAI provider, falling back to mock');
            realProvider = mock;
          }
        }
        const method = realProvider[prop as keyof AIProvider];
        if (typeof method === 'function') {
          return (method as (...a: unknown[]) => unknown).apply(realProvider, args);
        }
        return undefined;
      };
    },
  };

  return new Proxy(mock, handler);
}
