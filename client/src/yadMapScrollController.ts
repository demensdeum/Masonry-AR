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
        div.style.width = '2048px'
        div.style.height = '2048px'
        div.style.background = 'radial-gradient(circle at center, transparent, white)';
        div.style.userSelect = "none";

        (document.querySelector("#css-canvas") as HTMLElement).style.backgroundColor = 'white';

        this.sceneController.addCssPlaneObject(
            {
                name:"map",
                div: div,
                planeSize: {
                    width: 20.4,
                    height: 20.4
                },
                rotation: new GameVector3(
                    Utils.angleToRadians(270),
                    0,
                    0
                ),
                scale: new GameVector3(
                    0.01,
                    0.01,
                    0.01
                ),
                shadows: {
                    receiveShadow: true,
                    castShadow: false
                }
            }
        )
    }

    scroll(_: number, __: number): void {
        // debugPrint(offsetX)
        // debugPrint(offsetY)
    }

}