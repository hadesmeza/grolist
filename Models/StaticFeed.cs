using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GROLIAAS.Models
{
    public static class StaticFeed
    {
        public static string Items
        {
            get { return _items.Replace("\r\n", ""); }
        }
        private static string _items = @"Fresh vegetables |
  Asparagus
, Broccoli 
, Carrots
, Cauliflower
, Celery
, Corn
, Cucumbers
, Lettuce / Greens
, Mushrooms
, Onions
, Peppers
, Potatoes
, Spinach
, Squash
, Zucchini
, Tomatoes*
#
Fresh fruits |
  Apples
, Avocados
, Bananas
, Berries 
, Cherries
, Grapefruit
, Grapes
, Kiwis
, Lemons / Limes
, Melon
, Oranges
, Peaches
, Nectarines
, Pears
, Plums
#
Refrigerated items | Bagels
, Chip dip
, English muffins
, Eggs / Fake eggs
, Fruit juice
, Hummus
, Ready-bake breads
, Tofu
, Tortillas
#
Frozen Breakfasts|
  Burritos
, Fish sticks
, Ice cream / Sorbet
, Juice concentrate
, Pizza / Pizza Rolls
, Popsicles
, Fries / Tater tots
, TV dinners
, Vegetables
, Veggie burgers
#
Condiments / Sauces | BBQ sauce
, Gravy
, Honey
, Hot sauce
, Jam / Jelly / Preserves
, Ketchup / Mustard
, Mayonnaise
, Pasta sauce
, Relish
, Salad dressing
, Salsa
, Soy sauce
, Steak sauce
, Syrup
, Worcestershire sauce
#
Dairy | Butter / Margarine
, Cottage cheese
, Half & half
, Milk
, Sour cream
, Whipped cream
, Yogurt
, Cheese
, Bleu cheese
, Cheddar
, Cottage cheese
, Cream cheese
, Feta
, Goat cheese
, Mozzarella / Provolone
, Parmesan
, Provolone
, Ricotta
, Sandwich slices
, Swiss
#
Meat | Bacon / Sausage
, Beef
, Chicken
, Ground beef / Turkey
, Ham / Pork
, Hot dogs
, Lunchmeat
, Turkey
#
Seafood | Catfish
, Crab
, Lobster
, Mussels
, Oysters
, Salmon
, Shrimp
, Tilapia
, Tuna
#
Beverages | Beer
, Club soda / Tonic
, Champagne
, Gin
, Juice
, Mixers
, Red wine / White wine
, Rum
, Saké
, Soda pop
, Sports drink
, Whiskey
, Vodka
#
Baked goods | Bagels / Croissants
, Buns / Rolls
, Cake / Cookies
, Donuts / Pastries 
, Fresh bread
, Sliced bread
, Pie! Pie! Pie!
, Pita bread
#
Baking | Baking powder / Soda
, Bread crumbs
, Cake / Brownie mix
, Cake icing / Decorations
, Chocolate chips / Cocoa
, Flour
, Shortening
, Sugar
, Sugar substitute
, Yeast
#
Snacks | Candy / Gum
, Cookies
, Crackers
, Dried fruit
, Granola bars / Mix
, Nuts / Seeds
, Oatmeal
, Popcorn
, Potato / Corn chips
, Pretzels
#
Baby stuff | Baby food
, Diapers
, Formula
, Lotion
, Baby wash
, Wipes
#
Pets | Cat food / Treats
, Cat litter
, Dog food / Treats
, Flea treatment
, Pet shampoo
#
Personal care | Antiperspirant / Deodorant
, Bath soap / Hand soap
, Condoms / Other b.c.
, Cosmetics
, Cotton swabs / Balls
, Facial cleanser
, Facial tissue
, Feminine products
, Floss
, Hair gel / Spray
, Lip balm
, Moisturizing lotion
, Mouthwash
, Razors / Shaving cream
, Shampoo / Conditioner
, Sunblock
, Toilet paper
, Toothpaste
, Vitamins / Supplements
#
Medicine | Allergy
, Antibiotic
, Antidiarrheal
, Aspirin
, Antacid
, Band-aids / Medical
, Cold / Flu / Sinus
, Pain reliever
, Prescription pick-up
#
Kitchen |Aluminum foil
, Napkins
, Non-stick spray
, Paper towels
, Plastic wrap
, Sandwich / Freezer bags
, Wax paper
#
Cleaning products | Air freshener
, Bathroom cleaner
, Bleach / Detergent
, Dish / Dishwasher soap
, Garbage bags
, Glass cleaner
, Mop head / Vacuum bags
, Sponges / Scrubbers
#
Office supplies | CDRs / DVDRs
, Notepad / Envelopes
, Glue / Tape
, Printer paper
, Pens / Pencils
, Postage stamps
#
Other stuff | Automotive
, Batteries
, Charcoal / Propane
, Flowers / Greeting card
, Insect repellent
, Light bulbs
, Newspaper / Magazine
, Random impulse buy";
    }
}