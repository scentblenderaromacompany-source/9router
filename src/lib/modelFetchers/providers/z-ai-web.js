import { WebUIModelFetcher } from "./webui.js";

export class ZAiWebModelFetcher extends WebUIModelFetcher {
  constructor(providerId, connection, config = {}) {
    super(providerId, connection, config);
  }
}
