import { InGameState } from "./inGameState.js";
import { State } from "./state.js";
import { Utils } from "./utils.js";

export class CompanyLogoState extends State {

    private readonly switchMillisecondsTimeout = 1069
    private startDate = new Date()

    initialize(): void {
    }

    step(): void {
        // @ts-ignore
        const companyLogoLoaded = document.global_gameplay_companyLogoLoaded
        const diffMilliseconds = Math.abs((new Date().getTime() - this.startDate.getTime()))
        
        if (diffMilliseconds > this.switchMillisecondsTimeout) {
            const inGameState = new InGameState(
                "InGameState",
                this.context
              )
            
              // @ts-ignore
              document.global_gameplay_inGameState = inGameState;
            
            Utils.hideElement({name:"companyLogoContainer"})
            this.context.transitionTo(inGameState)
        }
        else if (companyLogoLoaded == true) {
            debugger
            Utils.showElement({name: "companyLogoContainer"});
        }
    }

}