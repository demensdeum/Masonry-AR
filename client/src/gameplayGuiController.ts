import { GameData } from "./gameData.js"
import { InGameState } from "./inGameState.js"

export class GameplayGuiController {
    private guiVersionText: HTMLElement
    private guiBalanceText: HTMLElement
    private gameData: GameData

    public constructor(gameData: GameData) {
        this.guiVersionText = document.getElementById("guiVersionText")!        
        this.guiBalanceText = document.getElementById("guiBalanceText")!        
        this.gameData = gameData
        this.render()
    }

    private render() {
        this.guiVersionText.textContent = InGameState.versionDate
        this.guiBalanceText.textContent = `Balance: ${this.gameData.balance.toString()}`        
    }
}