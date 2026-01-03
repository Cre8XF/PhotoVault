// ============================================================================
// AIEnhancePage - AI Photo Enhancement Tool (Phase 5: Mock)
// ============================================================================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Sparkles, Check, X } from 'lucide-react';
import useStore from '../../state/store';
import { ROUTES } from '../../routes';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { enhancePipeline } from '../../ai/aiPipelines';
import { getTransformStyle } from '../../ai/aiTransforms';

export default function AIEnhancePage() {
  const navigate = useNavigate();
  const { t } = useTranslation(['ai', 'common']);
  const { setIsWorldView, photos } = useStore();

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    setIsWorldView(true);
    return () => setIsWorldView(false);
  }, [setIsWorldView]);

  const handlePhotoSelect = (photo) => {
    setSelectedPhoto(photo);
    setResult(null);
    setShowResult(false);
  };

  const handleRunAI = async () => {
    if (!selectedPhoto) return;

    setProcessing(true);
    try {
      const enhanceResult = await enhancePipeline(selectedPhoto);
      setResult(enhanceResult);
      setShowResult(true);
    } catch (error) {
      console.error('AI Enhancement failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = () => {
    // Mock save - would update photo in Firestore in real implementation
    alert(t('ai:saveSuccess'));
    navigate(ROUTES.AI_TOOLS);
  };

  const handleBack = () => {
    navigate(ROUTES.AI_TOOLS);
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Top Bar */}
        <header className="fixed top-0 inset-x-0 z-50 h-14 bg-black/40 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center justify-between px-4 h-full">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-white hover:bg-white/10 rounded-full p-2 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-white font-semibold">{t('ai:enhance')}</h1>
            <div className="w-10" />
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-16 pb-8 px-4">
          {/* Step 1: Photo Selection */}
          {!selectedPhoto && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <Sparkles className="w-12 h-12 text-purple mx-auto mb-3" />
                <h2 className="text-xl font-bold text-white mb-2">
                  {t('ai:selectPhoto')}
                </h2>
                <p className="text-white/60">{t('ai:selectPhotoDesc')}</p>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {photos.slice(0, 12).map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => handlePhotoSelect(photo)}
                    className="relative aspect-square rounded-lg overflow-hidden bg-white/5 hover:ring-2 hover:ring-purple-500 transition"
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Enhancement Process/Result */}
          {selectedPhoto && (
            <div className="max-w-2xl mx-auto">
              {/* Preview */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mb-6">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                  <img
                    src={selectedPhoto.url}
                    alt={selectedPhoto.name}
                    style={showResult && result?.suggestedEdits ? getTransformStyle(result.suggestedEdits) : {}}
                    className="w-full h-full object-contain"
                  />
                  {processing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                      <div className="text-center">
                        <div className="spinner mb-3" />
                        <p className="text-white">{t('ai:processing')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              {!showResult ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
                  >
                    <X className="w-5 h-5 inline mr-2" />
                    {t('common:cancel')}
                  </button>
                  <button
                    onClick={handleRunAI}
                    disabled={processing}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition"
                  >
                    <Sparkles className="w-5 h-5 inline mr-2" />
                    {t('ai:enhance')}
                  </button>
                </div>
              ) : (
                <>
                  {/* Result Details */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mb-4">
                    <h3 className="text-white font-semibold mb-2">{t('ai:changes')}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {result?.suggestedEdits && Object.entries(result.suggestedEdits).map(([key, value]) => (
                        <div key={key} className="flex justify-between px-2 py-1 bg-white/5 rounded">
                          <span className="text-white/60 capitalize">{key}</span>
                          <span className="text-white font-medium">{value > 0 ? '+' : ''}{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Save Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowResult(false)}
                      className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
                    >
                      {t('common:cancel')}
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition"
                    >
                      <Check className="w-5 h-5 inline mr-2" />
                      {t('common:save')}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </PageWrapper>
  );
}
