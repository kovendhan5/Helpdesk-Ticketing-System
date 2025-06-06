/**
 * WebSocket Real-time Feature Test Script
 * 
 * This script tests the real-time functionality of the helpdesk system
 * by simulating user interactions and WebSocket events.
 */

import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE_URL = 'http://localhost:3001/api';
const WEBSOCKET_URL = 'http://localhost:3001';

// Test credentials
const TEST_ADMIN = {
  email: 'admin@test.com',
  password: 'SecureAdminPass123!'
};

const TEST_USER = {
  email: 'user@test.com', 
  password: 'SecureUserPass123!'
};

let adminToken = null;
let userToken = null;
let adminSocket = null;
let userSocket = null;

// Configure axios
axios.defaults.baseURL = API_BASE_URL;

/**
 * Authenticate and get tokens
 */
async function authenticate() {
  console.log('🔐 Authenticating users...');
  
  try {
    // Login as admin
    const adminResponse = await axios.post('/auth/login', TEST_ADMIN);
    adminToken = adminResponse.data.token;
    console.log('✅ Admin authenticated');
    
    // Login as regular user
    const userResponse = await axios.post('/auth/login', TEST_USER);
    userToken = userResponse.data.token;
    console.log('✅ User authenticated');
    
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Setup WebSocket connections
 */
async function setupWebSockets() {
  return new Promise((resolve, reject) => {
    console.log('🔌 Setting up WebSocket connections...');
    
    let connectionsReady = 0;
    const targetConnections = 2;
    
    // Admin WebSocket connection
    adminSocket = io(WEBSOCKET_URL, {
      auth: { token: adminToken },
      transports: ['websocket', 'polling']
    });
    
    adminSocket.on('connect', () => {
      console.log('✅ Admin WebSocket connected');
      connectionsReady++;
      if (connectionsReady === targetConnections) resolve();
    });
    
    adminSocket.on('connect_error', (error) => {
      console.error('❌ Admin WebSocket connection error:', error);
      reject(error);
    });
    
    // User WebSocket connection
    userSocket = io(WEBSOCKET_URL, {
      auth: { token: userToken },
      transports: ['websocket', 'polling']
    });
    
    userSocket.on('connect', () => {
      console.log('✅ User WebSocket connected');
      connectionsReady++;
      if (connectionsReady === targetConnections) resolve();
    });
    
    userSocket.on('connect_error', (error) => {
      console.error('❌ User WebSocket connection error:', error);
      reject(error);
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (connectionsReady < targetConnections) {
        reject(new Error('WebSocket connection timeout'));
      }
    }, 10000);
  });
}

/**
 * Test real-time ticket creation
 */
async function testTicketCreation() {
  console.log('\n📝 Testing real-time ticket creation...');
  
  return new Promise((resolve, reject) => {
    // Listen for ticket creation on admin socket
    adminSocket.on('ticket:created', (data) => {
      console.log('✅ Admin received ticket:created event:', data.ticket.title);
      resolve();
    });
    
    // Create a ticket using the user account
    setTimeout(async () => {
      try {
        const ticketData = {
          title: 'Test WebSocket Ticket',
          description: 'This ticket tests real-time WebSocket functionality',
          priority: 'medium',
          category: 'technical_issue'
        };
        
        const response = await axios.post('/tickets', ticketData, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        
        console.log('📝 Ticket created:', response.data.title);
      } catch (error) {
        console.error('❌ Failed to create ticket:', error.response?.data || error.message);
        reject(error);
      }
    }, 1000);
    
    // Timeout after 5 seconds
    setTimeout(() => {
      reject(new Error('Ticket creation test timeout'));
    }, 5000);
  });
}

/**
 * Test real-time ticket updates
 */
async function testTicketUpdate() {
  console.log('\n✏️ Testing real-time ticket updates...');
  
  return new Promise(async (resolve, reject) => {
    try {
      // First, get a ticket to update
      const ticketsResponse = await axios.get('/tickets?limit=1', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (ticketsResponse.data.length === 0) {
        reject(new Error('No tickets available for update test'));
        return;
      }
      
      const ticket = ticketsResponse.data[0];
      console.log('🎫 Updating ticket:', ticket.title);
      
      // Listen for ticket updates on user socket
      userSocket.on('ticket:updated', (data) => {
        if (data.ticket.id === ticket.id) {
          console.log('✅ User received ticket:updated event:', data.ticket.status);
          resolve();
        }
      });
      
      // Update the ticket status
      setTimeout(async () => {
        try {
          await axios.patch(`/tickets/${ticket.id}`, 
            { status: 'in_progress' },
            { headers: { Authorization: `Bearer ${adminToken}` } }
          );
          console.log('✏️ Ticket status updated to in_progress');
        } catch (error) {
          console.error('❌ Failed to update ticket:', error.response?.data || error.message);
          reject(error);
        }
      }, 1000);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Ticket update test timeout'));
      }, 5000);
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Test real-time comments
 */
async function testTicketComments() {
  console.log('\n💬 Testing real-time comments...');
  
  return new Promise(async (resolve, reject) => {
    try {
      // Get a ticket to comment on
      const ticketsResponse = await axios.get('/tickets?limit=1', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (ticketsResponse.data.length === 0) {
        reject(new Error('No tickets available for comment test'));
        return;
      }
      
      const ticket = ticketsResponse.data[0];
      console.log('💬 Adding comment to ticket:', ticket.title);
      
      // Listen for comments on user socket
      userSocket.on('ticket:commented', (data) => {
        if (data.ticket.id === ticket.id) {
          console.log('✅ User received ticket:commented event');
          resolve();
        }
      });
      
      // Add a comment
      setTimeout(async () => {
        try {
          await axios.post(`/tickets/${ticket.id}/comments`, 
            { 
              comment: 'This is a WebSocket test comment',
              is_internal: false 
            },
            { headers: { Authorization: `Bearer ${adminToken}` } }
          );
          console.log('💬 Comment added successfully');
        } catch (error) {
          console.error('❌ Failed to add comment:', error.response?.data || error.message);
          reject(error);
        }
      }, 1000);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Comment test timeout'));
      }, 5000);
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Cleanup connections
 */
function cleanup() {
  console.log('\n🧹 Cleaning up connections...');
  
  if (adminSocket) {
    adminSocket.disconnect();
    console.log('✅ Admin WebSocket disconnected');
  }
  
  if (userSocket) {
    userSocket.disconnect();
    console.log('✅ User WebSocket disconnected');
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting WebSocket Real-time Feature Tests\n');
  
  try {
    await authenticate();
    await setupWebSockets();
    
    // Run tests sequentially
    await testTicketCreation();
    await testTicketUpdate();
    await testTicketComments();
    
    console.log('\n🎉 All WebSocket tests passed successfully!');
    console.log('✅ Real-time ticket creation works');
    console.log('✅ Real-time ticket updates work');
    console.log('✅ Real-time comments work');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    cleanup();
  }
}

// Run the tests
runTests().catch(console.error);
