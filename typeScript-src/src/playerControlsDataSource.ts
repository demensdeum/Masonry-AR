import { Controls } from "./controls.js";

export interface ControlsDataSource {
    controlsQuaternionForObject(
        controls: Controls,
        objectName: string
    ): any;

    controlsCanMoveForwardObject(
        controls: Controls,
        objectName: string
    ): any;

    controlsCanMoveBackwardObject(
        controls: Controls,
        objectName: string
    ): any;    

    controlsCanMoveLeftObject(
        controls: Controls,
        objectName: string
    ): any;   
    
    controlsCanMoveRightObject(
        controls: Controls,
        objectName: string
    ): any;   
}