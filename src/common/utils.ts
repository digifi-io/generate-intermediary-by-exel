import {
  GenerateCallSignature,
  GenerateFromFileCallSignature,
  TableOptions,
  Variables,
} from './types';

import { TableValue } from '@digifi/digifi-node-js';
import crypto from 'crypto';
import xlsx from 'node-xlsx';

const validateTableKey = (key: string, tableKey: string): boolean => {
  return key.toString().trim().startsWith(tableKey);
};

const normalizeParsedFile = <T extends Variables>(
  parsedFile: ReturnType<typeof xlsx.parse>[number]
): {
  keys: Array<keyof T>;
  values: string[][];
} => {
  const [keys, ...rows] = parsedFile.data as [Array<keyof T>, string[]];
  const normalizedKeys = keys.map((key) => key.toString().trim());
  const normalizedValues = rows
    .map((row) => row.map((cell) => cell.toString().trim()))
    .filter((row) => !!row.length);

  return {
    keys: normalizedKeys,
    values: normalizedValues,
  };
};

const createEntity = <T extends Variables>(
  keys: string[],
  values: string[],
  tableOptions?: TableOptions<T>
): T => {
  const entity = keys.reduce<Variables>((acc, currentKey, index) => {
    if (
      tableOptions &&
      validateTableKey(currentKey, tableOptions.tableKey as string)
    ) {
      const [parentKey, childKey] = currentKey.split('.');

      const currentTable = (acc[parentKey] as TableValue)?.[0];

      if (currentTable) {
        return {
          ...acc,
          [parentKey]: [
            {
              ...currentTable,
              [childKey]: values[index],
            },
          ],
        };
      }

      return {
        ...acc,
        [parentKey]: [
          {
            _id: crypto.randomUUID(),
            [childKey]: values[index],
          },
        ],
      };
    }

    return {
      ...acc,
      [currentKey]: values[index],
    };
  }, {} as Variables);

  return entity as T;
};

const mergeEntities = <T extends Variables>(
  entities: T[],
  mergeKey: keyof T,
  tableOptions: TableOptions<T>
) => {
  const { tableKey } = tableOptions;
  const uniqueKeys = Array.from(
    new Set(entities.map((entity) => entity[mergeKey]))
  );

  return uniqueKeys.map((key) => {
    const entitiesToMerge = entities.filter(
      (entity) => entity[mergeKey] === key
    );

    return entitiesToMerge.reduce((acc, currentEntity) => {
      const hasTableField = currentEntity[tableKey];

      if (hasTableField) {
        if (acc[tableKey]) {
          return {
            ...acc,
            ...currentEntity,
            [tableKey]: [
              ...(acc[tableKey] as TableValue),
              ...(currentEntity[tableKey] as TableValue),
            ],
          };
        }
        return {
          ...acc,
          ...currentEntity,
          [tableKey]: [...(currentEntity[tableKey] as TableValue)],
        };
      }

      return {
        ...acc,
        ...currentEntity,
      };
    }, {} as T);
  });
};

const transformGeneratedEntities = <T extends Variables>(
  entities: T[],
  key: keyof T
): Record<string, T> => {
  return entities.reduce<Record<string, T>>((acc, current) => {
    return {
      ...acc,
      [current[key] as string]: current,
    };
  }, {} as Record<string, T>);
};

const generateFromFile = <T extends Variables>(
  mergeKey: keyof T,
  { filePath, sheet, tableOptions }: GenerateFromFileCallSignature<T>
): Record<string, T> => {
  const [parsedFile] = xlsx.parse(filePath, { sheets: sheet });
  const { keys, values } = normalizeParsedFile(parsedFile);

  const result = values.map((row) => createEntity(keys, row, tableOptions));

  if (tableOptions) {
    return transformGeneratedEntities(
      mergeEntities(result, mergeKey, tableOptions),
      mergeKey
    );
  }

  return transformGeneratedEntities(result, mergeKey);
};

export const generate = <T extends Variables>({
  schema,
  configs,
  mergeKey,
}: GenerateCallSignature<T>): T[] => {
  const results: Record<string, Variables> = {};

  const generated = configs.map((config) =>
    generateFromFile(mergeKey, { ...config })
  );

  generated.forEach((item) => {
    Object.keys(item).forEach((key) => {
      results[key] = {
        ...results[key],
        ...item[key],
      };
    });
  });

  const parsed = schema.parse(Object.values(results));

  return parsed;
};
