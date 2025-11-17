import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Validation schema with proper constraints
const ocorrenciaSchema = z.object({
  nome: z.string().trim().min(3, "Nome deve ter no mínimo 3 caracteres").max(100, "Nome muito longo (máx. 100 caracteres)"),
  telefone: z.string().regex(/^\d{10,11}$/, "Telefone inválido. Use apenas números (10-11 dígitos)"),
  categoria: z.enum(["Calçada", "Escadaria", "Rampa", "Árvore", "Iluminação", "Outro"], {
    errorMap: () => ({ message: "Selecione uma categoria válida" })
  }),
  endereco: z.string().trim().min(10, "Endereço muito curto (mín. 10 caracteres)").max(200, "Endereço muito longo (máx. 200 caracteres)"),
  ponto_referencia: z.string().max(200, "Ponto de referência muito longo (máx. 200 caracteres)").optional(),
  descricao: z.string().trim().min(20, "Descrição muito curta (mín. 20 caracteres)").max(1000, "Descrição muito longa (máx. 1000 caracteres)")
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const NovaOcorrencia = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [categoria, setCategoria] = useState("");
  const [endereco, setEndereco] = useState("");
  const [pontoReferencia, setPontoReferencia] = useState("");
  const [descricao, setDescricao] = useState("");
  const [foto1, setFoto1] = useState<File | null>(null);
  const [foto2, setFoto2] = useState<File | null>(null);
  const [preview1, setPreview1] = useState<string>("");
  const [preview2, setPreview2] = useState<string>("");
  const [acessibilidadeAfetada, setAcessibilidadeAfetada] = useState(false);
  const [publica, setPublica] = useState(true);

  const handleFoto1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Arquivo muito grande",
          description: "A foto deve ter no máximo 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file type
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast({
          title: "Formato inválido",
          description: "Use apenas imagens JPG, PNG ou WEBP.",
          variant: "destructive",
        });
        return;
      }
      
      setFoto1(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview1(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFoto2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Arquivo muito grande",
          description: "A foto deve ter no máximo 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file type
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast({
          title: "Formato inválido",
          description: "Use apenas imagens JPG, PNG ou WEBP.",
          variant: "destructive",
        });
        return;
      }
      
      setFoto2(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview2(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFoto1 = () => {
    setFoto1(null);
    setPreview1("");
  };

  const removeFoto2 = () => {
    setFoto2(null);
    setPreview2("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input with zod schema
    const validationResult = ocorrenciaSchema.safeParse({
      nome,
      telefone,
      categoria,
      endereco,
      ponto_referencia: pontoReferencia || undefined,
      descricao
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        title: "Erro de validação",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    try {
      const fotos = [];
      if (preview1) fotos.push(preview1);
      if (preview2) fotos.push(preview2);

      // Get current user (if authenticated)
      const { data: { user } } = await supabase.auth.getUser();

      // Insert occurrence with new fields
      const { data: occurrenceData, error: occurrenceError } = await supabase
        .from('occurrences')
        .insert({
          nome,
          telefone,
          categoria,
          endereco,
          ponto_referencia: pontoReferencia || null,
          descricao,
          fotos: fotos.length > 0 ? fotos : null,
          user_id: user?.id || null,
          acessibilidade_afetada: acessibilidadeAfetada,
          publica: publica,
        })
        .select('id')
        .single();

      if (occurrenceError) throw occurrenceError;

      // Insert contact information into separate secure table
      const { error: contactError } = await supabase
        .from('occurrence_contacts')
        .insert({
          occurrence_id: occurrenceData.id,
          nome,
          telefone,
        });

      if (contactError) throw contactError;

      toast({
        title: "Ocorrência registrada!",
        description: "Sua ocorrência foi registrada com sucesso.",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Error submitting occurrence:", error);
      toast({
        title: "Erro ao registrar",
        description: "Não foi possível registrar a ocorrência. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">Nova Ocorrência</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24">
        <Card>
          <CardHeader>
            <CardTitle>Registrar Problema</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados de quem está registrando */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    type="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value.replace(/\D/g, ''))}
                    placeholder="11987654321"
                    maxLength={11}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Digite apenas números (10-11 dígitos)
                  </p>
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select value={categoria} onValueChange={setCategoria} required>
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Calçada">Calçada</SelectItem>
                      <SelectItem value="Escadaria">Escadaria</SelectItem>
                      <SelectItem value="Rampa">Rampa</SelectItem>
                      <SelectItem value="Árvore">Árvore</SelectItem>
                      <SelectItem value="Iluminação">Iluminação</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fotos */}
              <div className="space-y-4">
                <Label>Fotos do Problema</Label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Foto 1 */}
                  <div>
                    {preview1 ? (
                      <div className="relative">
                        <img
                          src={preview1}
                          alt="Preview 1"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={removeFoto1}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Foto 1</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFoto1Change}
                        />
                      </label>
                    )}
                  </div>

                  {/* Foto 2 */}
                  <div>
                    {preview2 ? (
                      <div className="relative">
                        <img
                          src={preview2}
                          alt="Preview 2"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={removeFoto2}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Foto 2</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFoto2Change}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Localização */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="endereco">Endereço do Problema *</Label>
                  <Input
                    id="endereco"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Rua, número, bairro"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="ponto-referencia">Ponto de Referência</Label>
                  <Input
                    id="ponto-referencia"
                    value={pontoReferencia}
                    onChange={(e) => setPontoReferencia(e.target.value)}
                    placeholder="Ex: Próximo ao mercado"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <Label htmlFor="descricao">Descrição do Problema *</Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva detalhadamente o problema encontrado"
                  rows={5}
                  required
                />
              </div>

              {/* Additional Options */}
              <div className="space-y-4 p-4 bg-accent rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="acessibilidade">Acessibilidade afetada?</Label>
                    <p className="text-xs text-muted-foreground">
                      Marque se o problema afeta a mobilidade de pessoas com deficiência
                    </p>
                  </div>
                  <input
                    id="acessibilidade"
                    type="checkbox"
                    checked={acessibilidadeAfetada}
                    onChange={(e) => setAcessibilidadeAfetada(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="publica">Tornar ocorrência pública?</Label>
                    <p className="text-xs text-muted-foreground">
                      Permitir que outros cidadãos vejam esta ocorrência
                    </p>
                  </div>
                  <input
                    id="publica"
                    type="checkbox"
                    checked={publica}
                    onChange={(e) => setPublica(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Registrar Ocorrência
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NovaOcorrencia;
