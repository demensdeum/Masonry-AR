import { LocaleSelectorState } from "./localeSelectorState.js";
import { State } from "./state.js";
import { Utils } from "./utils.js";

export class CompanyLogoState extends State {

    private readonly switchMillisecondsTimeout = 2069
    private startDate = new Date()

    initialize(): void {
    }

    step(): void {
        // @ts-ignore
        const companyLogoLoaded = document.global_gameplay_companyLogoLoaded
        const diffMilliseconds = Math.abs((new Date().getTime() - this.startDate.getTime()))
        
        if (diffMilliseconds > this.switchMillisecondsTimeout) {
            Utils.hideHtmlElement({name:"companyLogoContainer"})

            const localeSelectorState = new LocaleSelectorState(
                "Locale Selector State",
                this.context
            )
            // @ts-ignore
            document.global_gameplay_localeSelectorState = localeSelectorState

            this.context.transitionTo(localeSelectorState)
        }
        else if (companyLogoLoaded == true) {
            Utils.showHtmlElement({name: "companyLogoContainer"});
        }
    }

}