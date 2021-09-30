export const environment = {
  production: true,
  apiBaseUrl: "http://localhost:5000",
  keycloak: {
    url: "http://localhost:8080/auth",
    realm: "webinar",
    clientId: "frontend",
    resourceServer: "api",
    rptUrls: [
      "/projects"
    ]
  }
};
