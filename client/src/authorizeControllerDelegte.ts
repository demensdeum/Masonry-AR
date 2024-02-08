import { AuthorizeController } from "./authorizeController.js";

export interface AuthorizeControllerDelegate{
    authorizeControllerDidAuthorize(controller: AuthorizeController): void
    authorizeControllerDidReceiveError(controller: AuthorizeController, message: string): void
}