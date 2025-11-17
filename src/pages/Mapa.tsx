import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Mapa = () => {
  const navigate = useNavigate();

  const ocorrencias: any[] = [];

  const getMarkerColor = (status: string) => {
    switch (status) {
      case "Concluída":
        return "bg-green-500";
      case "Recebida":
      case "Em análise":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Recebida":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Em análise":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Concluída":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
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
          <h1 className="text-lg font-bold">Mapa de Ocorrências</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24">
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span>Pendente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span>Concluída</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mapa Interativo OpenStreetMap */}
        <Card className="overflow-hidden mb-6">
          <CardContent className="p-0">
            <div className="relative w-full h-[500px]">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=-46.9388%2C-23.6239%2C-46.8988%2C-23.5839&layer=mapnik&marker=-23.6039,-46.9188"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                title="Mapa de Cotia - SP"
              />
              
              {/* Marcadores das ocorrências sobrepostos */}
              {ocorrencias.map((occurrence) => (
                <div
                  key={occurrence.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                  style={{
                    left: `${occurrence.coordinates.x}%`,
                    top: `${occurrence.coordinates.y}%`,
                  }}
                >
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full ${getMarkerColor(
                        occurrence.status
                      )} shadow-lg flex items-center justify-center border-2 border-white animate-pulse`}
                    >
                      <MapPin className="w-4 h-4 text-white" fill="currentColor" />
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute top-full mt-2 hidden group-hover:block z-50 w-56 pointer-events-none">
                      <Card className="shadow-xl">
                        <CardContent className="p-3 space-y-2">
                          <div className="font-semibold">{occurrence.type}</div>
                          <Badge className={getStatusColor(occurrence.status)}>
                            {occurrence.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {occurrence.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {occurrence.location}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Ocorrências */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Lista de Ocorrências</h2>
          
          {ocorrencias.map((occurrence) => (
            <Card key={occurrence.id}>
              <CardContent className="p-4 flex items-start gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${getMarkerColor(
                    occurrence.status
                  )} mt-1 flex-shrink-0`}
                ></div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{occurrence.type}</h3>
                    <Badge className={getStatusColor(occurrence.status)}>
                      {occurrence.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {occurrence.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{occurrence.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Mapa;
