import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { FlavourType } from '../../flavour-type/flavour-type.entity';
import { FlavourProfile } from '../../flavour-profile/flavour-profile.entity';
import { Ingredient } from '../../ingredient/ingredient.entity';
import { IngredientType } from '../../enums/ingredientType.enum';
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

  // Ferme l'application
  await app.close();
}

seedData().catch((error) => console.error(error));
