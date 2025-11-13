// @AI-HINT: TypeScript type definitions for MegiLance API models
// Ensures type safety across the entire frontend application

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'client' | 'freelancer' | 'admin';
  user_type?: string;
  bio?: string;
  skills?: string;
  hourly_rate?: number;
  profile_image_url?: string;
  location?: string;
  joined_at: string;
  is_active: boolean;
}

export interface TimeEntry {
  id: number;
  user_id: number;
  contract_id: number;
  description: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  hourly_rate?: number;
  amount?: number;
  billable: boolean;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface TimeEntrySummary {
  contract_id: number;
  total_hours: number;
  total_amount: number;
  billable_hours: number;
  billable_amount: number;
  entry_count: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  contract_id: number;
  contract?: Contract;
  from_user_id: number;
  to_user_id: number;
  subtotal: number;
  tax: number;
  total: number;
  total_amount: number;
  line_items?: InvoiceItem[];
  due_date: string;
  paid_date?: string;
  status: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  payment_id?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface InvoiceList {
  invoices: Invoice[];
  total: number;
  page: number;
  page_size: number;
}

export interface Escrow {
  id: number;
  contract_id: number;
  contract?: Contract;
  amount: number;
  released_amount: number;
  status: 'pending' | 'active' | 'released' | 'refunded' | 'disputed' | 'held';
  funded_at: string;
  released_at?: string;
  description?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EscrowBalance {
  contract_id: number;
  total_balance: number;
  total_funded: number;
  total_released: number;
  available_balance: number;
  held_amount: number;
  released_amount: number;
  refunded_amount: number;
  status: 'active' | 'none';
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent_id?: number;
  sort_order: number;
  is_active: boolean;
  project_count: number;
  created_at: string;
  updated_at: string;
  children?: Category[];
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  type: 'skill' | 'priority' | 'location' | 'budget' | 'general';
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: number;
  user_id: number;
  target_type: 'project' | 'freelancer' | 'client';
  target_id: number;
  created_at: string;
}

export interface FavoriteCheck {
  is_favorited: boolean;
  favorite_id?: number;
}

export interface RefundRequest {
  id: number;
  transaction_id: number;
  payment_id: number;
  user_id: number;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  requested_at: string;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: number;
  user_id: number;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'account' | 'project' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_to?: number;
  attachments?: string;
  messages?: Array<{ id: number; user_id: number; message: string; sender?: string; created_at: string }>;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketList {
  tickets: SupportTicket[];
  total: number;
  page: number;
  page_size: number;
}

export interface Refund {
  id: number;
  payment_id: number;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requested_by: number;
  processed_by?: number;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RefundList {
  refunds: Refund[];
  total: number;
  page: number;
  page_size: number;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  budget_type: 'Fixed' | 'Hourly';
  budget_min?: number;
  budget_max?: number;
  experience_level: 'Entry' | 'Intermediate' | 'Expert';
  estimated_duration: string;
  skills: string[];
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  client_id: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectList {
  projects: Project[];
  total: number;
  page: number;
  page_size: number;
}

export interface Contract {
  id: number;
  project_id: number;
  title?: string;
  client_id: number;
  client?: { full_name: string };
  freelancer_id: number;
  freelancer?: { full_name: string };
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'disputed';
  terms?: string;
  budget: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ContractList {
  contracts: Contract[];
  total: number;
  page: number;
  page_size: number;
}

export interface Proposal {
  id: number;
  project_id: number;
  freelancer_id: number;
  cover_letter: string;
  proposed_rate: number;
  estimated_duration: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  updated_at: string;
}

export interface ProposalList {
  proposals: Proposal[];
  total: number;
  page: number;
  page_size: number;
}

export interface Review {
  id: number;
  contract_id: number;
  reviewer_id: number;
  target_id: number;
  target_type: 'freelancer' | 'client';
  rating: number;
  comment: string;
  created_at: string;
}

export interface ReviewList {
  reviews: Review[];
  total: number;
  page: number;
  page_size: number;
}

export interface SearchResult {
  id: number;
  type: 'project' | 'freelancer' | 'skill' | 'tag';
  title?: string;
  name?: string;
  description?: string;
  budget?: number;
  location?: string;
  skills?: string[];
  url?: string;
}

export interface SearchResults {
  query: string;
  results: SearchResult[];
  total_results: number;
}

export interface AutocompleteSuggestion {
  text: string;
  type: 'project' | 'freelancer' | 'skill';
}

export interface AutocompleteResult {
  query: string;
  suggestions: AutocompleteSuggestion[];
}

export interface TrendingResult {
  type: 'projects' | 'freelancers';
  items: Project[] | User[];
}

// API Response wrappers
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Form data types
export interface TimeEntryFormData {
  contract_id: number;
  description: string;
  billable: boolean;
  hourly_rate?: number;
}

export interface InvoiceFormData {
  contract_id: number;
  to_user_id: number;
  due_date: string;
  items: InvoiceItem[];
  line_items?: InvoiceItem[];
  notes?: string;
  tax_rate?: number;
}

export interface EscrowFundData {
  contract_id: number;
  amount: number;
  description?: string;
}

export interface TagFormData {
  name: string;
  description?: string;
  type: 'skill' | 'priority' | 'location' | 'budget' | 'general';
}

export interface SupportTicketFormData {
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'account' | 'project' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ProjectFormData {
  title: string;
  description: string;
  category: string;
  budget_type: 'Fixed' | 'Hourly';
  budget_min?: number;
  budget_max?: number;
  experience_level: 'Entry' | 'Intermediate' | 'Expert';
  estimated_duration: string;
  skills: string[];
}

export interface ProposalFormData {
  project_id: number;
  cover_letter: string;
  proposed_rate: number;
  estimated_duration: string;
}

export interface ReviewFormData {
  target_id: number;
  target_type: 'freelancer' | 'client';
  contract_id: number;
  rating: number;
  comment: string;
}

// Filter types
export interface ProjectFilters {
  status?: string;
  category?: string;
  budget_min?: number;
  budget_max?: number;
  skills?: string[];
  page?: number;
  page_size?: number;
}

export interface FreelancerFilters {
  skills?: string[];
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  location?: string;
  page?: number;
  page_size?: number;
}

export interface TimeEntryFilters {
  contract_id?: number;
  status?: 'draft' | 'submitted' | 'approved' | 'rejected';
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}

export interface InvoiceFilters {
  status?: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  from_date?: string;
  to_date?: string;
  page?: number;
  page_size?: number;
}
