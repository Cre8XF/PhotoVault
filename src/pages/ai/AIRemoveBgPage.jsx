// ============================================================================
// AIRemoveBgPage - AI Background Removal (Phase 5: Mock)
// ============================================================================
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Scissors } from 'lucide-react';
import useStore from '../../state/store';
import { ROUTES } from '../../routes';
import { PageWrapper } from '../../components/layout/PageWrapper';

export default function AIRemoveBgPage() {
  const navigate = useNavigate();
  const { t } = useTranslation(['ai']);
  const setIsWorldView = useStore((state) => state.setIsWorldView);

  useEffect(() => {
    setIsWorldView(true);
    return () => setIsWorldView(false);
  }, [setIsWorldView]);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <header className="fixed top-0 inset-x-0 z-50 h-14 bg-black/40 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center justify-between px-4 h-full">
            <button
              onClick={() => navigate(ROUTES.AI_TOOLS)}
              className="flex items-center gap-2 text-white hover:bg-white/10 rounded-full p-2 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-white font-semibold">{t('ai:removeBg')}</h1>
            <div className="w-10" />
          </div>
        </header>

        <main className="pt-20 pb-8 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
              <Scissors className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('ai:removeBg')}</h2>
            <p className="text-white/60 mb-6">{t('ai:removeBgDesc')}</p>
            <div className="px-4 py-3 bg-purple-500/20 border border-purple-500/30 rounded-xl">
              <p className="text-sm text-purple-200">{t('ai:mockResult')}</p>
            </div>
          </div>
        </main>
      </div>
    </PageWrapper>
  );
}
