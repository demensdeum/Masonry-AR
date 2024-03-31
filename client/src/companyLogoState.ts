import { InGameState } from "./inGameState.js";
import { State } from "./state.js";

export class CompanyLogoState extends State {

    private startDate = new Date()

    initialize(): void {
    }

    step(): void {
        const diffSeconds = Math.abs((new Date().getTime() - this.startDate.getTime()))        
        if (diffSeconds > 2000) {
            const inGameState = new InGameState(
                "InGameState",
                this.context
              )
            
              // @ts-ignore
              document.global_gameplay_inGameState = inGameState;
            
            if ((document.getElementsByClassName("companyLogoContainer")[0] as HTMLElement).style.display == "block") {
                (document.getElementsByClassName("companyLogoContainer")[0] as HTMLElement).style.display = "none"
            }
            this.context.transitionTo(inGameState)
        }
    }

}