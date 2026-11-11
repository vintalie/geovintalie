export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  tipo?: string;
  tipo_nome?: string;
  is_admin?: boolean;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: number;
  name: string;
}

export interface ServiceProvider {
  id: number;
  business_name: string;
}

export interface ServiceListing {
  id: number;
  title: string;
  description?: string | null;
  price: number;
  city?: string | null;
  state?: string | null;
  average_rating: number;
  total_reviews: number;
  category: ServiceCategory | null;
  provider: ServiceProvider;
}

export interface SearchFilters {
  q?: string;
  category_id?: number;
  city?: string;
  state?: string;
  min_rating?: number;
  max_rating?: number;
  min_price?: number;
  max_price?: number;
  limit: number;
  page: number;
}

export interface Country {
  id: number;
  name: string;
  code?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export interface State {
  id: number;
  name: string;
  country_id: number;
  abbreviation: string;
  country_name?: string;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: number;
  name: string;
  state_id: number;
  created_at: string;
  updated_at: string;
}

export interface Neighborhood {
  id: number;
  name: string;
  city_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Street {
  id: number;
  name: string;
  city_id?: number;
  neighborhood_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: number;
  name: string;
  n_property: string;
  complement?: string;
  main_image: string;
  cover_image?: string;
  content_html?: string;
  additional_info: string;
  contact1_email: string;
  contact2_email?: string;
  number1: string;
  number2?: string;
  number3?: string;
  street_id: number;
  created_at: string;
  updated_at: string;
}

export interface Stocks {
  id: number;
  value: string;
  color: string;
  size?: string;
  q_type?: string;
  quantity?: number;
  product_id: number;
  property_id: number;
}

export interface Meta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  links?: { url: string | null; label: string; active: boolean }[];
}

export interface Links {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: Links;
  meta: Meta;
}

export interface Products {
  id: number;
  name: string;
  tipo: string;
  price: string;
  img_main: string;
  img_cover: string;
  html: string;
  disabled: boolean;
  user_id: number;
  property_id: number;
  created_at: string;
  updated_at: string;
  stock?: Stocks[];
}

export interface UserConsent {
  id: number;
  user_id: number;
  purpose: string;
  granted: boolean;
  granted_at?: string | null;
  withdrawn_at?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

export interface Appointment {
  id: number;
  client_id: number;
  provider_id: number;
  date: string;
  time: string;
  status: 'pendente' | 'aceito' | 'confirmado' | 'recusado' | 'concluido' | 'cancelado';
  valor: number | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  client: { id: number; name: string; email: string };
  provider: {
    id: number;
    business_name: string;
    user: { id: number; name: string; email: string };
  };
}

export interface ChatConversation {
  id: number;
  client_id: number;
  provider_id: number;
  appointment_id: number | null;
  created_at: string;
  updated_at: string;
  client: { id: number; name: string; email: string };
  provider: {
    id: number;
    business_name: string;
    user: { id: number; name: string; email: string };
  };
  messages?: ChatMessage[];
  unread_count?: number;
  participant_id?: number;
  participant_name?: string;
  participant_role?: string;
  last_message?: string;
  last_message_at?: string;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  body: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  sender: { id: number; name: string; email: string };
  is_mine?: boolean;
  mine?: boolean;
  sender_name?: string;
  // Anexo de arquivo (Escopo B6) - opcional; mensagem pode conter apenas texto,
  // apenas anexo ou ambos.
  file_name?: string | null;
  file_mime?: string | null;
  file_size?: number | null;
  file_url?: string | null;
  has_attachment?: boolean;
}

export interface Review {
  id: number;
  service_listing_id: number;
  service_provider_id: number;
  evaluator_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  evaluator?: { id: number; name: string; email: string };
  provider?: { id: number; business_name: string };
  reviewer_name?: string;
}
