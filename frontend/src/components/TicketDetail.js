import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWebSocket } from '../contexts/WebSocketContext';

const TicketDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isConnected, on, joinRoom, leaveRoom } = useWebSocket();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  const fetchTicketDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/tickets/${id}`);
      setTicket(response.data.ticket);
      setComments(response.data.comments);
      
      // Fetch attachments
      try {
        const attachmentsResponse = await axios.get(`/tickets/${id}/attachments`);
        setAttachments(attachmentsResponse.data);
      } catch (attachmentError) {
        console.error('Failed to fetch attachments:', attachmentError);
        setAttachments([]);
      }
      
      setError('');
    } catch (error) {
      setError('Failed to load ticket details');
      console.error('Fetch ticket details error:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchAdminUsers = useCallback(async () => {
    try {
      const response = await axios.get('/tickets/admin/users');
      setAdminUsers(response.data);
    } catch (error) {
      console.error('Fetch admin users error:', error);
    }
  }, []);

  useEffect(() => {
    fetchTicketDetails();
    if (user.role === 'admin') {
      fetchAdminUsers();
    }
  }, [fetchTicketDetails, fetchAdminUsers, user.role]);

  // WebSocket integration for real-time updates
  useEffect(() => {
    if (!isConnected || !id) return;

    // Join the ticket-specific room for real-time updates
    joinRoom(`ticket:${id}`);

    // Listen for ticket updates
    const unsubscribeTicketUpdated = on('ticket:updated', (data) => {
      if (data.ticket && data.ticket.id === parseInt(id)) {
        console.log('📨 Received ticket update:', data);
        setTicket(data.ticket);
        // Show notification
        setError('Ticket was updated by ' + data.updatedBy);
        setTimeout(() => setError(''), 3000);
      }
    });

    // Listen for new comments
    const unsubscribeTicketCommented = on('ticket:commented', (data) => {
      if (data.ticket && data.ticket.id === parseInt(id)) {
        console.log('💬 Received new comment:', data);
        // Refresh comments to show the new one
        fetchTicketDetails();
        // Show notification if comment is not from current user
        if (data.commentBy !== user.email) {
          setError('New comment added by ' + data.commentBy);
          setTimeout(() => setError(''), 3000);
        }
      }
    });

    // Listen for ticket assignment
    const unsubscribeTicketAssigned = on('ticket:assigned', (data) => {
      if (data.ticket && data.ticket.id === parseInt(id)) {
        console.log('👤 Received ticket assignment:', data);
        setTicket(data.ticket);
        setError('Ticket was assigned to ' + data.assignedTo);
        setTimeout(() => setError(''), 3000);
      }
    });

    // Cleanup function
    return () => {
      leaveRoom(`ticket:${id}`);
      unsubscribeTicketUpdated();
      unsubscribeTicketCommented();
      unsubscribeTicketAssigned();
    };
  }, [isConnected, id, on, joinRoom, leaveRoom, user.email, fetchTicketDetails]);

  const addComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      await axios.post(`/tickets/${id}/comments`, {
        comment: newComment,
        is_internal: isInternal
      });
      setNewComment('');
      setIsInternal(false);
      fetchTicketDetails(); // Refresh to show new comment
    } catch (error) {
      setError('Failed to add comment');
      console.error('Add comment error:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const updateTicket = async (field, value) => {
    try {
      await axios.patch(`/tickets/${id}`, { [field]: value });
      fetchTicketDetails(); // Refresh ticket data
    } catch (error) {
      setError(`Failed to update ${field}`);
      console.error('Update ticket error:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
                         'application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                         'text/plain', 'application/zip', 'application/x-rar-compressed'];
    
    if (file.size > maxSize) {
      setError(`File ${file.name} is too large. Maximum size is 10MB.`);
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      setError(`File ${file.name} has an unsupported type. Please upload images, documents, or archives only.`);
      return;
    }

    try {
      setUploadingFile(true);
      setError('');
      
      const formData = new FormData();
      formData.append('file', file);
      
      await axios.post(`/tickets/${id}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Refresh attachments
      const attachmentsResponse = await axios.get(`/tickets/${id}/attachments`);
      setAttachments(attachmentsResponse.data);
      
      // Clear the file input
      e.target.value = '';
    } catch (error) {
      setError('Failed to upload file. Please try again.');
      console.error('File upload error:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  const downloadAttachment = async (attachmentId, filename) => {
    try {
      const response = await axios.get(`/tickets/attachments/${attachmentId}/download`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to download file. Please try again.');
      console.error('Download attachment error:', error);
    }
  };

  const deleteAttachment = async (attachmentId) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) {
      return;
    }

    try {
      await axios.delete(`/tickets/attachments/${attachmentId}`);
      
      // Refresh attachments
      const attachmentsResponse = await axios.get(`/tickets/${id}/attachments`);
      setAttachments(attachmentsResponse.data);
    } catch (error) {
      setError('Failed to delete attachment. Please try again.');
      console.error('Delete attachment error:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'technical': return 'bg-red-100 text-red-800';
      case 'billing': return 'bg-green-100 text-green-800';
      case 'account': return 'bg-purple-100 text-purple-800';
      case 'feature_request': return 'bg-blue-100 text-blue-800';
      case 'bug_report': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/tickets')}
          className="text-primary-600 hover:text-primary-500 font-medium"
        >
          ← Back to Tickets
        </button>
        <div className="text-sm text-gray-500">
          Ticket #{ticket?.id}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Ticket Details */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{ticket?.subject}</h1>
            <p className="text-gray-600 mb-4">Submitted by: {ticket?.user_email}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket?.priority)}`}>
                {ticket?.priority} Priority
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket?.status)}`}>
                {ticket?.status.replace('_', ' ')}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(ticket?.category)}`}>
                {ticket?.category.replace('_', ' ')}
              </span>
            </div>
          </div>
          
          {/* Admin Controls */}
          {user.role === 'admin' && (
            <div className="lg:ml-6 mt-4 lg:mt-0 space-y-3 lg:min-w-64">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={ticket?.status || ''}
                  onChange={(e) => updateTicket('status', e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={ticket?.priority || ''}
                  onChange={(e) => updateTicket('priority', e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={ticket?.category || ''}
                  onChange={(e) => updateTicket('category', e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                >
                  <option value="general">General</option>
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                  <option value="account">Account</option>
                  <option value="feature_request">Feature Request</option>
                  <option value="bug_report">Bug Report</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <select
                  value={ticket?.assigned_to || ''}
                  onChange={(e) => updateTicket('assigned_to', e.target.value || null)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                >
                  <option value="">Unassigned</option>
                  {adminUsers.map(admin => (
                    <option key={admin.email} value={admin.email}>{admin.email}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Original Message</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{ticket?.message}</p>
            <div className="mt-3 text-sm text-gray-500">
              Created: {formatDate(ticket?.created_at)}
              {ticket?.updated_at !== ticket?.created_at && (
                <span className="ml-4">Updated: {formatDate(ticket?.updated_at)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attachments Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Attachments ({attachments.length})
          </h3>
          
          {/* File Upload */}
          <div className="flex items-center space-x-2">
            <input
              type="file"
              id="file-upload"
              onChange={handleFileUpload}
              className="hidden"
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar"
            />
            <label
              htmlFor="file-upload"
              className={`cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 ${uploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {uploadingFile ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  📎 Add File
                </>
              )}
            </label>
          </div>
        </div>

        {/* Attachments List */}
        {attachments.length > 0 ? (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {attachment.mimetype.startsWith('image/') ? '🖼️' : 
                     attachment.mimetype.includes('pdf') ? '📄' : 
                     attachment.mimetype.includes('word') ? '📝' : 
                     attachment.mimetype.includes('zip') || attachment.mimetype.includes('rar') ? '📦' : '📎'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{attachment.original_filename}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.size)} • Uploaded by {attachment.uploaded_by} • {formatDate(attachment.uploaded_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => downloadAttachment(attachment.id, attachment.original_filename)}
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                  >
                    Download
                  </button>
                  {(user.role === 'admin' || user.email === attachment.uploaded_by || user.email === ticket?.user_email) && (
                    <button
                      onClick={() => deleteAttachment(attachment.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium ml-2"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No attachments yet</p>
            <p className="text-sm mt-1">Upload files to share additional information</p>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          Comments ({comments.length})
        </h3>

        {/* Comments List */}
        <div className="space-y-6 mb-8">
          {comments.map((comment) => (
            <div key={comment.id} className={`${comment.is_internal ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''} p-4 rounded-lg`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{comment.user_email}</span>
                  {comment.author_role === 'admin' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Admin
                    </span>
                  )}
                  {comment.is_internal && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Internal
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
            </div>
          ))}
        </div>

        {/* Add Comment Form */}
        <form onSubmit={addComment} className="border-t pt-6">
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Add Comment
            </label>
            <textarea
              id="comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="Type your comment here..."
              required
            />
          </div>
          
          {user.role === 'admin' && (
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Internal comment (not visible to user)</span>
              </label>
            </div>
          )}
          
          <button
            type="submit"
            disabled={submittingComment || !newComment.trim()}
            className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submittingComment ? 'Adding...' : 'Add Comment'}
          </button>
        </form>
      </div>

      {/* Attachments Section */}
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Attachments ({attachments.length})
        </h3>

        {/* Upload File */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload File
          </label>
          <input
            type="file"
            onChange={handleFileUpload}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
        </div>

        {/* Attachments List */}
        <div className="space-y-4">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="block text-sm font-medium text-gray-900">
                  {attachment.original_name}
                </span>
                <span className="block text-xs text-gray-500">
                  {formatFileSize(attachment.size)} • {formatDate(attachment.created_at)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => downloadAttachment(attachment.id, attachment.original_name)}
                  className="text-primary-600 hover:text-primary-500 text-sm"
                >
                  Download
                </button>
                <button
                  onClick={() => deleteAttachment(attachment.id)}
                  className="text-red-600 hover:text-red-500 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
