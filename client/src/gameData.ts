import { GameGeolocationPosition } from "./geolocationPosition.js"

export class GameData {
    public heroUUID: string = ""
    public order: string = ""
    public name: string = ""
    public position: GameGeolocationPosition | null = null    
    public balance = 0
    public message = "No message"
    public model = "DEFAULT"
    public isZonesViewEnabled = true
    public isLocationResolvedOnce = ()=>{
        return this.position != null
    }
}