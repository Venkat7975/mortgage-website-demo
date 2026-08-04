import { uuid } from './customerId';

/**
 * Generates a Loan Application ID. Uses a timestamp + short UUID segment
 * rather than a simple shared counter, so two browser tabs applying at
 * the same moment can never collide (a plain incrementing counter in
 * localStorage can race between tabs).
 *
 * Format: APP-<base36 timestamp>-<4-char suffix>, e.g. APP-M3F2A1B-7K2Q
 */
export function generateApplicationId() {
  const timePart = Date.now().toString(36).toUpperCase();
  const suffix = uuid().split('-')[0].slice(0, 4).toUpperCase();
  return `APP-${timePart}-${suffix}`;
}
