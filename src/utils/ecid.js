// Simulates Adobe Experience Cloud ID (ECID) behavior: a long numeric ID
// generated once per browser and persisted, exactly like the real Adobe
// Identity Service does via the AMCV cookie / Web SDK's own storage. This
// is NOT a real ECID (those are only issued by Adobe's identity service),
// but it's shaped and behaves like one for demo/testing purposes — same
// digit count, same "stays put across sessions" property.

const ECID_KEY = 'meridian_ecid';

function randomDigits(length) {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += Math.floor(Math.random() * 10);
  }
  return out;
}

export function getOrCreateEcid() {
  let ecid = localStorage.getItem(ECID_KEY);
  if (!ecid) {
    // Real ECIDs are typically 19-38 digit numeric strings.
    ecid = randomDigits(19) + randomDigits(19);
    localStorage.setItem(ECID_KEY, ecid);
  }
  return ecid;
}

/**
 * Builds an XDM-shaped identityMap, the same structure the real Adobe Web
 * SDK attaches to every event: a map of identity namespace -> array of
 * { id, primary, authenticatedState }.
 *
 * ECID is always present (device/browser-level identity). Email is added
 * once the person logs in or registers, marked "authenticated" — matching
 * how a real AEP implementation would stitch an anonymous ECID to a known
 * customer identity after login.
 */
export function buildIdentityMap(user) {
  const ecid = getOrCreateEcid();

  const identityMap = {
    ECID: [
      { id: ecid, primary: !user, authenticatedState: 'ambiguous' },
    ],
  };

  if (user?.email) {
    identityMap.Email = [
      { id: user.email, primary: true, authenticatedState: 'authenticated' },
    ];
  }

  if (user?.customerId) {
    identityMap.CRMID = [
      { id: user.customerId, primary: false, authenticatedState: 'authenticated' },
    ];
  }

  return identityMap;
}
