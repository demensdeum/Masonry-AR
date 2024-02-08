import { RequestResult } from "./requestResult.js";
import { RequestResultCodes } from "./requestResultCodes.js";
import { AuthorizeControllerDelegate } from "./authorizeControllerDelegte.js";

export class AuthorizeController {
    private delegate: AuthorizeControllerDelegate

    constructor(delegate: AuthorizeControllerDelegate) {
        this.delegate = delegate
    }

    public async authorize() {
        const url = `http://localhost/Masonry-AR/server/authorize.php`;

        try {
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`)
            }

            const jsonData: any = await response.json()

            const result = RequestResult.fromJson(jsonData)

            if (result.code == RequestResultCodes.Success) {
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