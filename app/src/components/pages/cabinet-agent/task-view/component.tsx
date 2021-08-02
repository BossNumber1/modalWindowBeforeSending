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

import { TaskPr } from "@problembo/grpc-web-problembo-core/common/task-share_pb";

import { useKeycloak } from "@react-keycloak/web";

import { useCallback, useEffect, useState } from "react";
import DocumentTitle from "react-document-title";
import { Redirect } from "react-router";
import { useHistory, useParams } from "react-router-dom";

import agentApi, { AgentGetTaskReturn } from "api/grpc/agent";

import { CommonReturnMessagePrReturn, ResponseType } from "api/grpc/common";

import {
  generateCategoriesString,
  generateTableString,
  getTaskStatusString,
} from "lib/helper";

import useDownloadFile from "hooks/use-download-file";
import useModal from "hooks/use-modal";

import { routes } from "components/app/routes";

import LoadingContainer from "components/common/loading-container";
import ModalConfirm from "components/common/modal/confirm";
import Modal from "components/common/modal";
import Page from "components/common/page";
import Section from "components/common/section";
import ModalAlert from "components/common/modal/alert";
import ModalSetPrice from "components/common/modal/set-price";
import ModalSetTime from "components/common/modal/set-time";
import useDateFormatter from "hooks/use-date-formatter";

enum SubmitState {
  Submitted,
  Success,
  Error,
  Idle,
}

enum SubmitType {
  Cancel,
  Hide,
}

function _getRedirectPathOnError(
  taskId: number
): string {
  return routes.agent.task.taskId.view.getRedirectPath({
    taskId: taskId.toString(),
  });
}

interface AgentTaskViewTableProps {
  task: TaskPr.AsObject;
  clientname: string;
}

