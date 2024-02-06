import { State } from './state.js';
import { SceneController } from './sceneController.js';
import { IdleState } from './idleState.js';
import { GameData } from './gameData.js';
import { Translator } from './translator.js';
import { SoundPlayer } from './soundPlayer.js';
import { SimplePhysicsController } from './simplePhysicsController.js';
import { GameSettings } from './gameSettings.js';
import { debugPrint } from './runtime.js';

export class Context {
  public isRunning: boolean = false;
  public sceneController: SceneController;
  public translator: Translator;
  public gameData: GameData;

  private readonly canvas?: HTMLCanvasElement | null = document.querySelector("canvas");
  private state: State;
  private debugEnabled: boolean;
  public soundPlayer: SoundPlayer = new SoundPlayer(0.7);

  constructor(
    debugEnabled: boolean
  ) {
      this.debugEnabled = debugEnabled; 
      this.gameData = new GameData();
      this.translator = new Translator("ru");
      this.state = new IdleState(this);

      if (!this.canvas || this.canvas == undefined) {
        this.raiseCriticalError("1Canvas in NULL!!!!");
      }
      const canvas = this.canvas!;

      const physicsController = new SimplePhysicsController()
      const gameSettings = GameSettings.default()

      this.sceneController = new SceneController(
        canvas,
        physicsController,
        false,
        gameSettings,
        false
      );
      debugPrint("Game Context Initialized...");
  }

  public start(
    state: State
  )
  {   
    this.state = state;
    this.isRunning = true;     
    this.transitionTo(this.state);    
  }

  public raiseCriticalError(error: string) {
    if (this.debugEnabled) {
      console.error(error);
    }
    else {
      alert(error);
    }
    this.isRunning = false;
  }

  public transitionTo(state: State): void {
    debugPrint(`Transitioning to ${state.name}`);
    this.state = state;
    this.state.initialize(this);
  }

  public step() {
    this.state.step();    
    this.sceneController.step();
  }
}
