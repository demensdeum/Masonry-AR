import { int, float } from "./types.js"
import { SceneController } from "./sceneController.js"
import { Utils } from "./utils.js"
import { debugPrint } from "./runtime.js"

export class MapScrollController {

    private sceneController: SceneController
    private readonly columns: int = 17
    private readonly rows: int = 17
    private readonly planeSize: int = 6

    constructor(
        sceneController: SceneController
    )
    {
        this.sceneController = sceneController
    }

    private leftBorder() {
        return -(this.planeSize * Math.floor(this.columns / 2))
    }

    private rightBorder() {
        return this.leftBorder() + this.columns * this.planeSize
    }    

    private bottomBorder() {
        return -(this.planeSize * Math.floor(this.rows / 2))
    }

    private topBorder() {
        return this.bottomBorder() + this.rows * this.planeSize
    }    

    public initialize() {
        for (var y = 0; y < this.rows; y++) {
            for (var x = 0; x < this.columns; x++) {
                this.sceneController.addPlaneAt(
                    this.planeName(x, y),
                    this.leftBorder() + x * this.planeSize,
                    0,
                    this.bottomBorder() + y * this.planeSize,
                    this.planeSize,
                    this.planeSize,
                    "com.demensdeum.tile"
                )
                this.sceneController.rotateObjectTo(
                    this.planeName(x, y),
                    Utils.angleToRadians(90),
                    0,
                    0
                )
            }
        }
    }

    private planeName(
        x: int,
        y: int
    )
    {
        return `map plane: ${x} - ${y}`
    }

    public scroll(
        offsetX: float,
        offsetY: float
    ) {
        debugPrint(offsetX)
        debugPrint(offsetY)

        for (var y = 0; y < this.rows; y++) {
            for (var x = 0; x < this.columns; x++) {
                const planePosition = this.sceneController.sceneObjectPosition(
                    this.planeName(x, y)
                )

                if (planePosition.x > this.rightBorder()) {
                    planePosition.x -= this.columns * this.planeSize
                }
                else if (planePosition.x < this.leftBorder()) {
                    planePosition.x += this.columns * this.planeSize
                }

                if (planePosition.z > this.topBorder()) {
                    planePosition.z -= this.rows * this.planeSize
                }
                else if (planePosition.z < this.bottomBorder()) {
                    planePosition.z += this.rows * this.planeSize
                }
                
                planePosition.x += offsetX
                planePosition.z += offsetY

                this.sceneController.moveObjectTo(
                    this.planeName(x,y),
                    planePosition.x,
                    planePosition.y,
                    planePosition.z
                )
            }
        }        
    }
}