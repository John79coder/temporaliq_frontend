// src/api/debugHelpers.ts
export class DebugLogger {
    private static instance: DebugLogger;
    private logs: any[] = [];

    static getInstance(): DebugLogger {
        if (!DebugLogger.instance) {
            DebugLogger.instance = new DebugLogger();
        }
        return DebugLogger.instance;
    }

    logCookieState(context: string) {
        const cookieInfo = {
            timestamp: new Date().toISOString(),
            context,
            documentCookie: document.cookie,
            parsedCookies: this.parseCookies(),
            cookieEnabled: navigator.cookieEnabled,
        };

        console.group(`🍪 [COOKIES] ${context}`);
        console.log('Raw document.cookie:', cookieInfo.documentCookie || '(empty)');
        console.log('Parsed cookies:', cookieInfo.parsedCookies);
        console.log('Cookies enabled:', cookieInfo.cookieEnabled);
        console.groupEnd();

        this.logs.push({ type: 'cookies', ...cookieInfo });
        return cookieInfo;
    }

    private parseCookies(): Record<string, string> {
        const cookies: Record<string, string> = {};
        document.cookie.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name) cookies[name] = value || '';
        });
        return cookies;
    }

    logNetworkRequest(config: any, requestType: string) {
        const requestInfo = {
            timestamp: new Date().toISOString(),
            type: requestType,
            url: config.url,
            method: config.method,
            headers: config.headers,
            withCredentials: config.withCredentials,
            cookies: this.parseCookies(),
        };

        console.group(`📡 [NETWORK REQUEST] ${requestType}`);
        console.log('URL:', requestInfo.url);
        console.log('Method:', requestInfo.method);
        console.log('Headers:', requestInfo.headers);
        console.log('WithCredentials:', requestInfo.withCredentials);
        console.log('Current cookies:', requestInfo.cookies);
        console.groupEnd();

        this.logs.push({ type: 'request', ...requestInfo });
        return requestInfo;
    }

    logNetworkResponse(response: any, requestType: string) {
        const responseInfo = {
            timestamp: new Date().toISOString(),
            type: requestType,
            status: response.status,
            headers: response.headers ? Object.fromEntries(
                response.headers.entries ? response.headers.entries() : Object.entries(response.headers)
            ) : {},
            data: response.data,
            cookiesAfter: this.parseCookies(),
        };

        console.group(`📥 [NETWORK RESPONSE] ${requestType}`);
        console.log('Status:', responseInfo.status);
        console.log('Headers:', responseInfo.headers);
        console.log('Data:', responseInfo.data);
        console.log('Cookies after response:', responseInfo.cookiesAfter);

        if (response.headers) {
            const setCookie = response.headers['set-cookie'] || response.headers.get?.('set-cookie');
            if (setCookie) {
                console.warn('Set-Cookie header detected (may not be accessible):', setCookie);
            }
        }
        console.groupEnd();

        this.logs.push({ type: 'response', ...responseInfo });
        return responseInfo;
    }

    logSessionStorage(context: string) {
        const storageInfo = {
            timestamp: new Date().toISOString(),
            context,
            localStorage: { ...localStorage },
            sessionStorage: { ...sessionStorage },
        };

        console.group(`💾 [STORAGE] ${context}`);
        console.log('LocalStorage:', storageInfo.localStorage);
        console.log('SessionStorage:', storageInfo.sessionStorage);
        console.groupEnd();

        this.logs.push({ type: 'storage', ...storageInfo });
        return storageInfo;
    }

    async testCookiePersistence() {
        console.group('🧪 [COOKIE PERSISTENCE TEST]');
        document.cookie = 'test_cookie=test_value; path=/';
        const afterSet = document.cookie;
        console.log('After setting test_cookie:', afterSet);
        console.log('Test cookie visible?', afterSet.includes('test_cookie'));

        console.log('\nTesting cross-origin cookie behavior...');
        try {
            const response = await fetch('/auth/debug-cookies', {  // Relative path -> Vite proxy
                method: 'GET',
                credentials: 'include',
                headers: { 'Accept': 'application/json' }
            });

            const data = await response.json();
            console.log('Debug endpoint response:', data);
            console.log('Cookies server received:', data.cookies_received);
            console.log('Session data on server:', data.session_data);
        } catch (error) {
            console.error('Debug endpoint failed:', error);
        }
        console.groupEnd();
    }

    exportLogs() {
        return {
            timestamp: new Date().toISOString(),
            logs: this.logs,
            summary: {
                totalRequests: this.logs.filter(l => l.type === 'request').length,
                totalResponses: this.logs.filter(l => l.type === 'response').length,
                cookieStates: this.logs.filter(l => l.type === 'cookies').length,
            }
        };
    }

    clearLogs() {
        this.logs = [];
        console.log('🗑️ Debug logs cleared');
    }
}

export const debugLogger = DebugLogger.getInstance();

if (typeof window !== 'undefined') {
    (window as any).debugLogger = debugLogger;
    console.log('📝 Debug logger available: window.debugLogger');
}
