import Config from 'react-native-config';

type Environment = 'dev' | 'uat' | 'beta' | 'prod';

export const Env = {
  env: (Config.ENV ?? 'dev') as Environment,
  apiUrl: Config.API_URL ?? '',
  appName: Config.APP_NAME ?? 'Branch Performance',
  bundleId: Config.BUNDLE_ID ?? 'id.bmri.branchperf',
  isProd: Config.ENV === 'prod',
  isDev: Config.ENV === 'dev',
};
