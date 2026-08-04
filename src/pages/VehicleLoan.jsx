import CategoryPage from './CategoryPage';
import { LOAN_CATEGORIES } from '../data/loanCategories';

export default function VehicleLoan() {
  return <CategoryPage category={LOAN_CATEGORIES.Vehicle} />;
}
