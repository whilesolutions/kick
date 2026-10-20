import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  MousePointerClick, 
  ExternalLink, 
  Clock, 
  Lock, 
  RefreshCw, 
  ArrowLeft,
  Filter,
  Users,
  AlertTriangle,
  ShoppingBag
} from 'lucide-react';
import { FunnelMetrics } from '../models/publicInteraction.ts';
import { CampaignConfig } from '../models/campaignConfig.ts';

interface AdminFunnelProps {
  onBackToApp: () => void;
}

export const AdminFunnel: React.FC<AdminFunnelProps> = ({ onBackToApp }) => {
  const [password, setPassword] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<FunnelMetrics | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignConfig[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');

  const fetchMetrics = async (pwdToUse: string, campaignId: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`/api/public/admin/funnel-metrics?campaign=${campaignId}&password=${encodeURIComponent(pwdToUse)}`, {
        headers: {
          'x-admin-password': pwdToUse
        }
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        setAuthError('Contraseña incorrecta');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error('Error al cargar métricas');
      }

      const data = await res.json();
      setMetrics(data.metrics);
      setCampaigns(data.campaigns || []);
      setIsAuthenticated(true);
    } catch (err: any) {
      setAuthError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    fetchMetrics(password, selectedCampaign);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMetrics(password, selectedCampaign);
    }
  }, [selectedCampaign]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-white">Panel de Embudo Meta Ads</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Ingresa la contraseña de administrador para ver las conversiones de Kicks Selector.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Contraseña Admin
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
                autoFocus
              />
              {authError && (
                <p className="text-xs text-red-400 mt-1.5 font-medium">{authError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full min-h-[44px] py-3 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-sm text-white transition-all cursor-pointer shadow-lg shadow-red-600/30 disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Acceder al Embudo'}
            </button>

            <button
              type="button"
              onClick={onBackToApp}
              className="w-full text-xs text-neutral-400 hover:text-white py-2 transition-colors cursor-pointer"
            >
              ← Volver a la App de Selección
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToApp}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-white cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Volver a la selección"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-red-500" />
                <span>Embudo de Conversión (Meta Ads)</span>
              </h1>
              <p className="text-[11px] text-neutral-400">
                Métricas en tiempo real desde Firestore `public_interactions`
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchMetrics(password, selectedCampaign)}
            disabled={loading}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs font-bold text-neutral-200 flex items-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Campaign Filter Pill Selector */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
            <Filter className="w-4 h-4 text-red-500" />
            <span>Filtrar por Campaña:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCampaign('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                selectedCampaign === 'all'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              Todas las campañas
            </button>
            {campaigns.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCampaign(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  selectedCampaign === c.id
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {c.name || c.id}
              </button>
            ))}
          </div>
        </div>

        {/* Global KPIs */}
        {metrics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Sesiones</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {metrics.totalSessions}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                {metrics.pageViews} visualizaciones totales
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Avance Paso 2</span>
                <MousePointerClick className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {metrics.step1ToStep2Rate}%
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                {metrics.step1Selections} elecciones de marca/cat.
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Redirect a Shopify</span>
                <ExternalLink className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                {metrics.shopifyRedirects}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                {metrics.conversionRate}% conversión global
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Tiempos Medios</span>
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-white">
                P1: {(metrics.averageTimeStep1Ms / 1000).toFixed(1)}s • P2: {(metrics.averageTimeStep2Ms / 1000).toFixed(1)}s
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                Decisión ultrarrápida sin fricción
              </div>
            </div>
          </div>
        )}

        {/* Funnel Visual Pipeline */}
        {metrics && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-500" />
              Pipeline del Embudo (4 Pasos Críticos)
            </h3>

            <div className="space-y-4">
              {/* Step 1: Landing */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-neutral-300">1. Entrada desde Anuncio Meta (Page View)</span>
                  <span className="text-white font-mono">{metrics.pageViews} (100%)</span>
                </div>
                <div className="w-full bg-neutral-950 h-6 rounded-xl overflow-hidden border border-neutral-800 p-0.5">
                  <div className="bg-blue-600 h-full rounded-lg transition-all duration-500 w-full" />
                </div>
              </div>

              {/* Step 2: Brand/Category chosen */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-neutral-300">2. Selección de Marca o Categoría (Paso 1 completado)</span>
                  <span className="text-white font-mono">
                    {metrics.step1Selections} ({metrics.step1ToStep2Rate}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-950 h-6 rounded-xl overflow-hidden border border-neutral-800 p-0.5">
                  <div
                    className="bg-amber-500 h-full rounded-lg transition-all duration-500"
                    style={{ width: `${Math.min(metrics.step1ToStep2Rate, 100)}%` }}
                  />
                </div>
              </div>

              {/* Step 3: Product clicked */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-neutral-300">3. Interés en Producto Específico</span>
                  <span className="text-white font-mono">
                    {metrics.step2ProductClicks} ({metrics.step1Selections > 0 ? Math.round((metrics.step2ProductClicks / Math.max(metrics.step1Selections, 1)) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-950 h-6 rounded-xl overflow-hidden border border-neutral-800 p-0.5">
                  <div
                    className="bg-orange-500 h-full rounded-lg transition-all duration-500"
                    style={{
                      width: `${metrics.step1Selections > 0 ? Math.min((metrics.step2ProductClicks / metrics.step1Selections) * 100, 100) : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Step 4: Final Redirect to Shopify */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-neutral-300 font-black flex items-center gap-1.5 text-emerald-400">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    4. Redirección Exitosa a Producto en Shopify (Conversión)
                  </span>
                  <span className="text-emerald-400 font-mono font-black">
                    {metrics.shopifyRedirects} ({metrics.conversionRate}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-950 h-6 rounded-xl overflow-hidden border border-neutral-800 p-0.5">
                  <div
                    className="bg-emerald-500 h-full rounded-lg transition-all duration-500"
                    style={{ width: `${Math.min(metrics.conversionRate, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Performer Breakdowns */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Brands */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5">
              <h4 className="text-sm font-bold text-white mb-3">Top Marcas Más Clickeadas</h4>
              {metrics.topBrands.length === 0 ? (
                <p className="text-xs text-neutral-500">Aún no hay datos de clics por marca.</p>
              ) : (
                <div className="space-y-2">
                  {metrics.topBrands.map((b) => (
                    <div key={b.name} className="flex items-center justify-between text-xs bg-neutral-950 px-3 py-2 rounded-xl border border-neutral-800">
                      <span className="font-bold text-neutral-200">{b.name}</span>
                      <span className="font-mono text-red-400 font-bold">{b.clicks} clics</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Categories */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5">
              <h4 className="text-sm font-bold text-white mb-3">Top Categorías</h4>
              {metrics.topCategories.length === 0 ? (
                <p className="text-xs text-neutral-500">Aún no hay datos de clics por categoría.</p>
              ) : (
                <div className="space-y-2">
                  {metrics.topCategories.map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-xs bg-neutral-950 px-3 py-2 rounded-xl border border-neutral-800">
                      <span className="font-bold text-neutral-200">{c.name}</span>
                      <span className="font-mono text-red-400 font-bold">{c.clicks} clics</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
