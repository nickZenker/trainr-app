/**
 * Isolierte E2E-Tests ohne Server-Abhängigkeit
 * Für schnelle Feature-Entwicklung ohne Auth/DB-Probleme
 */

export async function setupIsolatedTest(page) {
  await page.addInitScript(() => {
    // Mock komplette App-Umgebung
    window.mockApp = {
      user: {
        id: 'test-user-id',
        email: 'test@trainr.local',
        name: 'Test User'
      },
      plans: [
        {
          id: 'plan-1',
          name: 'Test Strength Plan',
          goal: 'Test plan for scheduling',
          weeks: 8,
          created_at: new Date().toISOString()
        }
      ],
      stats: {
        totalPlans: 1,
        activePlans: 1
      }
    };
    
    // Mock alle fetch-Calls
    const originalFetch = window.fetch;
    window.fetch = async (url, options) => {
      console.log('[MOCK] Fetch called:', url, options?.method);
      
      // Auth-Check
      if (url.includes('/api/auth-check')) {
        return new Response(JSON.stringify({ 
          success: true, 
          user: window.mockApp.user,
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
      
      // Plans API
      if (url.includes('/api/plans')) {
        if (options?.method === 'GET') {
          return new Response(JSON.stringify(window.mockApp.plans), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        if (options?.method === 'POST') {
          const body = await options.body;
          const input = JSON.parse(body);
          
          const newPlan = {
            id: `plan-${Date.now()}`,
            name: input.name,
            goal: input.goal,
            weeks: input.weeks || null,
            created_at: new Date().toISOString()
          };
          
          window.mockApp.plans.push(newPlan);
          window.mockApp.stats.totalPlans++;
          
          return new Response(JSON.stringify(newPlan), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      
      // Fallback
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    };
    
    // Mock localStorage
    window.localStorage.setItem('sb-trainr-auth-token', JSON.stringify({
      access_token: 'mock-token',
      user: window.mockApp.user,
      expires_at: Date.now() + 3600000
    }));
  });
}

export async function createMockPage(page) {
  await setupIsolatedTest(page);
  
  // Erstelle Mock-HTML für Plans-Seite
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Trainr - Plans</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #1a1a1a; color: #fff; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { color: #00ff88; margin-bottom: 20px; }
        .form { background: #2a2a2a; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        input, select, textarea { width: 100%; padding: 8px; border: 1px solid #444; border-radius: 4px; background: #333; color: #fff; }
        button { background: #00ff88; color: #000; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #00cc6a; }
        .plan-card { background: #2a2a2a; padding: 20px; border-radius: 8px; margin-bottom: 10px; }
        .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }
        .stat-card { background: #2a2a2a; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; color: #00ff88; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Trainingspläne</h1>
        
        <div class="stats">
          <div class="stat-card">
            <h3>Gesamt</h3>
            <div class="stat-value" id="total-plans">1</div>
          </div>
          <div class="stat-card">
            <h3>Aktiv</h3>
            <div class="stat-value" id="active-plans">1</div>
          </div>
        </div>
        
        <div class="form">
          <h2>Neuen Plan erstellen</h2>
          <form id="create-plan-form" data-testid="plan-create-form">
            <div class="form-group">
              <input type="text" name="name" data-testid="plan-name-input" placeholder="Planname" required>
            </div>
            <div class="form-group">
              <select name="type" data-testid="plan-type-select">
                <option value="" disabled>Typ wählen</option>
                <option value="strength">Strength</option>
                <option value="endurance">Endurance</option>
              </select>
            </div>
            <div class="form-group">
              <textarea name="goal" data-testid="plan-goal-input" placeholder="Ziel" required></textarea>
            </div>
            <div class="form-group">
              <input type="number" name="weeks" data-testid="plan-weeks-input" min="1" max="52" value="8">
            </div>
            <button type="submit" data-testid="plan-submit">Plan anlegen</button>
          </form>
          <div id="plan-error" data-testid="plan-error" style="display: none;" class="error-message"></div>
        </div>
        
        <div id="plans-list">
          <div class="plan-card">
            <h3>Test Strength Plan</h3>
            <p>Test plan for scheduling</p>
            <small>Erstellt: ${new Date().toLocaleDateString('de-DE')}</small>
          </div>
        </div>
      </div>
      
      <script>
        // Mock Form Submission
        document.getElementById('create-plan-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const formData = new FormData(e.target);
          const planData = {
            name: formData.get('name'),
            type: formData.get('type'),
            goal: formData.get('goal'),
            weeks: formData.get('weeks')
          };
          
          console.log('[MOCK] Creating plan:', planData);
          
          // Validation
          const errorDiv = document.getElementById('plan-error');
          if (!planData.name) {
            errorDiv.textContent = 'Name ist erforderlich';
            errorDiv.style.display = 'block';
            return;
          }
          if (!planData.goal) {
            errorDiv.textContent = 'Ziel ist erforderlich';
            errorDiv.style.display = 'block';
            return;
          }
          if (!planData.weeks || planData.weeks < 1 || planData.weeks > 52) {
            errorDiv.textContent = 'Wochen muss 1–52 sein';
            errorDiv.style.display = 'block';
            return;
          }
          
          // Hide error
          errorDiv.style.display = 'none';
          
          // Simuliere Plan-Erstellung
          const newPlan = {
            id: 'plan-' + Date.now(),
            name: planData.name,
            goal: planData.goal,
            weeks: planData.weeks,
            created_at: new Date().toISOString()
          };
          
          // Update Stats
          document.getElementById('total-plans').textContent = '2';
          document.getElementById('active-plans').textContent = '2';
          
          // Add to list
          const plansList = document.getElementById('plans-list');
          const newPlanCard = document.createElement('div');
          newPlanCard.className = 'plan-card';
          newPlanCard.innerHTML = \`
            <h3>\${newPlan.name}</h3>
            <p>\${newPlan.goal || 'Kein Ziel definiert'}</p>
            <small>Erstellt: \${new Date().toLocaleDateString('de-DE')}</small>
          \`;
          plansList.appendChild(newPlanCard);
          
          // Clear form
          e.target.reset();
          
          // Simuliere Redirect zu Schedule-Seite
          setTimeout(() => {
            window.location.href = '/app/plans/' + newPlan.id + '/schedule';
          }, 1000);
        });
      </script>
    </body>
    </html>
  `);
}
