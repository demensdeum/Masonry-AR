import { ThreeCanvasDelegate } from "./threeCanvasDelegate";

export class ThreeCanvasHandler implements ThreeCanvasDelegate {
    private application: any;
    private debugEnabled: boolean = false;

    threeCanvasDidUpdateCanvas(
        _: any, 
        canvas: any
    ) {
        const output = JSON.stringify(canvas);
        this
            .application
            .ports
            .nativeCanvasReceiver
            .send(output);
            if (this.debugEnabled) {
                console.log("sent canvas to Elm");
            }            
    }

    threeCanvasButtonDidPress(
        _: any, 
        name: string
    ): void {
        this
            .application
            .ports
            .buttonPressedReceiver
            .send(name);
            console.log("sent button pressed to Elm: " + name);          
    }
}

// @ts-ignore
document.threeCanvasHandlerLoaded(new ThreeCanvasHandler());