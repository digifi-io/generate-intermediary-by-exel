import 'dotenv/config';

import { generate } from './common/utils';
import { generateParams, resultFilePath } from './constants';
import { writeFile } from 'fs/promises';
import { IntermediaryAPI } from './common/IntermediaryAPI';

async function createIntermediariesFromFile() {
  const generatedIntermediaries = generate(generateParams);

  const apiUrl = process.env.DigifiLosApiUrl as string;
  const apiKey = process.env.DigifiApiKey as string;

  const intermediaryAPI = new IntermediaryAPI(apiUrl, apiKey);

  await intermediaryAPI.handleParsedIntermediaries(
    generatedIntermediaries,
    'intermediary_name'
  );

  await writeFile(
    resultFilePath,
    JSON.stringify(generatedIntermediaries, null, 2)
  );
}

createIntermediariesFromFile();
