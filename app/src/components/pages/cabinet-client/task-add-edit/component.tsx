import {
  makeStyles,
  Button,
  TextareaAutosize,
  Typography,
  Paper,
  Theme,
} from "@material-ui/core";

import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";

import { useKeycloak } from "@react-keycloak/web";

import { DropzoneArea } from "material-ui-dropzone";
import React, { useEffect, useState } from "react";
import DocumentTitle from "react-document-title";
import { Redirect, useParams } from "react-router";

import useDownloadFile from "hooks/use-download-file";
import useModal from "hooks/use-modal";

import {
  clientAddTask,
  ClientAddTaskReturn,
  clientGetProfile,
  ClientGetProfileReturn,
  clientGetTask,
  ClientGetTaskReturn,
  clientUpdateTask,
  ClientUpdateTaskReturn,
} from "api/grpc/client";

import { ResponseType } from "api/grpc/common";

import { routes } from "components/app/routes";

import LoadingContainer from "components/common/loading-container";
import Modal from "components/common/modal";
import ModalChangePhone, {
  ChangeModalType,
} from "components/common/modal/change-phone";
import Page, { PageSize } from "components/common/page";
import Section from "components/common/section";
import fstoreApi from "api/grpc/fstore";

import { FILE_SIZE_LIMIT } from "app-constants";
import ModalAlert from "components/common/modal/alert/component";

export enum AddEditTaskMode {
  Add,
  Edit,
}

interface fileToUpload {
  file: File;
  name: string;
}

interface AddEditTaskMatchParams {
  taskId?: string;
}

interface AddEditTaskContentProps {
  token: string;
  phone: string;
  mode: AddEditTaskMode;
  taskId?: string;
  taskData: ClientGetTaskReturn | null;
}

const AddEditTaskContent = (props: AddEditTaskContentProps) => {
  const { token, phone, mode, taskId, taskData } = props;

  const [responseData, setResponseData] = useState<
    ClientAddTaskReturn | ClientUpdateTaskReturn | null
  >(null);

  const [isFilesUploaded, setIsFilesUploaded] = useState<boolean | null>(null);

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const [isClosedModal, setIsClosedModal] = useState<string>("false"); //NEW
  const [isSendForm, setIsSendForm] = useState<string>("false"); //NEW

  const [problem, setProblem] = useState<string>(
    taskData?.task?.problemtext || ""
  );

  const [files, setFiles] = useState<fileToUpload[] | []>([]);

  const [modalProps, { closeModal, openModal }] = useModal();

  const classes = useStyles();

  const downloadFile = useDownloadFile(token);

  const previewGridClasses = {
    container: classes.previewContainer,
    item: classes.previewItem,
  };

  const redirectTaskId =
    mode === AddEditTaskMode.Add
      ? responseData?.taskid?.taskid.toString()
      : taskId;

  const isLoaded =
    responseData?.responseType === ResponseType.Success &&
    isFilesUploaded === true;

  const isError =
    responseData?.responseType === ResponseType.Error ||
    isFilesUploaded === false;

  const onProblemChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setProblem(e.target.value);
  };

  const onFilesDrop = (files: File[]): void => {
    const filesToAdd = files.map((droppedFile) => ({
      file: droppedFile,
      name: droppedFile.name,
    }));

    setFiles((prevFiles) => [...prevFiles, ...filesToAdd]);
  };

  const onFileDelete = (fileToDelete: File): void => {
    setFiles((prevFiles) =>
      prevFiles.filter((prevFile) => prevFile.file !== fileToDelete)
    );
  };

  useEffect(() => {
    if (modalProps.open === false && isClosedModal === "true") {
      setIsSendForm("true");
    }
  }, [modalProps.open, isClosedModal]); //NEW

  const onSubmit = async (e: React.SyntheticEvent): Promise<void> => {
    e.preventDefault();
    
    setIsClosedModal("true"); //NEW
    openModal(); //NEW

    setIsSubmitted(true);

    const fileIds = [];

    for (const file of files) {
      const arrayBuffer = await file.file.arrayBuffer();

      const converted = new Uint8Array(arrayBuffer);

      const response = await fstoreApi.upload4SmallFile({
        token,
        file: converted,
        name: file.name,
      });

      if (response.responseType === ResponseType.Error) {
        setIsFilesUploaded(false);

        return;
      }

      fileIds.push(response.fileid);
    }

    setIsFilesUploaded(true);

    switch (mode) {
      case AddEditTaskMode.Add:
        const addResponse = await clientAddTask({
          token,
          problemText: problem,
          fileIdList: fileIds,
        });

        setResponseData(addResponse);

        break;
      case AddEditTaskMode.Edit:
        const updateResponse = await clientUpdateTask({
          token,
          taskId: Number(taskId),
          problemText: problem,
          fileIdList: fileIds,
        });

        setResponseData(updateResponse);

        break;
    }
  };

