export interface ThreeCanvasDelegate {
    threeCanvasDidUpdateCanvas(
        threeCanvas: any, 
        canvas: any
    ): void;

    threeCanvasButtonDidPress(
        threeCanvas: any,
        name: string
    ): void;
}