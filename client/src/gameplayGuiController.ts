import { GameData } from "./gameData.js"
import { GameDataDelegate } from "./gameDataDelegate.js"
import { InGameState } from "./inGameState.js"

export class GameplayGuiController implements GameDataDelegate {
    private guiBalanceText: HTMLElement
    private guiVersionText: HTMLElement    
    private gameData: GameData

    public constructor(gameData: GameData) {
        this.guiBalanceText = document.getElementById("guiBalanceText")!        
        this.guiVersionText = document.getElementById("guiVersionText")!        
        this.guiBalanceText.style.userSelect = "none"
        this.guiVersionText.style.userSelect = "none"
        this.gameData = gameData      
        this.gameData.delegate = this
        this.render()
    }

    gameDataDidChangeBalance(_: GameData, __: number) {
        this.render()
    }

    gameDataDidChangeName(_: GameData, __: string) {
        this.render()
    }

    gameDataDidChangeOrder(_: GameData, __: string) {
        this.render()
    }

    private render() {
        this.guiVersionText.textContent = InGameState.versionDate
        this.guiBalanceText.textContent = `${this.gameData.balance.toString()} ₳`        
    }
}