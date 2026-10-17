export interface GeminiUsageMeta {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
  cachedContentTokenCount?: number;
  thoughtsTokenCount?: number;
  toolUsePromptTokenCount?: number;
}

export interface ModelPrice {
  version: string;
  inputUsdPerMillion: number;
  outputUsdPerMillion: number;
}

export interface AccountedUsage {
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  cachedTokens: number | null;
  thinkingTokens: number | null;
  toolUseTokens: number | null;
  tokensKnown: boolean;
  estimatedCostUsd: number | null;
}

/** Missing provider metadata stays null (UNKNOWN), never coerced to 0. */
export function accountGeminiUsage(meta: GeminiUsageMeta | null | undefined, price: ModelPrice | null): AccountedUsage {
  if (!meta) {
    return {
      inputTokens: null,
      outputTokens: null,
      totalTokens: null,
      cachedTokens: null,
      thinkingTokens: null,
      toolUseTokens: null,
      tokensKnown: false,
      estimatedCostUsd: null,
    };
  }
  const input = Number.isFinite(meta.promptTokenCount) ? Number(meta.promptTokenCount) : null;
  const output = Number.isFinite(meta.candidatesTokenCount) ? Number(meta.candidatesTokenCount) : null;
  const totalReported = Number.isFinite(meta.totalTokenCount) ? Number(meta.totalTokenCount) : null;
  const cached = Number.isFinite(meta.cachedContentTokenCount) ? Number(meta.cachedContentTokenCount) : null;
  const thinking = Number.isFinite(meta.thoughtsTokenCount) ? Number(meta.thoughtsTokenCount) : null;
  const tool = Number.isFinite(meta.toolUsePromptTokenCount) ? Number(meta.toolUsePromptTokenCount) : null;
  const total =
    totalReported != null
      ? totalReported
      : input != null && output != null
        ? input + output
        : null;
  let estimatedCostUsd: number | null = null;
  if (price && input != null && output != null) {
    estimatedCostUsd = (input / 1_000_000) * price.inputUsdPerMillion + (output / 1_000_000) * price.outputUsdPerMillion;
  }
  return {
    inputTokens: input,
    outputTokens: output,
    totalTokens: total,
    cachedTokens: cached,
    thinkingTokens: thinking,
    toolUseTokens: tool,
    tokensKnown: input != null || output != null || total != null,
    estimatedCostUsd,
  };
}
