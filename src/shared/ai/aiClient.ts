import type { ChatCompletionRequest, JsonCompletionRequest } from '../types';
import { apiClient } from '../api/apiClient';

export const aiClient = {
  chat(request: ChatCompletionRequest): Promise<string> {
    return apiClient.ai.chat(request);
  },

  requestJson<TResult = unknown>(request: JsonCompletionRequest): Promise<TResult> {
    return apiClient.ai.requestJson<TResult>(request);
  },
};
