import { WebSocket, WebSocketServer } from "ws";
import { UserManager } from "./UserManager";

const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", (ws) => {
    UserManager.getInstance().addUser(ws);
});



//for sclaeable chat application

// type Subscription = {
//   ws: WebSocket;
//   rooms: string[];
// };

// const wss = new WebSocketServer({ port: 3001 });
// const subscriptions: Record<string, Subscription> = {};

// wss.on("connection", (userSocket) => {
//   const id = generateUniqueId();

//   subscriptions[id] = {
//     ws: userSocket,
//     rooms: [],
//   };

//   console.log(`User connected with ID: ${id}`);

//   userSocket.on("message", (data) => {
//     try {
//       const parsedMessage = JSON.parse(data.toString());
//       console.log(`Received message from user ${id}:`, parsedMessage);

//       if (parsedMessage.type === "SUBSCRIBE") {
//         const room = parsedMessage.room;

//         if (!subscriptions[id].rooms.includes(room)) {
//           subscriptions[id].rooms.push(room);
//           console.log(`User ${id} subscribed to room ${room}`);
//         }
//       } else if (parsedMessage.type === "sendMessage") {
//         const { message, roomId } = parsedMessage;

//         console.log(`Broadcasting message to room ${roomId}:`, message);

//         // Broadcast message to all users subscribed to the room
//         Object.keys(subscriptions).forEach((userId) => {
//           const { ws, rooms } = subscriptions[userId];
//           if (rooms.includes(roomId)) {
//             console.log(`Sending message to user ${userId} in room ${roomId}`);
//             try {
//               ws.send(JSON.stringify({ message, roomId }));
//             } catch (error) {
//               console.error(`Error sending message to user ${userId}:`, error);
//             }
//           }
//         });
//       }
//     } catch (error) {
//       console.error("Error processing message:", error);
//     }
//   });

//   userSocket.on("close", () => {
//     console.log(`User ${id} disconnected`);
//     delete subscriptions[id];
//   });
// });

// // Generate unique ID
// function generateUniqueId(): string {
//   return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
// }


