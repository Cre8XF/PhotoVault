// ============================================================================
// Route Map - Centralized route definitions for Pixtr
// ============================================================================

export const ROUTES = {
  HOME: '/',
  TOOLS: '/tools',
  COLLAGE_TEMPLATES: '/tools/collage/templates',
  COLLAGE_NEW: '/tools/collage/new',
  COLLAGE_EDIT: '/tools/collage/edit/:id',
  PHOTO: '/photo/:id',
  SLIDESHOW: '/slideshow/:id',
  EDITOR: '/editor/:id',
};

// Helper function to generate route with params
export const generateRoute = (route, params = {}) => {
  let path = route;
  Object.keys(params).forEach((key) => {
    path = path.replace(`:${key}`, params[key]);
  });
  return path;
};
