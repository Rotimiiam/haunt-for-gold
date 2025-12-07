/**
 * Analytics Client Library for Haunt For Gold
 * 
 * This library provides a simple interface to track analytics events
 * from the main game application to the analytics service.
 * 
 * Usage:
 * const analytics = new AnalyticsClient('http://localhost:3002');
 * await analytics.trackVisit('home');
 */

class AnalyticsClient {
  constructor(baseUrl = 'http://localhost:3002') {
    this.baseUrl = baseUrl;
    this.sessionId = this.getOrCreateSessionId();
    this.userId = null;
    this.currentGameId = null;
  }

  /**
   * Get or create a unique session ID
   */
  getOrCreateSessionId() {
    const storageKey = 'analytics_session_id';
    let sessionId = localStorage.getItem(storageKey);
    
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem(storageKey, sessionId);
    }
    
    return sessionId;
  }

  /**
   * Set the user ID for tracking
   */
  setUserId(userId) {
    this.userId = userId;
  }

  /**
   * Get client information
   */
  getClientInfo() {
    return {
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      ipAddress: null // Will be set by server if needed
    };
  }

  /**
   * Make an API request to the analytics service
   */
  async request(endpoint, data = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          userId: this.userId,
          ...data
        })
      });

      if (!response.ok) {
        console.warn(`Analytics request failed: ${response.status}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      // Silently fail - don't disrupt the main application
      console.warn('Analytics request error:', error.message);
      return null;
    }
  }

  /**
   * Make a GET request to the analytics service
   */
  async get(endpoint, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${this.baseUrl}/api/analytics${endpoint}${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Analytics query failed: ${response.status}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.warn('Analytics query error:', error.message);
      return null;
    }
  }

  /**
   * Track a visit event
   */
  async trackVisit(page = 'home') {
    const clientInfo = this.getClientInfo();
    return await this.request('/visit', {
      ...clientInfo,
      page
    });
  }

  /**
   * Track game start
   */
  async trackGameStart(gameMode, gameId = null) {
    if (!['practice', 'online', 'local'].includes(gameMode)) {
      console.warn('Invalid game mode:', gameMode);
      return null;
    }

    this.currentGameId = gameId || `game_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    return await this.request('/game/start', {
      gameMode,
      gameId: this.currentGameId
    });
  }

  /**
   * Track game end
   */
  async trackGameEnd(gameId = null, completed = true, score = null, result = null) {
    const finalGameId = gameId || this.currentGameId;
    
    const response = await this.request('/game/end', {
      gameId: finalGameId,
      completed,
      score,
      result
    });

    // Clear current game ID if it matches
    if (this.currentGameId === finalGameId) {
      this.currentGameId = null;
    }

    return response;
  }

  /**
   * Track page view
   */
  async trackPageView(page, path = null, timeOnPage = null) {
    return await this.request('/pageview', {
      page,
      path: path || window.location.pathname,
      timeOnPage
    });
  }

  /**
   * End the current session
   */
  async endSession() {
    return await this.request('/session/end', {});
  }

  /**
   * Get total visits
   */
  async getTotalVisits(startDate = null, endDate = null) {
    return await this.get('/visits/total', { startDate, endDate });
  }

  /**
   * Get game mode statistics
   */
  async getGameModeStats(startDate = null, endDate = null) {
    return await this.get('/games/modes', { startDate, endDate });
  }

  /**
   * Get active sessions
   */
  async getActiveSessions() {
    return await this.get('/sessions/active');
  }

  /**
   * Get game completion rates
   */
  async getCompletionRates(gameMode = null, startDate = null, endDate = null) {
    return await this.get('/games/completion', { gameMode, startDate, endDate });
  }

  /**
   * Get page view statistics
   */
  async getPageViews(page = null, startDate = null, endDate = null) {
    return await this.get('/pageviews', { page, startDate, endDate });
  }

  /**
   * Get engagement metrics
   */
  async getEngagement(startDate = null, endDate = null) {
    return await this.get('/engagement', { startDate, endDate });
  }

  /**
   * Get peak usage times
   */
  async getPeakUsage(startDate = null, endDate = null) {
    return await this.get('/peak-usage', { startDate, endDate });
  }

  /**
   * Get comprehensive dashboard data
   */
  async getDashboard(startDate = null, endDate = null) {
    return await this.get('/dashboard', { startDate, endDate });
  }
}

// Auto-initialize and track page load if in browser environment
if (typeof window !== 'undefined') {
  // Initialize analytics client
  window.AnalyticsClient = AnalyticsClient;
  
  // Auto-track initial page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Can be initialized by the main application
      console.log('Analytics client ready');
    });
  }
  
  // Track when user leaves the page
  window.addEventListener('beforeunload', () => {
    // Use sendBeacon for reliable tracking on page unload
    if (window.analyticsClient && navigator.sendBeacon) {
      const data = JSON.stringify({
        sessionId: window.analyticsClient.sessionId,
        userId: window.analyticsClient.userId
      });
      
      navigator.sendBeacon(
        `${window.analyticsClient.baseUrl}/api/analytics/session/end`,
        data
      );
    }
  });
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsClient;
}
