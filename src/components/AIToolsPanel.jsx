// ============================================================================
// components/AIToolsPanel.jsx - AI Verktøy Panel
// ============================================================================
import React, { useState } from "react";
import { 
  Wand2, 
  Scan, 
  ImagePlus, 
  Sparkles, 
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { analyzeImage } from "../utils/googleVision";
import { removeBackground, enhanceImage } from "../utils/picsartAI";
import { updatePhoto } from "../firebase";

const AIToolsPanel = ({ photo, onClose, onUpdate }) => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Auto-tag bilde
  const handleAutoTag = async () => {
    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeImage(photo.url, {
        detectLabels: true,
        detectFaces: true,
        detectSafeSearch: true,
        maxLabels: 10,
      });

      // Oppdater bilde i database
      await updatePhoto(photo.id, {
        aiTags: analysis.labels.map(l => l.name),
        faces: analysis.faces,
        aiAnalyzed: true,
        analyzedAt: new Date().toISOString(),
      });

      setResult({
        type: 'success',
        message: `Fant ${analysis.labels.length} tagger og ${analysis.faces} ansikter`,
        data: analysis,
      });

      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Auto-tag error:', err);
      setError(err.message || 'Feil ved AI-analyse');
    } finally {
      setProcessing(false);
    }
  };

  // Fjern bakgrunn
  const handleRemoveBackground = async () => {
    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const bgResult = await removeBackground(photo.url, {
        format: 'PNG',
        outputType: 'cutout',
      });

      if (!bgResult.success) {
        throw new Error(bgResult.error || 'Bakgrunnsfjerning feilet');
      }

      // Oppdater bilde med ny URL
      await updatePhoto(photo.id, {
        noBgUrl: bgResult.url,
        bgRemoved: true,
        bgRemovedAt: new Date().toISOString(),
      });

      setResult({
        type: 'success',
        message: 'Bakgrunn fjernet!',
        data: { url: bgResult.url },
      });

      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Remove background error:', err);
      setError(err.message || 'Feil ved fjerning av bakgrunn');
    } finally {
      setProcessing(false);
    }
  };

  // Forbedre bildekvalitet
  const handleEnhance = async () => {
    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const enhanceResult = await enhanceImage(photo.url, {
        upscale: 2,
        format: 'JPG',
      });

      if (!enhanceResult.success) {
        throw new Error(enhanceResult.error || 'Forbedring feilet');
      }

      // Oppdater bilde med forbedret versjon
      await updatePhoto(photo.id, {
        enhancedUrl: enhanceResult.url,
        enhanced: true,
        enhancedAt: new Date().toISOString(),
      });

      setResult({
        type: 'success',
        message: 'Bilde forbedret!',
        data: { url: enhanceResult.url },
      });

      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Enhance error:', err);
      setError(err.message || 'Feil ved forbedring');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl max-w-md w-full p-6 animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-purple-400" />
            AI-verktøy
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Bilde preview */}
        <div className="mb-6">
          <img
            src={photo.url}
            alt={photo.name || ''}
            className="w-full h-40 object-contain bg-gray-900 rounded-xl"
          />
          <p className="text-sm opacity-70 mt-2 text-center">
            {photo.name || 'Uten navn'}
          </p>
        </div>

        {/* AI Actions */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleAutoTag}
            disabled={processing}
            className="w-full glass p-4 rounded-xl hover:bg-white/15 transition flex items-center gap-3 disabled:opacity-50"
          >
            <div className="p-2 bg-purple-600/30 rounded-lg">
              <Scan className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium">Auto-tagging</p>
              <p className="text-xs opacity-70">Analyser og legg til tagger</p>
            </div>
            {processing && <Loader2 className="w-5 h-5 animate-spin" />}
          </button>

          <button
            onClick={handleRemoveBackground}
            disabled={processing}
            className="w-full glass p-4 rounded-xl hover:bg-white/15 transition flex items-center gap-3 disabled:opacity-50"
          >
            <div className="p-2 bg-blue-600/30 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium">Fjern bakgrunn</p>
              <p className="text-xs opacity-70">AI bakgrunnsfjerning</p>
            </div>
            {processing && <Loader2 className="w-5 h-5 animate-spin" />}
          </button>

          <button
            onClick={handleEnhance}
            disabled={processing}
            className="w-full glass p-4 rounded-xl hover:bg-white/15 transition flex items-center gap-3 disabled:opacity-50"
          >
            <div className="p-2 bg-pink-600/30 rounded-lg">
              <ImagePlus className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium">Forbedre kvalitet</p>
              <p className="text-xs opacity-70">AI-forbedring</p>
            </div>
            {processing && <Loader2 className="w-5 h-5 animate-spin" />}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <p className="font-medium text-green-400">{result.message}</p>
                {result.data && result.data.labels && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.data.labels.slice(0, 5).map((label, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                      >
                        {label.name} ({label.confidence}%)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <p className="font-medium text-red-400">Feil</p>
                <p className="text-sm opacity-90 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5" />
            <p className="text-xs opacity-70">
              AI-funksjoner bruker eksterne API-er. Gratis tier: 1000 requests/måned.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIToolsPanel;
