# API-Engine Architecture for Simulated Exchange

This project simulates a cryptocurrency exchange with a modular design for scalability and real-time updates. It focuses on the backend architecture and core exchange logic.

## Components

1.  **Frontend (Client):**
    *   Web interface for users to place orders and view market data.
    *   Communicates with the API Server using HTTP for order placement and WebSockets (or polling) for real-time updates.

2.  **API Server (Node.js with Express.js):**
    *   Handles incoming HTTP requests from the frontend for order placement.
    *   Performs request validation and authorization.
    *   Routes order placement requests to the Engine via a Redis queue.

3.  **Engine (Node.js):**
    *   Core logic of the exchange.
    *   Manages the order book (using efficient data structures like trees or ordered maps).
    *   Implements the order matching algorithm (e.g., price-time priority).
    *   Executes the pseudo market maker logic (placing buy and sell orders).
    *   Publishes trade confirmations and order book updates to Redis pub/sub channels.
    *   Sends trade data to the TimescaleDB via a Redis queue and a Database Processor

4.  **WebSocket Server (Socket.io or ws - Optional):**
    *   Handles real-time communication with connected clients.
    *   Subscribes to relevant Redis pub/sub channels.
    *   Forwards messages to connected clients, providing real-time market data updates.

5.  **Redis:**
    *   In-memory data store used for asynchronous communication and message queuing.
    *   Used for:
        *   API Server to Engine communication (using Redis queues).
        *   Engine to WebSocket Server communication (using Redis pub/sub).
        * Engine to TimescaleDB communication (using Redis queues).

6. **TimescaleDB:**
   * Time series database used to store trade data.

7. **Database Processor:**
    * Takes data from redis queue and sends it to timescaleDB.

## Architecture Diagram

```mermaid
graph LR
    subgraph Browser
        A[Frontend]
    end
    A -- POST /api/order --> B{API}
    B -- Redis Queue --> C{Engine}
    C -- Redis PubSub --> D{Websocket}
    C -- Redis Queue --> E{Database Processor}
    E --> F[Timescale DB]
    D --> A
