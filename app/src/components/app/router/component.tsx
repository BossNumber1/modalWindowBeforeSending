import React from 'react'
import { useKeycloak } from "@react-keycloak/web";

import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";

import {
  isRoleAgent,
  isRoleBuh,
  isRoleClient,
  isRoleModerator,
} from "lib/helper";

import CenteringContainer from "components/common/centering-container";
import Error from "components/common/error";
import Loader from "components/common/loader";

import { routes } from "../routes";

import { agentRoutes } from "./agentRoutes";
import { clientRoutes } from "./clientRoutes";
import { moderatorRoutes } from "./moderatorRoutes";
import { buhRoutes } from "./buhRoutes";
import { commonRoutes } from "./commonRoutes";

function _generateRedirect(roles: string[]) {
  if (!roles.length) {
    console.error("Отсутствует роль пользователя");

    return (
      <CenteringContainer>
        <Error message="Отсутствует роль пользователя" />
      </CenteringContainer>
    );
  }

  if (isRoleBuh(roles)) {
    return <Redirect to={routes.buh.getRoutePath()} />;
  }

  if (isRoleClient(roles)) {
    return <Redirect to={routes.client.getRoutePath()} />;
  }

  if (isRoleModerator(roles)) {
    return <Redirect to={routes.mod.getRoutePath()} />;
  }

  if (isRoleAgent(roles)) {
    return <Redirect to={routes.agent.getRoutePath()} />;
  }

  console.error("Не реализовано для данных ролей пользователя: ", roles);

  return (
    <CenteringContainer>
      <Error
        message={`Не реализовано для данных ролей пользователя: ${roles.join(
          ", "
        )}`}
      />
    </CenteringContainer>
  );
}

const Router = () => {
  const { keycloak } = useKeycloak();

  const roles = keycloak.tokenParsed?.realm_access?.roles;

  if (roles) {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/">
            {_generateRedirect(roles)}
          </Route>
          {agentRoutes}
          {buhRoutes}
          {clientRoutes}
          {moderatorRoutes}
          {commonRoutes}
          <Route path="*">
            <Redirect to={"/"} />
          </Route>
        </Switch>
      </BrowserRouter>
    );
  }

  return (
    <CenteringContainer>
      <Loader />
    </CenteringContainer>
  );
};

export default Router;
