import { WebUIModelFetcher } from "./webui.js";

export class KimiWebModelFetcher extends WebUIModelFetcher {
  constructor(providerId, connection, config = {}) {
    super(providerId, connection, config);
  }
}
