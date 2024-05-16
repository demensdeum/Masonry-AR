import { AuthorizeController } from "./authorizeController.js";

export interface AuthorizeControllerDelegate{
    authorizeControllerDidAuthorize(controller: AuthorizeController, heroUUID: string): void
    authorizeControllerDidReceiveError(controller: AuthorizeController, message: string): void
}