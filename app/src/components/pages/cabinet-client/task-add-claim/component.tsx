import React from 'react'
import {
  Button,
  makeStyles,
  TextareaAutosize,
  Typography,
} from "@material-ui/core";

import { useKeycloak } from "@react-keycloak/web";

import { useState } from "react";
import DocumentTitle from "react-document-title";
import { Redirect, useParams } from "react-router-dom";

import { clientCreateTaskClaim } from "api/grpc/client";

import { ResponseType } from "api/grpc/common";

import { routes } from "components/app/routes";

import LoadingContainer from "components/common/loading-container";
import Page from "components/common/page";
import Section from "components/common/section";

enum SubmitState {
  Submitted,
  Success,
  Error,
  Idle,
}

interface TaskAddClaimMatchParams {
  taskId: string;
}

interface TaskAddClaimContentProps {
  token: string;
}

const TaskAddClaimContent = (props: TaskAddClaimContentProps) => {
  const { token } = props;

  const { taskId } = useParams<TaskAddClaimMatchParams>();

  const [content, setContent] = useState<string>("");

  const [submitState, setSubmitState] = useState<SubmitState>(SubmitState.Idle);

  const [errorMessage, setErrorMessage] = useState<string>("");

  const classes = useStyles();

  const onContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setContent(e.target.value);
  };

  const onSubmit = async (e: React.SyntheticEvent): Promise<void> => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    setSubmitState(SubmitState.Submitted);

    const response = await clientCreateTaskClaim({
      token,
      taskId: Number(taskId),
      content,
    });

    if (response.responseType === ResponseType.Error) {
      setSubmitState(SubmitState.Error);

      setErrorMessage(response.message || "");

      return;
    }

    setSubmitState(SubmitState.Success);
  };

  if (submitState !== SubmitState.Idle) {
    return (
      <LoadingContainer
        isLoaded={submitState === SubmitState.Success}
        isError={submitState === SubmitState.Error}
        errorMessage={errorMessage}
        redirectPathOnError={routes.client.task.taskId.view.getRedirectPath({
          taskId,
        })}
      >
        <Redirect
          to={routes.client.task.taskId.view.getRedirectPath({
            taskId,
          })}
        />
      </LoadingContainer>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <Section className={classes.section1}>
        <Typography>Номер задачи: {taskId}</Typography>
        <TextareaAutosize
          rowsMin={20}
          className={classes.descriptionInput}
          onChange={onContentChange}
          value={content}
        />
      </Section>
      <Section className={classes.section2}>
        <Button type="submit" variant="contained" color="primary">
          Создать претензию
        </Button>
      </Section>
    </form>
  );
};

const TaskAddClaimPage = () => {
  const { keycloak } = useKeycloak();

  const token = keycloak.token;

  return (
    <DocumentTitle title="Кабинет клиента — отправка претензии по задаче">
      <Page>{token && <TaskAddClaimContent token={token} />}</Page>
    </DocumentTitle>
  );
};

const useStyles = makeStyles(() => ({
  section1: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    "& > :not(:last-child)": {
      marginBottom: 20,
    },
  },
  section2: {
    display: "flex",
    alignItems: "flex-end",
  },
  descriptionInput: {
    width: "100%",
  },
}));

export default TaskAddClaimPage;
