import { State } from "./state.js"
import { InGameState } from "./inGameState.js"
import { Utils } from "./utils.js"

export class MainMenuState extends State {
    private readonly switchMillisecondsTimeout = 6000
    private startDate = new Date()    

    initialize() {
        this.context.sceneController.switchSkyboxIfNeeded(
            {
                name: "com.demensdeum.masonry.black",
                environmentOnly: false
            }
        )
        Utils.showHtmlElement({name: "2d"})
    }

    step() {
        const diffMilliseconds = Math.abs((new Date().getTime() - this.startDate.getTime()))
        
        if (diffMilliseconds > this.switchMillisecondsTimeout) {
            this.playButtonDidPress()
        }       
    }

    public playButtonDidPress() {
        Utils.hideHtmlElement({name:"2d"})
        this.context.sceneController.removeAllSceneObjectsExceptCamera();

        const inGameState = new InGameState(
            "InGameState",
            this.context
        )

        // @ts-ignore
        document.global_gameplay_inGameState = inGameState
        this.context.transitionTo(inGameState)        
    }

}