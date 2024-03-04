import { BuildingStatusControllerDelegate } from "./buildingStatusControllerDelegate.js";
import { debugPrint } from "./runtime.js";
import { RequestResult } from "./requestResult.js";
import { RequestResultCodes } from "./requestResultCodes.js";
import { Entity } from "./entity.js";

export class BuildingStatusController {

    public delegate: BuildingStatusControllerDelegate

    constructor(
        delegate: BuildingStatusControllerDelegate
    )
    {
        this.delegate = delegate
    }

    public async rename(entity: Entity, name: string) {

        const url = `../server/setBuildingName.php?uuid=${entity.uuid}&name=${name}`

        debugPrint(`rename building: ${entity.uuid} to name: ${name}`)

        try {
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`)
            }

            const jsonData: any = await response.json()

            const result = RequestResult.fromJson(jsonData)

            if (result.code == RequestResultCodes.Success) {
                this.delegate.buildingStatusControllerDidRename(
                    this,
                    entity.uuid,
                    name
                )    
            }
            else {
                this.delegate.buildingStatusControllerDidReceiveError(
                    this,
                    result.message
                )
            }

        } catch (error) {
            console.error("Error renaming building:", error);
        }

    }

}