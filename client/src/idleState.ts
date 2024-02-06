import { State } from "./state.js"
import { Context } from "./context.js"
import { debugPrint } from "./runtime.js";

export class IdleState extends State {

    step(): void {
        debugPrint("IdleState step");
    }

    public initialize(): void {
    }
}