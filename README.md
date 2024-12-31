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
    *   Manages the order book .
    *   Implements the order matching algorithm .
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


Steps:

Navigate to the project directory:

Open a terminal and navigate to the root directory of your project.

Start Docker Compose (winding up):

Bash

cd /docker  # Change this path if your docker-compose.yml file is located elsewhere
docker-compose up -d
This command starts all services defined in your docker-compose.yml file in detached mode (-d).

Install Dependencies and Start Services (Serial Execution):

Important: We need to install dependencies and start services individually for a specific order:

a) API:

Bash

cd api
npm install
npm run dev
cd ..  # Move back to project root
This installs dependencies and starts the API service in development mode.

b) Engine:

Bash

cd engine
npm install
npm run dev
cd ..  # Move back to project root
Similar to the API, this installs dependencies and starts the engine service.

c) WS:

Bash

cd ws
npm install
npm run dev
cd ..  # Move back to project root
This installs dependencies and starts the websocket service.

d) Frontend:

Bash

cd frontend
npm install
npm run dev
cd ..  # Move back to project root
This installs dependencies and starts the frontend service.

e) Marketmaker:

Bash

cd marketmaker
npm install
npm run dev
cd ..  # Move back to project root
This installs dependencies and starts the marketmaker service.

Note: After following these steps, your entire application stack should be running in separate Docker containers. You can access the application based on the ports exposed in your docker-compose.yml file.

Additional Information:

To stop all running containers, use:

Bash

cd /docker  # Change this path if your docker-compose.yml file is located elsewhere
docker-compose down
To restart all services:

Bash

cd /docker  # Change this path if your docker-compose.yml file is located elsewhere
docker-compose up -d
Remember to update the paths in the commands if your project structure or docker-compose.yml location differs.