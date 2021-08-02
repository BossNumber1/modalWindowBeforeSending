import React from 'react'
import { Route } from "react-router-dom";

import CabinetBuhPage from "components/pages/cabinet-buh";
import BuhPaymentPage from "components/pages/cabinet-buh/payment";

import { routes } from "../routes";

export const buhRoutes = [
  <Route
    key={routes.buh.request.requestId.view.getRoutePath()}
    path={routes.buh.request.requestId.view.getRoutePath()}
    component={BuhPaymentPage}
  />,
  <Route
    key={routes.buh.getRoutePath()}
    path={routes.buh.getRoutePath()}
    component={CabinetBuhPage}
  />,
];
