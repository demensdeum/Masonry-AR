import { BuildingStatusController } from "./buildingStatusController.js"

export interface BuildingStatusControllerDelegate {
    buildingStatusControllerDidRename(controller: BuildingStatusController, entity: string, name: string): void
    buildingStatusControllerDidReceiveError(controller: BuildingStatusController, string: string): void
}