export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Country {
  id: number;
  name: string;
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
  abbreviation: number;
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
  complement?:string,
  main_image:string;
  cover_image?:string;
  content_html?:string;
  additional_info:string;
  contact1_email:string;
  contact2_email?:string;
  number1:string;
  number2?:string;
  number3?:string;
  street_id:number,
  created_at:string;
  updated_at:string;

}

export interface Stocks {
  id: number;
  value: string;
  color: string;
  size?:string;
  quantity:number;
  product_id:string;
  property_id:string;

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
  valor: string;
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