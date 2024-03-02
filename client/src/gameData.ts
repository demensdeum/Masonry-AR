import { GeolocationPosition } from "./geolocationPosition.js"

export class GameData {
    public heroUUID: string = ""
    public order: string = ""
    public name: string = ""
    public position: GeolocationPosition | null = null    
    public balance = 0
    public cameraLock = false
    public message = "No message"
    public model = "DEFAULT"
    public isZonesViewEnabled = true
}