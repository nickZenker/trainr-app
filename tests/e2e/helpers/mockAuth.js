/**
 * Mock Authentication Helper für E2E-Tests
 * Umgeht Auth-Probleme und ermöglicht schnelle Feature-Entwicklung
 */

export async function setupMockAuth(page) {
  // Mock localStorage für Auth-State
  await page.addInitScript(() => {
    // Simuliere erfolgreiche Authentifizierung
    const mockUser = {
      id: 'test-user-id',
      email: 'test@trainr.local',
      user_metadata: { name: 'Test User' }
    };
    
    const mockSession = {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      user: mockUser,
      expires_at: Date.now() + 3600000 // 1 Stunde
    };
    
    // Mock Supabase Auth
    window.localStorage.setItem('sb-trainr-auth-token', JSON.stringify(mockSession));
    
    // Mock fetch für Auth-Calls
    const originalFetch = window.fetch;
    window.fetch = async (url, options) => {
      // Auth-Check Endpoints
      if (url.includes('/api/auth-check') || url.includes('/api/dev/bootstrap')) {
        return new Response(JSON.stringify({ 
          success: true, 
          user: mockUser,
          authenticated: true 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Health Check
      if (url.includes('/api/health')) {
        return new Response(JSON.stringify({ 
          status: 'ok', 
          timestamp: new Date().toISOString() 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Fallback zu original fetch
      return originalFetch(url, options);
    };
  });
}

export async function navigateWithMockAuth(page, url) {
  await setupMockAuth(page);
  await page.goto(url, { waitUntil: 'networkidle' });
}

export async function setupCompleteMockEnvironment(page) {
  await setupMockAuth(page);
  
  // Setup Mock Services direkt hier
  await page.addInitScript(() => {
    // Mock für createPlan Service
    window.mockCreatePlan = async (input) => {
      console.log('[MOCK] createPlan called with:', input);
      
      const mockPlan = {
        id: `plan-${Date.now()}`,
        name: input.name,
        goal: input.description,
        weeks: input.weeks || null,
        created_at: new Date().toISOString()
      };
      
      return {
        success: true,
        message: 'Plan created successfully',
        plan: mockPlan
      };
    };
    
    // Mock für listPlans Service
    window.mockListPlans = async (filter = 'all') => {
      console.log('[MOCK] listPlans called with filter:', filter);
      
      const mockPlans = [
        {
          id: 'plan-1',
          name: 'Test Strength Plan',
          goal: 'Test plan for scheduling',
          weeks: 8,
          created_at: new Date().toISOString()
        }
      ];
      
      return mockPlans;
    };
    
    // Mock für getPlansStats Service
    window.mockGetPlansStats = async () => {
      console.log('[MOCK] getPlansStats called');
      
      return {
        totalPlans: 1,
        activePlans: 1
      };
    };
  });
}
