import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, MapPin, Loader2, X, Upload } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

const CATEGORIAS = ['Calçada', 'Escadaria', 'Rampa', 'Árvore', 'Iluminação', 'Outro'];

export default function NewOccurrence() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [endereco, setEndereco] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [acessibilidadeAfetada, setAcessibilidadeAfetada] = useState(false);
  const [publica, setPublica] = useState(true);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A foto deve ter no máximo 5MB",
          variant: "destructive"
        });
        return;
      }
      setFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFoto = () => {
    setFoto(null);
    setFotoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocalização não suportada",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive"
      });
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        // Reverse geocoding (usando nominatim - gratuito)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          if (data.display_name) {
            setEndereco(data.display_name);
          }
        } catch (error) {
          console.error('Erro ao buscar endereço:', error);
          setEndereco(`Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`);
        }

        setGettingLocation(false);
        toast({
          title: "Localização obtida!",
          description: "Coordenadas capturadas com sucesso"
        });
      },
      (error) => {
        setGettingLocation(false);
        toast({
          title: "Erro ao obter localização",
          description: error.message,
          variant: "destructive"
        });
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    if (!foto) {
      toast({
        title: "Foto obrigatória",
        description: "Por favor, adicione uma foto da ocorrência",
        variant: "destructive"
      });
      return;
    }

    if (!descricao.trim()) {
      toast({
        title: "Descrição obrigatória",
        description: "Por favor, descreva a ocorrência",
        variant: "destructive"
      });
      return;
    }

    if (!categoria) {
      toast({
        title: "Categoria obrigatória",
        description: "Por favor, selecione uma categoria",
        variant: "destructive"
      });
      return;
    }

    if (!latitude || !longitude) {
      toast({
        title: "Localização obrigatória",
        description: "Por favor, obtenha a localização ou digite o endereço",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para registrar uma ocorrência",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Upload da foto (simulado - você pode implementar storage depois)
      // Por enquanto, vamos salvar como base64 no array
      const fotoUrl = fotoPreview;

      // Inserir ocorrência
      const { data, error } = await supabase
        .from('occurrences')
        .insert({
          user_id: user.id,
          categoria,
          descricao: descricao.trim(),
          fotos: [fotoUrl],
          latitude,
          longitude,
          endereco: endereco || `${latitude}, ${longitude}`,
          acessibilidade_afetada: acessibilidadeAfetada,
          publica,
          status: 'Recebida',
          prioridade: 'media'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Ocorrência registrada!",
        description: `Sua ocorrência foi registrada com sucesso. ID: ${data.id.slice(0, 8)}`
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erro ao registrar ocorrência:', error);
      toast({
        title: "Erro ao registrar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Nova Ocorrência</CardTitle>
            <CardDescription>
              Registre um problema de manutenção urbana em sua região
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Foto */}
              <div className="space-y-2">
                <Label htmlFor="foto">Foto da Ocorrência *</Label>
                <div className="flex flex-col gap-4">
                  {fotoPreview ? (
                    <div className="relative">
                      <img 
                        src={fotoPreview} 
                        alt="Preview" 
                        className="w-full h-64 object-cover rounded-md border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveFoto}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:border-primary transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Clique para tirar foto ou escolher da galeria
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="foto"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                  {!fotoPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Escolher Foto
                    </Button>
                  )}
                </div>
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="descricao">
                  Descrição * ({descricao.length}/300)
                </Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva o problema encontrado..."
                  value={descricao}
                  onChange={(e) => {
                    if (e.target.value.length <= 300) {
                      setDescricao(e.target.value);
                    }
                  }}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Localização */}
              <div className="space-y-2">
                <Label htmlFor="endereco">Localização *</Label>
                <div className="flex gap-2">
                  <Input
                    id="endereco"
                    placeholder="Digite o endereço ou use GPS"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleGetLocation}
                    disabled={gettingLocation}
                  >
                    {gettingLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {latitude && longitude && (
                  <p className="text-xs text-muted-foreground">
                    Coordenadas: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </p>
                )}
              </div>

              {/* Acessibilidade Afetada */}
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="acessibilidade">Acessibilidade Afetada?</Label>
                  <p className="text-sm text-muted-foreground">
                    Esta ocorrência impede ou dificulta a acessibilidade?
                  </p>
                </div>
                <Switch
                  id="acessibilidade"
                  checked={acessibilidadeAfetada}
                  onCheckedChange={setAcessibilidadeAfetada}
                />
              </div>

              {/* Tornar Pública */}
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="publica">Tornar Pública?</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir que outros cidadãos vejam esta ocorrência
                  </p>
                </div>
                <Switch
                  id="publica"
                  checked={publica}
                  onCheckedChange={setPublica}
                />
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Registrar Ocorrência'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
