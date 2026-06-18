import { WebUIModelFetcher } from "./webui.js";

export class ChatgptWebModelFetcher extends WebUIModelFetcher {
  constructor(providerId, connection, config = {}) {
    super(providerId, connection, config);
  }
}
