import { SceneObjectCommand } from "./sceneObjectCommand.js";
import { SceneObjectCommandPerformer } from "./sceneObjectCommandPerformer.js";
import { float } from "./types.js";
import { ControlsDelegate } from "./controlsDelegate.js";
import { ControlsDataSource } from "./playerControlsDataSource.js";
import { DecorControlsDataSource } from "./decorControlsDataSource.js"

export class DecorControls extends SceneObjectCommandPerformer {

    private command?: SceneObjectCommand
    private decorControlsDataSource: DecorControlsDataSource
    
    constructor(
        objectName: string,
        startCommand: SceneObjectCommand,
        delegate: ControlsDelegate,
        dataSource: ControlsDataSource,
        decorControlsDataSource: DecorControlsDataSource
    ) {
        super(
            objectName,
            delegate,
            dataSource
        )

        this.setCommand(startCommand)
        this.decorControlsDataSource = decorControlsDataSource
    }

    setCommand(command: SceneObjectCommand) {
        command.reset()
        this.command = command
    }

    step(delta: float) {
        super.step(delta)

        if (this.command != null) {
            if (this.command.isExpired()) {
                const nextCommandName = this.command.nextCommandName
                if (nextCommandName != null && nextCommandName != "NONE") {
                    const command = this.decorControlsDataSource.decorControlsDidRequestCommandWithName(this, nextCommandName)
                    this.setCommand(command)
                }
            }
            else {
                this.handleCommand(this.command)
            }    
        }

    }

}