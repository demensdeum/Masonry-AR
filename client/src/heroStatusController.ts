import { HeroStatusControllerDelegate } from "./heroStatusControllerDelegate.js";
import { debugPrint } from "./runtime.js";
import { EntitiesRequestResult } from "./entitiesRequestResult.js";
import { RequestResultCodes } from "./requestResultCodes.js";

export class HeroStatusController {

    public delegate: HeroStatusControllerDelegate

    constructor(
        delegate: HeroStatusControllerDelegate
    )
    {
        this.delegate = delegate
    }

    public async set(order: string) {

        const url = `../server/setOrder.php?order=${order}`

        debugPrint(`set order: ${order}`)

        try {
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`)
            }

            const jsonData: any = await response.json()

            const result = EntitiesRequestResult.fromJson(jsonData)

            if (result.code == RequestResultCodes.Success) {
                this.delegate.heroStatusControllerDidChange(
                    this,
                    order
                )    
            }
            else {
                this.delegate.heroStatusControllerDidReceiveError(
                    this,
                    result.message
                )
            }

        } catch (error) {
            console.error("Error switching order:", error);
        }

    }

}