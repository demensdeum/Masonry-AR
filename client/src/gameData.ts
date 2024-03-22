import { GameGeolocationPosition } from "./gameGeolocationPosition.js"

export class GameData {
    public heroUUID: string = ""
    public order: string = ""
    public name: string = ""
    public playerServerGeolocationPosition: GameGeolocationPosition | null = null
    public playerClientGeolocationPosition: GameGeolocationPosition | null = null    
    public balance = 0
    public message = "No message"
    public model = "DEFAULT"
    public isZonesViewEnabled = true
    public isLocationResolvedOnce = ()=>{
        return this.playerClientGeolocationPosition != null
    }

    public geolocationPositionIsInSync() {
        if (!this.playerClientGeolocationPosition || !this.playerServerGeolocationPosition) {
            return false
        }
        else {
            return this.playerServerGeolocationPosition.near(this.playerClientGeolocationPosition)
        }
    }
}