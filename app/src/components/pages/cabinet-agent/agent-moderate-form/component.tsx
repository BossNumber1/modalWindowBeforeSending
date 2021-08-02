import React, {useCallback, useEffect, useState} from 'react'
import {Button, makeStyles, Typography} from "@material-ui/core";
import {AgentModerateFormStatusEnumPr as StatusPr} from "@problembo/grpc-web-problembo-core/common/core-share_pb";
import {useKeycloak} from "@react-keycloak/web";

import {DropzoneArea} from "material-ui-dropzone";
import DocumentTitle from "react-document-title";
import {Redirect} from "react-router";

import {ResponseType} from "api/grpc/common";

import {routes} from "components/app/routes";
import {useHistory} from "react-router-dom";
import LoadingContainer from "components/common/loading-container";
import Page from "components/common/page";
import Section from "components/common/section";
import fstoreApi from "api/grpc/fstore";
import {FILE_SIZE_LIMIT} from "app-constants";
import {SubmitState} from "lib/helper";
import agentApi from "api/grpc/agent";

interface fileToUpload {
  file: File;
  name: string;
}

const statusToString = (status: number) => {
  switch(status) {
    case StatusPr.AGENT_MODERATE_FORM_STATUS_ENUM_PR_NEW_FORM:
      return "Отправлена";
    case StatusPr.AGENT_MODERATE_FORM_STATUS_ENUM_PR_DENIED:
      return "Отклонена";
    case StatusPr.AGENT_MODERATE_FORM_STATUS_ENUM_PR_CONFIRMED:
      return "Одобрена";
    case StatusPr.AGENT_MODERATE_FORM_STATUS_ENUM_PR_REQ_FIX:
      return "Требуется исправление";
    case StatusPr.AGENT_MODERATE_FORM_STATUS_ENUM_PR_AFTER_FIX:
      return "Отправлена на повторную проверку";
    case StatusPr.AGENT_MODERATE_FORM_STATUS_ENUM_PR_UNSPECIFIED:
    default:
      return "Анкета не отправлена";
  }
}

