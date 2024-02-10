import { RequestResult } from "./requestResult.js";
import { RequestResultCodes } from "./requestResultCodes.js";
import { AuthorizeControllerDelegate } from "./authorizeControllerDelegte.js";
import { debugPrint } from "./runtime.js";

export class AuthorizeController {
    private delegate: AuthorizeControllerDelegate
    private isAuthorized = false

    constructor(delegate: AuthorizeControllerDelegate) {
        this.delegate = delegate
    }

    public async authorizeIfNeeded() {
        const url = `../server/authorize.php`;
        if (this.isAuthorized) {
            debugPrint(`this.constructor.name: no need to authorize! Already authorized!`)
            return
        }

        try {
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`)
            }

            const jsonData: any = await response.json()

            const result = RequestResult.fromJson(jsonData)

            if (result.code == RequestResultCodes.Success) {
                this.isAuthorized = true
                this.delegate.authorizeControllerDidAuthorize(
                    this
                )
            }
            else {
                this.delegate.authorizeControllerDidReceiveError(
                    this,
                    result.message
                )
            }

        } catch (error) {
            console.error("Error authorizing:", error);
        }
    }
}