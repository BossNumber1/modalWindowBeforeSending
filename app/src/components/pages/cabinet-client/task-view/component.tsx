import React from 'react'
import {
  Button,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Theme,
  Typography,
} from "@material-ui/core";

import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";

import { TaskStatusEnumPr } from "@problembo/grpc-web-problembo-core/common/core-share_pb";

import { useKeycloak } from "@react-keycloak/web";

import { useEffect, useState } from "react";
import DocumentTitle from "react-document-title";
import { Redirect, RouteComponentProps } from "react-router";
import { Link as RouterLink, useHistory } from "react-router-dom";

import {
  clientGetTask,
  ClientGetTaskReturn,
  clientTaskCancel,
  clientTaskConfirm
} from "api/grpc/client";

import { CommonReturnMessagePrReturn, ResponseType } from "api/grpc/common";

import { generateCategoriesString, getTaskStatusString } from "lib/helper";

import useDownloadFile from "hooks/use-download-file";
import useModal from "hooks/use-modal";

import { routes } from "components/app/routes";

import Page from "components/common/page";
import Section from "components/common/section";
import ModalConfirm from "components/common/modal/confirm";
import ModalCanConfirm from "../../../common/modal/can-confirm";
import Modal from "components/common/modal";
import LoadingContainer from "components/common/loading-container/component";
import useDateFormatter from "hooks/use-date-formatter";
//import {ChangeModalType} from "../../../common/modal/change-phone";

interface TaskViewContentProps {
  taskData: ClientGetTaskReturn;
  taskId: number;
  token: string;
}

