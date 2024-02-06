import { SceneObjectCommandsFactory } from "./commandsFactory.js";
import { debugPrint } from "./runtime.js";
import { SceneObjectCommand } from "./sceneObjectCommand.js";
import { SceneObjectCommandPerformer } from "./sceneObjectCommandPerformer.js";
import { Utils } from "./utils.js";

export class EnemyControls extends SceneObjectCommandPerformer {
    private moveCommand: SceneObjectCommand = SceneObjectCommandsFactory.idle("Idle", 0);
    private secondaryMoveCommand: SceneObjectCommand = SceneObjectCommandsFactory.idle("Idle", 0);    
    private extraMoveCommand: SceneObjectCommand = SceneObjectCommandsFactory.idle("Idle", 0);   
    private rotationCommand: SceneObjectCommand = SceneObjectCommandsFactory.idle("Idle", 0); 
    private actionCommand: SceneObjectCommand = SceneObjectCommandsFactory.idle("Idle", 0);

    public step(delta: any): void {
        super.step(delta)

        if (this.objectName == "NONE") {
            return;
        }

        if (!this.moveCommand.isExpired()) {
            super.handleCommand(this.moveCommand);
        }
        else {
            this.moveCommand = this.comeUpWithIdeaForMoveCommand();
        }

        if (!this.secondaryMoveCommand.isExpired()) {
            super.handleCommand(this.secondaryMoveCommand);
        }
        else {
            this.secondaryMoveCommand = this.comeUpWithIdeaForSecondaryMoveCommand();
        }

        if (!this.rotationCommand.isExpired()) {
            super.handleCommand(this.rotationCommand);
        }
        else {
            this.rotationCommand = this.comeUpWithIdeaForRotationCommand();
        }

        if (!this.extraMoveCommand.isExpired()) {
            super.handleCommand(this.extraMoveCommand);
        }
        else {
            this.extraMoveCommand = this.comeUpWithIdeaForExtraMoveCommand();
        }
    }

    private comeUpWithIdeaForRotationCommand() {
        const idea = Utils.randomInt(30);
        if (idea == 9) {
            return SceneObjectCommandsFactory.rotateLeft("GoLeft", Utils.randomInt(1000));
        }
        else if (idea == 14) {
            return SceneObjectCommandsFactory.rotateRight("GoRight", Utils.randomInt(1000));
        }
        return SceneObjectCommandsFactory.idle("Idle", Utils.randomInt(10));
    }

    private comeUpWithIdeaForMoveCommand() {
        const idea = Utils.randomInt(30);
        if (idea > 6  && idea < 20) {
            return SceneObjectCommandsFactory.moveForward("GoForward", 100 + Utils.randomInt(1000));
        }
        else if (idea == 4) {
            return SceneObjectCommandsFactory.moveBackward("GoBackward", 100 + Utils.randomInt(1000));
        }        
        return SceneObjectCommandsFactory.idle("Idle", Utils.randomInt(10));
    }

    private comeUpWithIdeaForSecondaryMoveCommand() {
        const idea = Utils.randomInt(30);
        if (idea == 3) {
            return SceneObjectCommandsFactory.jump("Jump", 10);
        }
        return SceneObjectCommandsFactory.idle("Idle", Utils.randomInt(10));
    }

    private comeUpWithIdeaForExtraMoveCommand() {
        const idea = Utils.randomInt(30);
        if (idea == 4) {
            return SceneObjectCommandsFactory.moveLeft("GoLeft", 100 + Utils.randomInt(500));
        }
        else if (idea == 6) {
            return SceneObjectCommandsFactory.moveRight("GoRight", 100 + Utils.randomInt(500));
        }
        return SceneObjectCommandsFactory.idle("Idle", Utils.randomInt(10));
    }
}