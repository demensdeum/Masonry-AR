import { AuthorizeRequestResult } from "./authorizeRequestResult.js";
import { RequestResultCodes } from "./requestResultCodes.js";
import { AuthorizeControllerDelegate } from "./authorizeControllerDelegte.js";
import { debugPrint } from "./runtime.js";
import { Constants } from "./constants.js";
import { AuthorizeControllerState } from "./authorizeControllerState.js";

export class AuthorizeController {
    private delegate: AuthorizeControllerDelegate
    private state: AuthorizeControllerState = AuthorizeControllerState.Idle

    constructor(delegate: AuthorizeControllerDelegate) {
        this.delegate = delegate
    }

    public async authorizeIfNeeded() {
        const url = `${Constants.apiPath}/server/authorize.php`;
        if (this.state != AuthorizeControllerState.Idle) {
            debugPrint(`Can't run authorize! Because state is: ${this.state}`)
            return
        }

        this.state = AuthorizeControllerState.Authorizing

        try {
            const response = await fetch(url)

            if (!response.ok) {
                this.state = AuthorizeControllerState.Error
                throw new Error(`Error: ${response.status} - ${response.statusText}`)
            }

            const jsonData: any = await response.json()

            const result = AuthorizeRequestResult.fromJson(jsonData)

            if (result.code == RequestResultCodes.Success) {
                this.state = AuthorizeControllerState.Authorized
                this.delegate.authorizeControllerDidAuthorize(
                    this,
                    result.heroUUID
                )
            }
            else {
                this.state = AuthorizeControllerState.Error
                this.delegate.authorizeControllerDidReceiveError(
                    this,
                    result.message
                )
            }

        } catch (error) {
            this.state = AuthorizeControllerState.Error
            console.error("Error authorizing:", error);
        }
    }
}