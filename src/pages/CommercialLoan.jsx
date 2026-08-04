import CategoryPage from './CategoryPage';
import { LOAN_CATEGORIES } from '../data/loanCategories';

export default function CommercialLoan() {
  return <CategoryPage category={LOAN_CATEGORIES.Commercial} />;
}