// NEW
  if (isSubmitted) {  
    if (isSendForm === "true") {
      return (
        <LoadingContainer
          isLoaded={isLoaded}
          isError={isError}
          errorMessage={responseData?.message}
          redirectPathOnError={
            taskId
              ? routes.client.task.taskId.view.getRedirectPath({
                  taskId,
                })
              : routes.client.getRedirectPath()
          }
        >
          {redirectTaskId &&  (
            <Redirect
              to={routes.client.task.taskId.view.getRedirectPath({
                taskId: redirectTaskId,
              })}
            />
          )}
        </LoadingContainer>
      );
    } else if (isSendForm === "false") {
      return ( <Modal {...modalProps}> 
        <ModalAlert
          closeModal={() => {
            closeModal();
          }}
          text="Задача № ХХХХХ создана и отправлена на проверку модератору. После проверки вы получите уведомление"
        />
      </Modal>)
    }
  }

  return (
    <>
      <form className={classes.form} onSubmit={onSubmit}>
        <Section className={classes.section1}>
          <Typography>Телефон: {phone}</Typography>
          <Button variant="contained" color="primary" onClick={openModal}>
            Изменить
          </Button>
        </Section>
        <Section>
          <Typography className={classes.sectionHeader}>
            Опишите проблемы:
          </Typography>
          <TextareaAutosize
            rowsMin={20}
            className={classes.descriptionInput}
            onChange={onProblemChange}
            value={problem}
          />
        </Section>
        <Section>
          <Typography className={classes.sectionHeader}>Файлы:</Typography>
          {!!taskData?.task?.filesList.length && (
            <Section className={classes.section}>
              <Paper className={classes.paper}>
                <div className={classes.filesContainer}>
                  {taskData?.task?.filesList.map((item, index) => (
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
          <div className={classes.dropzoneContainer}>
            <DropzoneArea
              filesLimit={10}
              dropzoneText={`Перенесите файлы или кликните по полю (не более 10 файлов, размер файла не более ${
                FILE_SIZE_LIMIT / 1024 / 1024
              } МБ)`}
              maxFileSize={FILE_SIZE_LIMIT}
              onDrop={onFilesDrop}
              onDelete={onFileDelete}
              dropzoneClass={classes.dropzoneContainer}
              previewGridClasses={previewGridClasses}
              showAlerts={false}
            />
          </div>
          <div className={classes.submitButtonContainer}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.submitButton}
            >
              {mode === AddEditTaskMode.Add
                ? "Создать задачу"
                : "Сохранить изменения"}
            </Button>
          </div>
        </Section>
      </form>
      
      <Modal {...modalProps}> 
        <ModalChangePhone
          onSubmit={() => {
            closeModal();
          }}
          modalType={ChangeModalType.Phone}
        />
      </Modal>
    </>
  );
};

interface AddEditTaskPageProps {
  mode: AddEditTaskMode;
}

const AddEditTaskPage = (props: AddEditTaskPageProps) => {
  const { mode } = props;

  const [profile, setProfile] = useState<ClientGetProfileReturn | undefined>(
    undefined
  );

  const [taskData, setTaskData] = useState<ClientGetTaskReturn | null>(null);

  const { taskId } = useParams<AddEditTaskMatchParams>();

  const { keycloak } = useKeycloak();

  const token = keycloak.token;

  const isLoaded =
    mode === AddEditTaskMode.Add
      ? profile?.responseType === ResponseType.Success
      : profile?.responseType === ResponseType.Success &&
        taskData?.responseType === ResponseType.Success;

  const isError =
    mode === AddEditTaskMode.Add
      ? profile?.responseType === ResponseType.Error
      : profile?.responseType === ResponseType.Error ||
        taskData?.responseType === ResponseType.Error;

  useEffect(() => {
    if (token) {
      clientGetProfile({ token }).then((res) => {
        setProfile(res);
      });
    }
  }, [token]);

  useEffect(() => {
    if (token && mode === AddEditTaskMode.Edit && taskId) {
      clientGetTask({ token, taskId: Number(taskId) }).then((res) => {
        setTaskData(res);
      });
    }
  }, [mode, taskId, token]);

  return (
    <DocumentTitle
      title={`Кабинет клиента — ${
        mode === AddEditTaskMode.Add ? "создание" : "редактирование"
      } задачи`}
    >
      <Page>
        <LoadingContainer
          isLoaded={isLoaded}
          isError={isError}
          errorMessage={profile?.message}
          redirectPathOnError={
            taskId
              ? routes.client.task.taskId.view.getRedirectPath({ taskId })
              : routes.client.getRedirectPath()
          }
        >
          {profile?.baseprofile && token && (
            <AddEditTaskContent
              token={token}
              phone={profile.baseprofile.phone}
              mode={mode}
              taskId={taskId}
              taskData={taskData}
            />
          )}
        </LoadingContainer>
      </Page>
    </DocumentTitle>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  form: {
    display: "flex",
    flexDirection: "column",
  },
  section1: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "100%",
    "& > :not(:last-child)": {
      marginRight: 20,
    },
  },
  sectionHeader: {
    marginBottom: 20,
    width: "100%",
  },
  descriptionInput: {
    width: "100%",
  },
  submitButton: {
    margin: "70px 70px 0 0",
  },
  submitButtonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
  },
  dropzoneContainer: {
    width: PageSize.Width,
    padding: 32,
  },
  previewContainer: {
    padding: 32,
  },
  previewItem: {
    flexBasis: "15%",
    maxWidth: "15%",
  },
  section: {
    display: "flex",
    alignItems: "flex-start",
    width: "100%",
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

export default AddEditTaskPage;
