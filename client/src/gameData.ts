import { GeolocationPosition } from "./geolocationPosition.js"

export class GameData {
    public heroUUID: String = ""
    public order: String = ""
    public position: GeolocationPosition | null = null    
    public balance = 0
    public cameraLock = false
    public message = "No message"
    public skin = "DEFAULT"
}