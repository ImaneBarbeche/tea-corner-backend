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

  // Données de test pour FlavourType
  const flavourTypesData = [
    { name: 'Floral', color: '#F8BBD9' },
    { name: 'Fruité', color: '#FF6347' },
    { name: 'Boisé', color: '#8B4513' },
    { name: 'Épicé', color: '#CD853F' },
    { name: 'Herbacé', color: '#66BB6A' },
    { name: 'Grillé', color: '#795548' },
    { name: 'Doux', color: '#FFD54F' },
    { name: 'Fumé', color: '#90A4AE' },
    { name: 'Marin', color: '#4FC3F7' },
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
    { name: 'Jasmin', flavourType: insertedFlavourTypes[0] },
    { name: 'Lavande', flavourType: insertedFlavourTypes[0] },
    { name: 'Orchidée', flavourType: insertedFlavourTypes[0] },
    { name: 'Fleur d\'oranger', flavourType: insertedFlavourTypes[0] },
    // Fruité
    { name: 'Citron', flavourType: insertedFlavourTypes[1] },
    { name: 'Pêche', flavourType: insertedFlavourTypes[1] },
    { name: 'Framboise', flavourType: insertedFlavourTypes[1] },
    { name: 'Mangue', flavourType: insertedFlavourTypes[1] },
    { name: 'Agrumes', flavourType: insertedFlavourTypes[1] },
    { name: 'Litchi', flavourType: insertedFlavourTypes[1] },
    { name: 'Abricot', flavourType: insertedFlavourTypes[1] },
    // Boisé
    { name: 'Cèdre', flavourType: insertedFlavourTypes[2] },
    { name: 'Chêne', flavourType: insertedFlavourTypes[2] },
    { name: 'Sous-bois', flavourType: insertedFlavourTypes[2] },
    { name: 'Mousse', flavourType: insertedFlavourTypes[2] },
    // Épicé
    { name: 'Cannelle', flavourType: insertedFlavourTypes[3] },
    { name: 'Gingembre', flavourType: insertedFlavourTypes[3] },
    { name: 'Cardamome', flavourType: insertedFlavourTypes[3] },
    { name: 'Poivre', flavourType: insertedFlavourTypes[3] },
    { name: 'Muscade', flavourType: insertedFlavourTypes[3] },
    // Herbacé
    { name: 'Herbe fraîche', flavourType: insertedFlavourTypes[4] },
    { name: 'Foin', flavourType: insertedFlavourTypes[4] },
    { name: 'Bambou', flavourType: insertedFlavourTypes[4] },
    { name: 'Menthe', flavourType: insertedFlavourTypes[4] },
    { name: 'Végétal', flavourType: insertedFlavourTypes[4] },
    // Grillé
    { name: 'Caramel', flavourType: insertedFlavourTypes[5] },
    { name: 'Noisette', flavourType: insertedFlavourTypes[5] },
    { name: 'Malt', flavourType: insertedFlavourTypes[5] },
    { name: 'Chocolat', flavourType: insertedFlavourTypes[5] },
    { name: 'Pain grillé', flavourType: insertedFlavourTypes[5] },
    // Doux
    { name: 'Miel', flavourType: insertedFlavourTypes[6] },
    { name: 'Vanille', flavourType: insertedFlavourTypes[6] },
    { name: 'Sucre', flavourType: insertedFlavourTypes[6] },
    // Fumé
    { name: 'Fumée', flavourType: insertedFlavourTypes[7] },
    { name: 'Tourbe', flavourType: insertedFlavourTypes[7] },
    { name: 'Résineux', flavourType: insertedFlavourTypes[7] },
    // Marin
    { name: 'Umami', flavourType: insertedFlavourTypes[8] },
    { name: 'Iode', flavourType: insertedFlavourTypes[8] },
    { name: 'Minéral', flavourType: insertedFlavourTypes[8] },
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

  // Données pour les ingrédients système (user: null)
  const ingredientsData = [
    // Herb
    { name: 'Menthe', type: IngredientType.Herb, color: '#66BB6A' },
    { name: 'Camomille', type: IngredientType.Herb, color: '#FFF176' },
    { name: 'Verveine', type: IngredientType.Herb, color: '#AED581' },
    { name: 'Lavande', type: IngredientType.Herb, color: '#CE93D8' },
    { name: 'Basilic', type: IngredientType.Herb, color: '#388E3C' },
    // Fruit
    { name: 'Citron', type: IngredientType.Fruit, color: '#FFF176' },
    { name: 'Orange', type: IngredientType.Fruit, color: '#FFA726' },
    { name: 'Framboise', type: IngredientType.Fruit, color: '#E91E63' },
    { name: 'Mangue', type: IngredientType.Fruit, color: '#FFB300' },
    { name: 'Pomme', type: IngredientType.Fruit, color: '#EF5350' },
    // Spice
    { name: 'Cannelle', type: IngredientType.Spice, color: '#A1887F' },
    { name: 'Gingembre', type: IngredientType.Spice, color: '#FFD54F' },
    { name: 'Cardamome', type: IngredientType.Spice, color: '#81C784' },
    { name: 'Clou de girofle', type: IngredientType.Spice, color: '#6D4C41' },
    { name: 'Vanille', type: IngredientType.Spice, color: '#F3E5AB' },
    // Sweetener
    { name: 'Miel', type: IngredientType.Sweetener, color: '#FFB300' },
    { name: 'Sucre', type: IngredientType.Sweetener, color: '#FFFFFF' },
    { name: 'Stevia', type: IngredientType.Sweetener, color: '#C8E6C9' },
    { name: "Sirop d'agave", type: IngredientType.Sweetener, color: '#FFE082' },
    // Nut
    { name: 'Amande', type: IngredientType.Nut, color: '#BCAAA4' },
    { name: 'Noix de coco', type: IngredientType.Nut, color: '#F5F5F5' },
    // Other
    { name: 'Fleur de bleuet', type: IngredientType.Other, color: '#5C6BC0' },
    { name: 'Rose', type: IngredientType.Other, color: '#F48FB1' },
    { name: 'Jasmin', type: IngredientType.Other, color: '#FFFDE7' },
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

  // Données pour les styles de thé
  const teaStylesData = [
    // Green
    { name: 'Sencha', description: 'Thé vert japonais aux feuilles en aiguilles, légèrement végétal et umami.', color: '#7CB342', type: TeaType.Green },
    { name: 'Matcha', description: 'Thé vert japonais réduit en fine poudre, utilisé dans la cérémonie du thé.', color: '#8BC34A', type: TeaType.Green },
    { name: 'Gunpowder', description: 'Thé vert chinois aux feuilles roulées en petites billes, saveur prononcée.', color: '#9CCC65', type: TeaType.Green },
    // Black
    { name: 'Orthodox', description: 'Thé noir aux feuilles entières ou brisées, traitement traditionnel.', color: '#4E342E', type: TeaType.Black },
    { name: 'Earl Grey', description: 'Thé noir aromatisé à la bergamote, emblème de la tradition anglaise.', color: '#5D4037', type: TeaType.Black },
    { name: 'Darjeeling', description: 'Thé noir indien aux arômes muscatés, surnommé le champagne des thés.', color: '#6D4C41', type: TeaType.Black },
    // White
    { name: 'Silver Needle', description: 'Thé blanc constitué uniquement de bourgeons duveteux, très délicat.', color: '#ECEFF1', type: TeaType.White },
    { name: 'White Peony', description: 'Thé blanc aux bourgeons et jeunes feuilles, légèrement plus corsé.', color: '#CFD8DC', type: TeaType.White },
    // Oolong
    { name: 'Tieguanyin', description: 'Oolong roulé chinois aux arômes floraux et beurré, semi-oxydé.', color: '#A5D6A7', type: TeaType.Oolong },
    { name: 'Dan Cong', description: 'Oolong torsadé aux arômes expressifs, du floral au fruité.', color: '#80CBC4', type: TeaType.Oolong },
    // Pu-erh
    { name: 'Pu-erh pressé', description: 'Thé pu-erh compressé en galette ou brique, affiné avec le temps.', color: '#3E2723', type: TeaType.Puerh },
    { name: 'Pu-erh vrac', description: 'Thé pu-erh en feuilles libres, fermenté naturellement.', color: '#4E342E', type: TeaType.Puerh },
    // Herbal
    { name: 'Tisane florale', description: 'Infusion à base de fleurs séchées, douce et parfumée.', color: '#F48FB1', type: TeaType.Herbal },
    { name: 'Tisane de plantes', description: 'Infusion de plantes aromatiques, souvent apaisante ou digestive.', color: '#A5D6A7', type: TeaType.Herbal },
    { name: 'Tisane fruitée', description: 'Infusion aux fruits séchés et baies, naturellement sucrée.', color: '#FFCC80', type: TeaType.Herbal },
    // Yellow
    { name: 'Junshan Yinzhen', description: 'Thé jaune rare aux aiguilles duvetées, légèrement oxydé.', color: '#FFF176', type: TeaType.Yellow },
    // Dark
    { name: 'Liu An', description: 'Thé sombre fermenté, terreux et doux, vieillit bien.', color: '#5D4037', type: TeaType.Dark },
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

  // Données pour les thés système
  const teasData = [
    // Thés verts
    {
      name: 'Sencha',
      type: TeaType.Green,
      style: style('Sencha'),
      description: 'Thé vert japonais classique aux notes végétales et d\'umami. Récolté au printemps, idéal pour s\'initier aux thés verts japonais.',
      custom_color: '#7CB342',
      custom_brew_color: '#C5E1A5',
      instructions: 'Infuser à 70-75°C pendant 1 à 2 minutes. Éviter l\'eau bouillante qui amèrerait le thé.',
      brewing_time: 90,
      brewing_temperature: 72,
      leaf_amount: 3,
      water_amount: 200,
      caffeine_level: caffeineLevel.Medium,
      source: 'Japon / Shizuoka',
      is_public: true,
    },
    {
      name: 'Matcha Cérémonial',
      type: TeaType.Green,
      style: style('Matcha'),
      description: 'Poudre de thé vert japonais de grade cérémonial, utilisée dans le chado. Saveur umami intense avec une légère amertume.',
      custom_color: '#558B2F',
      custom_brew_color: '#AED581',
      instructions: 'Tamiser 1,5g de matcha dans un bol. Ajouter 70ml d\'eau à 75°C. Fouetter en zigzag avec un chasen jusqu\'à obtenir une mousse.',
      brewing_time: 60,
      brewing_temperature: 75,
      leaf_amount: 2,
      water_amount: 70,
      caffeine_level: caffeineLevel.High,
      source: 'Japon / Uji',
      is_public: true,
    },
    // Thés noirs
    {
      name: 'Earl Grey',
      type: TeaType.Black,
      style: style('Earl Grey'),
      description: 'Thé noir aromatisé à l\'huile essentielle de bergamote. Caractère floral et agrumé, emblème du thé britannique.',
      custom_color: '#4E342E',
      custom_brew_color: '#A1887F',
      instructions: 'Infuser à 95°C pendant 3 à 4 minutes. Peut se déguster nature ou avec un nuage de lait.',
      brewing_time: 210,
      brewing_temperature: 95,
      leaf_amount: 3,
      water_amount: 250,
      caffeine_level: caffeineLevel.High,
      source: 'Inde / Sri Lanka',
      is_public: true,
    },
    {
      name: 'Darjeeling Premier Flush',
      type: TeaType.Black,
      style: style('Darjeeling'),
      description: 'Première récolte printanière de Darjeeling. Notes muscatées et florales délicates, liqueur claire et légère.',
      custom_color: '#795548',
      custom_brew_color: '#D7CCC8',
      instructions: 'Infuser à 90°C pendant 3 minutes. Ne pas trop infuser pour préserver la finesse aromatique.',
      brewing_time: 180,
      brewing_temperature: 90,
      leaf_amount: 3,
      water_amount: 250,
      caffeine_level: caffeineLevel.Medium,
      source: 'Inde / Darjeeling',
      is_public: true,
    },
    {
      name: 'Chaï Masala',
      type: TeaType.Black,
      style: style('Orthodox'),
      description: 'Thé noir indien épicé, préparation traditionnelle du sous-continent. Réchauffant et aromatique, souvent préparé avec du lait.',
      custom_color: '#BF360C',
      custom_brew_color: '#FFAB91',
      instructions: 'Faire bouillir le thé avec les épices dans un mélange eau/lait (50/50) pendant 5 minutes. Sucrer selon le goût.',
      brewing_time: 300,
      brewing_temperature: 100,
      leaf_amount: 4,
      water_amount: 300,
      caffeine_level: caffeineLevel.High,
      source: 'Inde / Assam',
      is_public: true,
    },
    // Thé blanc
    {
      name: 'Silver Needle',
      type: TeaType.White,
      style: style('Silver Needle'),
      description: 'Le plus précieux des thés blancs, composé uniquement de bourgeons duveteux. Saveur douce, mielleuse et délicatement florale.',
      custom_color: '#ECEFF1',
      custom_brew_color: '#F5F5F5',
      instructions: 'Infuser à 75°C pendant 3 à 5 minutes. Plusieurs infusions possibles, chacune révélant de nouveaux arômes.',
      brewing_time: 240,
      brewing_temperature: 75,
      leaf_amount: 4,
      water_amount: 200,
      caffeine_level: caffeineLevel.Low,
      source: 'Chine / Fujian',
      is_public: true,
    },
    // Oolong
    {
      name: 'Tieguanyin',
      type: TeaType.Oolong,
      style: style('Tieguanyin'),
      description: 'Oolong de la province du Fujian aux arômes floraux intenses et à la texture beurrée. Semi-oxydé, entre le thé vert et le thé noir.',
      custom_color: '#80CBC4',
      custom_brew_color: '#E0F2F1',
      instructions: 'Rincer les feuilles 10 secondes. Infuser à 90°C pendant 45 secondes à 1 minute. Multiplier les infusions (4 à 6).',
      brewing_time: 50,
      brewing_temperature: 90,
      leaf_amount: 5,
      water_amount: 150,
      caffeine_level: caffeineLevel.Medium,
      source: 'Chine / Fujian',
      is_public: true,
    },
    // Pu-erh
    {
      name: 'Pu-erh Shou',
      type: TeaType.Puerh,
      style: style('Pu-erh pressé'),
      description: 'Pu-erh mûr à fermentation accélérée. Notes terreuses, de sous-bois et de champignon, liqueur sombre et veloutée.',
      custom_color: '#3E2723',
      custom_brew_color: '#4E342E',
      instructions: 'Rincer deux fois 5 secondes. Infuser à 95-100°C. Première infusion 20 secondes, augmenter progressivement.',
      brewing_time: 20,
      brewing_temperature: 98,
      leaf_amount: 6,
      water_amount: 150,
      caffeine_level: caffeineLevel.Medium,
      source: 'Chine / Yunnan',
      is_public: true,
    },
    // Tisanes
    {
      name: 'Camomille Pure',
      type: TeaType.Herbal,
      style: style('Tisane florale'),
      description: 'Infusion de fleurs de camomille séchées. Apaisante et légèrement sucrée, idéale le soir pour favoriser la détente.',
      custom_color: '#FFF176',
      custom_brew_color: '#FFFDE7',
      instructions: 'Infuser à 90°C pendant 5 à 7 minutes. Couvrir pendant l\'infusion pour conserver les arômes.',
      brewing_time: 360,
      brewing_temperature: 90,
      leaf_amount: 3,
      water_amount: 250,
      caffeine_level: caffeineLevel.None,
      source: 'Europe / Agriculture biologique',
      is_public: true,
    },
    {
      name: 'Menthe Citron',
      type: TeaType.Herbal,
      style: style('Tisane de plantes'),
      description: 'Alliance fraîche de menthe et de citron. Digestive et revigorante, parfaite chaude ou en infusion froide.',
      custom_color: '#66BB6A',
      custom_brew_color: '#E8F5E9',
      instructions: 'Infuser à 90°C pendant 5 minutes. Excellent en thé glacé avec quelques feuilles de menthe fraîche.',
      brewing_time: 300,
      brewing_temperature: 90,
      leaf_amount: 4,
      water_amount: 250,
      caffeine_level: caffeineLevel.None,
      source: 'France / Agriculture biologique',
      is_public: true,
    },
    {
      name: 'Rooibos Vanille',
      type: TeaType.Herbal,
      style: style('Tisane de plantes'),
      description: 'Rooibos d\'Afrique du Sud aromatisé à la vanille naturelle. Naturellement sans caféine, doux et légèrement sucré.',
      custom_color: '#BF360C',
      custom_brew_color: '#FFAB91',
      instructions: 'Infuser à 95°C pendant 5 à 8 minutes. Se déguste nature ou avec du lait, chaud ou froid.',
      brewing_time: 420,
      brewing_temperature: 95,
      leaf_amount: 4,
      water_amount: 250,
      caffeine_level: caffeineLevel.None,
      source: 'Afrique du Sud / Cederberg',
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

  // Données pour les ingrédients des thés système
  const teaIngredientsData = [
    // Earl Grey → fleur de bleuet (couleur et arôme)
    { tea: tea('Earl Grey'), ingredient: ingredient('Fleur de bleuet'), quantity: 1, optional: true },
    // Chaï Masala → épices
    { tea: tea('Chaï Masala'), ingredient: ingredient('Cannelle'), quantity: 2, optional: false },
    { tea: tea('Chaï Masala'), ingredient: ingredient('Cardamome'), quantity: 1, optional: false },
    { tea: tea('Chaï Masala'), ingredient: ingredient('Gingembre'), quantity: 1, optional: false },
    { tea: tea('Chaï Masala'), ingredient: ingredient('Clou de girofle'), quantity: 1, optional: true },
    // Camomille Pure
    { tea: tea('Camomille Pure'), ingredient: ingredient('Camomille'), quantity: 5, optional: false },
    // Menthe Citron
    { tea: tea('Menthe Citron'), ingredient: ingredient('Menthe'), quantity: 3, optional: false },
    { tea: tea('Menthe Citron'), ingredient: ingredient('Citron'), quantity: 2, optional: false },
    // Rooibos Vanille
    { tea: tea('Rooibos Vanille'), ingredient: ingredient('Vanille'), quantity: 1, optional: false },
  ];

  // Insère les TeaIngredients
  for (const tiData of teaIngredientsData) {
    if (!tiData.tea || !tiData.ingredient) {
      console.warn(`Skipping tea ingredient: tea or ingredient not found`);
      continue;
    }
    const existing = await teaIngredientRepository.findOne({
      where: { tea: { id: tiData.tea.id }, ingredient: { id: tiData.ingredient.id } },
    });
    if (!existing) {
      const ti = teaIngredientRepository.create(tiData);
      await teaIngredientRepository.save(ti);
      console.log(`Inserted ingredient ${tiData.ingredient.name} for tea ${tiData.tea.name}`);
    } else {
      console.log(`Ingredient ${tiData.ingredient.name} already linked to tea ${tiData.tea.name}`);
    }
  }

  // Ferme l'application
  await app.close();
}

seedData().catch((error) => console.error(error));
