import {
  AuthorizedApiClient,
  IntermediariesApiService,
  Intermediary,
  VariableValue,
} from '@digifi/digifi-node-js';

export class IntermediaryAPI extends IntermediariesApiService {
  constructor(apiUrl: string, apiKey: string) {
    super(
      new AuthorizedApiClient(apiUrl, apiKey, {
        apiVersion: '2024-02-26',
      })
    );
  }

  async handleParsedIntermediaries(
    parsedIntermediaries: Array<Intermediary['variables']>,
    variableToMatch: keyof Intermediary['variables']
  ) {
    try {
      const intermediaries = await this.search({});

      let createdCounter = 0;
      let updatedCounter = 0;

      const intermediariesMap = this.createIntermediaryMap(
        intermediaries.items,
        variableToMatch
      );

      await Promise.all(
        parsedIntermediaries.map((parsedIntermediary, index) => {
          return new Promise((resolve, reject) => {
            const valueToMatch = this.normalizeVariableToMatch(
              parsedIntermediary[variableToMatch]
            );

            const intermediaryToUpdate = intermediariesMap[valueToMatch];

            setTimeout(() => {
              if (intermediaryToUpdate) {
                updatedCounter++;

                return this.updateIntermediary(
                  intermediaryToUpdate.id,
                  parsedIntermediary
                );
              }

              createdCounter++;
              return this.createIntermediary(parsedIntermediary);
            }, index * 500);
          });
        })
      );

      console.log('Intermediaries created successfully', {
        updatedCounter,
        createdCounter,
      });
    } catch (error) {
      console.error(error);
    }
  }

  private async updateIntermediary(
    id: string,
    variables: Intermediary['variables']
  ) {
    return this.update(id, {
      variables,
    });
  }

  private async createIntermediary(variables: Intermediary['variables']) {
    return this.create({
      variables,
    });
  }

  private normalizeVariableToMatch(variable: VariableValue) {
    return (variable as string).trim().toLowerCase().replace(/\W/gim, '');
  }

  private createIntermediaryMap(
    intermediaries: Array<Intermediary>,
    variableToMatch: keyof Intermediary['variables']
  ): Record<string, Intermediary> {
    return intermediaries.reduce((acc, currentIntermediary) => {
      const valueToMatch = this.normalizeVariableToMatch(
        currentIntermediary.variables[variableToMatch]
      );

      return {
        ...acc,
        [valueToMatch]: currentIntermediary,
      };
    }, {});
  }
}
