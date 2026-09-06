import api from './axios';

// Countries
// api/location.ts
export const getCountries = (params?: { page?: number; per_page?: number }) => {
  return api.get('/api/auth/location/countries', { params });
};

export const createCountry = (data: any) => api.post('/api/auth/location/countries', data);
export const getCountry = (id: number) => api.get(`/api/auth/location/countries/${id}`);
export const updateCountry = (id: number, data: any) => api.put(`/api/auth/location/countries/${id}`, data);
export const deleteCountry = (id: number) => api.delete(`/api/auth/location/countries/${id}`);

// States (aninhado em country)
export const getStates = (params?: { page?: number; per_page?: number }) => {
  return api.get('/api/auth/location/states', { params });
};

export const createState = (countryId: number, data: any) =>
  api.post(`/api/auth/location/states`, data);
export const getState = (stateId: number) =>
  api.get(`/api/auth/location/states/${stateId}`);
export const updateState = (countryId: number, stateId: number, data: any) =>
  api.put(`/api/auth/location/countries/${countryId}/states/${stateId}`, data);
export const deleteState = (countryId: number, stateId: number) =>
  api.delete(`/api/auth/location/countries/${countryId}/states/${stateId}`);

// Cities (aninhado em state)

export const getCities = (params?: { page?: number; per_page?: number }) => {
  return api.get('/api/auth/location/cities', { params });
};
export const createCity = (data: any) =>
  api.post(`/api/auth/location/cities`, data);
export const getCity = (cityId: number) =>
  api.get(`/api/auth/location/cities/${cityId}`);
export const updateCity = (cityId: number, data: any) =>
  api.put(`/api/auth/location/${cityId}`, data);
export const deleteCity = (cityId: number) =>
  api.delete(`/api/auth/location/cities/${cityId}`);

// Neighborhoods

export const getNeighborhoods = (params?: { page?: number; per_page?: number }) => {
  return api.get('/api/auth/location/neighborhoods', { params });
};
export const createNeighborhood = (data: any) => api.post('/api/auth/location/neighborhoods', data);
export const getNeighborhood = (id: number) => api.get(`/api/auth/location/neighborhoods/${id}`);
export const updateNeighborhood = (id: number, data: any) => api.put(`/api/auth/location/neighborhoods/${id}`, data);
export const deleteNeighborhood = (id: number) => api.delete(`/api/auth/location/neighborhoods/${id}`);

// Streets
export const getStreets = (params?: { page?: number; per_page?: number }) => {
  return api.get('/api/auth/location/streets', { params });
};
export const createStreet = (data: any) => api.post('/api/auth/location/streets', data);
export const getStreet = (id: number) => api.get(`/api/auth/location/streets/${id}`);
export const updateStreet = (id: number, data: any) => api.put(`/api/auth/location/streets/${id}`, data);
export const deleteStreet = (id: number) => api.delete(`/api/auth/location/streets/${id}`);
 
// Products

export const getProperties = () => api.get('/api/auth/properties/');
export const createProperty = (data: any) => api.post('/api/auth/properties', data);
export const getProperty = (id: number) => api.get(`/api/auth/properties/${id}`);
export const updateProperty = (id: number, data: any) => api.put(`/api/auth/properties/${id}`, data);
export const deleteProperty = (id: number) => api.delete(`/api/auth/properties/${id}`);

// Produtos (rotas corretas com plural)
export const getProducts = () => api.get('/api/auth/products');
export const createProduct = (data: any) => api.post('/api/auth/products', data);
export const getProduct = (id: number) => api.get(`/api/auth/products/${id}`);
export const updateProduct = (id: number, data: any) => api.put(`/api/auth/products/${id}`, data);
export const deleteProduct = (id: number) => api.delete(`/api/auth/products/${id}`);

// Estoques (rotas corretas)
export const getStocks = (productId: number) => api.get(`/api/auth/products/${productId}/stocks`);
export const createStock = (productId: number, data: any) => api.post(`/api/auth/products/${productId}/stocks`, data);
export const getStock = (productId: number, stockId: number) => api.get(`/api/auth/products/${productId}/stocks/${stockId}`);
export const updateStock = (productId: number, stockId: number, data: any) => api.put(`/api/auth/products/${productId}/stocks/${stockId}`, data);
export const deleteStock = (productId: number, stockId: number) => api.delete(`/api/auth/products/${productId}/stocks/${stockId}`);



// Streets by city (aninhado)
export const getStreetsByCity = (countryId: number, stateId: number, cityId: number) =>
  api.get(`/api/auth/location/countries/${countryId}/states/${stateId}/cities/${cityId}/streets`);
export const createStreetInCity = (countryId: number, stateId: number, cityId: number, data: any) =>
  api.post(`/api/auth/location/countries/${countryId}/states/${stateId}/cities/${cityId}/streets`, data);
