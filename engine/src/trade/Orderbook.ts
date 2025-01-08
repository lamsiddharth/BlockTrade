import { BASE_CURRENCY } from "./Engine";

export interface Order {
    price: number;
    quantity: number;
    orderId: string;
    filled: number;
    side: "buy" | "sell";
    userId: string;
}

export interface Fill {
    price: string;
    qty: number;
    tradeId: number;
    otherUserId: string;
    markerOrderId: string;
}

export class Orderbook {
    bids: Order[];
    asks: Order[];
    bidsDepth: { [key: string]: number };
    asksDepth: { [key: string]: number };
    baseAsset: string;
    quoteAsset: string = BASE_CURRENCY;
    lastTradeId: number;
    currentPrice: number;

    constructor(baseAsset: string, bids: Order[], asks: Order[], lastTradeId: number, currentPrice: number) {
        this.bids = bids;
        this.asks = asks;
        this.bidsDepth = {};
        this.asksDepth = {};
        this.baseAsset = baseAsset;
        this.lastTradeId = lastTradeId || 0;
        this.currentPrice = currentPrice || 0;

        // Initialize depth maps
        this.updateDepth();
    }

    updateDepth() {
        this.bidsDepth = {};
        this.asksDepth = {};

        this.bids.forEach(order => {
            if (!this.bidsDepth[order.price]) {
                this.bidsDepth[order.price] = 0;
            }
            this.bidsDepth[order.price] += order.quantity - order.filled;
        });

        this.asks.forEach(order => {
            if (!this.asksDepth[order.price]) {
                this.asksDepth[order.price] = 0;
            }
            this.asksDepth[order.price] += order.quantity - order.filled;
        });
    }

    ticker() {
        return `${this.baseAsset}_${this.quoteAsset}`;
    }

    getSnapshot() {
        return {
            baseAsset: this.baseAsset,
            bids: this.bids,
            asks: this.asks,
            lastTradeId: this.lastTradeId,
            currentPrice: this.currentPrice
        };
    }

    addOrder(order: Order): {
        executedQty: number,
        fills: Fill[]
    } {
        if (order.side === "buy") {
            const { executedQty, fills } = this.matchBid(order);
            order.filled = executedQty;
            if (executedQty < order.quantity) {
                this.bids.push(order);
                this.updateDepthForOrder(order);
            }
            return { executedQty, fills };
        } else {
            const { executedQty, fills } = this.matchAsk(order);
            order.filled = executedQty;
            if (executedQty < order.quantity) {
                this.asks.push(order);
                this.updateDepthForOrder(order);
            }
            return { executedQty, fills };
        }
    }

    updateDepthForOrder(order: Order) {
        const depth = order.side === "buy" ? this.bidsDepth : this.asksDepth;
        if (!depth[order.price]) {
            depth[order.price] = 0;
        }
        depth[order.price] += order.quantity - order.filled;
    }

    matchBid(order: Order): { fills: Fill[], executedQty: number } {
        const fills: Fill[] = [];
        let executedQty = 0;

        for (let i = 0; i < this.asks.length; i++) {
            if (this.asks[i].price <= order.price && executedQty < order.quantity) {
                const filledQty = Math.min(order.quantity - executedQty, this.asks[i].quantity - this.asks[i].filled);
                executedQty += filledQty;
                this.asks[i].filled += filledQty;
                this.asksDepth[this.asks[i].price] -= filledQty;
                if (this.asksDepth[this.asks[i].price] === 0) {
                    delete this.asksDepth[this.asks[i].price];
                }
                fills.push({
                    price: this.asks[i].price.toString(),
                    qty: filledQty,
                    tradeId: this.lastTradeId++,
                    otherUserId: this.asks[i].userId,
                    markerOrderId: this.asks[i].orderId
                });
            }
        }
        this.asks = this.asks.filter(order => order.filled < order.quantity);
        return { fills, executedQty };
    }

    matchAsk(order: Order): { fills: Fill[], executedQty: number } {
        const fills: Fill[] = [];
        let executedQty = 0;

        for (let i = 0; i < this.bids.length; i++) {
            if (this.bids[i].price >= order.price && executedQty < order.quantity) {
                const filledQty = Math.min(order.quantity - executedQty, this.bids[i].quantity - this.bids[i].filled);
                executedQty += filledQty;
                this.bids[i].filled += filledQty;
                this.bidsDepth[this.bids[i].price] -= filledQty;
                if (this.bidsDepth[this.bids[i].price] === 0) {
                    delete this.bidsDepth[this.bids[i].price];
                }
                fills.push({
                    price: this.bids[i].price.toString(),
                    qty: filledQty,
                    tradeId: this.lastTradeId++,
                    otherUserId: this.bids[i].userId,
                    markerOrderId: this.bids[i].orderId
                });
            }
        }
        this.bids = this.bids.filter(order => order.filled < order.quantity);
        return { fills, executedQty };
    }

    getDepth() {
        return {
            bids: Object.entries(this.bidsDepth).map(([price, qty]) => [price, qty.toString()]),
            asks: Object.entries(this.asksDepth).map(([price, qty]) => [price, qty.toString()])
        };
    }

    getOpenOrders(userId: string): Order[] {
        const asks = this.asks.filter(x => x.userId === userId);
        const bids = this.bids.filter(x => x.userId === userId);
        return [...asks, ...bids];
    }

    cancelBid(order: Order) {
        const index = this.bids.findIndex(x => x.orderId === order.orderId);
        if (index !== -1) {
            const price = this.bids[index].price;
            const remainingQty = this.bids[index].quantity - this.bids[index].filled;
            this.bids.splice(index, 1);
            this.bidsDepth[price] -= remainingQty;
            if (this.bidsDepth[price] === 0) {
                delete this.bidsDepth[price];
            }
            return price;
        }
    }

    cancelAsk(order: Order) {
        const index = this.asks.findIndex(x => x.orderId === order.orderId);
        if (index !== -1) {
            const price = this.asks[index].price;
            const remainingQty = this.asks[index].quantity - this.asks[index].filled;
            this.asks.splice(index, 1);
            this.asksDepth[price] -= remainingQty;
            if (this.asksDepth[price] === 0) {
                delete this.asksDepth[price];
            }
            return price;
        }
    }
}
