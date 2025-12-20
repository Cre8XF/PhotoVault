// ============================================================================
// AIToolsPage - Main Hub for AI Tools (Phase 5)
// ============================================================================
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Sparkles, Scissors, User, Palette, Maximize2, Zap } from 'lucide-react';
import useStore from '../../state/store';
import { ROUTES } from '../../routes';
import { PageWrapper } from '../../components/layout/PageWrapper';

export default function AIToolsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation(['ai', 'common']);
  const setIsWorldView = useStore((state) => state.setIsWorldView);
  const aiMockMode = useStore((state) => state.aiMockMode);

  useEffect(() => {
    setIsWorldView(true);
    return () => {
      setIsWorldView(false);
    };
  }, [setIsWorldView]);

  const aiTools = [
    {
      id: 'enhance',
      name: t('ai:enhance'),
      description: t('ai:enhanceDesc'),
      icon: Sparkles,
      route: ROUTES.AI_ENHANCE,
      active: true,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'removeBg',
      name: t('ai:removeBg'),
      description: t('ai:removeBgDesc'),
      icon: Scissors,
      route: ROUTES.AI_REMOVE_BG,
      active: true,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'portrait',
      name: t('ai:portrait'),
      description: t('ai:portraitDesc'),
      icon: User,
      route: ROUTES.AI_PORTRAIT,
      active: true,
      color: 'from-pink-500 to-rose-500',
    },
    {
      id: 'color',
      name: t('ai:colorFix'),
      description: t('ai:colorFixDesc'),
      icon: Palette,
      route: ROUTES.AI_COLOR,
      active: true,
      color: 'from-orange-500 to-yellow-500',
    },
    {
      id: 'upscale',
      name: t('ai:upscale'),
      description: t('ai:upscaleDesc'),
      icon: Maximize2,
      route: ROUTES.AI_UPSCALE,
      active: true,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const handleToolClick = (tool) => {
    if (!tool.active) {
      // Coming soon toast
      return;
    }
    navigate(tool.route);
  };

  const handleBack = () => {
    navigate(ROUTES.TOOLS, { replace: true });
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Light mode overlay */}
        <div
          className="min-h-screen"
          style={{
            background: 'inherit'
          }}
        >
          <style>{`
            body.light-mode .ai-tools-hero-bg {
              background: linear-gradient(to bottom right, #f8fafc, #ede9fe, #f8fafc) !important;
            }
          `}</style>
          <div className="ai-tools-hero-bg" style={{ minHeight: '100vh' }}>
            {/* Top Bar */}
            <header
              className="fixed top-0 inset-x-0 z-50 h-14 backdrop-blur-md"
              style={{
                backgroundColor: 'var(--glass-bg)',
                borderBottom: '1px solid var(--border-color)'
              }}
            >
              <div className="flex items-center justify-between px-4 h-full">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 rounded-full p-2 transition"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--interactive-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <h1 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('ai:aiTools')}</h1>

                <div className="w-10" /> {/* Spacer */}
              </div>
            </header>

        {/* Main Content */}
        <main className="pt-20 pb-8 px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {t('ai:aiTools')}
            </h2>
            <p className="max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
              {t('ai:aiToolsDesc')}
            </p>
            {aiMockMode && (
              <div className="mt-3 inline-block px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                <p className="text-xs text-yellow-300">
                  {t('ai:mockModeActive')}
                </p>
              </div>
            )}
          </div>

          {/* AI Tools Grid */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool)}
                  className="relative group backdrop-blur-sm rounded-2xl p-6 text-left transition-all hover:scale-105 active:scale-100"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--border-color)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--interactive-hover)'
                    e.currentTarget.style.borderColor = 'var(--glass-border)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface)'
                    e.currentTarget.style.borderColor = 'var(--border-color)'
                  }}
                >
                  {/* Icon with gradient */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Tool Name */}
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {tool.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {tool.description}
                  </p>

                  {/* Coming Soon Badge */}
                  {!tool.active && (
                    <div className="absolute top-4 right-4 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
                      <span className="text-xs text-purple-300 font-medium">
                        {t('ai:comingSoon')}
                      </span>
                    </div>
                  )}

                  {/* Arrow indicator */}
                  {tool.active && (
                    <div className="flex items-center text-sm text-white/40 group-hover:text-white/80 transition">
                      <span>{t('common:open')}</span>
                      <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Info */}
          <div className="mt-8 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {t('ai:aiPowered')}
            </p>
          </div>
        </main>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
