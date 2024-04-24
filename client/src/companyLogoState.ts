import { InGameState } from "./inGameState.js";
import { State } from "./state.js";

export class CompanyLogoState extends State {

    private readonly switchMillisecondsTimeout = 100
    private startDate = new Date()

    initialize(): void {
    }

    step(): void {
        // @ts-ignore
        const companyLogoLoaded = document.global_gameplay_companyLogoLoaded
        const diffMilliseconds = Math.abs((new Date().getTime() - this.startDate.getTime()))
        
        if (companyLogoLoaded) {
            //debugger
        }
        if (diffMilliseconds > this.switchMillisecondsTimeout) {
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
        else if (
            (document.getElementsByClassName("companyLogoContainer")[0] as HTMLElement).style.display != "block" &&
            companyLogoLoaded == true
        ) {
            (document.getElementsByClassName("companyLogoContainer")[0] as HTMLElement).style.display = "block"
        }
    }

}