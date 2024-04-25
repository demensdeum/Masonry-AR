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
        div.style.width = '800px'
        div.style.height = '600px'
        div.style.backgroundColor = '#000000'

        const iframe = document.createElement('iframe')
        iframe.style.width = '800px'
        iframe.style.height = '600px'
        iframe.style.border = '0px'
        iframe.src = [ 'https://www.youtube.com/embed/', "ZyhrYis509A", '?rel=0&controls=0&loop=1&autoplay=1&mute=1' ].join( '' );
        div.appendChild( iframe );

        this.sceneController.addCssPlaneObject(
            {
                name:"map",
                div: div,
                planeSize: {
                    width: 8,
                    height: 4
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

    scroll(offsetX: number, offsetY: number): void {
        debugPrint(offsetX)
        debugPrint(offsetY)
    }

}