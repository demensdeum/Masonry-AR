import { Context } from "./context.js";
import { State } from "./state.js";
import { debugPrint } from "./runtime.js";
import { GeolocationController } from "./geolocationController.js";
import { GeolocationControllerDelegate } from "./geolocationControllerDelegate.js";
import { GeolocationPosition } from "./geolocationPosition.js";

export class InGameState extends State implements GeolocationControllerDelegate {
    name = "InGameState"
    
    private geolocationController = new GeolocationController(this)

    initialize(): void {
        this.geolocationController.trackPosition()
    }

    step(): void {
        debugPrint("In Game Step")
    }

    geolocationControllerDidGetPosition(controller: GeolocationController, position: GeolocationPosition) {
        debugPrint(`Position: ${position.latitude}, ${position.longitude}`)
    }
}