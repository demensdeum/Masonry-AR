import { MapScrollController } from "./mapScrollController.js"
import { debugPrint } from "./runtime.js"
import { SceneController } from "./sceneController.js"

export class YadMapScrollController implements MapScrollController {

    private sceneController: SceneController

    constructor(
        sceneController: SceneController
    )
    {
        this.sceneController = sceneController
        debugPrint(this.sceneController)
    }

    initialize(): void {
        this.sceneController.addCssPlaneObject(
            "map",
            2,
            2
        )
    }

    scroll(offsetX: number, offsetY: number): void {
        debugPrint(offsetX)
        debugPrint(offsetY)
    }

}