const ANALYTICS_ENDPOINT = 'https://analytics.agnet.top/track';
const PROJECT_NAME = 'biaoshu-web';

type AnalyticsEvent = 'app_open' | 'page_view';

interface AnalyticsIdentity {
  clientId: string;
  clientCreatedAt: string;
}

const LEGACY_CLIENT_ID_KEY = 'analytics_client_id';

let appOpenTracked = false;
let lastTrackedPage = '';
let identityPromise: Promise<AnalyticsIdentity> | null = null;

function getLegacyClientId() {
  try {
    return localStorage.getItem(LEGACY_CLIENT_ID_KEY) || '';
  } catch {
    return '';
  }
}

function getAnalyticsIdentity() {
  if (!identityPromise) {
    identityPromise = Promise.resolve({ clientId: getLegacyClientId(), clientCreatedAt: '' });
  }
  return identityPromise;
}

function getVersion() {
  return import.meta.env.VITE_APP_VERSION || '0.1.0';
}

function getPlatform() {
  return 'web';
}

function sendAnalytics(event: AnalyticsEvent, page = '', payload: Record<string, unknown> = {}) {
  void Promise.all([getVersion(), getAnalyticsIdentity()]).then(([version, identity]) => {
    fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectName: PROJECT_NAME,
        event,
        page,
        version,
        platform: getPlatform(),
        arch: '',
        client_id: identity.clientId,
        client_created_at: identity.clientCreatedAt,
        ...payload,
      }),
    }).catch(() => undefined);
  }).catch(() => undefined);
}

export function trackAppOpen() {
  if (appOpenTracked) return;
  appOpenTracked = true;
  sendAnalytics('app_open');
}

export function trackPageView(page: string) {
  const normalizedPage = page.trim();
  if (!normalizedPage || normalizedPage === lastTrackedPage) return;
  lastTrackedPage = normalizedPage;
  sendAnalytics('page_view', normalizedPage);
}

export function trackConfigUsage() {
  // 占位函数，后续按需启用
}

export function trackResourceClick() {
  // 占位函数，后续按需启用
}