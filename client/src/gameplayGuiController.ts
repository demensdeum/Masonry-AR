import { GameData } from "./gameData.js"
import { GameDataDelegate } from "./gameDataDelegate.js"
import { InGameState } from "./inGameState.js"
import { int } from "./types.js"

export class GameplayGuiController implements GameDataDelegate {
    private guiBalanceText: HTMLElement
    private guiVersionText: HTMLElement    
    private gameData: GameData
    private renderingBalance: int = 0

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
    }

    gameDataDidChangeName(_: GameData, __: string) {
    }

    gameDataDidChangeOrder(_: GameData, __: string) {
    }

    private render() {
        this.guiVersionText.textContent = InGameState.versionDate
        this.guiBalanceText.textContent = `${this.renderingBalance.toString()} ₳`        
    }

    public step() {
        const diff = this.gameData.balance - this.renderingBalance;
        var stepAmount = Math.min(1000, Math.abs(diff))
        if (stepAmount < 1000 && stepAmount != 0) {
            stepAmount = 1
        }
        if (diff > 0) {
            this.renderingBalance += stepAmount
        } else if (diff < 0) {
            this.renderingBalance -= stepAmount
        }
        this.render();
    }
}