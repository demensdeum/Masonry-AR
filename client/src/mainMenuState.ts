import { State } from "./state.js"
import { Utils } from "./utils.js"
import { Context } from "./context.js"
import { LegalScreenState } from "./legalScreenState.js"

export class MainMenuState implements State {
    public name: string
    context: Context

    private readonly switchMillisecondsTimeout = 6000
    private startDate = new Date()    

    constructor(
        name: string,
        context: Context
    ) {
        this.name = name
        this.context = context
    }

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
        
        const legalScreenState = new LegalScreenState(
            "legalScreenState",
            this.context
        )

        this.context.transitionTo(legalScreenState)
    }

}