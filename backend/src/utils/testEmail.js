import emailService from '../services/emailService.js';

// Simple email service test utility
async function testEmailService() {
  console.log('Testing email service configuration...');
  
  try {
    const isReady = await emailService.testConnection();
    
    if (isReady) {
      console.log('✅ Email service configuration is valid');
      
      // Test sending a sample email
      const testTicket = {
        id: 'TEST',
        subject: 'Test Email Configuration',
        message: 'This is a test email to verify the helpdesk email service is working correctly.',
        priority: 'medium',
        category: 'technical',
        status: 'open',
        created_at: new Date().toISOString()
      };
      
      const testEmail = process.env.TEST_EMAIL || 'test@example.com';
      console.log(`Sending test email to: ${testEmail}`);
      
      await emailService.sendTicketCreatedNotification(testTicket, testEmail);
      console.log('✅ Test email sent successfully');
    } else {
      console.log('❌ Email service configuration failed');
      console.log('Please check your SMTP configuration in environment variables:');
      console.log('- SMTP_HOST');
      console.log('- SMTP_PORT');
      console.log('- SMTP_USER');
      console.log('- SMTP_PASS');
      console.log('- FROM_EMAIL');
    }
  } catch (error) {
    console.error('❌ Email service test failed:', error);
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testEmailService();
}

export default testEmailService;
