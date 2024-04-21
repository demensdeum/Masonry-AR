import { MapScrollController } from "./mapScrollController.js"
import { debugPrint } from "./runtime.js"
import { SceneController } from "./sceneController.js"
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js"

export class YadMapScrollController implements MapScrollController {

    private renderer: CSS3DRenderer
    private sceneController: SceneController

    constructor(
        sceneController: SceneController
    )
    {
        this.sceneController = sceneController

        this.renderer = new CSS3DRenderer()
        this.renderer.domElement.style.position = 'absolute'
        this.renderer.domElement.style.top = "0"
        document.querySelector('#css')?.appendChild( this.renderer.domElement );    

        debugPrint(this.sceneController)
    }

    initialize(): void {
    }

    scroll(offsetX: number, offsetY: number): void {
        debugPrint(offsetX)
        debugPrint(offsetY)
    }

}