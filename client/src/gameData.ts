import { GeolocationPosition } from "./geolocationPosition.js"

export class GameData {
    public heroUUID = ""
    public order = ""
    public position: GeolocationPosition | null = null    
    public balance = 0
    public cameraLock = false
    public message = "No message"
}