const TaskViewContent = (props: TaskViewContentProps) => {

  const { taskData, taskId, token } = props;

  const { assignagent, task, allowedaction } = taskData;

  const [taskCancelResponse, setTaskCancelResponse] = useState<
      CommonReturnMessagePrReturn | undefined
      >(undefined);

  const [taskConfirmResponse, setConfirmResponse] = useState<
      CommonReturnMessagePrReturn | undefined
      >(undefined);

  console.log(taskConfirmResponse)

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const [modalProps, { closeModal, openModal }] = useModal();

  const [modalCanConfirmProps, {openModal: openCanConfirmModal, closeModal: closeCanConfirmModal}]  = useModal();

  const history = useHistory();

  const classes = useStyles();

  const isLoaded = taskCancelResponse?.responseType === ResponseType.Success;

  const isError = taskCancelResponse?.responseType === ResponseType.Error;

  const onConfirmSubmit = async () => {
    closeModal();
    setIsSubmitted(true);

    clientTaskCancel({ token, taskId }).then((res) => {
      setTaskCancelResponse(res);
    });
  };


  const onCanConfirm = async () => {
    closeCanConfirmModal()
    clientTaskConfirm({ token, taskId }).then((res) => {
      setConfirmResponse(res)
    })
    history.go(0)

  }

  const downloadFile = useDownloadFile(token);

  const formatDate = useDateFormatter();

  const onReturnButtonClick = () => {
    history.push(routes.client.getRedirectPath());
  };

  if (isSubmitted) {
    return (
        <LoadingContainer
            isLoaded={isLoaded}
            isError={isError}
            errorMessage={taskCancelResponse?.message}
            redirectPathOnError={routes.client.getRedirectPath()}
        >
          <Redirect to={routes.client.getRoutePath()} />
        </LoadingContainer>
    );
  }

  return (
      <>
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
                    Номер задачи:
                  </TableCell>
                  <TableCell>{task?.taskshort?.taskid?.taskid || "—"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Дата создания:
                  </TableCell>
                  <TableCell>
                    {formatDate(task?.taskshort?.datecreate) || "—"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Статус:
                  </TableCell>
                  <TableCell>
                    {getTaskStatusString(task?.taskshort?.status) || "—"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Категория:
                  </TableCell>
                  <TableCell>
                    {generateCategoriesString(task?.taskshort?.categoryList)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Назначенный специалист:
                  </TableCell>
                  <TableCell>{assignagent || "—"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Согласованное время:
                  </TableCell>
                  <TableCell>{task?.taskshort?.scheduledtime || "—"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Стоимость выполнения:
                  </TableCell>
                  <TableCell>
                    {task?.taskshort?.price
                        ? task?.taskshort?.price + " руб"
                        : "—"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Section>
        <Section className={classes.section}>
          <Paper className={classes.paper}>
            <Typography variant="h6">Описание задачи</Typography>
            <Typography variant="body1">{task?.problemtext || "—"}</Typography>
          </Paper>
        </Section>
        {!!task?.filesList.length && (
            <Section className={classes.section}>
              <Paper className={classes.paper}>
                <Typography>Файлы:</Typography>
                <div className={classes.filesContainer}>
                  {task.filesList.map((item, index) => (
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
              </Paper>
            </Section>
        )}
        {task?.taskshort?.status && [TaskStatusEnumPr.TASK_STATUS_ENUM_PR_MODER_REQ_UPDATE, TaskStatusEnumPr.TASK_STATUS_ENUM_PR_MODER_BLOCK].includes(task.taskshort.status) && (<Section className={classes.section}>
            <Paper className={classes.paper}>
              <Typography variant="h6">Комментарий модератора</Typography>
              <Typography variant="body1">{task?.lastmoderatorremark || "—"}</Typography>
            </Paper>
          </Section>
        )}
        <Section className={classes.section}>
          <div className={classes.buttonActionContainer}>
            <Button
                variant="contained"
                color="primary"
                disabled={!allowedaction?.ischoiceagent}
                component={RouterLink}
                to={routes.client.task.taskId.choiceAgent.getRedirectPath({
                  taskId: taskId.toString(),
                })}
            >
              Выбор специалиста
            </Button>
            <Typography>{allowedaction?.choiceagentdesc}</Typography>
          </div>
          <div className={classes.buttonActionContainer}>
            <Button
                variant="contained"
                color="primary"
                disabled={!allowedaction?.ispay}
                component={RouterLink}
                to={routes.client.task.taskId.pay.getRedirectPath({
                  taskId: taskId.toString(),
                })}
            >
              Оплата
            </Button>
            <Typography>{allowedaction?.paydesc}</Typography>
          </div>
          <div className={classes.buttonActionContainer}>
            <Button
                variant="contained"
                color="primary"
                disabled={!allowedaction?.iscancel}
                onClick={openModal}
            >
              Отмена заказа
            </Button>
            <Typography>{allowedaction?.canceldesc}</Typography>
          </div>
          <div className={classes.buttonActionContainer}>
            <Button
                variant="contained"
                color="primary"
                disabled={!allowedaction?.isedit}
                component={RouterLink}
                to={routes.client.task.taskId.edit.getRedirectPath({
                  taskId: taskId.toString(),
                })}
            >
              Изменить задачу
            </Button>
            <Typography>{allowedaction?.editdesc}</Typography>
          </div>
          <div className={classes.buttonActionContainer}>
            <Button
                variant="contained"
                color="primary"
                disabled={!allowedaction?.isreview}
            >
              Поставить оценку
            </Button>
            <Typography>{allowedaction?.reviewdesc}</Typography>
          </div>
          <div className={classes.buttonActionContainer}>
            <Button
                variant="contained"
                color="primary"
                disabled={!allowedaction?.isclaim}
            >
              Составить претензию
            </Button>
            <Typography>{allowedaction?.claimdesc}</Typography>
          </div>


          <div className={classes.buttonActionContainer}>
            <Button
                variant="contained"
                color="primary"
                disabled={!allowedaction?.iscanconfirm}
                onClick={openCanConfirmModal}
            >
              Подтвердить выполнение
            </Button>
            <Typography>{allowedaction?.canconfirmdesc}</Typography>
          </div>


        </Section>
        <Modal {...modalProps}>
          <ModalConfirm
              onSubmit={onConfirmSubmit}
              onCancel={() => {
                closeModal();
              }}
          />
        </Modal>

        <Modal {...modalCanConfirmProps}>
          <ModalCanConfirm
              onCloseConfirmModal={() => {
                closeCanConfirmModal();
              }}
              onConfirm={onCanConfirm}
              taskId={taskId}
          />
        </Modal>
      </>
  );
};

interface TaskViewMatchParams {
  taskId: string;
}

interface TaskViewProps extends RouteComponentProps<TaskViewMatchParams> {}

const TaskViewPage = (props: TaskViewProps) => {
  const { match } = props;

  const taskId = Number(match.params.taskId);

  const [taskData, setTaskData] = useState<ClientGetTaskReturn | undefined>(
      undefined
  );

  const { keycloak } = useKeycloak();

  const token = keycloak.token;

  const isLoaded = taskData?.responseType === ResponseType.Success;

  const isError = taskData?.responseType === ResponseType.Error;

  useEffect(() => {
    if (token && taskId) {
      clientGetTask({ token, taskId }).then((res) => {
        setTaskData(res);
      });
    }
  }, [token, taskId]);

  return (
      <DocumentTitle title="Кабинет клиента — просмотр задачи">
        <Page>
          <LoadingContainer
              isLoaded={isLoaded}
              isError={isError}
              errorMessage={taskData?.message}
              redirectPathOnError={routes.client.getRedirectPath()}
          >
            {taskData?.responseType === ResponseType.Success && token && (
                <TaskViewContent
                    taskData={taskData}
                    taskId={taskId}
                    token={token}
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
  },
  tableContainer: {
    width: "auto",
  },
  paper: {
    padding: theme.spacing(2),
    width: "100%",
    backgroundColor: theme.palette.action.hover,
    "& > :not(:last-child)": {
      marginBottom: 20,
    },
  },
  buttonActionContainer: {
    display: "flex",
    "& > :not(:last-child)": {
      marginRight: 20,
    },
    "& + &": {
      marginTop: 30,
    },
  },
  filesContainer: {
    display: "inline-flex",
    justifyContent: "flex-start",
    flexWrap: "wrap",
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
}));

export default TaskViewPage;
