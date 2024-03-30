import { GameDataDelegate } from "./gameDataDelegate.js"
import { GameGeolocationPosition } from "./gameGeolocationPosition.js"
import { int } from "./types.js"

export class GameData {
    public delegate?: GameDataDelegate

    public heroUUID: string = ""
    public _order: string = ""
    public _name: string = ""
    public playerServerGeolocationPosition: GameGeolocationPosition | null = null
    public playerClientGeolocationPosition: GameGeolocationPosition | null = null    
    public _balance: int = 0
    public message = "No message"
    public model = "DEFAULT"
    public isZonesViewEnabled = true

    public set order(value: string) {
        this._order = value
        this.delegate?.gameDataDidChangeOrder(this, this._order)
    }

    public get order(): string {
        return this._order
    }

    public set name(value: string) {
        this._name = value
        this.delegate?.gameDataDidChangeName(this, this._name)
    }

    public get name(): string {
        return this._name
    }

    public set balance(value: int) {
        this._balance = value
        this.delegate?.gameDataDidChangeBalance(this, this._balance)
    }

    public get balance(): int {
        return this._balance
    }


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