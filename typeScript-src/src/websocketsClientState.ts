export enum WebsocketsClientState {
    Idle = 'Idle',
    Connecting = 'Connecting',
    ReconnectingTimer = 'ReconnectingTimer',
    Error = 'Error',
    Connected = 'Connected',
    SocketClosed = 'SocketClosed'
  };