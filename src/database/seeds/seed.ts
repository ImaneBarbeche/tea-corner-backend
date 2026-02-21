import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { FlavourType } from '../../flavour-type/flavour-type.entity';
import { FlavourProfile } from '../../flavour-profile/flavour-profile.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

async function seedData() {
  // Crée une instance de l'application NestJS
  const app = await NestFactory.createApplicationContext(AppModule);

  // Récupère les repositories
  const flavourTypeRepository = app.get<Repository<FlavourType>>(getRepositoryToken(FlavourType));
  const flavourProfileRepository = app.get<Repository<FlavourProfile>>(getRepositoryToken(FlavourProfile));

  // Données de test pour FlavourType
  const flavourTypesData = [
    { name: 'Floral', color: '#FFD700' },
    { name: 'Fruité', color: '#FF6347' },
    { name: 'Boisé', color: '#8B4513' },
    { name: 'Épicé', color: '#CD853F' },
  ];

  // Insère les FlavourType
  const insertedFlavourTypes: FlavourType[] = [];
  for (const flavourTypeData of flavourTypesData) {
    const existing = await flavourTypeRepository.findOne({ where: { name: flavourTypeData.name } });
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
    { name: 'Rose', flavourType: insertedFlavourTypes[0] }, // Associé à 'Floral'
    { name: 'Citron', flavourType: insertedFlavourTypes[1] }, // Associé à 'Fruité'
    { name: 'Cèdre', flavourType: insertedFlavourTypes[2] }, // Associé à 'Boisé'
    { name: 'Cannelle', flavourType: insertedFlavourTypes[3] }, // Associé à 'Épicé'
  ];

  // Insère les FlavourProfile
  for (const profileData of flavourProfilesData) {
    const existingProfile = await flavourProfileRepository.findOne({ where: { name: profileData.name } });
    if (!existingProfile) {
      const profile = flavourProfileRepository.create(profileData);
      await flavourProfileRepository.save(profile);
      console.log(`Inserted flavour profile: ${profileData.name}`);
    } else {
      console.log(`Flavour profile ${profileData.name} already exists`);
    }
  }

  // Ferme l'application
  await app.close();
}

seedData().catch(error => console.error(error));
