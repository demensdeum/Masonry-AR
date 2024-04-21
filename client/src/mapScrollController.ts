import { float } from "./types.js"

export interface MapScrollController {
    initialize(): void
    scroll(
        offsetX: float,
        offsetY: float
    ): void
}