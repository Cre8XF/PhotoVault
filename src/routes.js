// ============================================================================
// Route Map - Centralized route definitions for Pixtr
// ============================================================================

export const ROUTES = {
  HOME: '/',              // Photo Library (SearchPage)
  LANDING: '/landing',    // Public LandingPage
  DISCOVER: '/discover',  // HomeDashboard (optional, not in nav)
  TOOLS: '/tools',
  COLLAGE_TEMPLATES: '/tools/collage/templates',
  COLLAGE_NEW: '/tools/collage/new',
  COLLAGE_EDIT: '/tools/collage/edit/:id',
  PHOTO: '/photo/:id',
  SLIDESHOW: '/slideshow/:id',
  // Phase 5: AI Tools World
  AI_TOOLS: '/tools/ai',
  AI_ENHANCE: '/tools/ai/enhance',
  AI_REMOVE_BG: '/tools/ai/remove-bg',
  AI_PORTRAIT: '/tools/ai/portrait',
  AI_COLOR: '/tools/ai/color',
  AI_UPSCALE: '/tools/ai/upscale',
};

// Helper function to generate route with params
export const generateRoute = (route, params = {}) => {
  let path = route;
  Object.keys(params).forEach((key) => {
    path = path.replace(`:${key}`, params[key]);
  });
  return path;
};
