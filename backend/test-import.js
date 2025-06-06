import websocketService from './src/services/websocketService.js';

console.log('WebSocket service imported:', !!websocketService);
console.log('WebSocket service type:', typeof websocketService);
console.log('Initialize method exists:', typeof websocketService.initialize);
console.log('WebSocket service object keys:', Object.getOwnPropertyNames(websocketService));
