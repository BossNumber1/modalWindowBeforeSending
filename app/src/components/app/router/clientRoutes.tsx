import React from 'react'
import { Route } from "react-router-dom";

import AddEditTaskPage, {
  AddEditTaskMode,
} from "components/pages/cabinet-client/task-add-edit";
import CabinetClientPage from "components/pages/cabinet-client";
import ProfilePage from "components/pages/cabinet-client/profile";
import TaskAddClaimPage from "components/pages/cabinet-client/task-add-claim";
import TaskChoiceAgentPage from "components/pages/cabinet-client/task-choice-agent";
import TaskPayPage from "components/pages/cabinet-client/task-pay";
import TaskPayWaitPage from "components/pages/cabinet-client/task-pay-wait";
import TaskReviewAddPage from "components/pages/cabinet-client/task-review-add";
import TaskViewPage from "components/pages/cabinet-client/task-view";

import { routes } from "../routes";

export const clientRoutes = [
  <Route
    key={routes.client.addTask.getRoutePath()}
    path={routes.client.addTask.getRoutePath()}
    render={(props) => (
      <AddEditTaskPage {...props} mode={AddEditTaskMode.Add} />
    )}
  />,
  <Route
    key={routes.client.profile.getRoutePath()}
    path={routes.client.profile.getRoutePath()}
    component={ProfilePage}
  />,
  <Route
    key={routes.client.task.taskId.view.getRoutePath()}
    path={routes.client.task.taskId.view.getRoutePath()}
    component={TaskViewPage}
  />,
  <Route
    key={routes.client.task.taskId.choiceAgent.getRoutePath()}
    path={routes.client.task.taskId.choiceAgent.getRoutePath()}
    component={TaskChoiceAgentPage}
  />,
  <Route
    key={routes.client.task.taskId.edit.getRoutePath()}
    path={routes.client.task.taskId.edit.getRoutePath()}
    render={(props) => (
      <AddEditTaskPage {...props} mode={AddEditTaskMode.Edit} />
    )}
  />,
  <Route
    key={routes.client.task.taskId.review.add.getRoutePath()}
    path={routes.client.task.taskId.review.add.getRoutePath()}
    component={TaskReviewAddPage}
  />,
  <Route
    key={routes.client.task.taskId.addClaim.getRoutePath()}
    path={routes.client.task.taskId.addClaim.getRoutePath()}
    component={TaskAddClaimPage}
  />,
  <Route
    key={routes.client.task.taskId.pay.getRoutePath()}
    path={routes.client.task.taskId.pay.getRoutePath()}
    component={TaskPayPage}
  />,
  <Route
    key={routes.client.task.taskId["pay-wait"].getRoutePath()}
    path={routes.client.task.taskId["pay-wait"].getRoutePath()}
    component={TaskPayWaitPage}
  />,
  <Route
    key={routes.client.getRoutePath()}
    path={routes.client.getRoutePath()}
    component={CabinetClientPage}
  />,
];
