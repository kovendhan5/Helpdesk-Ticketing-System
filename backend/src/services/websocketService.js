import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import authMiddleware from '../middleware/auth.js';

const { JWT_CONFIG } = authMiddleware;

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // Map of userId -> socketId
    this.adminUsers = new Set(); // Set of admin user IDs
  }

  initialize(server) {
    try {
      console.log('🔌 Initializing WebSocket service...');
      this.io = new Server(server, {
        cors: {
          origin: [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000'
          ],
          methods: ['GET', 'POST'],
          credentials: true
        },
        transports: ['websocket', 'polling']
      });

      console.log('✅ WebSocket server created with CORS configuration');

      // Authentication middleware for Socket.IO
      this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, JWT_CONFIG.secret);
        socket.userId = decoded.id;
        socket.userEmail = decoded.email;
        socket.userRole = decoded.role;
        
        console.log(`🔌 WebSocket authenticated: ${decoded.email} (${decoded.role})`);
        next();
      } catch (error) {
        console.error('❌ WebSocket authentication failed:', error.message);
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    console.log('🔌 WebSocket service initialized');
    } catch (error) {
      console.error('❌ WebSocket service initialization failed:', error);
      throw error;
    }
  }

  handleConnection(socket) {
    const { userId, userEmail, userRole } = socket;
    
    // Store user connection
    this.connectedUsers.set(userId, socket.id);
    
    // Track admin users
    if (userRole === 'admin') {
      this.adminUsers.add(userId);
    }

    console.log(`✅ User connected: ${userEmail} (${userRole}) - Socket: ${socket.id}`);

    // Join user to their own room for private notifications
    socket.join(`user:${userId}`);
    
    // Join admins to admin room for admin-specific notifications
    if (userRole === 'admin') {
      socket.join('admins');
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${userEmail} - Socket: ${socket.id}`);
      this.connectedUsers.delete(userId);
      this.adminUsers.delete(userId);
    });

    // Handle real-time ticket updates (for admin dashboard)
    socket.on('join:dashboard', () => {
      if (userRole === 'admin') {
        socket.join('dashboard');
        console.log(`📊 Admin joined dashboard updates: ${userEmail}`);
      }
    });

    // Handle joining specific ticket room for real-time comments
    socket.on('join:ticket', (ticketId) => {
      socket.join(`ticket:${ticketId}`);
      console.log(`🎫 User joined ticket room: ${userEmail} -> ticket:${ticketId}`);
    });

    // Handle leaving ticket room
    socket.on('leave:ticket', (ticketId) => {
      socket.leave(`ticket:${ticketId}`);
      console.log(`🚪 User left ticket room: ${userEmail} -> ticket:${ticketId}`);
    });

    // Send connection success message
    socket.emit('connection:success', {
      message: 'Connected to real-time updates',
      userId,
      userRole
    });
  }

  // Emit ticket created event
  emitTicketCreated(ticket) {
    if (!this.io) return;

    console.log(`📢 Broadcasting ticket created: #${ticket.id}`);
    
    // Notify all admins
    this.io.to('admins').emit('ticket:created', {
      ticket,
      message: `New ticket created: #${ticket.id} - ${ticket.subject}`,
      timestamp: new Date().toISOString()
    });

    // Notify dashboard
    this.io.to('dashboard').emit('dashboard:update', {
      type: 'ticket_created',
      ticket,
      timestamp: new Date().toISOString()
    });
  }

  // Emit ticket updated event
  emitTicketUpdated(ticket, updatedFields, updatedBy) {
    if (!this.io) return;

    console.log(`📢 Broadcasting ticket updated: #${ticket.id}`);
    
    const updateData = {
      ticket,
      updatedFields,
      updatedBy,
      message: `Ticket #${ticket.id} updated by ${updatedBy}`,
      timestamp: new Date().toISOString()
    };

    // Notify the ticket owner
    this.io.to(`user:${ticket.user_id || ticket.user_email}`).emit('ticket:updated', updateData);
    
    // Notify all admins
    this.io.to('admins').emit('ticket:updated', updateData);
    
    // Notify anyone viewing this specific ticket
    this.io.to(`ticket:${ticket.id}`).emit('ticket:updated', updateData);

    // Notify dashboard
    this.io.to('dashboard').emit('dashboard:update', {
      type: 'ticket_updated',
      ticket,
      updatedFields,
      timestamp: new Date().toISOString()
    });
  }

  // Emit new comment event
  emitNewComment(ticket, comment, commentBy) {
    if (!this.io) return;

    console.log(`📢 Broadcasting new comment on ticket #${ticket.id}`);
    
    const commentData = {
      ticket,
      comment,
      commentBy,
      message: `New comment on ticket #${ticket.id} by ${commentBy}`,
      timestamp: new Date().toISOString()
    };

    // Notify the ticket owner (if not the commenter)
    if (ticket.user_email !== commentBy) {
      this.io.to(`user:${ticket.user_id || ticket.user_email}`).emit('ticket:commented', commentData);
    }
    
    // Notify all admins (if comment is not internal or commenter is not admin)
    if (!comment.is_internal) {
      this.io.to('admins').emit('ticket:commented', commentData);
    }
    
    // Notify anyone viewing this specific ticket
    this.io.to(`ticket:${ticket.id}`).emit('ticket:commented', commentData);
  }

  // Emit ticket assigned event
  emitTicketAssigned(ticket, assignedTo, assignedBy) {
    if (!this.io) return;

    console.log(`📢 Broadcasting ticket assigned: #${ticket.id} -> ${assignedTo}`);
    
    const assignmentData = {
      ticket,
      assignedTo,
      assignedBy,
      message: `Ticket #${ticket.id} assigned to ${assignedTo} by ${assignedBy}`,
      timestamp: new Date().toISOString()
    };

    // Notify the assigned user
    this.io.to(`user:${assignedTo}`).emit('ticket:assigned', assignmentData);
    
    // Notify the ticket owner
    this.io.to(`user:${ticket.user_id || ticket.user_email}`).emit('ticket:assigned', assignmentData);
    
    // Notify all admins
    this.io.to('admins').emit('ticket:assigned', assignmentData);

    // Notify dashboard
    this.io.to('dashboard').emit('dashboard:update', {
      type: 'ticket_assigned',
      ticket,
      assignedTo,
      timestamp: new Date().toISOString()
    });
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get connected admin count
  getConnectedAdminCount() {
    return this.adminUsers.size;
  }

  // Broadcast system message to all connected users
  broadcastSystemMessage(message, type = 'info') {
    if (!this.io) return;
    
    this.io.emit('system:message', {
      message,
      type,
      timestamp: new Date().toISOString()
    });
  }
}

// Export a singleton instance
const websocketService = new WebSocketService();
export default websocketService;
