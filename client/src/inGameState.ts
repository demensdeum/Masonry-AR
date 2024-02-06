import { Context } from "./context.js";
import { State } from "./state.js";
import { debugPrint } from "./runtime.js";

export class InGameState extends State {
    name = "InGameState"
    
    setup(context: Context): void {
    }

    initialize(): void {
    }

    step(): void {
        debugPrint("step")
    }
}