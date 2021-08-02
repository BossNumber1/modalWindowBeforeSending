import Keycloak from "keycloak-js";

const keycloak = Keycloak({
  realm: process.env.REACT_APP_KEYCLOAK_REALM || "problembo",
  url: process.env.REACT_APP_KEYCLOAK_URL || "https://login.problembo.com/auth/",
  clientId: "web_app",
});

export default keycloak;
