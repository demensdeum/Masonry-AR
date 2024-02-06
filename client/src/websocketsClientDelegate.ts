import { WebsocketsClient } from "./websocketsClient";

export interface WebsocketsClientDelegate {
    websocketsClientDidReceiveMessage(websocketsClient: WebsocketsClient, message: String) : void;
    websocketsClientDidReceiveError(websocketsClient: WebsocketsClient, error: Error) : void;
    websocketsClientDidConnect(websocketsClient: WebsocketsClient) : void;
}