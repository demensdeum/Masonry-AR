import { GameData } from "./gameData.js"
import { int } from "./types.js"

export interface GameDataDelegate {
    gameDataDidChangeOrder(gameData: GameData, order: string): void
    gameDataDidChangeName(gameData: GameData, name: string): void
    gameDataDidChangeBalance(gameData: GameData, balance: int): void
}