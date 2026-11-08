import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProperties, getProperty, deleteProperty } from '../../api/location';
import type { Property } from '../../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, Store, Phone, Mail, Trash2, Edit3 } from 'lucide-react';

const PropertyList = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    try {
      if (id) {
        const response = await getProperty(Number(id));
        const data = response.data.property ?? response.data.propertys ?? response.data.properties ?? response.data;
        setProperties(Array.isArray(data) ? data : [data]);
      } else {
        const response = await getProperties();
        const data = response.data.propertys?.data ?? response.data.properties?.data ?? response.data.data ?? response.data;
        setProperties(Array.isArray(data) ? data : [data]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta propriedade?')) return;
    try {
      await deleteProperty(propertyId);
      setProperties(properties.filter((p) => p.id !== propertyId));
    } catch (err: any) {
      setError('Erro ao excluir propriedade.');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground text-xs">Carregando…</div>;
  if (error) return (
    <div className="flex items-center justify-center h-64">
      <Alert variant="destructive">
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </div>
  );

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 space-y-6">
      <Card className="shadow-card">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
            <h1 className="text-xl font-bold">Minhas Propriedades</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{properties.length}</Badge>
            <Button asChild size="sm" variant="default">
              <Link to="/property/new">
                <Store className="h-3 w-3 mr-1" aria-hidden="true" /> Nova Propriedade
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Card className="shadow-card">
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card">
        <CardContent className="p-0">
          {properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground py-12">
              <p>Nenhuma propriedade cadastrada ainda.</p>
              <Link to="/property/new" className="mt-4 text-primary underline underline-offset-4">
                Cadastrar primeira propriedade
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((property) => (
                <Card key={property.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <span className="font-semibold">{property.name}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                        #{property.n_property}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-[11px] text-muted-foreground">
                      {property.street_id ? 'Endereço vinculado' : 'Endereço pendente'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 pb-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Mail className="h-3 w-3" aria-hidden="true" />
                      {property.contact1_email || 'Sem e-mail'}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Phone className="h-3 w-3" aria-hidden="true" />
                      {property.number1 || 'Sem telefone'}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/property/${property.id}/edit`}>
                          <Edit3 className="h-3 w-3 mr-1" aria-hidden="true" /> Editar
                        </Link>
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(property.id)}>
  <Trash2 className="h-3 w-3 mr-1" aria-hidden="true" /> Excluir
</Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default PropertyList;
