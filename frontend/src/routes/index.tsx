import { /*BrowserRouter,*/ Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import Dashboard from '../pages/Dashboard';
import CountriesList from '../pages/Locations/Countries/CountriesList';
import CountryFormPage from '../pages/Locations/Countries/CountryFormPage';
import StatesList from '../pages/Locations/States/StatesList';
import StateFormPage from '../pages/Locations/States/StateFormPage';
import CitiesList from '../pages/Locations/Cities/CitiesList';
import CityFormPage from '../pages/Locations/Cities/CityFormPage';
import NeighborhoodsList from '../pages/Locations/Neighborhoods/NeighborhoodsList';
import NeighborhoodFormPage from '../pages/Locations/Neighborhoods/NeighborhoodFormPage';
import StreetsList from '../pages/Locations/Streets/StreetsList';
import PropertyList from '../pages/Property/PropertyList';
import PropertyFormPage from '../pages/Property/PropertyFormPage';
import StreetFormPage from '../pages/Locations/Streets/StreetFormPage';
import Profile from '../pages/Profile';
import Layout from '../components/Layout/Layout';
import LayoutProducts from '../components/Layout/LayoutProducts';
import ProductsWithStocks from '../pages/Products/ProductsWithStocks';

// Dentro do <Routes>

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Carregando...</div>;
  return user ? children : <Navigate to="/login" />;
};

export const AppRoutes = () => {
  return (
    // <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="countries">
            <Route index element={<CountriesList />} />
            <Route path="new" element={<CountryFormPage />} />
            <Route path=":id" element={<CountriesList />} />
            <Route path=":id/edit" element={<CountryFormPage />} />
          </Route>

          <Route path="states">
            <Route index element={<StatesList />} />
            <Route path="new" element={<StateFormPage />} />
            <Route path=":id" element={<StatesList />} />
            <Route path=":id/edit" element={<StateFormPage />} />
          </Route>
          
          <Route path="cities">
            <Route index element={<CitiesList />} />
            <Route path="new" element={<CityFormPage />} />
            <Route path=":id" element={<CitiesList />} />
            <Route path=":id/edit" element={<CityFormPage />} />
          </Route>
          <Route path="neighborhoods">
            <Route index element={<NeighborhoodsList />} />
            <Route path="new" element={<NeighborhoodFormPage />} />
            <Route path=":id" element={<NeighborhoodsList />} />
            <Route path=":id/edit" element={<NeighborhoodFormPage />} />
          </Route>
          <Route path="streets">
            <Route index element={<StreetsList />} />
            <Route path="new" element={<StreetFormPage />} />
            <Route path=":id" element={<StreetsList />} />
            <Route path=":id/edit" element={<StreetFormPage />} />
          </Route>

          <Route path="properties">
            <Route index element={<PropertyList />} />
            <Route path="new" element={<PropertyFormPage />} />
            <Route path=":id" element={<PropertyList />} />
            <Route path=":id/edit" element={<PropertyFormPage />} />
          </Route>
          <Route path="product">
            <Route index element={<LayoutProducts />} />
            <Route path="new" element={<LayoutProducts />} />
            <Route path=":id" element={<LayoutProducts />} />
            <Route path=":id/edit" element={<LayoutProducts />} />
          </Route>


          <Route path="/products" element={<ProductsWithStocks />} />

        </Route>
      </Routes>
    // </BrowserRouter>
  );
};
