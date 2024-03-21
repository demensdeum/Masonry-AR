import { GameGeolocationPosition } from "./geolocationPosition.js";
import { MockEntitiesController } from "./mockEntitiesController.js";

export interface MockEntitiesControllerDataSource {
    mockEntitiesControllerDidRequestGeolocationPosition(
        mockEntitiesController: MockEntitiesController
    ): GameGeolocationPosition
}