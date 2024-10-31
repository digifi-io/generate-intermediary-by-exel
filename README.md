# generate-intermediary-by-exel

## Steps:

1. Describe the **zod schema**.\
   Describe your entity schema that you want to create in **constants.ts**;\
   It should satisfies **Array<Intermediary['variables']>** interface;
2. Describe **configs**.\
   Describe your configs that should satisfies **Array<GenerateCallSignature['configs']>** interface.\
   In configs you describe what file and what sheet you want to read.\
   If file/sheet contains a table variable you should describe it in configs.\
3. Describe generateParams.\
   In generateParams you should insert your schema and configs and also you should provide a **mergeKey**.\
   The **mergeKey** is a variable name that should exist in all files/sheets. It will be used for merging files/sheets that was read in one entity.
