import { WebUIModelFetcher } from "./webui.js";

export class PerplexityWebModelFetcher extends WebUIModelFetcher {
  constructor(providerId, connection, config = {}) {
    super(providerId, connection, config);
  }
}
