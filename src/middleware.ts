// Temporarily disabled middleware to keep existing routes working
// import createMiddleware from 'next-intl/middleware';
// import {locales} from './config/locales';

// export default createMiddleware({
//   locales,
//   defaultLocale: 'en',
//   localePrefix: 'never'
// });

export const config = {
  matcher: []  // Disable middleware for now
};
