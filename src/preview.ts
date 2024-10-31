import 'dotenv/config';

import { generate } from './common/utils';
import { generateParams, resultFilePath } from './constants';
import { writeFile } from 'fs/promises';

async function preview() {
  const generatedIntermediaries = generate(generateParams);

  await writeFile(
    resultFilePath,
    JSON.stringify(generatedIntermediaries, null, 2)
  );
}

preview();
