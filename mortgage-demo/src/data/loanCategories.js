// Static display content for each loan category. This is demo copy, not
// real rate data.

export const LOAN_CATEGORIES = {
  Home: {
    key: 'Home',
    label: 'Home Loan',
    tagline: 'Finance the place you actually want to live in.',
    rate: '7.45%',
    rateLabel: 'starting from',
    term: 'Up to 30 years',
    maxAmount: '₹1 Crore',
    icon: 'home',
    products: [
      { name: 'Standard Home Loan', description: 'Purchase or construct a primary residence.' },
      { name: 'Home Improvement Loan', description: 'Renovate, extend, or repair an existing home.' },
      { name: 'Balance Transfer', description: 'Move an existing home loan to a lower rate.' },
    ],
    benefits: [
      'No prepayment penalty after 12 months',
      'Doorstep document collection',
      'Rate lock during processing',
      'Dedicated relationship manager',
    ],
  },
  Land: {
    key: 'Land',
    label: 'Land Loan',
    tagline: 'Own the ground first — build on your own timeline.',
    rate: '8.10%',
    rateLabel: 'starting from',
    term: 'Up to 15 years',
    maxAmount: '₹50 Lakh',
    icon: 'terrain',
    products: [
      { name: 'Land Purchase Loan', description: 'Buy residential plots in approved layouts.' },
      { name: 'Agricultural Land Loan', description: 'Acquire farmland with flexible seasonal repayment.' },
      { name: 'Plot Development Loan', description: 'Grade, fence, and service a plot before building.' },
    ],
    benefits: [
      'Repayment aligned to harvest cycles (agricultural)',
      'Simple title verification process',
      'Convert to a construction loan later',
    ],
  },
  Vehicle: {
    key: 'Vehicle',
    label: 'Vehicle Loan',
    tagline: 'From the daily commute to the weekend ride.',
    rate: '8.75%',
    rateLabel: 'starting from',
    term: 'Up to 7 years',
    maxAmount: '₹25 Lakh',
    icon: 'directions_car',
    products: [
      { name: 'Car Loan', description: 'New and certified pre-owned passenger vehicles.' },
      { name: 'Bike Loan', description: 'Two-wheelers, scooters, and motorcycles.' },
      { name: 'EV Loan', description: 'Electric vehicles with a preferential rate.' },
    ],
    benefits: [
      '0.25% rate discount on EV purchases',
      'Same-day in-principle approval',
      'No-cost EMI on select dealer tie-ups',
    ],
  },
  Commercial: {
    key: 'Commercial',
    label: 'Commercial Loan',
    tagline: 'Space for the business you\u2019re already running.',
    rate: '9.20%',
    rateLabel: 'starting from',
    term: 'Up to 20 years',
    maxAmount: '₹5 Crore',
    icon: 'apartment',
    products: [
      { name: 'Office Loan', description: 'Purchase or fit out office space.' },
      { name: 'Retail Property Loan', description: 'Storefronts and retail units.' },
      { name: 'Warehouse Loan', description: 'Storage and light-industrial facilities.' },
    ],
    benefits: [
      'Interest-only period available during fit-out',
      'GST and business vintage flexibility',
      'Co-applicant support for partnerships',
    ],
  },
};

export const CATEGORY_LIST = Object.values(LOAN_CATEGORIES);
