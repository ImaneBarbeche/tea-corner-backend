import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { FlavourType } from '../../flavour-type/flavour-type.entity';
import { FlavourProfile } from '../../flavour-profile/flavour-profile.entity';
import { Ingredient } from '../../ingredient/ingredient.entity';
import { IngredientType } from '../../enums/ingredientType.enum';
import { Tea } from '../../tea/tea.entity';
import { TeaStyle } from '../../tea-style/tea-style.entity';
import { TeaIngredient } from '../../ingredient/tea-ingredient.entity';
import { TeaType } from '../../enums/teaType.enum';
import { caffeineLevel } from '../../enums/caffeineLevel.enum';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

async function seedData() {
  // Crée une instance de l'application NestJS
  const app = await NestFactory.createApplicationContext(AppModule);

  // Récupère les repositories
  const flavourTypeRepository = app.get<Repository<FlavourType>>(
    getRepositoryToken(FlavourType),
  );
  const flavourProfileRepository = app.get<Repository<FlavourProfile>>(
    getRepositoryToken(FlavourProfile),
  );

  // FlavourType data
  const flavourTypesData = [
    { name: 'Floral', color: '#F8BBD9' },
    { name: 'Fruity', color: '#FF6347' },
    { name: 'Woody', color: '#8B4513' },
    { name: 'Spicy', color: '#CD853F' },
    { name: 'Herbaceous', color: '#66BB6A' },
    { name: 'Roasted', color: '#795548' },
    { name: 'Sweet', color: '#FFD54F' },
    { name: 'Smoky', color: '#90A4AE' },
    { name: 'Marine', color: '#4FC3F7' },
  ];

  // Insère les FlavourType
  const insertedFlavourTypes: FlavourType[] = [];
  for (const flavourTypeData of flavourTypesData) {
    const existing = await flavourTypeRepository.findOne({
      where: { name: flavourTypeData.name },
    });
    if (!existing) {
      const flavourType = flavourTypeRepository.create(flavourTypeData);
      const inserted = await flavourTypeRepository.save(flavourType);
      insertedFlavourTypes.push(inserted);
      console.log(`Inserted flavour type: ${flavourTypeData.name}`);
    } else {
      insertedFlavourTypes.push(existing);
      console.log(`Flavour type ${flavourTypeData.name} already exists`);
    }
  }

  // Données de test pour FlavourProfile, associées aux FlavourType
  const flavourProfilesData = [
    // Floral
    { name: 'Rose', flavourType: insertedFlavourTypes[0] },
    { name: 'Jasmine', flavourType: insertedFlavourTypes[0] },
    { name: 'Lavender', flavourType: insertedFlavourTypes[0] },
    { name: 'Orchid', flavourType: insertedFlavourTypes[0] },
    { name: 'Orange Blossom', flavourType: insertedFlavourTypes[0] },
    // Fruity
    { name: 'Lemon', flavourType: insertedFlavourTypes[1] },
    { name: 'Peach', flavourType: insertedFlavourTypes[1] },
    { name: 'Raspberry', flavourType: insertedFlavourTypes[1] },
    { name: 'Mango', flavourType: insertedFlavourTypes[1] },
    { name: 'Citrus', flavourType: insertedFlavourTypes[1] },
    { name: 'Lychee', flavourType: insertedFlavourTypes[1] },
    { name: 'Apricot', flavourType: insertedFlavourTypes[1] },
    // Woody
    { name: 'Cedar', flavourType: insertedFlavourTypes[2] },
    { name: 'Oak', flavourType: insertedFlavourTypes[2] },
    { name: 'Forest Floor', flavourType: insertedFlavourTypes[2] },
    { name: 'Moss', flavourType: insertedFlavourTypes[2] },
    // Spicy
    { name: 'Cinnamon', flavourType: insertedFlavourTypes[3] },
    { name: 'Ginger', flavourType: insertedFlavourTypes[3] },
    { name: 'Cardamom', flavourType: insertedFlavourTypes[3] },
    { name: 'Pepper', flavourType: insertedFlavourTypes[3] },
    { name: 'Nutmeg', flavourType: insertedFlavourTypes[3] },
    // Herbaceous
    { name: 'Fresh Grass', flavourType: insertedFlavourTypes[4] },
    { name: 'Hay', flavourType: insertedFlavourTypes[4] },
    { name: 'Bamboo', flavourType: insertedFlavourTypes[4] },
    { name: 'Mint', flavourType: insertedFlavourTypes[4] },
    { name: 'Vegetal', flavourType: insertedFlavourTypes[4] },
    // Roasted
    { name: 'Caramel', flavourType: insertedFlavourTypes[5] },
    { name: 'Hazelnut', flavourType: insertedFlavourTypes[5] },
    { name: 'Malt', flavourType: insertedFlavourTypes[5] },
    { name: 'Chocolate', flavourType: insertedFlavourTypes[5] },
    { name: 'Toast', flavourType: insertedFlavourTypes[5] },
    // Sweet
    { name: 'Honey', flavourType: insertedFlavourTypes[6] },
    { name: 'Vanilla', flavourType: insertedFlavourTypes[6] },
    { name: 'Sugar', flavourType: insertedFlavourTypes[6] },
    // Smoky
    { name: 'Smoke', flavourType: insertedFlavourTypes[7] },
    { name: 'Peat', flavourType: insertedFlavourTypes[7] },
    { name: 'Resinous', flavourType: insertedFlavourTypes[7] },
    // Marine
    { name: 'Umami', flavourType: insertedFlavourTypes[8] },
    { name: 'Iodine', flavourType: insertedFlavourTypes[8] },
    { name: 'Mineral', flavourType: insertedFlavourTypes[8] },
  ];

  // Insère les FlavourProfile
  for (const profileData of flavourProfilesData) {
    const existingProfile = await flavourProfileRepository.findOne({
      where: { name: profileData.name },
    });
    if (!existingProfile) {
      const profile = flavourProfileRepository.create(profileData);
      await flavourProfileRepository.save(profile);
      console.log(`Inserted flavour profile: ${profileData.name}`);
    } else {
      console.log(`Flavour profile ${profileData.name} already exists`);
    }
  }

  // Récupère le repository Ingredient
  const ingredientRepository = app.get<Repository<Ingredient>>(
    getRepositoryToken(Ingredient),
  );

  // System ingredient data (user: null)
  const ingredientsData = [
    // Herb
    { name: 'Mint', type: IngredientType.Herb, color: '#66BB6A' },
    { name: 'Chamomile', type: IngredientType.Herb, color: '#FFF176' },
    { name: 'Verbena', type: IngredientType.Herb, color: '#AED581' },
    { name: 'Lavender', type: IngredientType.Herb, color: '#CE93D8' },
    { name: 'Basil', type: IngredientType.Herb, color: '#388E3C' },
    // Fruit
    { name: 'Lemon', type: IngredientType.Fruit, color: '#FFF176' },
    { name: 'Orange', type: IngredientType.Fruit, color: '#FFA726' },
    { name: 'Raspberry', type: IngredientType.Fruit, color: '#E91E63' },
    { name: 'Mango', type: IngredientType.Fruit, color: '#FFB300' },
    { name: 'Apple', type: IngredientType.Fruit, color: '#EF5350' },
    // Spice
    { name: 'Cinnamon', type: IngredientType.Spice, color: '#A1887F' },
    { name: 'Ginger', type: IngredientType.Spice, color: '#FFD54F' },
    { name: 'Cardamom', type: IngredientType.Spice, color: '#81C784' },
    { name: 'Clove', type: IngredientType.Spice, color: '#6D4C41' },
    { name: 'Vanilla', type: IngredientType.Spice, color: '#F3E5AB' },
    // Sweetener
    { name: 'Honey', type: IngredientType.Sweetener, color: '#FFB300' },
    { name: 'Sugar', type: IngredientType.Sweetener, color: '#FFFFFF' },
    { name: 'Stevia', type: IngredientType.Sweetener, color: '#C8E6C9' },
    { name: 'Agave Syrup', type: IngredientType.Sweetener, color: '#FFE082' },
    // Nut
    { name: 'Almond', type: IngredientType.Nut, color: '#BCAAA4' },
    { name: 'Coconut', type: IngredientType.Nut, color: '#F5F5F5' },
    // Other
    { name: 'Cornflower', type: IngredientType.Other, color: '#5C6BC0' },
    { name: 'Rose', type: IngredientType.Other, color: '#F48FB1' },
    { name: 'Jasmine', type: IngredientType.Other, color: '#FFFDE7' },
  ];

  // Insère les ingrédients
  for (const ingredientData of ingredientsData) {
    const existing = await ingredientRepository.findOne({
      where: { name: ingredientData.name, user: IsNull() },
    });
    if (!existing) {
      const ingredient = ingredientRepository.create(ingredientData);
      await ingredientRepository.save(ingredient);
      console.log(`Inserted ingredient: ${ingredientData.name}`);
    } else {
      console.log(`Ingredient ${ingredientData.name} already exists`);
    }
  }

  // Récupère les repositories Tea
  const teaStyleRepository = app.get<Repository<TeaStyle>>(
    getRepositoryToken(TeaStyle),
  );
  const teaRepository = app.get<Repository<Tea>>(getRepositoryToken(Tea));
  const teaIngredientRepository = app.get<Repository<TeaIngredient>>(
    getRepositoryToken(TeaIngredient),
  );

  // Tea style data
  const teaStylesData = [
    // Green
    {
      name: 'Sencha',
      description:
        'Japanese green tea with needle-shaped leaves, lightly vegetal and umami.',
      color: '#7CB342',
      type: TeaType.Green,
    },
    {
      name: 'Matcha',
      description:
        'Japanese green tea ground into a fine powder, used in the tea ceremony.',
      color: '#8BC34A',
      type: TeaType.Green,
    },
    {
      name: 'Gunpowder',
      description:
        'Chinese green tea with leaves rolled into small pellets, bold in flavour.',
      color: '#9CCC65',
      type: TeaType.Green,
    },
    // Black
    {
      name: 'Orthodox',
      description:
        'Black tea with whole or broken leaves, processed using traditional methods.',
      color: '#4E342E',
      type: TeaType.Black,
    },
    {
      name: 'Earl Grey',
      description:
        'Black tea flavoured with bergamot, an icon of British tea tradition.',
      color: '#5D4037',
      type: TeaType.Black,
    },
    {
      name: 'Darjeeling',
      description:
        'Indian black tea with muscatel notes, known as the champagne of teas.',
      color: '#6D4C41',
      type: TeaType.Black,
    },
    // White
    {
      name: 'Silver Needle',
      description:
        'White tea made exclusively from downy buds, exceptionally delicate.',
      color: '#ECEFF1',
      type: TeaType.White,
    },
    {
      name: 'White Peony',
      description:
        'White tea with buds and young leaves, slightly fuller in body.',
      color: '#CFD8DC',
      type: TeaType.White,
    },
    // Oolong
    {
      name: 'Tieguanyin',
      description:
        'Chinese rolled oolong with floral and buttery aromas, semi-oxidised.',
      color: '#A5D6A7',
      type: TeaType.Oolong,
    },
    {
      name: 'Dan Cong',
      description:
        'Twisted oolong with expressive aromas ranging from floral to fruity.',
      color: '#80CBC4',
      type: TeaType.Oolong,
    },
    // Pu-erh
    {
      name: 'Pressed Pu-erh',
      description: 'Pu-erh compressed into a cake or brick, refined over time.',
      color: '#3E2723',
      type: TeaType.Puerh,
    },
    {
      name: 'Loose Pu-erh',
      description: 'Loose-leaf pu-erh, naturally fermented.',
      color: '#4E342E',
      type: TeaType.Puerh,
    },
    // Herbal
    {
      name: 'Floral Herbal',
      description: 'Infusion of dried flowers, gentle and fragrant.',
      color: '#F48FB1',
      type: TeaType.Herbal,
    },
    {
      name: 'Plant Herbal',
      description: 'Infusion of aromatic herbs, often soothing or digestive.',
      color: '#A5D6A7',
      type: TeaType.Herbal,
    },
    {
      name: 'Fruit Herbal',
      description: 'Infusion of dried fruits and berries, naturally sweet.',
      color: '#FFCC80',
      type: TeaType.Herbal,
    },
    // Yellow
    {
      name: 'Junshan Yinzhen',
      description: 'Rare yellow tea with downy needles, lightly oxidised.',
      color: '#FFF176',
      type: TeaType.Yellow,
    },
    // Dark
    {
      name: 'Liu An',
      description: 'Fermented dark tea, earthy and smooth, ages well.',
      color: '#5D4037',
      type: TeaType.Dark,
    },
  ];

  // Insère les styles
  const insertedTeaStyles: TeaStyle[] = [];
  for (const styleData of teaStylesData) {
    const existing = await teaStyleRepository.findOne({
      where: { name: styleData.name },
    });
    if (!existing) {
      const style = teaStyleRepository.create(styleData);
      const inserted = await teaStyleRepository.save(style);
      insertedTeaStyles.push(inserted);
      console.log(`Inserted tea style: ${styleData.name}`);
    } else {
      insertedTeaStyles.push(existing);
      console.log(`Tea style ${styleData.name} already exists`);
    }
  }

  // Helper pour retrouver un style par nom
  const style = (name: string) =>
    insertedTeaStyles.find((s) => s.name === name)!;

  // System tea data
  const teasData = [
    // Green teas
    {
      name: 'Sencha',
      type: TeaType.Green,
      style: style('Sencha'),
      description:
        'Classic Japanese green tea with vegetal and umami notes. Harvested in spring, an ideal introduction to Japanese green teas.',
      custom_color: '#7CB342',
      custom_brew_color: '#C5E1A5',
      instructions:
        'Steep at 70-75°C for 1 to 2 minutes. Avoid boiling water, which would make the tea bitter.',
      brewing_time: 90,
      brewing_temperature: 72,
      leaf_amount: 3,
      water_amount: 200,
      caffeine_level: caffeineLevel.Medium,
      source: 'Japan / Shizuoka',
      is_public: true,
    },
    {
      name: 'Ceremonial Matcha',
      type: TeaType.Green,
      style: style('Matcha'),
      description:
        'Ceremonial grade Japanese green tea powder, used in the chado tradition. Intense umami flavour with a pleasant bitterness.',
      custom_color: '#558B2F',
      custom_brew_color: '#AED581',
      instructions:
        'Sift 1.5g of matcha into a bowl. Add 70ml of water at 75°C. Whisk in a zigzag motion with a chasen until a foam forms.',
      brewing_time: 60,
      brewing_temperature: 75,
      leaf_amount: 2,
      water_amount: 70,
      caffeine_level: caffeineLevel.High,
      source: 'Japan / Uji',
      is_public: true,
    },
    // Black teas
    {
      name: 'Earl Grey',
      type: TeaType.Black,
      style: style('Earl Grey'),
      description:
        'Black tea flavoured with bergamot essential oil. Floral and citrusy character, an icon of British tea culture.',
      custom_color: '#4E342E',
      custom_brew_color: '#A1887F',
      instructions:
        'Steep at 95°C for 3 to 4 minutes. Enjoy plain or with a splash of milk.',
      brewing_time: 210,
      brewing_temperature: 95,
      leaf_amount: 3,
      water_amount: 250,
      caffeine_level: caffeineLevel.High,
      source: 'India / Sri Lanka',
      is_public: true,
    },
    {
      name: 'Darjeeling First Flush',
      type: TeaType.Black,
      style: style('Darjeeling'),
      description:
        'First spring harvest from Darjeeling. Delicate muscatel and floral notes, with a light and clear liquor.',
      custom_color: '#795548',
      custom_brew_color: '#D7CCC8',
      instructions:
        'Steep at 90°C for 3 minutes. Avoid over-steeping to preserve the delicate aromatics.',
      brewing_time: 180,
      brewing_temperature: 90,
      leaf_amount: 3,
      water_amount: 250,
      caffeine_level: caffeineLevel.Medium,
      source: 'India / Darjeeling',
      is_public: true,
    },
    {
      name: 'Masala Chai',
      type: TeaType.Black,
      style: style('Orthodox'),
      description:
        'Spiced Indian black tea, a traditional preparation from the subcontinent. Warming and aromatic, typically made with milk.',
      custom_color: '#BF360C',
      custom_brew_color: '#FFAB91',
      instructions:
        'Simmer the tea with spices in a 50/50 water and milk blend for 5 minutes. Sweeten to taste.',
      brewing_time: 300,
      brewing_temperature: 100,
      leaf_amount: 4,
      water_amount: 300,
      caffeine_level: caffeineLevel.High,
      source: 'India / Assam',
      is_public: true,
    },
    // White tea
    {
      name: 'Silver Needle',
      type: TeaType.White,
      style: style('Silver Needle'),
      description:
        'The most prized of white teas, made exclusively from downy buds. Soft, honeyed flavour with a delicate floral finish.',
      custom_color: '#ECEFF1',
      custom_brew_color: '#F5F5F5',
      instructions:
        'Steep at 75°C for 3 to 5 minutes. Multiple infusions are possible, each revealing new aromas.',
      brewing_time: 240,
      brewing_temperature: 75,
      leaf_amount: 4,
      water_amount: 200,
      caffeine_level: caffeineLevel.Low,
      source: 'China / Fujian',
      is_public: true,
    },
    // Oolong
    {
      name: 'Tieguanyin',
      type: TeaType.Oolong,
      style: style('Tieguanyin'),
      description:
        'Fujian province oolong with intense floral aromas and a buttery texture. Semi-oxidised, sitting between green and black tea.',
      custom_color: '#80CBC4',
      custom_brew_color: '#E0F2F1',
      instructions:
        'Rinse the leaves for 10 seconds. Steep at 90°C for 45 seconds to 1 minute. Repeat for 4 to 6 infusions.',
      brewing_time: 50,
      brewing_temperature: 90,
      leaf_amount: 5,
      water_amount: 150,
      caffeine_level: caffeineLevel.Medium,
      source: 'China / Fujian',
      is_public: true,
    },
    // Pu-erh
    {
      name: 'Pu-erh Shou',
      type: TeaType.Puerh,
      style: style('Pressed Pu-erh'),
      description:
        'Ripe pu-erh with accelerated fermentation. Earthy, forest floor and mushroom notes, with a dark and velvety liquor.',
      custom_color: '#3E2723',
      custom_brew_color: '#4E342E',
      instructions:
        'Rinse twice for 5 seconds each. Steep at 95-100°C. First infusion 20 seconds, increasing gradually.',
      brewing_time: 20,
      brewing_temperature: 98,
      leaf_amount: 6,
      water_amount: 150,
      caffeine_level: caffeineLevel.Medium,
      source: 'China / Yunnan',
      is_public: true,
    },
    // Herbal teas
    {
      name: 'Pure Chamomile',
      type: TeaType.Herbal,
      style: style('Floral Herbal'),
      description:
        'Infusion of dried chamomile flowers. Soothing and lightly sweet, ideal in the evening to unwind.',
      custom_color: '#FFF176',
      custom_brew_color: '#FFFDE7',
      instructions:
        'Steep at 90°C for 5 to 7 minutes. Cover while steeping to preserve the aromas.',
      brewing_time: 360,
      brewing_temperature: 90,
      leaf_amount: 3,
      water_amount: 250,
      caffeine_level: caffeineLevel.None,
      source: 'Europe / Organic',
      is_public: true,
    },
    {
      name: 'Mint Lemon',
      type: TeaType.Herbal,
      style: style('Plant Herbal'),
      description:
        'A fresh blend of mint and lemon. Digestive and invigorating, perfect hot or as a cold brew.',
      custom_color: '#66BB6A',
      custom_brew_color: '#E8F5E9',
      instructions:
        'Steep at 90°C for 5 minutes. Excellent as iced tea with a few fresh mint leaves.',
      brewing_time: 300,
      brewing_temperature: 90,
      leaf_amount: 4,
      water_amount: 250,
      caffeine_level: caffeineLevel.None,
      source: 'France / Organic',
      is_public: true,
    },
    {
      name: 'Vanilla Rooibos',
      type: TeaType.Herbal,
      style: style('Plant Herbal'),
      description:
        'South African rooibos flavoured with natural vanilla. Naturally caffeine-free, smooth and lightly sweet.',
      custom_color: '#BF360C',
      custom_brew_color: '#FFAB91',
      instructions:
        'Steep at 95°C for 5 to 8 minutes. Enjoy plain or with milk, hot or cold.',
      brewing_time: 420,
      brewing_temperature: 95,
      leaf_amount: 4,
      water_amount: 250,
      caffeine_level: caffeineLevel.None,
      source: 'South Africa / Cederberg',
      is_public: true,
    },
  ];

  // Insère les thés
  const insertedTeas: Tea[] = [];
  for (const teaData of teasData) {
    const existing = await teaRepository.findOne({
      where: { name: teaData.name, author: IsNull() },
    });
    if (!existing) {
      const tea = teaRepository.create(teaData);
      const inserted = await teaRepository.save(tea);
      insertedTeas.push(inserted);
      console.log(`Inserted tea: ${teaData.name}`);
    } else {
      insertedTeas.push(existing);
      console.log(`Tea ${teaData.name} already exists`);
    }
  }

  // Helper pour retrouver un thé et un ingrédient par nom
  const tea = (name: string) => insertedTeas.find((t) => t.name === name)!;
  const allIngredients = await ingredientRepository.find({
    where: { user: IsNull() },
  });
  const ingredient = (name: string) =>
    allIngredients.find((i) => i.name === name)!;

  // System tea ingredient data
  const teaIngredientsData = [
    // Earl Grey → cornflower (color and aroma)
    {
      tea: tea('Earl Grey'),
      ingredient: ingredient('Cornflower'),
      quantity: 1,
      optional: true,
    },
    // Chaï Masala → spices
    {
      tea: tea('Masala Chai'),
      ingredient: ingredient('Cinnamon'),
      quantity: 2,
      optional: false,
    },
    {
      tea: tea('Masala Chai'),
      ingredient: ingredient('Cardamom'),
      quantity: 1,
      optional: false,
    },
    {
      tea: tea('Masala Chai'),
      ingredient: ingredient('Ginger'),
      quantity: 1,
      optional: false,
    },
    {
      tea: tea('Masala Chai'),
      ingredient: ingredient('Clove'),
      quantity: 1,
      optional: true,
    },
    // Pure Chamomile
    {
      tea: tea('Pure Chamomile'),
      ingredient: ingredient('Chamomile'),
      quantity: 5,
      optional: false,
    },
    // Mint Lemon
    {
      tea: tea('Mint Lemon'),
      ingredient: ingredient('Mint'),
      quantity: 3,
      optional: false,
    },
    {
      tea: tea('Mint Lemon'),
      ingredient: ingredient('Lemon'),
      quantity: 2,
      optional: false,
    },
    // Vanilla Rooibos
    {
      tea: tea('Vanilla Rooibos'),
      ingredient: ingredient('Vanilla'),
      quantity: 1,
      optional: false,
    },
  ];

  // Insère les TeaIngredients
  for (const tiData of teaIngredientsData) {
    if (!tiData.tea || !tiData.ingredient) {
      console.warn(`Skipping tea ingredient: tea or ingredient not found`);
      continue;
    }
    const existing = await teaIngredientRepository.findOne({
      where: {
        tea: { id: tiData.tea.id },
        ingredient: { id: tiData.ingredient.id },
      },
    });
    if (!existing) {
      const ti = teaIngredientRepository.create(tiData);
      await teaIngredientRepository.save(ti);
      console.log(
        `Inserted ingredient ${tiData.ingredient.name} for tea ${tiData.tea.name}`,
      );
    } else {
      console.log(
        `Ingredient ${tiData.ingredient.name} already linked to tea ${tiData.tea.name}`,
      );
    }
  }

  // Ferme l'application
  await app.close();
}

seedData().catch((error) => console.error(error));
