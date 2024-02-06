import { SceneObjectCommand } from "./sceneObjectCommand.js"
import { DecorControls } from "./decorControls.js"

export interface DecorControlsDataSource {
    decorControlsDidRequestCommandWithName(
        decorControls: DecorControls,
        commandName: String
    ): SceneObjectCommand
}