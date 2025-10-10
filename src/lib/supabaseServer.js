import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const supabaseServer = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options = {}) {
          // Sichere Default-Optionen für Cookies
          const defaultOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 Tage
          };
          
          try {
            cookieStore.set({ 
              name, 
              value, 
              ...defaultOptions, 
              ...options 
            });
          } catch (error) {
            // In Server Components ist cookies().set nicht verfügbar
            console.warn(`Cookie set failed in Server Component context: ${error.message}`);
          }
        },
        remove(name, options = {}) {
          // Sichere Default-Optionen für Cookie-Löschung
          const defaultOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 0, // Sofort ablaufen
          };
          
          try {
            cookieStore.set({ 
              name, 
              value: "", 
              ...defaultOptions, 
              ...options 
            });
          } catch (error) {
            // In Server Components ist cookies().set nicht verfügbar
            console.warn(`Cookie remove failed in Server Component context: ${error.message}`);
          }
        },
      },
    }
  );
};

// Helper for Server Actions that need to set cookies
export const supabaseServerWithCookies = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options = {}) {
          // Sichere Default-Optionen für Cookies in Server Actions
          const defaultOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 Tage
          };
          
          cookieStore.set({ 
            name, 
            value, 
            ...defaultOptions, 
            ...options 
          });
        },
        remove(name, options = {}) {
          // Sichere Default-Optionen für Cookie-Löschung in Server Actions
          const defaultOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 0, // Sofort ablaufen
          };
          
          cookieStore.set({ 
            name, 
            value: "", 
            ...defaultOptions, 
            ...options 
          });
        },
      },
    }
  );
};

/**
 * Helper function to get the appropriate Supabase client based on context
 * @param {string} context - The context: 'server' | 'serverActions' | 'middleware'
 * @returns {Promise<SupabaseClient>} Configured Supabase client
 */
export const getSupabaseClient = async (context = 'server') => {
  switch (context) {
    case 'serverActions':
      return await supabaseServerWithCookies();
    case 'middleware':
      // For middleware, we need to handle cookies differently
      // This would typically be used in middleware.js
      throw new Error('Use createServerClient directly in middleware with request/response cookies');
    case 'server':
    default:
      return await supabaseServer();
  }
};

/**
 * Utility to check if we're in a context where cookies can be modified
 * @returns {boolean} True if cookies can be set/removed
 */
export const canModifyCookies = () => {
  try {
    // Try to access cookies() to see if we're in the right context
    const cookieStore = cookies();
    return cookieStore && typeof cookieStore.set === 'function';
  } catch (error) {
    return false;
  }
};

/**
 * Safe cookie operations with fallback
 * @param {string} operation - 'set' | 'remove'
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value (for set operations)
 * @param {object} options - Cookie options
 */
export const safeCookieOperation = async (operation, name, value = '', options = {}) => {
  if (!canModifyCookies()) {
    console.warn(`Cookie ${operation} operation skipped - not in modifiable context`);
    return false;
  }

  try {
    const cookieStore = await cookies();
    const defaultOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      ...(operation === 'remove' ? { maxAge: 0 } : { maxAge: 60 * 60 * 24 * 7 })
    };

    cookieStore.set({
      name,
      value,
      ...defaultOptions,
      ...options
    });

    return true;
  } catch (error) {
    console.error(`Cookie ${operation} operation failed:`, error.message);
    return false;
  }
};