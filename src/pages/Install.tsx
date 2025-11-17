import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Smartphone, Check } from "lucide-react";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center">
      <Card className="max-w-md w-full p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-4">
            <Smartphone className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Instalar Monitore</h1>
          <p className="text-muted-foreground">
            Instale o app na tela inicial do seu celular para acesso rápido e offline
          </p>
        </div>

        {isInstalled ? (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-green-800 dark:text-green-300 text-sm">
                App já instalado! Você pode acessá-lo pela tela inicial.
              </p>
            </div>
            <Button 
              className="w-full" 
              onClick={() => window.location.href = '/'}
            >
              Ir para o App
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {deferredPrompt ? (
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleInstall}
              >
                <Download className="mr-2 w-5 h-5" />
                Instalar App
              </Button>
            ) : (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Como instalar:</p>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <span className="font-bold">iPhone:</span>
                    <span>Toque em "Compartilhar" → "Adicionar à Tela Inicial"</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold">Android:</span>
                    <span>Toque no menu (⋮) → "Instalar app" ou "Adicionar à tela inicial"</span>
                  </div>
                </div>
              </div>
            )}
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/'}
            >
              Continuar no Navegador
            </Button>
          </div>
        )}

        <div className="pt-4 border-t space-y-2">
          <h3 className="font-semibold text-sm">Benefícios do App:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ Acesso rápido pela tela inicial</li>
            <li>✓ Funciona offline</li>
            <li>✓ Notificações de atualizações</li>
            <li>✓ Experiência como app nativo</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default Install;
