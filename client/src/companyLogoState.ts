import { InGameState } from "./inGameState.js";
import { State } from "./state.js";
import { int } from "./types.js";

export class CompanyLogoState extends State {

    private counter: int = 0

    initialize(): void {
        this.context.sceneController.switchSkyboxIfNeeded(
            "com.demensdeum.company.logo"
        )
    }

    step(): void {
        this.counter += 1
        if (this.counter > 300) {
            const inGameState = new InGameState(
                "InGameState",
                this.context
              )
            
              // @ts-ignore
              document.global_gameplay_inGameState = inGameState;
            
            this.context.transitionTo(inGameState)
        }
    }

}