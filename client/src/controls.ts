import { ControlsDelegate } from "./controlsDelegate";
import { ControlsDataSource } from "./playerControlsDataSource";

export interface Controls {
    dataSource: ControlsDataSource
    delegate: ControlsDelegate;
    step(delta: any): void;
}