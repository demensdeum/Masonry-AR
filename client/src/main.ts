import { Context } from "./context.js";
import { InGameState } from "./inGameState.js"

function main(options: {[key: string]: string} = {}) {
  const debugEnabled = options["debugEnabled"] === "true";

  const context = new Context(
      debugEnabled
  );
  
  const initialState = new InGameState();

  context.start(initialState)

  function step() {
      if (!context.isRunning) {
          return
      }
      context.step()
      requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}

main()