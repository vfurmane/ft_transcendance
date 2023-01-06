export interface FtOauth2Configuration {
  ft: {
    api: {
      baseUrl: string;
      oauth: {
        authorizationURL: string;
        tokenURL: string;
      };
      routes: {
        users: {
          me: string;
        };
      };
    };
  };
}

export default (): FtOauth2Configuration => {
  const apiBaseUrl = 'https://api.intra.42.fr';
  const apiOauthBaseUrl = `${apiBaseUrl}/oauth`;
  const apiRoutesBaseUrl = `${apiBaseUrl}/v2`;
  return {
    ft: {
      api: {
        baseUrl: apiBaseUrl,
        oauth: {
          authorizationURL: `${apiOauthBaseUrl}/authorize`,
          tokenURL: `${apiOauthBaseUrl}/token`,
        },
        routes: {
          users: {
            me: `${apiRoutesBaseUrl}/me`,
          },
        },
      },
    },
  };
};
