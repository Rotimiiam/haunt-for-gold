/**
 * Analytics Integration for Haunt For Gold
 * Tracks game events and sends them to the analytics service
 */

class GameAnalytics {
  constructor() {
    // Use production analytics URL or fallback to localhost
    this.analyticsUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3002' 
      : 'https://dash.rotimi.name.ng';
    
    this.sessionId = this.getOrCreateSessionId();
    this.userId = null;
    this.currentGameId = null;
    this.pageLoadTime = Date.now();
  }

  /**
   * Get or create a unique session ID
   */
  getOrCreateSessionId() {
    const storageKey = 'haunt_analytics_session';
    let sessionId = sessionStorage.getItem(storageKey);
    
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      sessionStorage.setItem(storageKey, sessionId);
    }
    
    return sessionId;
  }

  /**
   * Send analytics event (fail silently if analytics service is down)
   */
  async send(endpoint, data = {}) {
    try {
      const response = await fetch(`${this.analyticsUrl}/api/analytics${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          userId: this.userId,
          ...data
        })
      });
      
      if (!response.ok) {
        console.debug('Analytics request failed:', response.status);
      }
    } catch (error) {
      // Silently fail - don't disrupt the game
      console.debug('Analytics error:', error.message);
    }
  }

  /**
   * Track page visit
   */
  trackVisit(page = 'home') {
    this.send('/visit', {
      page,
      userAgent: navigator.userAgent,
      referrer: document.referrer
    });
  }

  /**
   * Track game start
   */
  trackGameStart(gameMode) {
    this.currentGameId = `game_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    this.send('/game/start', {
      gameMode, // 'practice', 'online', or 'local'
      gameId: this.currentGameId
    });
  }

  /**
   * Track game end
   */
  trackGameEnd(completed = true, score = null, result = null) {
    if (!this.currentGameId) return;
    
    this.send('/game/end', {
      gameId: this.currentGameId,
      completed,
      score,
      result
    });
    
    this.currentGameId = null;
  }

  /**
   * Track page view
   */
  trackPageView(page, path = window.location.pathname) {
    const timeOnPage = Math.floor((Date.now() - this.pageLoadTime) / 1000);
    this.send('/pageview', {
      page,
      path,
      timeOnPage
    });
  }

  /**
   * End session (call on page unload)
   */
  endSession() {
    this.send('/session/end', {});
  }

  /**
   * Set user ID when player logs in or enters name
   */
  setUserId(userId) {
    this.userId = userId;
  }
}

// Initialize analytics
window.gameAnalytics = new GameAnalytics();

// Track initial visit
window.gameAnalytics.trackVisit('home');

// Track session end on page unload
window.addEventListener('beforeunload', () => {
  window.gameAnalytics.endSession();
});

console.log('📊 Analytics tracking initialized');
