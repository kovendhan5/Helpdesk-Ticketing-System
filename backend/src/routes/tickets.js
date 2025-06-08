import express from 'express';
import pool from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import emailService from '../services/emailService.js';

const router = express.Router();

// Get all tickets
router.get('/', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    
    let query;
    let queryParams = [];
    
    if (req.user.role === 'admin') {
      // Admin sees all tickets
      query = `
        SELECT t.*, u.email as user_email, u.username 
        FROM tickets t 
        JOIN users u ON t.user_id = u.id 
        ORDER BY t.created_at DESC
      `;
    } else {
      // Regular users see only their tickets
      query = `
        SELECT t.*, u.email as user_email, u.username 
        FROM tickets t 
        JOIN users u ON t.user_id = u.id 
        WHERE t.user_id = $1 
        ORDER BY t.created_at DESC
      `;
      queryParams = [req.user.userId];
    }
    
    const result = await client.query(query, queryParams);
    client.release();
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get single ticket
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    const ticketId = req.params.id;
    
    let query = `
      SELECT t.*, u.email as user_email, u.username 
      FROM tickets t 
      JOIN users u ON t.user_id = u.id 
      WHERE t.id = $1
    `;
    let queryParams = [ticketId];
    
    // Non-admin users can only see their own tickets
    if (req.user.role !== 'admin') {
      query += ' AND t.user_id = $2';
      queryParams.push(req.user.userId);
    }
    
    const result = await client.query(query, queryParams);
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// Create new ticket (simplified - no file uploads initially)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, priority = 'medium' } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    
    const client = await pool.connect();
    
    const query = `
      INSERT INTO tickets (title, description, priority, status, user_id, created_at, updated_at)
      VALUES ($1, $2, $3, 'open', $4, NOW(), NOW())
      RETURNING *
    `;
    
    const result = await client.query(query, [title, description, priority, req.user.userId]);
    client.release();
    
    const newTicket = result.rows[0];
    
    // Send email notification to admin
    try {
      await emailService.sendNewTicketNotification(newTicket);
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the ticket creation if email fails
    }
    
    res.status(201).json(newTicket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Update ticket
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { title, description, priority, status } = req.body;
    
    const client = await pool.connect();
    
    // Check if ticket exists and user has permission
    let checkQuery = 'SELECT * FROM tickets WHERE id = $1';
    let checkParams = [ticketId];
    
    if (req.user.role !== 'admin') {
      checkQuery += ' AND user_id = $2';
      checkParams.push(req.user.userId);
    }
    
    const checkResult = await client.query(checkQuery, checkParams);
    
    if (checkResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    
    if (priority !== undefined) {
      updates.push(`priority = $${paramCount++}`);
      values.push(priority);
    }
    
    if (status !== undefined && req.user.role === 'admin') {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    
    if (updates.length === 0) {
      client.release();
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    updates.push(`updated_at = NOW()`);
    values.push(ticketId);
    
    const updateQuery = `
      UPDATE tickets 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await client.query(updateQuery, values);
    client.release();
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// Delete ticket (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const ticketId = req.params.id;
    
    const client = await pool.connect();
    
    const result = await client.query('DELETE FROM tickets WHERE id = $1 RETURNING *', [ticketId]);
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

// Add comment to ticket
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    const client = await pool.connect();
    
    // Check if ticket exists and user has permission to comment
    let checkQuery = 'SELECT * FROM tickets WHERE id = $1';
    let checkParams = [ticketId];
    
    if (req.user.role !== 'admin') {
      checkQuery += ' AND user_id = $2';
      checkParams.push(req.user.userId);
    }
    
    const checkResult = await client.query(checkQuery, checkParams);
    
    if (checkResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Add comment
    const commentQuery = `
      INSERT INTO ticket_comments (ticket_id, user_id, content, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    
    const result = await client.query(commentQuery, [ticketId, req.user.userId, content]);
    client.release();
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Get ticket comments
router.get('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const ticketId = req.params.id;
    
    const client = await pool.connect();
    
    // Check if ticket exists and user has permission
    let checkQuery = 'SELECT * FROM tickets WHERE id = $1';
    let checkParams = [ticketId];
    
    if (req.user.role !== 'admin') {
      checkQuery += ' AND user_id = $2';
      checkParams.push(req.user.userId);
    }
    
    const checkResult = await client.query(checkQuery, checkParams);
    
    if (checkResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Get comments
    const commentsQuery = `
      SELECT tc.*, u.username, u.email
      FROM ticket_comments tc
      JOIN users u ON tc.user_id = u.id
      WHERE tc.ticket_id = $1
      ORDER BY tc.created_at ASC
    `;
    
    const result = await client.query(commentsQuery, [ticketId]);
    client.release();
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

export default router;
