export class WebsocketsHandler {
  // @ts-ignore
  websocketsClientDidConnect(websocketsClient) {
    // @ts-ignore
    this.application.ports.websocketsConnected.send("websocketsConnected");          
  }

  // @ts-ignore
  websocketsClientDidReceiveMessage(websocketsClient, message) {
    // @ts-ignore
    this.application.ports.serverCanvasReceiver.send(message);
  }
  // @ts-ignore
  websocketsClientDidReceiveError(websocketsClient, message) {

  }
}

const websocketsHandler = new WebsocketsHandler();
// @ts-ignore
document.websocketsHandlerLoaded(websocketsHandler);