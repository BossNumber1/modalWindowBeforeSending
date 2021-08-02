import React from 'react'
import { ReactKeycloakProvider } from "@react-keycloak/web";

import keycloak from "api/keycloak";
import CenteringContainer from "components/common/centering-container";
import Loader from "components/common/loader";

const AuthProvider: React.FC = (props) => {
  const { children } = props;

  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{
        onLoad: "login-required",
      }}
      LoadingComponent={
        <CenteringContainer>
          <Loader />
        </CenteringContainer>
      }
    >
      {children}
    </ReactKeycloakProvider>
  );
};

export default AuthProvider;
