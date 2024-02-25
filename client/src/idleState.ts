import { State } from "./state.js"
import { debugPrint } from "./runtime.js";

export class IdleState extends State {

    step(): void {
        debugPrint("IdleState step");
    }

    public initialize(): void {
    }
}