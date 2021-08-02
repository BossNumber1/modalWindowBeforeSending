import React from 'react'
import { Route } from "react-router-dom";

import { ChangeModalType } from "components/common/modal/change-phone";
import ChangePhoneEmailPage from "components/pages/common/change-phone-email";

import { routes } from "../routes";

export const commonRoutes = [
  <Route
    key={routes.verifyEmail.getRoutePath()}
    path={routes.verifyEmail.getRoutePath()}
    render={(props) => (
      <ChangePhoneEmailPage {...props} type={ChangeModalType.Email} />
    )}
  />,
  <Route
    key={routes.verifyPhone.getRoutePath()}
    path={routes.verifyPhone.getRoutePath()}
    render={(props) => (
      <ChangePhoneEmailPage {...props} type={ChangeModalType.Phone} />
    )}
  />,
];
