// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

const application = Elm.Main.init({
  node: document.getElementById("application")
});

document.websocketsHandlerLoaded = (websocketsHandler) => {
  document.websocketsHandler = websocketsHandler;         
  websocketsHandler.application = application;
  tryConnectWebsockets()
};

document.websocketsClientLoaded = (websocketsClient) => {
  document.websocketsClient = websocketsClient
  application.ports.sendCanvas.subscribe((message) => {
    websocketsClient.send(message);
  });
  tryConnectWebsockets()
};

function tryConnectWebsockets() {
  if (document.websocketsClient == null) {
    return;
  }
  if (document.websocketsHandler == null) {
    return;
  }
  document.websocketsClient.delegate = document.websocketsHandler;
  document.websocketsClient.connect();
};

document.threeCanvasHandlerLoaded = (threeCanvasHandler) => {
  threeCanvasHandler.application = application;
  document.threeCanvasHandler = threeCanvasHandler;
  tryWireThreeCanvasWithHandler();
};

document.threeCanvasDidLoad = (threeCanvas) => {
  document.threeCanvas = threeCanvas;
  tryWireThreeCanvasWithHandler();
};

function tryWireThreeCanvasWithHandler() {
  if (document.threeCanvas == null) {
    return;
  }
  if (document.threeCanvasHandler == null) {
    return;
  }

  document.threeCanvas.delegate = document.threeCanvasHandler;
};