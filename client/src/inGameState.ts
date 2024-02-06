import { Context } from "./context.js";
import { State } from "./state.js";
import { debugPrint } from "./runtime.js";

export class InGameState implements State {
    name = "InGameState"
    
    initialize(context: Context): void {
        debugPrint("initialize")
    }

    step(): void {
        debugPrint("step")
    }
}