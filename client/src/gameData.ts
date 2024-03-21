import { GameGeolocationPosition } from "./geolocationPosition.js"

export class GameData {
    public heroUUID: string = ""
    public order: string = ""
    public name: string = ""
    public delayedPosition: GameGeolocationPosition | null = null
    public currentPosition: GameGeolocationPosition | null = null    
    public balance = 0
    public message = "No message"
    public model = "DEFAULT"
    public isZonesViewEnabled = true
    public isLocationResolvedOnce = ()=>{
        return this.currentPosition != null
    }
}