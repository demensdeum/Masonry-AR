import { GameGeolocationPosition } from "./gameGeolocationPosition.js"
import { int } from "./types.js"
import { Utils } from "./utils.js"

export class WalkChallengeController {

    private readonly storageKey = "walkChallenge"
    private positions: GameGeolocationPosition[] = []

    constructor() {
        this.loadPositions()
    }

    public isNotStarted() {
        return this.positions.length < 1
    }

    public isStarted() {
        return !this.isNotStarted()
    }

    public start(position: GameGeolocationPosition) {
        window.localStorage.removeItem(this.storageKey)
        this.positions = [position]
    }

    public clear() {
        window.localStorage.removeItem(this.storageKey)
        this.positions = []
    }

    public add(position: GameGeolocationPosition) {
        this.positions.push(position)
        this.savePositions()
    }

    public distance(): int {
        if (this.positions.length < 1) {
            return 0
        }
        const firstPosition = this.positions[0]
        
        const result =
            this.positions.reduce<any>( // still no tuples huh?
                (acculumator, currentValue) => [
                    acculumator[0] + Utils.distanceBetweenPositions(
                        acculumator[1], 
                        currentValue
                    ), 
                    currentValue
                ],
                [0, firstPosition]
            )
        return Math.floor(result[0])
    }

    private loadPositions() {
        if (window.localStorage.getItem(this.storageKey) == null) {
            return
        }
        const json = window.localStorage.getItem(this.storageKey)!
        const positions = JSON.parse(json)
        this.positions = positions
    }

    private savePositions() {
        const jsonPositions = JSON.stringify(this.positions)
        window.localStorage.setItem(this.storageKey, jsonPositions)
    }

}