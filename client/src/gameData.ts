import { int } from "./types.js";
import { GeolocationPosition } from "./geolocationPosition.js"

export class GameData {
    public heroUuid = ""
    public position: GeolocationPosition | null = null    
    public balance = 0
    public cameraLock = false
    public message = "No message"
}