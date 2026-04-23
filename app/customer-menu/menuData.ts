type DietCode = 'D' | 'LF/LC' | 'NAS' | 'R' | 'RS';

type MenuItem = {
  name: string;
  diets: DietCode[];
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

export const menuSections: MenuSection[] = [
  {
    title: 'American Classics',
    items: [
      { name: 'Baked Chicken', diets: ['D', 'LF/LC', 'NAS'] },
      { name: 'Baked Fish Dinner', diets: ['D', 'LF/LC', 'RS'] },
      { name: 'Salmon Meal', diets: ['D', 'NAS', 'R'] },
      { name: 'BBQ Pork Roast Dinner', diets: ['NAS'] },
      { name: 'Chicken Fingers', diets: ['D', 'LF/LC', 'NAS', 'R'] },
      { name: 'Chicken Noodle Soup', diets: ['D', 'LF/LC', 'RS'] },
      { name: 'Chicken Nuggets Meal', diets: ['D', 'LF/LC', 'R'] },
      { name: 'Chicken Pot Pie', diets: ['LF/LC'] },
      { name: 'Chicken Wings', diets: ['D', 'LF/LC'] },
      { name: 'Chili con Carne Meal', diets: ['D', 'LF/LC', 'NAS'] },
      { name: 'Chopped Sirloin Dinner', diets: ['D', 'NAS', 'LF/LC', 'R'] },
      { name: 'Country Fried Chicken Dinner', diets: ['D', 'LF/LC', 'RS', 'R'] },
      { name: 'Country Fried Steak Style', diets: ['D', 'NAS'] },
      { name: 'Crab Cake', diets: ['D', 'NAS', 'LF/LC'] },
      { name: 'Fish Fry Dinner', diets: ['D', 'LF/LC', 'R'] },
      { name: 'Grilled Chicken Breast', diets: ['D', 'LF/LC', 'NAS', 'R'] },
      { name: 'Ham Dinner', diets: ['LF/LC'] },
      { name: 'Honey BBQ Chicken Meal', diets: ['LF/LC', 'NAS'] },
      { name: 'Macaroni & Cheese', diets: ['LF/LC', 'NAS', 'D', 'RS'] },
      { name: 'Meatloaf Dinner', diets: ['NAS', 'LF/LC'] },
      { name: 'Pot Roast Dinner', diets: ['D', 'LF/LC', 'NAS', 'R'] },
      { name: 'Roasted Turkey Meal', diets: ['D', 'LF/LC', 'NAS'] },
      { name: 'Salisbury Steak Style Beef', diets: ['D', 'RS', 'NAS', 'LF/LC'] },
      { name: 'Uncrustable Meal', diets: ['NAS', 'LF/LC', 'R'] },
      { name: 'Western Pork Chop', diets: ['D', 'LF/LC'] },
    ],
  },
  {
    title: 'European Delights',
    items: [
      { name: 'Cheese Ravioli', diets: ['LF/LC', 'NAS'] },
      { name: 'Chicken Alfredo', diets: ['D', 'NAS', 'RS'] },
      { name: 'Chicken and Broccoli', diets: ['D', 'LF/LC', 'NAS'] },
      { name: 'Lasagna Dinner', diets: ['D', 'LF/LC', 'NAS'] },
      { name: 'Country Fried Steak', diets: ['NAS'] },
      { name: 'Meatball Stroganoff Meal', diets: ['NAS'] },
      { name: 'Pasta with Meatballs', diets: ['NAS'] },
      { name: 'Veggie Lasagna', diets: ['LF/LC', 'NAS'] },
    ],
  },
  {
    title: 'Asian Fusion',
    items: [
      { name: "General Tso's Chicken", diets: ['D', 'RS', 'NAS', 'LF/LC', 'R'] },
      { name: 'Pepper Steak', diets: ['D', 'NAS', 'LF/LC'] },
      { name: 'Sweet and Sour Chicken', diets: ['D', 'NAS', 'RS', 'LF/LC', 'R'] },
      { name: 'Tangerine Chicken', diets: ['D', 'NAS', 'RS', 'LF/LC', 'R'] },
      { name: 'Teriyaki Stir Fry Chicken Dinner', diets: ['NAS', 'RS', 'R'] },
    ],
  },
  {
    title: 'Brunch / Breakfast',
    items: [
      { name: 'Biscuits & Gravy', diets: ['D', 'RS', 'LF/LC'] },
      { name: 'Cheese Omelet', diets: ['D', 'LF/LC'] },
      { name: 'Corned Beef Hash Meals', diets: ['D', 'RS'] },
      { name: 'Egg & Cheese Muffin', diets: ['D', 'LF/LC'] },
      { name: 'French Toast Meal', diets: ['D', 'LF/LC', 'RS', 'R'] },
      { name: 'Ham and Cheese Eggs Meal', diets: ['D'] },
      { name: 'Pancakes', diets: ['NAS'] },
      { name: 'Sausage & Cheese Biscuit', diets: ['D'] },
      { name: 'Waffles with Sausage', diets: ['NAS', 'R'] },
    ],
  },
  {
    title: 'Shelf Table',
    items: [
      { name: 'MO Chicken Pasta Parmesan', diets: ['D'] },
      { name: 'MO Chicken Teriyaki', diets: ['LF/LC', 'R'] },
      { name: 'MO Chicken Tikka Masala', diets: ['D', 'LF/LC', 'R'] },
      { name: 'MO Chicken Tinga', diets: ['D', 'LF/LC'] },
      { name: 'MO Pasta Fagioli', diets: ['D', 'LF/LC'] },
    ],
  },
  {
    title: 'Puree Entrées',
    items: [
      { name: 'Puree Baked Ham Meal', diets: ['D', 'LF/LC', 'NAS'] },
      { name: 'Puree Baked Chicken Meal', diets: ['D', 'NAS'] },
      { name: 'Puree Roast Beef', diets: ['D', 'LF/LC', 'NAS'] },
      { name: 'Puree Roast Pork Meal', diets: ['D', 'LF/LC', 'NAS'] },
    ],
  },
  {
    title: 'Latin Cuisine',
    items: [
      { name: 'Arroz con Pollo', diets: ['D', 'LF/LC', 'NAS'] },
      { name: 'Mojo Pork Dinner', diets: ['D', 'NAS', 'LF/LC'] },
      { name: 'Ropa Vieja', diets: ['D', 'LF/LC'] },
      { name: 'Soft Chicken Taco', diets: ['NAS', 'LF/LC'] },
    ],
  },
  {
    title: 'Desserts',
    items: [
      { name: 'Applesauce (Unsweetened)', diets: [] },
      { name: 'Cheddar Goldfish Crackers', diets: [] },
      { name: 'Cinnamon Goldfish Crackers', diets: [] },
      { name: 'Fudge Brownie', diets: [] },
      { name: 'Chocolate Pudding', diets: [] },
      { name: 'Fruit Cup', diets: [] },
      { name: 'Fudge Round', diets: [] },
      { name: 'Nutty Bar', diets: [] },
      { name: 'Oatmeal Cream Cookies', diets: [] },
      { name: 'Oreos', diets: [] },
      { name: 'Rice Krispies', diets: [] },
      { name: 'Sour Orange Raisins', diets: [] },
      { name: 'SUGAR FREE Choc Chip Cookie', diets: [] },
      { name: 'SUGAR FREE Lemon Cookie', diets: [] },
      { name: 'SUGAR FREE Jello', diets: [] },
      { name: 'Sugar Cookies', diets: [] },
      { name: 'Vanilla Goldfish Crackers', diets: [] },
      { name: 'Vanilla Puddings', diets: [] },
    ],
  },
  {
    title: 'Beverages',
    items: [
      { name: '2% Milk', diets: [] },
      { name: 'Apple Juice', diets: [] },
      { name: 'Chocolate Milk', diets: [] },
      { name: 'Cranberry Juice', diets: [] },
      { name: 'Fruit Punch', diets: [] },
      { name: 'Grape Juice', diets: [] },
      { name: 'Orange Juice', diets: [] },
      { name: 'Whole Milk', diets: [] },
    ],
  },
];