import {
  Button,
  makeStyles,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Theme,
  Typography,
  Select,
  TextareaAutosize,
} from "@material-ui/core";

import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";

import { TaskStatusEnumPr } from "@problembo/grpc-web-problembo-core/common/core-share_pb";

import { useKeycloak } from "@react-keycloak/web";

import React, { useCallback, useEffect, useState } from "react";
import DocumentTitle from "react-document-title";
import { Redirect, RouteComponentProps } from "react-router";
import { useHistory } from "react-router-dom";

import { CommonReturnMessagePrReturn, ResponseType } from "api/grpc/common";

import moderatorApi, {
  GetTaskForReviewReturn,
  VerifyTaskArgs,
} from "api/grpc/moderator";

import { getTaskStatusString } from "lib/helper";

import useDownloadFile from "hooks/use-download-file";

import { routes } from "components/app/routes";

import Categories, {
  CategoriesLoadState,
  CategoryDataList,
  getIsLastCategorySelected,
} from "components/common/categories";
import Page from "components/common/page";
import Section from "components/common/section";
import LoadingContainer from "components/common/loading-container";

interface ModeratorTaskViewContentProps {
  taskData: GetTaskForReviewReturn;
  taskId: number;
  token: string;
  getLoadingState: (state: CategoriesLoadState) => void;
}

const ModeratorTaskViewContent = (props: ModeratorTaskViewContentProps) => {
  const { taskData, taskId, token, getLoadingState } = props;

  const { taskshort, filesList, problemtext } = taskData;

  const [messageForClient, setMessageForClient] = useState<string>("");

  const onMessageForClientChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setMessageForClient(e.target.value);
  };

  const [verifyTaskResponse, setVerifyTaskResponse] =
    useState<CommonReturnMessagePrReturn | null>(null);

  const [taskStatus, setTaskStatus] = useState<TaskStatusEnumPr>(
    TaskStatusEnumPr.TASK_STATUS_ENUM_PR_UNSPECIFIED
  );

  const [categories, setCategories] = useState<CategoryDataList | null>(null);

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const history = useHistory();

  const classes = useStyles();

  const isLoaded = verifyTaskResponse?.responseType === ResponseType.Success;

  const isError = verifyTaskResponse?.responseType === ResponseType.Error;

  const isMessageForClient = [TaskStatusEnumPr.TASK_STATUS_ENUM_PR_MODER_REQ_UPDATE, TaskStatusEnumPr.TASK_STATUS_ENUM_PR_MODER_BLOCK].includes(taskStatus)

  const isStatusSuccess =
    taskStatus === TaskStatusEnumPr.TASK_STATUS_ENUM_PR_MODER_SUCCESS;

  const isSubmitDisabled = isStatusSuccess
    ? !getIsLastCategorySelected(categories)
    : isMessageForClient
      ? (!messageForClient.length || taskStatus === TaskStatusEnumPr.TASK_STATUS_ENUM_PR_UNSPECIFIED)
      : taskStatus === TaskStatusEnumPr.TASK_STATUS_ENUM_PR_UNSPECIFIED;

  const getCategories = (categories: CategoryDataList): void => {
    setCategories(categories);
  };

  const onTaskStatusChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setTaskStatus(e.target.value as TaskStatusEnumPr);
  };

  const onSubmit = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();

      if (!isMessageForClient) {
        setMessageForClient("");
      }

      const isValidForm = !isSubmitDisabled
        || (isMessageForClient && messageForClient.trim());

      if (!isValidForm) {
        return;
      }

      setIsSubmitted(true);

      const verifyTaskArgs = {
        token,
        taskId,
        messageForClient: isMessageForClient ? messageForClient : "",
        status: taskStatus,
      } as VerifyTaskArgs;

      if (isStatusSuccess && categories) {
        const categoriesList = categories.map(
          (category) => category.selectedChild
        ) as number[];

        verifyTaskArgs.categoriesList = categoriesList;
      }

      moderatorApi.verifyTask(verifyTaskArgs).then((res) => {
        setVerifyTaskResponse(res);
      });
    },
    [categories, taskId, taskStatus, messageForClient, isMessageForClient, token, isSubmitDisabled, isStatusSuccess]
  );

  const downloadFile = useDownloadFile(token);

  const onReturnButtonClick = () => {
    history.push(routes.mod.getRedirectPath());
  };

  if (isSubmitted) {
    return (
      <LoadingContainer
        isLoaded={isLoaded}
        isError={isError}
        errorMessage={verifyTaskResponse?.message}
        redirectPathOnError={routes.mod.getRoutePath()}
      >
        <Redirect to={routes.mod.getRoutePath()} />
      </LoadingContainer>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <Section className={classes.section1}>
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={onReturnButtonClick}
        >
          Назад
        </Button>
      </Section>
      <Section className={classes.section}>
        <TableContainer className={classes.tableContainer}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell component="th" scope="row">
                  ID Задачи:
                </TableCell>
                <TableCell>{taskId}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                  Клиент:
                </TableCell>
                <TableCell>Имя Отчество</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                  Статус:
                </TableCell>
                <TableCell>
                  {getTaskStatusString(taskshort?.status) || "—"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Section>
      <Section className={classes.section}>
        <Paper className={classes.problemTextContainer}>
          <Typography variant="body1">{problemtext || "—"}</Typography>
        </Paper>
      </Section>
      {!!filesList.length && (
        <Section className={classes.section}>
          <Typography>Файлы:</Typography>
          <div className={classes.filesContainer}>
            {filesList.map((item, index) => (
              <div
                key={index}
                className={classes.fileContainer}
                onClick={() => {
                  downloadFile(item.fileid, item.fileid);
                }}
              >
                <InsertDriveFileIcon color="action" />
                <Typography variant="subtitle2">Скачать файл</Typography>
              </div>
            ))}
          </div>
        </Section>
      )}

      {isMessageForClient && <Section className={classes.section}>
        <Typography>Сообщение клиенту:</Typography>
        <TextareaAutosize
          rowsMin={10}
          className={classes.descriptionInput}
          onChange={onMessageForClientChange}
          value={messageForClient}
        />
      </Section>}

      <Section className={classes.section}>
        <div className={classes.actionsWrapperContainer}>
          <div className={classes.actionsWrapperLeft}>
            <div className={classes.actionsContainer}>
              <Select
                id="task-status"
                value={taskStatus}
                onChange={onTaskStatusChange}
                className={classes.taskStatusSelect}
              >
                <MenuItem
                  value={TaskStatusEnumPr.TASK_STATUS_ENUM_PR_UNSPECIFIED}
                >
                  Не выбрано
                </MenuItem>
                <MenuItem
                  value={TaskStatusEnumPr.TASK_STATUS_ENUM_PR_MODER_BLOCK}
                >
                  Блокировать задачу
                </MenuItem>
                <MenuItem
                  value={TaskStatusEnumPr.TASK_STATUS_ENUM_PR_MODER_SUCCESS}
                >
                  Одобрить
                </MenuItem>
                <MenuItem
                  value={TaskStatusEnumPr.TASK_STATUS_ENUM_PR_MODER_REQ_UPDATE}
                >
                  Отправить на доработку
                </MenuItem>
              </Select>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitDisabled}
              >
                Выполнить
              </Button>
            </div>
          </div>
          <div className={classes.actionsWrapperRight}>
            {taskStatus ===
              TaskStatusEnumPr.TASK_STATUS_ENUM_PR_MODER_SUCCESS && (
              <Categories
                getLoadingState={getLoadingState}
                getCategories={getCategories}
              />
            )}
          </div>
        </div>
      </Section>
    </form>
  );
};

