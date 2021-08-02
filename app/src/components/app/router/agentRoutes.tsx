import React from 'react'
import { Route } from "react-router-dom";

import CabinetAgentPage from "components/pages/cabinet-agent";
import AgentProfilePage from "components/pages/cabinet-agent/profile";
import ChangeSpecsPage from "components/pages/cabinet-agent/change-specs";
import AgentTaskViewPage from "components/pages/cabinet-agent/task-view/component";
import AgentModerateForm from "components/pages/cabinet-agent/agent-moderate-form";

import { routes } from "../routes";

export const agentRoutes = [
  <Route
    key={routes.agent.task.taskId.view.getRoutePath()}
    path={routes.agent.task.taskId.view.getRoutePath()}
    component={AgentTaskViewPage}
  />,
  <Route
    key={routes.agent.profile.form.getRoutePath()}
    path={routes.agent.profile.form.getRoutePath()}
    component={AgentModerateForm}
  />,
  <Route
    key={routes.agent.profile.getRoutePath()}
    path={routes.agent.profile.getRoutePath()}
    component={AgentProfilePage}
  />,
  <Route
    key={routes.agent.changeSpecs.getRoutePath()}
    path={routes.agent.changeSpecs.getRoutePath()}
    component={ChangeSpecsPage}
  />,
  <Route
    key={routes.agent.getRoutePath()}
    path={routes.agent.getRoutePath()}
    component={CabinetAgentPage}
  />,
];
