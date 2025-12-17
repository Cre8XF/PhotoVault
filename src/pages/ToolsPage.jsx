// ============================================================================
// ToolsPage - Phase 3A: Tools/Create Hub
// ============================================================================
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Video, Sparkles, Wand2, ArrowLeft } from 'lucide-react';
import useStore from '../state/store';
import { ROUTES } from '../routes';

export default function ToolsPage() {
  const setIsWorldView = useStore((state) => state.setIsWorldView);
  const navigate = useNavigate();

  useEffect(() => {
    setIsWorldView(true);
    return () => setIsWorldView(false);
  }, [setIsWorldView]);

  const tools = [
    {
      id: 'collage',
      name: 'Collage',
      description: 'Create beautiful photo collages',
      icon: Layout,
      gradient: 'from-purple-500 to-pink-500',
      available: true,
      onClick: () => navigate(ROUTES.COLLAGE_TEMPLATES),
    },
    {
      id: 'video',
      name: 'Video Story',
      description: 'Turn photos into a video',
      icon: Video,
      gradient: 'from-blue-500 to-cyan-500',
      available: false,
      onClick: null,
    },
    {
      id: 'animation',
      name: 'Animation',
      description: 'Create animated GIFs',
      icon: Wand2,
      gradient: 'from-green-500 to-emerald-500',
      available: false,
      onClick: null,
    },
    {
      id: 'ai-tools',
      name: 'AI Tools',
      description: 'Enhance and transform photos with AI',
      icon: Sparkles,
      gradient: 'from-orange-500 to-red-500',
      available: true, // Phase 5: AI Tools now available
      onClick: () => navigate(ROUTES.AI_TOOLS),
    },
  ];

  const handleBack = () => {
    navigate('/more', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Bar */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 bg-black/40 backdrop-blur-md border-b border-white/10 text-on-glass">
        <div className="flex items-center justify-between px-4 h-full">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 hover:bg-white/10 rounded-full p-2 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="font-semibold">Your tools</h1>

          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pt-20 pb-6">
        <div className="grid grid-cols-1 gap-4 max-w-2xl">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isAvailable = tool.available;

            return (
              <button
                key={tool.id}
                onClick={isAvailable ? tool.onClick : undefined}
                disabled={!isAvailable}
                className={`relative rounded-2xl shadow-md overflow-hidden text-left transition-all ${
                  isAvailable
                    ? 'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                    : 'cursor-not-allowed'
                }`}
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-90`}
                />

                {/* Content */}
                <div className="relative z-10 p-6 text-on-brand">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-8 h-8" />
                        <h2 className="text-2xl font-semibold">{tool.name}</h2>
                      </div>
                      <p className="text-sm opacity-90">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  {/* Coming Soon Badge */}
                  {!isAvailable && (
                    <div className="absolute top-4 right-4 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
                      <span className="text-xs text-purple-300 font-medium">
                        Coming soon
                      </span>
                    </div>
                  )}

                  {/* Decorative Pattern */}
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Info Text */}
        <div className="mt-8 text-center text-sm text-muted-foreground max-w-md mx-auto">
          <p>More creative tools coming soon to help you make the most of your photos.</p>
        </div>
      </main>
    </div>
  );
}
