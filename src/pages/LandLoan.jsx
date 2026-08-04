import CategoryPage from './CategoryPage';
import { LOAN_CATEGORIES } from '../data/loanCategories';

export default function LandLoan() {
  return <CategoryPage category={LOAN_CATEGORIES.Land} />;
}
