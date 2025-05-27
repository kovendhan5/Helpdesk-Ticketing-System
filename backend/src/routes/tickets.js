import express from 'express';
import pool from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create a new ticket (user only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { subject, message, priority } = req.body;
    const userEmail = req.user.email;

    // Validate input
    if (!subject || !message || !priority) {
      return res.status(400).json({ error: 'Subject, message, and priority are required' });
    }

    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ error: 'Priority must be low, medium, or high' });
    }

    // Insert ticket into database
    const result = await pool.query(
      'INSERT INTO tickets (user_email, subject, message, priority) VALUES ($1, $2, $3, $4) RETURNING *',
      [userEmail, subject, message, priority]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tickets (admin: all tickets, user: own tickets)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { user_email, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const userEmail = req.user.email;
    const isAdmin = req.user.role === 'admin';

    let query = 'SELECT * FROM tickets';
    let params = [];
    let whereConditions = [];

    // If not admin, only show user's own tickets
    if (!isAdmin) {
      whereConditions.push('user_email = $1');
      params.push(userEmail);
    } else {
      // Admin can filter by user_email and status
      if (user_email) {
        whereConditions.push(`user_email = $${params.length + 1}`);
        params.push(user_email);
      }
      if (status) {
        whereConditions.push(`status = $${params.length + 1}`);
        params.push(status);
      }
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';
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
    const { status } = req.body;

    // Validate input
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    if (!['open', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Status must be open, in_progress, or resolved' });
    }

    // Check if ticket exists
    const ticketExists = await pool.query('SELECT id FROM tickets WHERE id = $1', [id]);
    if (ticketExists.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Update ticket status
    const result = await pool.query(
      'UPDATE tickets SET status = $1 WHERE id = $2 RETURNING id, status',
      [status, id]
    );

    res.json(result.rows[0]);
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

export default router;
