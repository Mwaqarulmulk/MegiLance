// @AI-HINT: Support Tickets system - create and manage support requests
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { supportTicketsApi } from '@/lib/api';
import type { SupportTicket } from '@/types/api';
import { Headphones, Plus, MessageSquare, Clock, CheckCircle, XCircle, Send } from 'lucide-react';
import commonStyles from './Support.common.module.css';
import lightStyles from './Support.light.module.css';
import darkStyles from './Support.dark.module.css';

const SupportTickets: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const themeStyles = resolvedTheme === 'light' ? lightStyles : darkStyles;

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form state
  const [subject, setSubject] = useState('');
    const [category, setCategory] = useState<'technical' | 'billing' | 'account' | 'project' | 'other'>('technical');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: any = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      const response = await supportTicketsApi.list(filters) as { tickets: SupportTicket[] };
      setTickets(response.tickets);
    } catch (err: any) {
      setError(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await supportTicketsApi.create({
        subject,
        category,
        priority,
        description
      });
      resetForm();
      setShowCreateForm(false);
      loadTickets();
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket');
    }
  };

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !message.trim()) return;

    try {
      setError(null);
      await supportTicketsApi.addMessage(selectedTicket.id, { message });
      setMessage('');
      const updated = await supportTicketsApi.get(selectedTicket.id) as SupportTicket;
      setSelectedTicket(updated);
      loadTickets();
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    }
  };

  const resetForm = () => {
    setSubject('');
    setCategory('technical');
    setPriority('medium');
    setDescription('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock size={18} />;
      case 'in_progress':
        return <MessageSquare size={18} />;
      case 'resolved':
        return <CheckCircle size={18} />;
      case 'closed':
        return <XCircle size={18} />;
      default:
        return <Headphones size={18} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: '#10b981',
      medium: '#3b82f6',
      high: '#f59e0b',
      urgent: '#ef4444'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      <div className={commonStyles.header}>
        <div>
          <h1 className={cn(commonStyles.title, themeStyles.title)}>Support Tickets</h1>
          <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
            Get help from our support team
          </p>
        </div>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className={cn(commonStyles.createBtn, themeStyles.createBtn)}
          >
            <Plus size={20} />
            New Ticket
          </button>
        )}
      </div>

      {error && (
        <div className={cn(commonStyles.error, themeStyles.error)}>
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className={cn(commonStyles.formCard, themeStyles.formCard)}>
          <h2 className={cn(commonStyles.formTitle, themeStyles.formTitle)}>Create Support Ticket</h2>
          <form onSubmit={handleCreate}>
            <div className={commonStyles.formGroup}>
              <label className={cn(commonStyles.label, themeStyles.label)}>Subject *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={cn(commonStyles.input, themeStyles.input)}
                required
                placeholder="Brief description of your issue"
              />
            </div>

            <div className={commonStyles.formRow}>
              <div className={commonStyles.formGroup}>
                <label className={cn(commonStyles.label, themeStyles.label)}>Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className={cn(commonStyles.select, themeStyles.select)}
                  required
                  aria-label="Select Ticket Category"
                >
                  <option value="general">General</option>
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                  <option value="account">Account</option>
                </select>
              </div>

              <div className={commonStyles.formGroup}>
                <label className={cn(commonStyles.label, themeStyles.label)}>Priority *</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className={cn(commonStyles.select, themeStyles.select)}
                  required
                  aria-label="Select Ticket Priority"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className={commonStyles.formGroup}>
              <label className={cn(commonStyles.label, themeStyles.label)}>Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={cn(commonStyles.textarea, themeStyles.textarea)}
                rows={5}
                required
                placeholder="Provide detailed information about your issue..."
              />
            </div>

            <div className={commonStyles.formActions}>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className={cn(commonStyles.cancelBtn, themeStyles.cancelBtn)}
              >
                Cancel
              </button>
              <button type="submit" className={cn(commonStyles.submitBtn, themeStyles.submitBtn)}>
                Create Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={commonStyles.filterSection}>
        <label className={cn(commonStyles.filterLabel, themeStyles.label)}>Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={cn(commonStyles.filterSelect, themeStyles.filterSelect)}
        >
          <option value="all">All Tickets</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className={commonStyles.content}>
        <div className={commonStyles.ticketsList}>
          {loading ? (
            <div className={cn(commonStyles.loading, themeStyles.loading)}>Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className={cn(commonStyles.empty, themeStyles.empty)}>
              <Headphones size={48} />
              <p>No support tickets</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={cn(
                  commonStyles.ticketCard,
                  themeStyles.ticketCard,
                  selectedTicket?.id === ticket.id && commonStyles.selected
                )}
              >
                <div className={commonStyles.ticketHeader}>
                  {getStatusIcon(ticket.status)}
                  <div className={commonStyles.ticketInfo}>
                    <h3 className={cn(commonStyles.ticketSubject, themeStyles.ticketSubject)}>
                      {ticket.subject}
                    </h3>
                    <span className={cn(commonStyles.ticketMeta, themeStyles.ticketMeta)}>
                      #{ticket.id} • {formatDate(ticket.created_at)}
                    </span>
                  </div>
                </div>
                <div className={commonStyles.ticketFooter}>
                  <span
                    className={cn(commonStyles.badge, themeStyles.badge)}
                    data-status={ticket.status}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span
                    className={cn(commonStyles.priorityBadge, themeStyles.priorityBadge)}
                    style={{ backgroundColor: getPriorityColor(ticket.priority) + '30', color: getPriorityColor(ticket.priority) }}
                  >
                    {ticket.priority}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedTicket && (
          <div className={cn(commonStyles.ticketDetail, themeStyles.ticketDetail)}>
            <div className={commonStyles.detailHeader}>
              <div>
                <h2 className={cn(commonStyles.detailTitle, themeStyles.detailTitle)}>
                  {selectedTicket.subject}
                </h2>
                <p className={cn(commonStyles.detailMeta, themeStyles.detailMeta)}>
                  Ticket #{selectedTicket.id} • Created {formatDate(selectedTicket.created_at)}
                </p>
              </div>
              <div className={commonStyles.detailBadges}>
                <span
                  className={cn(commonStyles.badge, themeStyles.badge)}
                  data-status={selectedTicket.status}
                >
                  {selectedTicket.status.replace('_', ' ')}
                </span>
                <span
                  className={cn(commonStyles.priorityBadge, themeStyles.priorityBadge)}
                  style={{ backgroundColor: getPriorityColor(selectedTicket.priority) + '30', color: getPriorityColor(selectedTicket.priority) }}
                >
                  {selectedTicket.priority}
                </span>
              </div>
            </div>

            <div className={cn(commonStyles.detailDescription, themeStyles.detailDescription)}>
              <h4 className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}>Description</h4>
              <p>{selectedTicket.description}</p>
            </div>

            {selectedTicket.messages && selectedTicket.messages.length > 0 && (
              <div className={commonStyles.messagesSection}>
                <h4 className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}>Conversation</h4>
                <div className={commonStyles.messagesList}>
                  {selectedTicket.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(commonStyles.message, themeStyles.message)}
                    >
                      <div className={cn(commonStyles.messageMeta, themeStyles.messageMeta)}>
                        <strong>{msg.sender || 'User'}</strong>
                        <span>{formatDate(msg.created_at)}</span>
                      </div>
                      <p className={cn(commonStyles.messageText, themeStyles.messageText)}>
                        {msg.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTicket.status !== 'closed' && (
              <form onSubmit={handleAddMessage} className={commonStyles.replyForm}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={cn(commonStyles.replyInput, themeStyles.replyInput)}
                  rows={3}
                  placeholder="Type your reply..."
                  required
                />
                <button type="submit" className={cn(commonStyles.sendBtn, themeStyles.sendBtn)}>
                  <Send size={16} />
                  Send Reply
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTickets;
