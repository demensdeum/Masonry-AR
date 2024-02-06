import { Context } from './context';

export interface State {
    name: string;
    initialize(context: Context): void;
    step(): void;
}
  