// Simple, transparent eligibility rules — intentionally readable so it's
// obvious what to tweak when using this to test different AJO segment
// conditions (e.g. "eligible but didn't apply").

export function evaluateEligibility({ annualIncome, creditScore, existingLoans, loanAmount }) {
  const reasons = [];

  if (annualIncome < 300000) {
    reasons.push('Annual income below ₹3,00,000 minimum.');
  }
  if (creditScore < 650) {
    reasons.push('Credit score below 650 minimum.');
  }
  if (existingLoans >= 3) {
    reasons.push('Too many existing active loans (3 or more).');
  }
  if (loanAmount > annualIncome * 10) {
    reasons.push('Requested amount exceeds 10x annual income.');
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}
