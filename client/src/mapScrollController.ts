import { int, float } from "./types.js"
import { debugPrint } from "./runtime.js"
import { SceneController } from "./sceneController.js"
import { Utils } from "./utils.js"

export class MapScrollController {

    private sceneController: SceneController
    private readonly columns: int = 3
    private readonly rows: int = 3
    private readonly planeSize: int = 3

    constructor(
        sceneController: SceneController
    )
    {
        this.sceneController = sceneController
    }

    public initialize() {
        for (var y = 0; y < this.rows; y++) {
            for (var x = 0; x < this.columns; x++) {
                this.sceneController.addPlaneAt(
                    this.tileName(x, y),
                    -this.planeSize + x * this.planeSize,
                    0,
                    -this.planeSize + y * this.planeSize,
                    this.planeSize,
                    this.planeSize,
                    "com.demensdeum.loading.texture"
                )
                this.sceneController.rotateObjectTo(
                    this.tileName(x, y),
                    Utils.angleToRadians(90),
                    0,
                    0
                )
            }
        }
    }

    private tileName(
        x: int,
        y: int
    )
    {
        return `${x} - ${y}`
    }

    public scroll(
        x: float,
        y: float
    ) {
        debugPrint(x)
        debugPrint(y)
    }
}