const AgentTaskViewTable = (props: AgentTaskViewTableProps) => {
  const { clientname, task } = props;

  const formatDate = useDateFormatter()

  const classes = useStyles();

  return (
    <TableContainer className={classes.tableContainer}>
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell component="th" scope="row">
              Номер:
            </TableCell>
            <TableCell>
              {generateTableString(task.taskshort?.taskid?.taskid)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">
              Дата создания:
            </TableCell>
            <TableCell>
              {generateTableString(formatDate(task?.taskshort?.datecreate))}
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
              Стоимость выполнения:
            </TableCell>
            <TableCell>{generateTableString(task.taskshort?.price)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">
              Клиент:
            </TableCell>
            <TableCell>{generateTableString(clientname)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">
              Статус:
            </TableCell>
            <TableCell>
              {getTaskStatusString(task?.taskshort?.status) || "—"}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

interface AgentTaskViewContentProps {
  taskData: AgentGetTaskReturn;
  taskId: number;
  token: string;
  reload: () => void;
}

const AgentTaskViewContent = (props: AgentTaskViewContentProps) => {
  const { taskData, taskId, token, reload } = props;

  const { clientname, task, allowedaction } = taskData;

  const [submitState, setSubmitState] = useState<SubmitState>(SubmitState.Idle);

  const [errorMessage, setErrorMessage] = useState<string>("");

  const [
    modalCancelProps,
    { closeModal: closeModalCancel, openModal: openModalCancel },
  ] = useModal();

  const [
    modalHideProps,
    { closeModal: closeModalHide, openModal: openModalHide },
  ] = useModal();

  const [
    modalAlertProps,
    { closeModal: closeModalAlert, openModal: openModalAlert },
  ] = useModal();

  const [
    modalPriceProps,
    { closeModal: closeModalPrice, openModal: openModalPrice }
  ] = useModal();

  const [
    modalTimeProps,
    { closeModal: closeModalTime, openModal: openModalTime }
  ] = useModal();

  const [
    modalConfifrmTaskAsComplitedProps,
    { closeModal: closeModalConfifrmTaskAsComplited, openModal: openModalConfirmTaskAsComplited }
  ] = useModal();

  const history = useHistory();

  const classes = useStyles();

  const getResponse = async (type: SubmitType) => {
    switch (type) {
      case SubmitType.Cancel:
        return await agentApi.taskCancel({ token, taskId });

      case SubmitType.Hide:
        return await agentApi.hideTask({ token, taskId });
    }
  };

  const onSubmit = async (type: SubmitType) => {
    closeModalHide();

    setSubmitState(SubmitState.Submitted);

    const response = await getResponse(type);

    if (response.responseType === ResponseType.Error) {
      setSubmitState(SubmitState.Error);

      setErrorMessage(response.message || "");

      return;
    }

    setSubmitState(SubmitState.Success);
  };

  const callToClient = async () => {
    openModalAlert();

    agentApi.callToClient({ token, taskId });
  };

  const handleTaskAsComplitedSubmit = async () => {
    closeModalConfifrmTaskAsComplited();

    agentApi.setTaskAsComplited({ token, taskId });
  };

  const downloadFile = useDownloadFile(token);

  const handlePriceSubmit = (response: CommonReturnMessagePrReturn) => {
    if (response.responseType === ResponseType.Success) {
      reload();
      closeModalPrice();
      setSubmitState(SubmitState.Success);
    }
  };

  const handleTimeSubmit = (response: CommonReturnMessagePrReturn) => {
    if (response.responseType === ResponseType.Error) {
      setSubmitState(SubmitState.Error);

      setErrorMessage(response.message || "");

      return;
    }

    closeModalTime();
    setSubmitState(SubmitState.Success);
  };

  const onReturnButtonClick = () => {
    history.push(routes.agent.getRedirectPath());
  };

  if (submitState !== SubmitState.Idle) {
    return (
      <LoadingContainer
        isLoaded={submitState === SubmitState.Success}
        isError={submitState === SubmitState.Error}
        errorMessage={errorMessage}
        redirectPathOnError={_getRedirectPathOnError(taskId)}
      >
        <Redirect to={routes.agent.getRoutePath()} />
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
        {task && (
          <AgentTaskViewTable task={task} clientname={clientname} />
        )}
      </Section>
      <Section className={classes.section}>
        <Paper className={classes.paper}>
          <Typography variant="h6">Описание задачи</Typography>
          <Typography variant="body1">
            {generateTableString(task?.problemtext)}
          </Typography>
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
      <Section className={classes.section}>
        <Button
          variant="contained"
          color="primary"
          disabled={!allowedaction?.iscansetsessiontime}
          onClick={openModalTime}
        >
          Установить время начала сессии
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!allowedaction?.iscancall}
          onClick={callToClient}
        >
          Позвонить клиенту
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!allowedaction?.iscancancel}
          onClick={openModalCancel}
        >
          Отмена заказа
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!allowedaction?.iscanconfirm}
          onClick={openModalConfirmTaskAsComplited}
        >
          Решено
        </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!allowedaction?.iscanhide}
            onClick={openModalHide}>
            Не показывать
          </Button>

          <Button
            variant="contained"
            color="primary"
            disabled={!allowedaction?.iscanoffer}
            onClick={openModalPrice}
          >
            Предложить стоимость
          </Button>
      </Section>
      <Modal {...modalCancelProps}>
        <ModalConfirm
          onSubmit={() => onSubmit(SubmitType.Cancel)}
          onCancel={closeModalCancel}
        />
      </Modal>
      <Modal {...modalHideProps}>
        <ModalConfirm
          onSubmit={() => onSubmit(SubmitType.Hide)}
          onCancel={closeModalHide}
        />
      </Modal>
      <Modal {...modalAlertProps}>
        <ModalAlert text="Звонок клиенту" closeModal={closeModalAlert} />
      </Modal>
      <Modal {...modalPriceProps}>
        <ModalSetPrice onSubmit={handlePriceSubmit} />
      </Modal>
      <Modal {...modalTimeProps}>
        <ModalSetTime onSubmit={handleTimeSubmit} />
      </Modal>
      <Modal {...modalConfifrmTaskAsComplitedProps}>
        <ModalConfirm
          onSubmit={handleTaskAsComplitedSubmit}
          onCancel={closeModalConfifrmTaskAsComplited}
        />
      </Modal>
    </>
  );
};

interface AgentTaskViewMatchParams {
  taskId: string;
}

const AgentTaskViewPage = () => {
  const params = useParams<AgentTaskViewMatchParams>();

  const taskId = Number(params.taskId);

  const [taskData, setTaskData] = useState<AgentGetTaskReturn | null>(null);

  const { keycloak } = useKeycloak();

  const token = keycloak.token;

  const isLoaded = taskData?.responseType === ResponseType.Success;

  const isError = taskData?.responseType === ResponseType.Error;

  const reload = useCallback(() => {
    if (!(token && taskId)) {
      return;
    }
    agentApi.getTask({ token, taskId }).then((res) => {
      setTaskData(res);
    });
  }, [token, taskId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <DocumentTitle title="Кабинет агента — просмотр задачи">
      <Page>
        <LoadingContainer
          isLoaded={isLoaded}
          isError={isError}
          errorMessage={taskData?.message}
          redirectPathOnError={_getRedirectPathOnError(taskId)}
        >
          {taskData?.responseType === ResponseType.Success && token && (
            <AgentTaskViewContent
              taskData={taskData}
              taskId={taskId}
              token={token}
              reload={reload}
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
  paper: {
    padding: theme.spacing(2),
    width: "100%",
    backgroundColor: theme.palette.action.hover,
    "& > :not(:last-child)": {
      marginBottom: 20,
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

export default AgentTaskViewPage;
