import React from 'react'
import { Button, makeStyles, Typography } from "@material-ui/core";

import { PayStatusEnumPr } from "@problembo/grpc-web-problembo-core/common/core-share_pb";

import { useKeycloak } from "@react-keycloak/web";

import { useEffect, useState } from "react";
import DocumentTitle from "react-document-title";
import { RouteComponentProps, useHistory } from "react-router";

import { clientPayStatus, ClientPayStatusReturn } from "api/grpc/client";

import { ResponseType } from "api/grpc/common";

import { routes } from "components/app/routes";

import LoadingContainer from "components/common/loading-container";
import Page from "components/common/page";
import Section from "components/common/section";

interface TaskPayWaitContentProps {
  token: string;
  taskId: number;
}

const TaskPayWaitContent = (props: TaskPayWaitContentProps) => {
  const { token, taskId } = props;

  const [payStatus, setPayStatus] =
    useState<ClientPayStatusReturn | undefined>(undefined);

  const history = useHistory();

  const classes = useStyles();

  const isLoaded = payStatus?.responseType === ResponseType.Success;

  const isError = payStatus?.responseType === ResponseType.Error;

  const status = payStatus?.status;

  const isPaid = status === PayStatusEnumPr.PAY_STATUS_ENUM_PR_PAID;

  const isFailed = status === PayStatusEnumPr.PAY_STATUS_ENUM_PR_FAIL;

  const isProcessing = status === PayStatusEnumPr.PAY_STATUS_ENUM_PR_PROCESSING;

  useEffect(() => {
    if (isPaid || isFailed || isError) {
      return;
    }

    const intervalId = setInterval(() => {
      clientPayStatus({ token, taskId }).then((res) => {
        setPayStatus(res);
      });
    }, 1000);

    setTimeout(() => {
      clearInterval(intervalId);
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [token, taskId, isPaid, isFailed, isError]);

  const onButtonClick = (): void => {
    history.push(
      routes.client.task.taskId.view.getRedirectPath({
        taskId: taskId.toString(),
      })
    );
  };

  return (
    <LoadingContainer
      isLoaded={isLoaded}
      isError={isError}
      errorMessage={payStatus?.message}
      redirectPathOnError={routes.client.task.taskId.view.getRedirectPath({
        taskId: taskId.toString(),
      })}
    >
      {isPaid && (
        <Section className={classes.section}>
          <Typography>Процесс оплаты успешно завершен</Typography>
          <Button variant="contained" color="primary" onClick={onButtonClick}>
            Закрыть
          </Button>
        </Section>
      )}
      {isFailed && (
        <Section className={classes.section}>
          <Typography color="error">Ошибка при оплате!</Typography>
          <Button variant="contained" color="primary" onClick={onButtonClick}>
            Закрыть
          </Button>
        </Section>
      )}
      {isProcessing && (
        <Section className={classes.section}>
          <Typography>Ожидаем зачисления оплаты...</Typography>
        </Section>
      )}
    </LoadingContainer>
  );
};

interface TaskPayWaitMatchParams {
  taskId: string;
}

interface TaskPayWaitProps
  extends RouteComponentProps<TaskPayWaitMatchParams> {}

const TaskPayWaitPage = (props: TaskPayWaitProps) => {
  const { match } = props;

  const taskId = Number(match.params.taskId);

  const { keycloak } = useKeycloak();

  const token = keycloak.token;

  return (
    <DocumentTitle title="Кабинет клиента — ожидание оплаты">
      <Page>
        {taskId && token && (
          <TaskPayWaitContent taskId={taskId} token={token} />
        )}
      </Page>
    </DocumentTitle>
  );
};

const useStyles = makeStyles(() => ({
  section: {
    height: "100%",
    width: "100%",
    "& > :not(:last-child)": {
      marginBottom: 20,
    },
  },
}));

export default TaskPayWaitPage;
