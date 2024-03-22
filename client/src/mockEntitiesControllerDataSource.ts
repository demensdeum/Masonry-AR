import { GameGeolocationPosition } from "./gameGeolocationPosition.js";
import { MockEntitiesController } from "./mockEntitiesController.js";

export interface MockEntitiesControllerDataSource {
    mockEntitiesControllerDidRequestGeolocationPosition(
        mockEntitiesController: MockEntitiesController
    ): GameGeolocationPosition
}