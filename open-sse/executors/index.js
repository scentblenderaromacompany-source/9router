import { AntigravityExecutor } from "./antigravity.js";
import { AzureExecutor } from "./azure.js";
import { GeminiCLIExecutor } from "./gemini-cli.js";
import { GithubExecutor } from "./github.js";
import { IFlowExecutor } from "./iflow.js";
import { QoderExecutor } from "./qoder.js";
import { KiroExecutor } from "./kiro.js";
import { CodexExecutor } from "./codex.js";
import { CursorExecutor } from "./cursor.js";
import { VertexExecutor } from "./vertex.js";
import { QwenExecutor } from "./qwen.js";
import { OpenCodeExecutor } from "./opencode.js";
import { OpenCodeGoExecutor } from "./opencode-go.js";
import { GrokWebExecutor } from "./grok-web.js";
import { PerplexityWebExecutor } from "./perplexity-web.js";
import { OllamaLocalExecutor } from "./ollama-local.js";
import { CommandCodeExecutor } from "./commandcode.js";
import { XiaomiTokenplanExecutor } from "./xiaomi-tokenplan.js";
import { MimoFreeExecutor } from "./mimo-free.js";
import { ChatGPTWebExecutor } from "./chatgpt-web.js";
import { ZAIExecutor } from "./z-ai.js";
import { ZAIWebExecutor } from "./z-ai-web.js";
import { ClaudeWebExecutor } from "./claude-web.js";
import { DeepSeekWebExecutor } from "./deepseek-web.js";
import { KimiWebExecutor } from "./kimi-web.js";
import { MiniMaxWebExecutor } from "./minimax-web.js";
import { GeminiWebExecutor } from "./gemini-web.js";
import { DuckWebExecutor } from "./duck-web.js";
import { PollinationsExecutor } from "./pollinations.js";
import { KreaExecutor } from "./krea.js";
import { JimengExecutor } from "./jimeng.js";
import { FluxExecutor } from "./flux.js";
import { GrokImagineExecutor } from "./grok-imagine.js";
import { WebUIExecutor } from "./webui-base.js";
import { DefaultExecutor } from "./default.js";

const executors = {
  antigravity: new AntigravityExecutor(),
  azure: new AzureExecutor(),
  "gemini-cli": new GeminiCLIExecutor(),
  github: new GithubExecutor(),
  iflow: new IFlowExecutor(),
  qoder: new QoderExecutor(),
  kiro: new KiroExecutor(),
  codex: new CodexExecutor(),
  cursor: new CursorExecutor(),
  cu: new CursorExecutor(), // Alias for cursor
  vertex: new VertexExecutor("vertex"),
  "vertex-partner": new VertexExecutor("vertex-partner"),
  qwen: new QwenExecutor(),
  opencode: new OpenCodeExecutor(),
  "opencode-go": new OpenCodeGoExecutor(),
  "grok-web": new GrokWebExecutor(),
  "perplexity-web": new PerplexityWebExecutor(),
  "ollama-local": new OllamaLocalExecutor(),
  commandcode: new CommandCodeExecutor(),
  "xiaomi-tokenplan": new XiaomiTokenplanExecutor(),
  "mimo-free": new MimoFreeExecutor(),
  mmf: new MimoFreeExecutor(), // Alias for mimo-free
  "chatgpt-web": new ChatGPTWebExecutor(),
  "z-ai": new ZAIExecutor(),
  "z-ai-web": new ZAIWebExecutor(),
  "claude-web": new ClaudeWebExecutor(),
  "deepseek-web": new DeepSeekWebExecutor(),
  "kimi-web": new KimiWebExecutor(),
  "minimax-web": new MiniMaxWebExecutor(),
  "gemini-web": new GeminiWebExecutor(),
  "duck-web": new DuckWebExecutor(),
  "pollinations": new PollinationsExecutor(),
  "krea": new KreaExecutor(),
  "jimeng": new JimengExecutor(),
  "flux": new FluxExecutor(),
  "grok-imagine": new GrokImagineExecutor(),
};

const defaultCache = new Map();

export function getExecutor(provider) {
  if (executors[provider]) return executors[provider];
  if (!defaultCache.has(provider)) defaultCache.set(provider, new DefaultExecutor(provider));
  return defaultCache.get(provider);
}

export function hasSpecializedExecutor(provider) {
  return !!executors[provider];
}

export { BaseExecutor } from "./base.js";
export { AntigravityExecutor } from "./antigravity.js";
export { AzureExecutor } from "./azure.js";
export { GeminiCLIExecutor } from "./gemini-cli.js";
export { GithubExecutor } from "./github.js";
export { IFlowExecutor } from "./iflow.js";
export { QoderExecutor } from "./qoder.js";
export { KiroExecutor } from "./kiro.js";
export { CodexExecutor } from "./codex.js";
export { CursorExecutor } from "./cursor.js";
export { VertexExecutor } from "./vertex.js";
export { DefaultExecutor } from "./default.js";
export { QwenExecutor } from "./qwen.js";
export { OpenCodeExecutor } from "./opencode.js";
export { OpenCodeGoExecutor } from "./opencode-go.js";
export { GrokWebExecutor } from "./grok-web.js";
export { PerplexityWebExecutor } from "./perplexity-web.js";
export { OllamaLocalExecutor } from "./ollama-local.js";
export { CommandCodeExecutor } from "./commandcode.js";
export { XiaomiTokenplanExecutor } from "./xiaomi-tokenplan.js";
export { MimoFreeExecutor } from "./mimo-free.js";
export { ChatGPTWebExecutor } from "./chatgpt-web.js";
export { ZAIExecutor } from "./z-ai.js";
export { ZAIWebExecutor } from "./z-ai-web.js";
export { ClaudeWebExecutor } from "./claude-web.js";
export { DeepSeekWebExecutor } from "./deepseek-web.js";
export { KimiWebExecutor } from "./kimi-web.js";
export { MiniMaxWebExecutor } from "./minimax-web.js";
export { GeminiWebExecutor } from "./gemini-web.js";
export { DuckWebExecutor } from "./duck-web.js";
export { PollinationsExecutor } from "./pollinations.js";
export { KreaExecutor } from "./krea.js";
export { JimengExecutor } from "./jimeng.js";
export { FluxExecutor } from "./flux.js";
export { GrokImagineExecutor } from "./grok-imagine.js";
export { WebUIExecutor } from "./webui-base.js";
