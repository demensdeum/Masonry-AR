import { State } from "./state.js";
import { InGameState } from "./inGameState.js"
declare function _t(key: string): string;

export class LocaleSelectorState extends State {
    initialize(): void {
    }
    step(): void {
        this.context.translator.locale = confirm("Я Русский?") ? "ru" : "en"
        
        const inGameState = new InGameState(
            "InGameState",
            this.context
          )
        
        // @ts-ignore
        document.global_gameplay_inGameState = inGameState;
        
        this.context.transitionTo(inGameState)        
    }
}