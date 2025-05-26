import WebSocket from 'isomorphic-ws';
import { GenericObject } from '../types';
import { pause } from '../ws-utils';

export abstract class BaseWsClient<
   ChannelType extends string,
   RequestType,
   ResponseType,
   HandlerCallbackType extends (data: any) => void,
> {
   protected _connection: WebSocket | null = null;
   protected _isConnected: boolean = false;
   protected _requestBuffer: GenericObject<string> = {};
   protected _wsUrl: string = '';
   protected _onConnect?: () => void;
   protected _onDisconnect?: () => void;

   protected _handlers: Record<ChannelType | string, HandlerCallbackType[]> = {} as Record<
      ChannelType | string,
      HandlerCallbackType[]
   >;

   constructor(wsUrl: string) {
      this._wsUrl = wsUrl;
   }

   get connection(): WebSocket | null {
      return this._connection;
   }

   get isConnected(): boolean {
      return this._isConnected;
   }

   set onConnect(callback: () => void) {
      this._onConnect = callback;
   }

   set onDisconnect(callback: () => void) {
      this._onDisconnect = callback;
   }

   connect(): void {
      if (!this._wsUrl) throw new Error('WebSocket URL is not set.');
      this._isConnected = false;
      this._connection = new WebSocket(this._wsUrl);

      this._connection.onopen = () => {
         this._isConnected = true;
         this.onOpen();
         this.sendBufferedRequests();
         if (this._onConnect) {
            this._onConnect();
         }
      };

      this._connection.onclose = () => {
         this._isConnected = false;
         this.onClose();
         if (this._onDisconnect) {
            this._onDisconnect();
         }
         // Simple reconnect logic, can be made more sophisticated
         pause(2 * 1000).then(() => {
            if (this._wsUrl) {
               this.connect();
            }
         });
      };

      this._connection.onmessage = (event) => {
         try {
            const message = JSON.parse(event.data as string) as ResponseType;
            this.handleMessage(message);
         } catch (error) {
            this.onError(error);
         }
      };

      this._connection.onerror = (event) => {
         this.onError(event.error || new Error('WebSocket error'));
      };
   }

   protected sendBufferedRequests(): void {
      if (Object.keys(this._requestBuffer).length > 0) {
         for (const requestKey in this._requestBuffer) {
            if (this._connection && this._isConnected) {
               this._connection.send(this._requestBuffer[requestKey]);
               delete this._requestBuffer[requestKey];
            } else {
               // Stop if connection lost while sending buffered requests
               break;
            }
         }
      }
   }

   protected send(message: RequestType): void {
      const messageStr = JSON.stringify(message);
      if (this._isConnected && this._connection) {
         this._connection.send(messageStr);
      } else {
         this._requestBuffer[messageStr] = messageStr; // Using messageStr as key, assuming it's unique enough for buffering
      }
   }

   addHandler(channel: ChannelType | string, callback: HandlerCallbackType): this {
      if (!this._handlers[channel]) {
         this._handlers[channel] = [];
      }
      this._handlers[channel].push(callback);
      return this;
   }

   removeHandler(channel: ChannelType | string, callbackToRemove: HandlerCallbackType): void {
      const callbacks = this._handlers[channel];
      if (callbacks) {
         this._handlers[channel] = callbacks.filter((cb) => cb !== callbackToRemove);
      }
   }

   protected abstract handleMessage(message: ResponseType): void;

   // Lifecycle hooks for subclasses to override
   protected onOpen(): void {
      // console.log("WebSocket connection opened.");
   }

   protected onClose(): void {
      // console.log("WebSocket connection closed.");
   }

   protected onError(error: any): void {
      console.error('WebSocket error:', error);
   }

   disconnect(): void {
      if (this._connection) {
         this._connection.onclose = null; // Prevent reconnect logic on explicit disconnect
         this._connection.close();
         this._connection = null;
         this._isConnected = false;
         this._wsUrl = ''; // Clear wsUrl to prevent auto-reconnect after explicit disconnect
         // console.log("WebSocket disconnected.");
      }
   }

   /**
    * Adds a handler for a specific channel. This is an alias for addHandler.
    * @param channel The channel to subscribe to.
    * @param callback The callback function to execute when a message is received on the channel.
    * @returns The instance of the client for chaining.
    */
   on(channel: ChannelType | string, callback: HandlerCallbackType): this {
      return this.addHandler(channel, callback);
   }
}
