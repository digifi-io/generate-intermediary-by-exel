import { VariableValue } from '@digifi/digifi-node-js';
import { z } from 'zod';

export type Variables = Record<string, VariableValue>;

export type TableOptions<T extends Variables> = {
  tableKey: keyof T;
};

export type GenerateFromFileCallSignature<T extends Variables> = {
  filePath: string;
  sheet: string;
  tableOptions?: TableOptions<T>;
};

export type GenerateCallSignature<T extends Variables> = {
  schema: z.ZodSchema<T[]>;
  mergeKey: keyof T;
  configs: Array<GenerateFromFileCallSignature<T>>;
};
