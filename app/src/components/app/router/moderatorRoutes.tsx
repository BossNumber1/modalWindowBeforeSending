import React from 'react'
import { Route } from "react-router-dom";

import CabinetModeratorPage from "components/pages/cabinet-moderator";
import ModeratorTaskViewPage from "components/pages/cabinet-moderator/task-view";
import ModerateFormViewPage from "components/pages/cabinet-moderator/moderate-form-view";

import { routes } from "../routes";

export const moderatorRoutes = [
  <Route
    key={routes.mod.form.formId.view.getRoutePath()}
    path={routes.mod.form.formId.view.getRoutePath()}
    component={ModerateFormViewPage}
  />,
  <Route
    key={routes.mod.task.taskId.view.getRoutePath()}
    path={routes.mod.task.taskId.view.getRoutePath()}
    component={ModeratorTaskViewPage}
  />,
  <Route
    key={routes.mod.getRoutePath()}
    path={routes.mod.getRoutePath()}
    component={CabinetModeratorPage}
  />,
];
