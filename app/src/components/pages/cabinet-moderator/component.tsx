import React from 'react'
import { makeStyles, MenuItem, Select, Typography } from "@material-ui/core";

import { AgentModerateFormStatusEnumPr } from "@problembo/grpc-web-problembo-core/common/core-share_pb";

import { AgentModerateFormShortViewPr } from "@problembo/grpc-web-problembo-core/moderator/moderator_pb";

import { TaskShortPr } from "@problembo/grpc-web-problembo-core/common/task-share_pb";

import { useKeycloak } from "@react-keycloak/web";

import { useEffect, useState } from "react";
import DocumentTitle from "react-document-title";

import { ResponseType } from "api/grpc/common";

import moderatorApi, {
  GetAgentModerateFormsReturn,
  NewTaskListReturn,
} from "api/grpc/moderator";

import {
  generateTableString,
  getFormStatusString,
  getTaskStatusString,
} from "lib/helper";

import { routes } from "components/app/routes";

import LoadingContainer from "components/common/loading-container";
import Page from "components/common/page";
import Section from "components/common/section";
import Table from "components/common/table";
import useDateFormatter from "hooks/use-date-formatter";

function _getFormLink(formId: number | undefined) {
  if (!formId) {
    return;
  }

  return routes.mod.form.formId.view.getRedirectPath({
    formId: formId.toString(),
  });
}

function _getTaskLink(taskId: number | undefined) {
  if (!taskId) {
    return;
  }

  return routes.mod.task.taskId.view.getRedirectPath({
    taskId: taskId.toString(),
  });
}

const MODERATE_FORMS_HEADERS = [
  "email",
  "ФИО",
  "Дата заявки",
  "Статус",
  "Открыть",
];

function _generateModerateFormsData(
  formshortviewList: AgentModerateFormShortViewPr.AsObject[],
  formatDate: any
) {
  return formshortviewList.map((item) => {
    return [
      generateTableString(item.formshort?.id?.id),
      generateTableString(item.formshort?.agentname),
      generateTableString(formatDate(item.formshort?.createat)),
      getFormStatusString(item.status),
      {
        link: _getFormLink(item.formshort?.id?.id),
        name: "Анкета",
      },
    ];
  });
}

const NEW_TASKS_HEADERS = ["№ задачи", "Дата создания", "Статус", "Открыть"];

function _generateNewTasksData(
  tasksList: TaskShortPr.AsObject[],
  formatDate: any
) {
  return tasksList.map((item) => {
    return [
      generateTableString(item.taskid?.taskid),
      generateTableString(formatDate(item.datecreate)),
      getTaskStatusString(item.status),
      {
        link: _getTaskLink(item.taskid?.taskid),
        name: "Открыть",
      },
    ];
  });
}

// TODO links

const CabinetModeratorPage = () => {
  const [moderateForms, setModerateForms] =
    useState<GetAgentModerateFormsReturn | null>(null);

  const [status, setStatus] = useState<AgentModerateFormStatusEnumPr>(
    AgentModerateFormStatusEnumPr.AGENT_MODERATE_FORM_STATUS_ENUM_PR_UNSPECIFIED
  );

  const [newTaskList, setNewTaskList] =
    useState<NewTaskListReturn | null>(null);

  const formatDate = useDateFormatter();

  const classes = useStyles();

  const { keycloak } = useKeycloak();

  const token = keycloak.token;

  const errorMessage = moderateForms?.message || newTaskList?.message;

  const isLoaded =
    moderateForms?.responseType === ResponseType.Success &&
    newTaskList?.responseType === ResponseType.Success;

  const isError =
    moderateForms?.responseType === ResponseType.Error ||
    newTaskList?.responseType === ResponseType.Error;

  const onStatusChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setStatus(e.target.value as AgentModerateFormStatusEnumPr);
  };

  useEffect(() => {
    if (token) {
      moderatorApi.getAgentModerateForms({ token, status }).then((res) => {
        setModerateForms(res);
      });

      moderatorApi.newTaskList({ token }).then((res) => {
        setNewTaskList(res);
      });
    }
  }, [token, status]);

  // TODO filter, sorting

  return (
    <DocumentTitle title="Кабинет модератора">
      <Page>
        <LoadingContainer
          isLoaded={isLoaded}
          isError={isError}
          errorMessage={errorMessage}
        >
          <Section className={classes.section}>
            <Typography>Анкета агента со статусом:</Typography>
            <Select
              id="status"
              value={status}
              onChange={onStatusChange}
              className={classes.statusSelect}
            >
              <MenuItem
                value={
                  AgentModerateFormStatusEnumPr.AGENT_MODERATE_FORM_STATUS_ENUM_PR_UNSPECIFIED
                }
              >
                Не выбрано (все)
              </MenuItem>
              <MenuItem
                value={
                  AgentModerateFormStatusEnumPr.AGENT_MODERATE_FORM_STATUS_ENUM_PR_NEW_FORM
                }
              >
                Новые
              </MenuItem>
              <MenuItem
                value={
                  AgentModerateFormStatusEnumPr.AGENT_MODERATE_FORM_STATUS_ENUM_PR_CONFIRMED
                }
              >
                Одобренные
              </MenuItem>
              <MenuItem
                value={
                  AgentModerateFormStatusEnumPr.AGENT_MODERATE_FORM_STATUS_ENUM_PR_DENIED
                }
              >
                Отклоненные
              </MenuItem>
              <MenuItem
                value={
                  AgentModerateFormStatusEnumPr.AGENT_MODERATE_FORM_STATUS_ENUM_PR_REQ_FIX
                }
              >
                На доработке
              </MenuItem>
              <MenuItem
                value={
                  AgentModerateFormStatusEnumPr.AGENT_MODERATE_FORM_STATUS_ENUM_PR_AFTER_FIX
                }
              >
                После доработки
              </MenuItem>
            </Select>
          </Section>
          <Section className={classes.section}>
            {moderateForms?.formshortviewList && (
              <Table
                headers={MODERATE_FORMS_HEADERS}
                data={_generateModerateFormsData(
                  moderateForms?.formshortviewList,
                  formatDate
                )}
              />
            )}
          </Section>
          <Section className={classes.section}>
            {newTaskList?.tasksList && (
              <Table
                headers={NEW_TASKS_HEADERS}
                data={_generateNewTasksData(newTaskList?.tasksList, formatDate)}
              />
            )}
          </Section>
        </LoadingContainer>
      </Page>
    </DocumentTitle>
  );
};

const useStyles = makeStyles(() => ({
  section: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    "& > :not(:last-child)": {
      marginRight: 20,
    },
  },
  sectionHeaderContainer: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
  },
  buttonWrapper: {
    display: "flex",
    alignItems: "center",
    width: "auto",
    "& > :not(:last-child)": {
      marginRight: 20,
    },
  },
  statusSelect: {
    width: 300,
  },
}));

export default CabinetModeratorPage;
