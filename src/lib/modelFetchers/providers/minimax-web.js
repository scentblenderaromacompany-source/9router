import { WebUIModelFetcher } from "./webui.js";

export class MinimaxWebModelFetcher extends WebUIModelFetcher {
  constructor(providerId, connection, config = {}) {
    super(providerId, connection, config);
  }
}
