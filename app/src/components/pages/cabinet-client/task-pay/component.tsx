import React from 'react'
import { Button, makeStyles, Typography } from "@material-ui/core";

import { useKeycloak } from "@react-keycloak/web";

import { useEffect, useState } from "react";
import DocumentTitle from "react-document-title";
import { RouteComponentProps } from "react-router";
import { useHistory } from "react-router-dom";

import {
  clientGetTask,
  ClientGetTaskReturn,
  clientPayTask,
  ClientPayTaskReturn,
} from "api/grpc/client";

import { ResponseType } from "api/grpc/common";

import { routes } from "components/app/routes";

import LoadingContainer from "components/common/loading-container";
import Page from "components/common/page";
import Section from "components/common/section";

interface TaskPayContentProps {
  taskData?: ClientGetTaskReturn;
  payData?: ClientPayTaskReturn;
  taskId: number;
}

const TaskPayContent = (props: TaskPayContentProps) => {
  const { taskData, payData, taskId } = props;

  const history = useHistory();

  const classes = useStyles();

  const errorMessage = taskData?.message || payData?.message;

  const isLoaded =
    taskData?.responseType === ResponseType.Success &&
    payData?.responseType === ResponseType.Success;

  const isError =
    taskData?.responseType === ResponseType.Error ||
    payData?.responseType === ResponseType.Error;

  const onUrlButtonClick = (): void => {
    const url = payData?.payurl;

    if (url) {
      window.location.href = url;
    }
  };

  const onCloseButtonClick = (): void => {
    history.push(routes.client.getRedirectPath());
  };

  return (
    <LoadingContainer
      isLoaded={isLoaded}
      isError={isError}
      errorMessage={errorMessage}
      redirectPathOnError={routes.client.task.taskId.view.getRedirectPath({
        taskId: taskId.toString(),
      })}
    >
      <div className={classes.contentContainer}>
        <Section className={classes.section}>
          <Typography>
            Оплата заказа №{taskData?.task?.taskshort?.taskid?.taskid} на сумму{" "}
            {taskData?.task?.taskshort?.price} рублей
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={onUrlButtonClick}
          >
            Перейти на сайт платежной системы
          </Button>
        </Section>
        <Section className={classes.sectionBottom}>
          <Button
            variant="contained"
            color="primary"
            onClick={onCloseButtonClick}
          >
            Закрыть задачу без оплаты
          </Button>
        </Section>
      </div>
    </LoadingContainer>
  );
};

interface TaskPayMatchParams {
  taskId: string;
}

interface TaskPayProps extends RouteComponentProps<TaskPayMatchParams> {}

const TaskPayPage = (props: TaskPayProps) => {
  const { match } = props;

  const taskId = Number(match.params.taskId);

  const [taskData, setTaskData] =
    useState<ClientGetTaskReturn | undefined>(undefined);

  const [payData, setPaydata] =
    useState<ClientPayTaskReturn | undefined>(undefined);

  const { keycloak } = useKeycloak();

  const token = keycloak.token;

  useEffect(() => {
    if (token && taskId) {
      clientGetTask({ token, taskId }).then((res) => {
        setTaskData(res);
      });

      clientPayTask({ token, taskId }).then((res) => {
        setPaydata(res);
      });
    }
  }, [token, taskId]);

  return (
    <DocumentTitle title="Кабинет клиента — оплата">
      <Page>
        <TaskPayContent taskData={taskData} payData={payData} taskId={taskId} />
      </Page>
    </DocumentTitle>
  );
};

const useStyles = makeStyles(() => ({
  section: {
    display: "flex",
    alignItems: "flex-start",
    "& > :not(:last-child)": {
      marginBottom: 20,
    },
  },
  sectionBottom: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    position: "absolute",
    bottom: 0,
  },
  contentContainer: {
    position: "relative",
    height: "100%",
  },
}));

export default TaskPayPage;
