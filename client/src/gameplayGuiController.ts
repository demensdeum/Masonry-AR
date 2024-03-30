import { GameData } from "./gameData.js"
import { InGameState } from "./inGameState.js"

export class GameplayGuiController {
    private guiBalanceText: HTMLElement
    private guiVersionText: HTMLElement    
    private gameData: GameData

    public constructor(gameData: GameData) {
        this.guiBalanceText = document.getElementById("guiBalanceText")!        
        this.guiVersionText = document.getElementById("guiVersionText")!        
        this.guiBalanceText.style.userSelect = "none"
        this.guiVersionText.style.userSelect = "none"
        this.gameData = gameData
        this.render()
    }

    private render() {
        this.guiVersionText.textContent = InGameState.versionDate
        this.guiBalanceText.textContent = `Balance: ${this.gameData.balance.toString()}`        
    }
}