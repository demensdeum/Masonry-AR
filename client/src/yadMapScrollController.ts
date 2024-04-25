import { MapScrollController } from "./mapScrollController.js"
import { debugPrint } from "./runtime.js"
import { SceneController } from "./sceneController.js"
import { GameVector3  } from "./gameVector3.js"
import { Utils } from "./utils.js"

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
        const div = document.createElement('div')
        div.id = "map"
        div.style.width = '1600px'
        div.style.height = '1600px'

        this.sceneController.addCssPlaneObject(
            {
                name:"map",
                div: div,
                planeSize: {
                    width: 8,
                    height: 8
                },
                rotation: new GameVector3(
                    Utils.angleToRadians(270),
                    0,
                    0
                ),
                scale: new GameVector3(
                    0.005,
                    0.005,
                    0.005
                ),
                shadows: {
                    receiveShadow: true,
                    castShadow: false
                }
            }
        )
    }

    scroll(offsetX: number, offsetY: number): void {
        debugPrint(offsetX)
        debugPrint(offsetY)
    }

}