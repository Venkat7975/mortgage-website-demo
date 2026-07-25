import CategoryPage from './CategoryPage';
import { LOAN_CATEGORIES } from '../data/loanCategories';

export default function HomeLoan() {
  return <CategoryPage category={LOAN_CATEGORIES.Home} />;
}
