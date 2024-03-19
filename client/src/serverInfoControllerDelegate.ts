import { ServerInfoController } from "./serverInfoController.js";
import { ServerInfoEntry } from "./serverInfoEntry.js";

export interface ServerInfoControllerDelegate {
    serverInfoControllerDidFetchInfo(
        serverInfoController: ServerInfoController,
        entries: ServerInfoEntry[]
    ): void
}