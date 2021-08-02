import React from 'react'
import {
  Button,
  makeStyles,
  TextareaAutosize,
  Typography,
} from "@material-ui/core";

import { Rating } from "@material-ui/lab";

import { useKeycloak } from "@react-keycloak/web";

import { useState } from "react";
import DocumentTitle from "react-document-title";
import { Link as RouterLink, Redirect, useParams } from "react-router-dom";

import { clientSetReview } from "api/grpc/client";

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

interface TaskReviewAddMatchParams {
  taskId: string;
}

interface TaskReviewAddContentProps {
  token: string;
}

const TaskReviewAddContent = (props: TaskReviewAddContentProps) => {
  const { token } = props;

  const { taskId } = useParams<TaskReviewAddMatchParams>();

  const [rating, setRating] = useState<number | null>(null);

  const [submitState, setSubmitState] = useState<SubmitState>(SubmitState.Idle);

  const [comment, setComment] = useState<string>("");

  const [errorMessage, setErrorMessage] = useState<string>("");

  const classes = useStyles();

  const onRatingChange = (
    e: React.ChangeEvent<{}>,
    newRating: number | null
  ): void => {
    setRating(newRating);
  };

  const onCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setComment(e.target.value);
  };

  const onSubmit = async (e: React.SyntheticEvent): Promise<void> => {
    e.preventDefault();

    if (!rating) {
      return;
    }

    setSubmitState(SubmitState.Submitted);

    const response = await clientSetReview({
      token,
      taskId: Number(taskId),
      rating,
      comment,
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
      <Section className={classes.section}>
        <Typography>Поставьте оценку по пятибальной шкале</Typography>
        <Rating
          name="simple-controlled"
          value={rating}
          onChange={onRatingChange}
        />
      </Section>
      <Section className={classes.section}>
        <Typography>Комментарий:</Typography>
        <TextareaAutosize
          rowsMin={20}
          className={classes.descriptionInput}
          onChange={onCommentChange}
          value={comment}
        />
      </Section>
      <Section>
        <div className={classes.buttonContainer}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!rating}
          >
            Отправить отзыв
          </Button>
          {rating && rating <= 2 && (
            <Button
              type="button"
              variant="contained"
              color="primary"
              component={RouterLink}
              to={routes.client.task.taskId.addClaim.getRedirectPath({
                taskId,
              })}
            >
              Перейти к форме претензии
            </Button>
          )}
        </div>
      </Section>
    </form>
  );
};

const TaskReviewAddPage = () => {
  const { keycloak } = useKeycloak();

  const token = keycloak.token;

  return (
    <DocumentTitle title="Кабинет клиента — отправка отзыва по задаче">
      <Page>{token && <TaskReviewAddContent token={token} />}</Page>
    </DocumentTitle>
  );
};

const useStyles = makeStyles(() => ({
  section: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    "& > :not(:last-child)": {
      marginBottom: 20,
    },
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    width: "100%",
  },
  descriptionInput: {
    width: "100%",
  },
}));

export default TaskReviewAddPage;
