import { float } from "./types.js"
import { Utils } from "./utils.js"
import { debugPrint } from "./runtime.js"

export class GameSettings {

    static databaseKey = "GameSettings"

    mouseSensitivity: float
    frameDelay: float

    static default()
    {
        return new GameSettings(
            4,
            0
        )
    }

    static fromJson(
        savedGameSettings: any
    )
    {
        const mouseSensitivity = Utils.numberOrConstant(savedGameSettings.mouseSensitivity, 1)
        const frameDelay = Utils.numberOrConstant(savedGameSettings.frameDelay, 0)

        return new GameSettings(
            mouseSensitivity,
            frameDelay
        )
    }

    constructor(
        mouseSensitivity: float,
        frameDelay: float
    )
    {
        this.mouseSensitivity = mouseSensitivity
        this.frameDelay = frameDelay
    }

    save() {
        const serializedGameSettings = JSON.stringify(this)
        debugPrint(serializedGameSettings)
        window.localStorage.setItem(GameSettings.databaseKey, serializedGameSettings)
    }

    static loadOrDefault(): GameSettings {
        const savedGameSettingsJson = window.localStorage.getItem(GameSettings.databaseKey)
        var savedGameSettings = null
        if (savedGameSettingsJson != null) {
            savedGameSettings = JSON.parse(savedGameSettingsJson)
        }
        const gameSettings = savedGameSettings != null ? GameSettings.fromJson(savedGameSettings) : GameSettings.default()
        return gameSettings
    }

}