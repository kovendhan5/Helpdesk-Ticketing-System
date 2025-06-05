import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    // Configure nodemailer transporter
    // In production, use environment variables for email configuration
    this.transporter = nodemailer.createTransport({
      // For development, you can use a service like Ethereal Email or configure SMTP
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '', // Set in environment variables
        pass: process.env.SMTP_PASS || ''  // Set in environment variables
      }
    });
  }

  async sendTicketCreatedNotification(ticket, userEmail) {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@helpdesk.local',
        to: userEmail,
        subject: `Ticket Created: ${ticket.subject}`,
        html: `
          <h2>Your Support Ticket Has Been Created</h2>
          <p>Dear User,</p>
          <p>Your support ticket has been successfully created. Here are the details:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Ticket Details</h3>
            <p><strong>Ticket ID:</strong> #${ticket.id}</p>
            <p><strong>Subject:</strong> ${ticket.subject}</p>
            <p><strong>Priority:</strong> ${ticket.priority}</p>
            <p><strong>Category:</strong> ${ticket.category}</p>
            <p><strong>Status:</strong> ${ticket.status}</p>
            <p><strong>Created:</strong> ${new Date(ticket.created_at).toLocaleString()}</p>
          </div>
          
          <p><strong>Message:</strong></p>
          <div style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #007bff; margin: 10px 0;">
            ${ticket.message.replace(/\n/g, '<br>')}
          </div>
          
          <p>We will review your ticket and respond as soon as possible.</p>
          <p>Thank you for contacting our support team!</p>
          
          <hr>
          <p style="font-size: 12px; color: #666;">
            This is an automated message. Please do not reply to this email.
          </p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Ticket creation notification sent to:', userEmail);
    } catch (error) {
      console.error('Failed to send ticket creation notification:', error);
      // Don't throw error to prevent ticket creation failure due to email issues
    }
  }

  async sendTicketUpdateNotification(ticket, userEmail, updatedField, oldValue, newValue) {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@helpdesk.local',
        to: userEmail,
        subject: `Ticket Updated: ${ticket.subject}`,
        html: `
          <h2>Your Support Ticket Has Been Updated</h2>
          <p>Dear User,</p>
          <p>Your support ticket has been updated. Here are the details:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Ticket Details</h3>
            <p><strong>Ticket ID:</strong> #${ticket.id}</p>
            <p><strong>Subject:</strong> ${ticket.subject}</p>
            <p><strong>Current Status:</strong> ${ticket.status}</p>
            <p><strong>Priority:</strong> ${ticket.priority}</p>
            <p><strong>Category:</strong> ${ticket.category}</p>
          </div>
          
          <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Update Details</h3>
            <p><strong>Field Updated:</strong> ${updatedField}</p>
            <p><strong>Previous Value:</strong> ${oldValue}</p>
            <p><strong>New Value:</strong> ${newValue}</p>
            <p><strong>Updated:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>If you have any questions about this update, please reply to this ticket.</p>
          <p>Thank you for using our support system!</p>
          
          <hr>
          <p style="font-size: 12px; color: #666;">
            This is an automated message. Please do not reply to this email.
          </p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Ticket update notification sent to:', userEmail);
    } catch (error) {
      console.error('Failed to send ticket update notification:', error);
    }
  }

  async sendCommentNotification(ticket, comment, userEmail) {
    try {
      // Don't send notification to the person who made the comment
      if (comment.user_email === userEmail) {
        return;
      }

      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@helpdesk.local',
        to: userEmail,
        subject: `New Comment on Ticket: ${ticket.subject}`,
        html: `
          <h2>New Comment on Your Support Ticket</h2>
          <p>Dear User,</p>
          <p>A new comment has been added to your support ticket:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Ticket Details</h3>
            <p><strong>Ticket ID:</strong> #${ticket.id}</p>
            <p><strong>Subject:</strong> ${ticket.subject}</p>
            <p><strong>Status:</strong> ${ticket.status}</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>New Comment</h3>
            <p><strong>From:</strong> ${comment.user_email}</p>
            <p><strong>Posted:</strong> ${new Date(comment.created_at).toLocaleString()}</p>
            <div style="margin-top: 10px; padding: 10px; background-color: white; border-left: 4px solid #007bff;">
              ${comment.comment.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <p>You can view the full ticket and respond by logging into your account.</p>
          <p>Thank you for using our support system!</p>
          
          <hr>
          <p style="font-size: 12px; color: #666;">
            This is an automated message. Please do not reply to this email.
          </p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Comment notification sent to:', userEmail);
    } catch (error) {
      console.error('Failed to send comment notification:', error);
    }
  }

  // Test email configuration
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service is ready to send emails');
      return true;
    } catch (error) {
      console.error('Email service configuration error:', error);
      return false;
    }
  }
}

export default new EmailService();
