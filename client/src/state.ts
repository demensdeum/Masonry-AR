import { Context } from './context';

export abstract class State {
    public name: string
    context: Context

    constructor(
        name: string,
        context: Context
    ) {
        this.name = name
        this.context = context
    }

    abstract initialize(): void
    abstract step(): void
}
  