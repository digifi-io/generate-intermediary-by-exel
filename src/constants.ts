import * as path from 'path';

import { emailSchema, phoneNumberSchema } from './common/commonSchemas';

import { GenerateCallSignature } from './common/types';
import { z } from 'zod';

const intermediaryListFilePath = path.join(__dirname, 'list.xlsx');
export const resultFilePath = path.join(__dirname, 'result.json');

const schema = z.array(
  z.object({
    intermediary_name: z.string(),
    intermediary_full_address: z.string().optional(),
    intermediary_phone: phoneNumberSchema,
    intermediary_licence_number: z.string().optional(),
    intermediary_vep_code: z.string().optional(),
    intermediary_dealer_feedback: z.string().optional(),
    intermediary_visit_notes: z.string().optional(),
    intermediary_record_id: z.string().optional(),
    intermediary_members: z
      .array(
        z.object({
          _id: z.string(),
          email: emailSchema,
          job_title: z.string().optional(),
          first_name: z.string().optional(),
          last_name: z.string().optional(),
        })
      )
      .optional(),
  })
);

type TSchema = z.infer<typeof schema>[number];

const configs: GenerateCallSignature<TSchema>['configs'] = [
  {
    filePath: intermediaryListFilePath,
    sheet: 'Companies Import',
  },
  {
    filePath: intermediaryListFilePath,
    sheet: 'Contact Import',
    tableOptions: {
      tableKey: 'intermediary_members',
    },
  },
];

export const generateParams: GenerateCallSignature<TSchema> = {
  schema,
  mergeKey: 'intermediary_name',
  configs,
};