interface ModeratorTaskViewMatchParams {
  taskId: string;
}

interface ModeratorTaskViewProps
  extends RouteComponentProps<ModeratorTaskViewMatchParams> {}

const ModeratorTaskViewPage = (props: ModeratorTaskViewProps) => {
  const { match } = props;

  const taskId = Number(match.params.taskId);

  const [taskData, setTaskData] = useState<GetTaskForReviewReturn | null>(null);

  const [categoriesLoadingState, setCategoriesLoadingState] =
    useState<CategoriesLoadState | null>(null);

  const { keycloak } = useKeycloak();

  const token = keycloak.token;

  const errorMessage = taskData?.message;

  const isLoaded = taskData?.responseType === ResponseType.Success;

  const isError =
    taskData?.responseType === ResponseType.Error ||
    categoriesLoadingState === CategoriesLoadState.Error;

  const getLoadingState = (state: CategoriesLoadState) => {
    setCategoriesLoadingState(state);
  };

  useEffect(() => {
    if (token && taskId) {
      moderatorApi.getTaskForReview({ token, taskId }).then((res) => {
        setTaskData(res);
      });
    }
  }, [token, taskId]);

  return (
    <DocumentTitle title="Кабинет модератора — проверка задачи">
      <Page>
        <LoadingContainer
          isLoaded={isLoaded}
          isError={isError}
          errorMessage={errorMessage}
          redirectPathOnError={routes.mod.getRedirectPath()}
        >
          {taskData?.responseType === ResponseType.Success && token && (
            <ModeratorTaskViewContent
              taskData={taskData}
              taskId={taskId}
              token={token}
              getLoadingState={getLoadingState}
            />
          )}
        </LoadingContainer>
      </Page>
    </DocumentTitle>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  section1: {
    display: "flex",
    alignItems: "flex-start",
  },
  section: {
    display: "flex",
    alignItems: "flex-start",
    width: "100%",
    "& > :not(:last-child)": {
      marginBottom: 20,
    },
  },
  tableContainer: {
    width: "auto",
  },
  problemTextContainer: {
    padding: theme.spacing(2),
    width: "100%",
    backgroundColor: theme.palette.action.hover,
  },
  filesContainer: {
    display: "inline-flex",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    marginTop: 20,
    "& > :not(:last-child)": {
      marginRight: 30,
    },
  },
  fileContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 10,
    cursor: "pointer",
    "& > :not(:last-child)": {
      marginRight: 8,
    },
  },
  actionsWrapperContainer: {
    display: "flex",
    alignItems: "flex-start",
    width: "100%",
  },
  actionsContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    "& > :not(:last-child)": {
      marginBottom: 20,
    },
    "& + &": {
      marginTop: 70,
    },
  },
  actionsWrapperLeft: {
    display: "flex",
    flexDirection: "column",
    flex: "0 1 4000px",
  },
  actionsWrapperRight: {
    display: "flex",
    flexDirection: "column",
    flex: "0 1 6000px",
  },
  taskStatusSelect: {
    width: 300,
  },
  descriptionInput: {
    width: "100%",
  },
}));

export default ModeratorTaskViewPage;
