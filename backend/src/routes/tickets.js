import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import pool from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import emailService from '../services/emailService.js';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, document, and archive files are allowed'));
    }
  }
});

// Create a new ticket (user only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { subject, message, priority, category } = req.body;
    const userEmail = req.user.email;

    // Validate input
    if (!subject || !message || !priority) {
      return res.status(400).json({ error: 'Subject, message, and priority are required' });
    }

    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ error: 'Priority must be low, medium, or high' });
    }

    const validCategories = ['general', 'technical', 'billing', 'account', 'feature_request', 'bug_report'];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }    // Insert ticket into database
    const result = await pool.query(
      'INSERT INTO tickets (user_email, subject, message, priority, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userEmail, subject, message, priority, category || 'general']
    );

    const ticket = result.rows[0];

    // Send email notification
    try {
      await emailService.sendTicketCreatedNotification(ticket, userEmail);
    } catch (emailError) {
      console.error('Failed to send ticket creation email:', emailError);
      // Continue with response even if email fails
    }

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tickets (admin: all tickets, user: own tickets)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { user_email, status, priority, category, assigned_to, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const userEmail = req.user.email;
    const isAdmin = req.user.role === 'admin';

    let query = `
      SELECT t.*, 
             (SELECT COUNT(*) FROM ticket_comments tc WHERE tc.ticket_id = t.id) as comment_count
      FROM tickets t
    `;
    let params = [];
    let whereConditions = [];

    // If not admin, only show user's own tickets
    if (!isAdmin) {
      whereConditions.push('t.user_email = $1');
      params.push(userEmail);
    } else {
      // Admin can filter by various criteria
      if (user_email) {
        whereConditions.push(`t.user_email = $${params.length + 1}`);
        params.push(user_email);
      }
      if (status) {
        whereConditions.push(`t.status = $${params.length + 1}`);
        params.push(status);
      }
      if (priority) {
        whereConditions.push(`t.priority = $${params.length + 1}`);
        params.push(priority);
      }
      if (category) {
        whereConditions.push(`t.category = $${params.length + 1}`);
        params.push(category);
      }
      if (assigned_to) {
        whereConditions.push(`t.assigned_to = $${params.length + 1}`);
        params.push(assigned_to);
      }
    }

    // Search functionality
    if (search) {
      whereConditions.push(`(t.subject ILIKE $${params.length + 1} OR t.message ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    query += ' ORDER BY t.created_at DESC';
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update ticket status (admin only)
router.patch('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_to, priority, category } = req.body;

    // Validate input
    if (!status && !assigned_to && !priority && !category) {
      return res.status(400).json({ error: 'At least one field to update is required' });
    }

    let updateFields = [];
    let params = [];
    let paramIndex = 1;

    if (status) {
      if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
        return res.status(400).json({ error: 'Status must be open, in_progress, resolved, or closed' });
      }
      updateFields.push(`status = $${paramIndex++}`);
      params.push(status);
      
      // Set resolved_at when ticket is resolved
      if (status === 'resolved') {
        updateFields.push(`resolved_at = CURRENT_TIMESTAMP`);
      }
    }

    if (assigned_to !== undefined) {
      if (assigned_to === null || assigned_to === '') {
        updateFields.push(`assigned_to = NULL`);
      } else {
        // Verify the assigned user exists and is admin
        const userCheck = await pool.query('SELECT role FROM users WHERE email = $1', [assigned_to]);
        if (userCheck.rows.length === 0) {
          return res.status(400).json({ error: 'Assigned user does not exist' });
        }
        if (userCheck.rows[0].role !== 'admin') {
          return res.status(400).json({ error: 'Can only assign tickets to admin users' });
        }
        updateFields.push(`assigned_to = $${paramIndex++}`);
        params.push(assigned_to);
      }
    }

    if (priority) {
      if (!['low', 'medium', 'high'].includes(priority)) {
        return res.status(400).json({ error: 'Priority must be low, medium, or high' });
      }
      updateFields.push(`priority = $${paramIndex++}`);
      params.push(priority);
    }

    if (category) {
      const validCategories = ['general', 'technical', 'billing', 'account', 'feature_request', 'bug_report'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      updateFields.push(`category = $${paramIndex++}`);
      params.push(category);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');    // Check if ticket exists and get current data
    const currentTicketResult = await pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
    if (currentTicketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    const currentTicket = currentTicketResult.rows[0];

    // Update ticket
    const updateQuery = `UPDATE tickets SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    params.push(id);
    
    const result = await pool.query(updateQuery, params);
    const updatedTicket = result.rows[0];

    // Send email notifications for changes
    try {
      // Notify ticket owner of status changes
      if (status && status !== currentTicket.status) {
        await emailService.sendTicketUpdateNotification(
          updatedTicket, 
          currentTicket.user_email, 
          'status', 
          currentTicket.status, 
          status
        );
      }

      // Notify ticket owner of priority changes
      if (priority && priority !== currentTicket.priority) {
        await emailService.sendTicketUpdateNotification(
          updatedTicket, 
          currentTicket.user_email, 
          'priority', 
          currentTicket.priority, 
          priority
        );
      }

      // Notify assigned user when ticket is assigned to them
      if (assigned_to && assigned_to !== currentTicket.assigned_to) {
        if (assigned_to && assigned_to !== currentTicket.user_email) {
          await emailService.sendTicketUpdateNotification(
            updatedTicket, 
            assigned_to, 
            'assignment', 
            currentTicket.assigned_to || 'unassigned', 
            assigned_to
          );
        }
      }
    } catch (emailError) {
      console.error('Failed to send ticket update email:', emailError);
      // Continue with response even if email fails
    }

    res.json(updatedTicket);
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete ticket (admin only, optional)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ticket exists
    const ticketExists = await pool.query('SELECT id FROM tickets WHERE id = $1', [id]);
    if (ticketExists.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Delete ticket
    await pool.query('DELETE FROM tickets WHERE id = $1', [id]);

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get individual ticket with comments
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email;
    const isAdmin = req.user.role === 'admin';

    // Get ticket
    const ticketQuery = isAdmin 
      ? 'SELECT * FROM tickets WHERE id = $1'
      : 'SELECT * FROM tickets WHERE id = $1 AND user_email = $2';
    
    const ticketParams = isAdmin ? [id] : [id, userEmail];
    const ticketResult = await pool.query(ticketQuery, ticketParams);

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = ticketResult.rows[0];

    // Get comments
    const commentsQuery = `
      SELECT tc.*, u.role as author_role 
      FROM ticket_comments tc 
      JOIN users u ON tc.user_email = u.email 
      WHERE tc.ticket_id = $1 
      ORDER BY tc.created_at ASC
    `;
    const commentsResult = await pool.query(commentsQuery, [id]);

    res.json({
      ticket,
      comments: commentsResult.rows
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add comment to ticket
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, is_internal = false } = req.body;
    const userEmail = req.user.email;
    const isAdmin = req.user.role === 'admin';

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ error: 'Comment is required' });
    }

    // Verify ticket exists and user has access
    const ticketQuery = isAdmin 
      ? 'SELECT id FROM tickets WHERE id = $1'
      : 'SELECT id FROM tickets WHERE id = $1 AND user_email = $2';
    
    const ticketParams = isAdmin ? [id] : [id, userEmail];
    const ticketResult = await pool.query(ticketQuery, ticketParams);

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Only admins can create internal comments
    const isInternalComment = isAdmin && is_internal;    // Insert comment
    const result = await pool.query(
      'INSERT INTO ticket_comments (ticket_id, user_email, comment, is_internal) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, userEmail, comment.trim(), isInternalComment]
    );

    // Update ticket's updated_at timestamp
    await pool.query('UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

    // Send email notifications for comments (only for non-internal comments)
    if (!isInternalComment) {
      try {
        // Get ticket details for email
        const ticketResult = await pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
        const ticket = ticketResult.rows[0];
        
        // Send notification to ticket owner if comment is not from them
        if (ticket.user_email !== userEmail) {
          await emailService.sendCommentNotification(ticket, result.rows[0], ticket.user_email);
        }
        
        // Send notification to admins if comment is from user
        if (!isAdmin) {
          const adminResult = await pool.query("SELECT email FROM users WHERE role = 'admin'");
          for (const admin of adminResult.rows) {
            if (admin.email !== userEmail) {
              await emailService.sendCommentNotification(ticket, result.rows[0], admin.email);
            }
          }
        }
      } catch (emailError) {
        console.error('Failed to send comment notification emails:', emailError);
        // Continue with response even if email fails
      }
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get categories
router.get('/meta/categories', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories WHERE active = true ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get admin dashboard statistics
router.get('/admin/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get ticket statistics
    const totalTickets = await pool.query('SELECT COUNT(*) as count FROM tickets');
    const openTickets = await pool.query("SELECT COUNT(*) as count FROM tickets WHERE status = 'open'");
    const inProgressTickets = await pool.query("SELECT COUNT(*) as count FROM tickets WHERE status = 'in_progress'");
    const resolvedTickets = await pool.query("SELECT COUNT(*) as count FROM tickets WHERE status = 'resolved'");
    
    // Get tickets by priority
    const highPriorityTickets = await pool.query("SELECT COUNT(*) as count FROM tickets WHERE priority = 'high' AND status != 'resolved'");
    const mediumPriorityTickets = await pool.query("SELECT COUNT(*) as count FROM tickets WHERE priority = 'medium' AND status != 'resolved'");
    const lowPriorityTickets = await pool.query("SELECT COUNT(*) as count FROM tickets WHERE priority = 'low' AND status != 'resolved'");
    
    // Get tickets by category
    const categoryStats = await pool.query(`
      SELECT category, COUNT(*) as count 
      FROM tickets 
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    // Get recent activity (last 7 days)
    const recentTickets = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM tickets 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    
    // Get unassigned tickets
    const unassignedTickets = await pool.query("SELECT COUNT(*) as count FROM tickets WHERE assigned_to IS NULL AND status != 'resolved'");
    
    // Get avg resolution time (in hours)
    const avgResolutionTime = await pool.query(`
      SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_hours 
      FROM tickets 
      WHERE resolved_at IS NOT NULL
    `);

    res.json({
      summary: {
        total: parseInt(totalTickets.rows[0].count),
        open: parseInt(openTickets.rows[0].count),
        in_progress: parseInt(inProgressTickets.rows[0].count),
        resolved: parseInt(resolvedTickets.rows[0].count),
        unassigned: parseInt(unassignedTickets.rows[0].count)
      },
      priority: {
        high: parseInt(highPriorityTickets.rows[0].count),
        medium: parseInt(mediumPriorityTickets.rows[0].count),
        low: parseInt(lowPriorityTickets.rows[0].count)
      },
      categories: categoryStats.rows,
      recentActivity: recentTickets.rows,
      avgResolutionTime: parseFloat(avgResolutionTime.rows[0].avg_hours || 0)
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload file attachment for a ticket
router.post('/:id/attachments', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const ticketId = req.params.id;
    const userEmail = req.user.email;
    const isAdmin = req.user.role === 'admin';

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if ticket exists and user has permission
    const ticketResult = await pool.query(
      'SELECT * FROM tickets WHERE id = $1',
      [ticketId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = ticketResult.rows[0];
    
    // Check permission: admin can attach to any ticket, user can only attach to their own
    if (!isAdmin && ticket.user_email !== userEmail) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Save attachment info to database
    const attachmentResult = await pool.query(
      `INSERT INTO ticket_attachments (ticket_id, filename, original_filename, mimetype, size, file_path, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        ticketId,
        req.file.filename,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        req.file.path,
        userEmail
      ]
    );

    res.status(201).json({
      message: 'File uploaded successfully',
      attachment: attachmentResult.rows[0]
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get attachments for a ticket
router.get('/:id/attachments', authenticateToken, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const userEmail = req.user.email;
    const isAdmin = req.user.role === 'admin';

    // Check if ticket exists and user has permission
    const ticketResult = await pool.query(
      'SELECT * FROM tickets WHERE id = $1',
      [ticketId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = ticketResult.rows[0];
    
    // Check permission
    if (!isAdmin && ticket.user_email !== userEmail) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get attachments
    const attachmentsResult = await pool.query(
      'SELECT id, filename, original_filename, mimetype, size, uploaded_by, uploaded_at FROM ticket_attachments WHERE ticket_id = $1 ORDER BY uploaded_at DESC',
      [ticketId]
    );

    res.json(attachmentsResult.rows);
  } catch (error) {
    console.error('Get attachments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download attachment
router.get('/attachments/:id/download', authenticateToken, async (req, res) => {
  try {
    const attachmentId = req.params.id;
    const userEmail = req.user.email;
    const isAdmin = req.user.role === 'admin';

    // Get attachment info
    const attachmentResult = await pool.query(
      `SELECT ta.*, t.user_email as ticket_owner 
       FROM ticket_attachments ta 
       JOIN tickets t ON ta.ticket_id = t.id 
       WHERE ta.id = $1`,
      [attachmentId]
    );

    if (attachmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const attachment = attachmentResult.rows[0];
    
    // Check permission
    if (!isAdmin && attachment.ticket_owner !== userEmail) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if file exists
    const filePath = path.join(uploadsDir, attachment.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.original_filename}"`);
    res.setHeader('Content-Type', attachment.mimetype);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download attachment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete attachment (admin or file uploader only)
router.delete('/attachments/:id', authenticateToken, async (req, res) => {
  try {
    const attachmentId = req.params.id;
    const userEmail = req.user.email;
    const isAdmin = req.user.role === 'admin';

    // Get attachment info
    const attachmentResult = await pool.query(
      `SELECT ta.*, t.user_email as ticket_owner 
       FROM ticket_attachments ta 
       JOIN tickets t ON ta.ticket_id = t.id 
       WHERE ta.id = $1`,
      [attachmentId]
    );

    if (attachmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const attachment = attachmentResult.rows[0];
    
    // Check permission: admin, file uploader, or ticket owner can delete
    if (!isAdmin && attachment.uploaded_by !== userEmail && attachment.ticket_owner !== userEmail) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete file from filesystem
    const filePath = path.join(uploadsDir, attachment.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await pool.query('DELETE FROM ticket_attachments WHERE id = $1', [attachmentId]);

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get admin users for assignment
router.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT email FROM users WHERE role = 'admin' ORDER BY email");
    res.json(result.rows);
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload file (admin only) - Legacy route, keeping for compatibility
router.post('/admin/upload', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const { originalname, mimetype, size, filename } = req.file;

    res.status(201).json({ 
      message: 'File uploaded successfully', 
      file: { originalname, mimetype, size, filename } 
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test email service (admin only)
router.post('/admin/test-email', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { testEmail } = req.body;
    const email = testEmail || req.user.email;

    // Test email service connection
    const isReady = await emailService.testConnection();
    
    if (!isReady) {
      return res.status(500).json({ 
        error: 'Email service configuration failed',
        message: 'Please check SMTP configuration in environment variables'
      });
    }

    // Send test email
    const testTicket = {
      id: 'TEST-' + Date.now(),
      subject: 'Email Service Test',
      message: 'This is a test email to verify the helpdesk email service is working correctly. Sent at ' + new Date().toLocaleString(),
      priority: 'medium',
      category: 'technical',
      status: 'open',
      created_at: new Date().toISOString()
    };

    await emailService.sendTicketCreatedNotification(testTicket, email);
    
    res.json({ 
      message: 'Test email sent successfully',
      email: email,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({ error: 'Failed to send test email: ' + error.message });
  }
});

export default router;