const AgentModerateForm = () => {

  const [mainFile, setMainFile] = useState<fileToUpload | null>(null);

  const [placeFile, setPlaceFile] = useState<fileToUpload | null>(null);

  const [selfieFile, setSelfieFile] = useState<fileToUpload | null>(null);

  const [submitState, setSubmitState] = useState<SubmitState>(SubmitState.Idle);

  const [errorMessage, setErrorMessage] = useState<string>("");

  const [status, setStatus] = useState<string | null>(null);

  const [comment, setComment] = useState<string | null>(null);

  const history = useHistory();

  const classes = useStyles();

  const { keycloak } = useKeycloak();

  const token = keycloak.token;


  useEffect(() => {
    (async () => {
      if(!token) return;
      try {
        const res = await agentApi.getAgentModerateForm({token});
        setStatus(statusToString(res.status));
        setComment(res.comment);
        console.log(res);
      } catch {
        setStatus(statusToString(0));
      }
    })()
  }, [token]);



  const onMainDrop = (files: File[]): void => {
    setMainFile({ file: files[0], name: files[0].name });
  };

  const onReturnButtonClick = () => {
    history.push(routes.agent.profile.getRedirectPath());
  };

  const onMainDelete = (): void => {
    setMainFile(null);
  };

  const onPlaceDrop = (files: File[]): void => {
    setPlaceFile({ file: files[0], name: files[0].name });
  };

  const onPlaceDelete = (): void => {
    setPlaceFile(null);
  };

  const onSelfieDrop = (files: File[]): void => {
    setSelfieFile({ file: files[0], name: files[0].name });
  };

  const onSelfieDelete = (): void => {
    setSelfieFile(null);
  };

  const uploadFile = useCallback(
    async (file: fileToUpload) => {
      if (!token) {
        return;
      }

      const arrayBuffer = await file.file.arrayBuffer();

      const converted = new Uint8Array(arrayBuffer);

      const response = await fstoreApi.upload4SmallFile({
        token,
        file: converted,
        name: file.name,
      });

      if (response.responseType === ResponseType.Error) {
        setErrorMessage(response.message || "");

        setSubmitState(SubmitState.Error);

        return;
      }

      return response.fileid;
    },
    [token]
  );

  const onSubmit = useCallback(async () => {
    if (!(token && mainFile && placeFile && selfieFile)) {
      return;
    }

    setSubmitState(SubmitState.Submitted);

    const mainFileId = await uploadFile(mainFile);

    const placeFileId = await uploadFile(placeFile);

    const selfieFileId = await uploadFile(selfieFile);

    if (mainFileId && placeFileId && selfieFileId) {
      const response = await agentApi.setAgentModerateForm({
        token,
        mainFileId,
        placeFileId,
        selfieFileId,
      });

      if (response.responseType === ResponseType.Error) {
        setErrorMessage(response.message || "");

        setSubmitState(SubmitState.Error);

        return;
      }

      setSubmitState(SubmitState.Success);
    }
  }, [token, mainFile, placeFile, selfieFile, uploadFile]);




  if (submitState !== SubmitState.Idle) {
    return (
      <DocumentTitle title="Анкета агента">
        <Page>
          <LoadingContainer
            isLoaded={submitState === SubmitState.Success}
            isError={submitState === SubmitState.Error}
            errorMessage={errorMessage}
            redirectPathOnError={routes.agent.profile.getRedirectPath()}
          >
            <Redirect to={{
              pathname: routes.agent.profile.getRedirectPath(),
              state: {isUpload: true}
            }} />
          </LoadingContainer>
        </Page>
      </DocumentTitle>
    );
  }

  return (
    <DocumentTitle title="Анкета агента">
      <Page>
        <Section className={classes.section}>
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
          <Typography variant="h5">Статус анкеты</Typography>
          <Typography>{status}</Typography>
        </Section>
        {comment && (
          <Section className={classes.section}>
            <Typography variant="h5">Комментарий модератора</Typography>
            <Typography>{comment}</Typography>
          </Section>
        )}
        <Section className={classes.section}>
          <Typography variant="h4">Проверка паспорта</Typography>
          <Typography>
            Просим вас пройти проверку и подтвердить личность, потому что мы
            хотим, чтобы наш сервис был безопасным.
          </Typography>
          <Typography>
            Проверка паспорта — это просто и безопасно. Мы не публикуем копию
            вашего паспорта и никому не передаем.
          </Typography>
        </Section>
        <Section className={classes.section}>
          <div className={classes.fileUploadContainer}>
            <div>
              <div>
                <Typography>Фото разворота паспорта</Typography>
              </div>
              {
                mainFile && (
                  <div style={{maxWidth: '200px', overflow: 'hidden'}}>
                    <Typography>{mainFile.name}</Typography>
                  </div>
                )
              }
            </div>
            <DropzoneArea
              acceptedFiles={["image/*"]}
              filesLimit={1}
              maxFileSize={FILE_SIZE_LIMIT}
              onDrop={onMainDrop}
              onDelete={onMainDelete}
              dropzoneClass={classes.dropzoneContainer}
              showPreviews={false}
              showPreviewsInDropzone={false}
              dropzoneText={""}
              showAlerts={false}
            />
          </div>
          <div className={classes.fileUploadContainer}>
            <div>
              <div>
                <Typography>Фото прописки из паспорта</Typography>
              </div>
              {
                placeFile && (
                  <div style={{maxWidth: '200px', overflow: 'hidden'}}>
                    <Typography>{placeFile.name}</Typography>
                  </div>
                )
              }
            </div>
            <DropzoneArea
              acceptedFiles={["image/*"]}
              filesLimit={1}
              maxFileSize={FILE_SIZE_LIMIT}
              onDrop={onPlaceDrop}
              onDelete={onPlaceDelete}
              dropzoneClass={classes.dropzoneContainer}
              showPreviews={false}
              showPreviewsInDropzone={false}
              dropzoneText={""}
              showAlerts={false}
            />
          </div>
          <div className={classes.fileUploadContainer}>
            <div>
              <div>
                <Typography>Селфи с паспортом</Typography>
              </div>
              {
                selfieFile && (
                  <div style={{maxWidth: '200px', overflow: 'hidden'}}>
                    <Typography>{selfieFile.name}</Typography>
                  </div>
                )
              }
            </div>
            <DropzoneArea
              acceptedFiles={["image/*"]}
              filesLimit={1}
              maxFileSize={FILE_SIZE_LIMIT}
              onDrop={onSelfieDrop}
              onDelete={onSelfieDelete}
              dropzoneClass={classes.dropzoneContainer}
              showPreviews={false}
              showPreviewsInDropzone={false}
              dropzoneText={""}
              showAlerts={false}
            />
          </div>
        </Section>
        <Section className={classes.section}>
          <div className={classes.submitButtonContainer}>
            <Button
              type="button"
              variant="contained"
              color="primary"
              className={classes.submitButton}
              onClick={onSubmit}
              disabled={!(mainFile && placeFile && selfieFile)}
            >
              Сохранить
            </Button>
          </div>
        </Section>
      </Page>
    </DocumentTitle>
  );
};

const useStyles = makeStyles(() => ({
  section: {
    display: "flex",
    alignItems: "flex-start",
    width: "100%",
    "& > :not(:last-child)": {
      marginBottom: 20,
    },
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
    height: 100,
    minHeight: "100px!important" as "100px",
    width: 100,
  },
  fileUploadContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: 350,
    "& > :not(:last-child)": {
      marginRight: 20,
    },
  },
}));

export default AgentModerateForm;
