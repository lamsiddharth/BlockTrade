import { WebSocket } from "ws";
import { OutgoingMessage } from "./types/out";
import { SubscriptionManager } from "./SubscriptionManager";
import { IncomingMessage, SUBSCRIBE, UNSUBSCRIBE } from "./types/in";

export class User {
    private id: string;
    private ws: WebSocket;

    constructor(id: string, ws: WebSocket) {
        this.id = id;
        this.ws = ws;
        this.addListeners();
    }

    private subscriptions: string[] = [];

    public subscribe(subscription: string, ) {
        this.subscriptions.push(subscription);
    }

    public unsubscribe(subscription: string) {
        this.subscriptions = this.subscriptions.filter(s => s !== subscription);
    }

    emit(message: OutgoingMessage) {
        this.ws.send(JSON.stringify(message));
    }

    private addListeners() {
        this.ws.on("message", (message: string) => {
            try {
                const parsedMessage: IncomingMessage = JSON.parse(message);
                if (parsedMessage.method === SUBSCRIBE) {
                    parsedMessage.params.forEach((s) => {
                        if (!this.subscriptions.includes(s)) {
                            SubscriptionManager.getInstance().subscribe(this.id, s);
                            this.subscribe(s);
                        }
                    });
                }
        
                if (parsedMessage.method === UNSUBSCRIBE) {
                    parsedMessage.params.forEach((s) => {
                        if (this.subscriptions.includes(s)) {
                            SubscriptionManager.getInstance().unsubscribe(this.id, s);
                            this.unsubscribe(s);
                        }
                    });
                }
                this.ws.send(
                    JSON.stringify({
                        status: "success",
                        action: parsedMessage.method,
                        params: parsedMessage.params,
                    })
                ); 
            } catch (err) {
                console.error("Failed to process message:", err);
            }
        });
        
    }

}