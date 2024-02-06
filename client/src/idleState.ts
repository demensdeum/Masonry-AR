import { State } from "./state.js"
import { Context } from "./context.js"
import { debugPrint } from "./runtime.js";

export class IdleState implements State {

    public name: string = "Idle";
    private context: Context;

    constructor(
        context: Context
    )
    {
        this.context = context;
    }

    step(): void {
        debugPrint("IdleState step");
    }

    public initialize(context: Context): void {
        this.context = context;
    }
}