import { WebsocketsClientState } from "./websocketsClientState.js";
import { WebsocketsClientDelegate } from "./websocketsClientDelegate";
import { int, float } from "./types.js";
import { debugPrint } from "./runtime.js";

export class WebsocketsClient {

    private state: WebsocketsClientState;
    private url: string;
    private reconnectingTimerSeconds: int;
    private socket?: WebSocket;
    private delegate?: WebsocketsClientDelegate;
    private receivedVerboseEnabled: boolean = false;
    private sendingVersboseEnabled: boolean = false;
    private debugEnabled: boolean = false;

    constructor(url: string) {
        console.log("WebsocketsClient constructor!");
        this.state = WebsocketsClientState.Idle;
        this.url = url;
        this.reconnectingTimerSeconds = 5;
    }

    connect() {
        console.log("connect");
        this.state = WebsocketsClientState.Connecting;
        try {
            this.socket = new WebSocket(this.url);
            this.socket.addEventListener('open', this.handleOpen.bind(this));
            this.socket.addEventListener('message', this.handleMessage.bind(this));
            this.socket.addEventListener('close', this.handleClose.bind(this));
            this.socket.addEventListener('error', this.handleWebsocketErrorEvent.bind(this));
        }
        catch (error) {
            if (error instanceof Error) {
                this.handleError(error);
            }
            else {
                console.log("Unknown websocket error: " + error);
            }
        }
    }

    handleOpen(event: Event) {
        this.state = WebsocketsClientState.Connected;
        console.log("Websockets connected");
        this.delegate?.websocketsClientDidConnect(this);
    }

    handleMessage(event: MessageEvent) {
        const message = event.data;
        if (this.receivedVerboseEnabled) {
            console.log("Received: " + message);
        }
        this.delegate?.websocketsClientDidReceiveMessage(this, message);
    }

    handleClose(event: CloseEvent) {
        this.state = WebsocketsClientState.SocketClosed;
        console.log("Socket closed!");
        this.reconnect("handleClose");
    }
    
    handleWebsocketErrorEvent(event: Event) {
        if (event instanceof Error) {
            this.handleError(
                Error(
                    event.message
                )
            );
        }
        else {
            console.log("Unknown websocket error event: " + event);
        }
    }

    handleError(error: Error) {
        this.state = WebsocketsClientState.Error;
        console.log("Socket error!");
        this.delegate?.websocketsClientDidReceiveError(this, error);
    }

    reconnect(parent: String) {
        if (this.state != WebsocketsClientState.SocketClosed) {
            console.log("No reconnecting for state: " + this.state);
            return;
        }
        this.state = WebsocketsClientState.ReconnectingTimer;
        console.log("Reconnect called parent: " + parent);
        setTimeout(() => {
            console.log("Delayed for "+ this.reconnectingTimerSeconds +" second.");
            this.connect();
        }, this.reconnectingTimerSeconds * 1000);
    }

    send(data: string) {
        if (this.sendingVersboseEnabled) {
            debugPrint("Sending data from client: " + data);
        }        
        if (this.state != WebsocketsClientState.Connected) {
            if (this.debugEnabled) {
                console.log("Trying to send data while is not connected!111");
            }
            return;
        }
        this.socket?.send(data);
    }

    close() {
        this.socket?.close();
    }
}

const websocketsClient = new WebsocketsClient("ws://127.0.0.1:2938");
// @ts-ignore
document.websocketsClientLoaded(websocketsClient);