import { consola } from 'consola';
import { getTsConfigPath, SharedOptions } from './shared-options';

/** @internal */
export function logSharedOptions(options: SharedOptions) {
  consola.debug('options:', JSON.stringify(options, null, 2));
  consola.info(`analyzing project at "${getTsConfigPath(options)}"...`);

  const deprecatedOptionsToReplacementsMap = {
    includeNames: 'includeName',
    excludeName: 'excludeName',
    includeTypes: 'includeKind',
    excludeTypes: 'excludeKind',
  };
  for (const [deprecatedOption, replacementOption] of Object.entries(
    deprecatedOptionsToReplacementsMap
  )) {
    if (deprecatedOption in options) {
      logDeprecationWarning(`option "${deprecatedOption}"`, {
        replaceWith: `"${replacementOption}" option`,
      });
    }
  }
}

/** @internal */
export function logDeprecationWarning(
  target: string,
  options: {
    replaceWith: string;
  }
) {
  consola.warn(
    `${target} is DEPRECATED! Please use ${options.replaceWith} instead.`
  );
}

export function logSizeWarningIfExceeding(options: {
  edges: number;
  output: string;
  maxEdges: number;
  maxOutputSize: number;
  description?: string;
}) {
  const { edges, maxEdges, output, maxOutputSize, description } = options;
  const tooManyEdges = edges > maxEdges;
  const tooMuchText = output.length > maxOutputSize;

  if (tooManyEdges || tooMuchText) {
    consola.warn(
      `The generated output exceeds the maximum text size (${maxOutputSize}) or amount of edges (${maxEdges}). ` +
        'Consider refining the filter options to reduce the output diagram size (see --help)' +
        (description ? ` ${description}` : '')
    );
  }
}
