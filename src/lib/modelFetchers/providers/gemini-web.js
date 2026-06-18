import { WebUIModelFetcher } from "./webui.js";

export class GeminiWebModelFetcher extends WebUIModelFetcher {
  constructor(providerId, connection, config = {}) {
    super(providerId, connection, config);
  }
}
