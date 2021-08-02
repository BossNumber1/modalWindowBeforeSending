import React from 'react'
import { Button, makeStyles, Typography } from "@material-ui/core";

import { RolesPr } from "@problembo/grpc-web-problembo-core/common/core-share_pb";

import { useKeycloak } from "@react-keycloak/web";

import { useCallback, useEffect, useState } from "react";
import DocumentTitle from "react-document-title";
import { Link as RouterLink, useLocation } from "react-router-dom";

import agentApi, { AgentGetAgentProfileReturn } from "api/grpc/agent";

import { ResponseType } from "api/grpc/common";

import { generateTableString } from "lib/helper";

import useModal from "hooks/use-modal";

import { routes } from "components/app/routes";

import LoadingContainer from "components/common/loading-container";
import Modal from "components/common/modal";
import ModalChangePhone, {
  ChangeModalType,
} from "components/common/modal/change-phone";
import Page from "components/common/page";
import Section from "components/common/section";
import ModalSuccessUpload from "../../../common/modal/success-upload";
//import Table from "components/common/table";

interface AgentProfileContentProps {
  profile: AgentGetAgentProfileReturn;
  openModal: () => void;
}

interface state {
  isUpload: boolean
}


interface location {
  state: state
}


const AgentProfileContent = (props: AgentProfileContentProps) => {

  const { profile, openModal } = props;

  const classes = useStyles();

  const getStatus = () => profile?.baseprofile?.rolesList
    .some(role => role === RolesPr.ROLE_AGENT) ? "Агент" : "Неподтвержденный агент";

  return (
    <div className={classes.content}>
      <Section className={classes.section1}>
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          color="primary"
        >
          &lt; Вернуться на главную
        </Button>
        <Typography className={classes.section1Header} variant="h5">
          Профиль агента
        </Typography>
      </Section>
      <Section className={classes.section}>
        <Typography className={classes.sectionHeader}>Имя отчество:</Typography>
        <Typography>
          {generateTableString(profile.baseprofile?.fname)}{" "}
          {generateTableString(profile.baseprofile?.mname)}
        </Typography>
      </Section>
      <Section className={classes.section}>
        <Typography className={classes.sectionHeader}>Статус:</Typography>
        <Typography>{getStatus()}</Typography>
      </Section>
      <Section className={classes.section}>
        <Typography className={classes.sectionHeader}>Email:</Typography>
        <Typography>
          {generateTableString(profile.baseprofile?.email)}
        </Typography>
      </Section>
      <Section className={classes.section}>
        <Typography className={classes.sectionHeader}>Телефон:</Typography>
        <Typography>
          {generateTableString(profile.baseprofile?.phone)}
        </Typography>
        <Button variant="contained" color="primary" onClick={openModal}>
          Изменить телефон
        </Button>
      </Section>
      {/*
      <Section className={classes.section}>
        <Typography className={classes.sectionHeader}>Компетенции:</Typography>
        <Table headers={["Компетенция"]} data={generateTableData()} />
        <Button
          component={RouterLink}
          to={routes.agent.changeSpecs.getRedirectPath()}
          variant="contained"
          color="primary"
        >
          Изменить
        </Button>
      </Section>
      */}
      <Section className={classes.section}>
        <Typography className={classes.sectionHeader}>Анкета:</Typography>
        <Button
          component={RouterLink}
          to={routes.agent.profile.form.getRedirectPath()}
          variant="contained"
          color="primary"
        >
          Заполнить/исправить анкету
        </Button>
      </Section>
    </div>
  );
};

const AgentProfilePage = () => {


  const [profile, setProfile] = useState<AgentGetAgentProfileReturn | null>(
    null
  );

  const [modalProps, { closeModal, openModal }] = useModal();

  const { keycloak } = useKeycloak();

  const token = keycloak.token;

  const errorMessage = profile?.message;

  const [modalSuccessUploadProps, {openModal : openSuccessUpload, closeModal: closeSuccessUpload}]  = useModal();

  const isLoaded = profile?.responseType === ResponseType.Success;

  const isError = profile?.responseType === ResponseType.Error;

  const getProfile = useCallback((): void => {
    if (token) {
      agentApi.getAgentProfile({ token }).then((res) => {
        setProfile(res);
      });
    }
  }, [token]);

  const location:location = useLocation()

  useEffect(() => {
    if (location.state) {
      if (location.state.isUpload) {
        openSuccessUpload()
      }

    }
  }, [location.state, openSuccessUpload])


  const onModalSubmit = () => {
    getProfile();
    closeModal();
  };

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  return (
    <DocumentTitle title="Кабинет агента — профиль">
      <Page>
        <LoadingContainer
          isLoaded={isLoaded}
          isError={isError}
          errorMessage={errorMessage}
          redirectPathOnError={routes.agent.getRedirectPath()}
        >
          {profile && (
            <AgentProfileContent profile={profile} openModal={openModal} />
          )}
          <Modal {...modalProps}>
            <ModalChangePhone
              onSubmit={onModalSubmit}
              modalType={ChangeModalType.Phone}
            />
          </Modal>
        </LoadingContainer>

                <Modal {...modalSuccessUploadProps}>
              <ModalSuccessUpload
              onClose={() => {
                closeSuccessUpload()
              }}
                />
              </Modal>

      </Page>
    </DocumentTitle>
  );
};

const useStyles = makeStyles(() => ({
  content: {
    display: "flex",
    flexDirection: "column",
  },
  section1: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  section: {
    display: "flex",
    alignItems: "flex-start",
    width: "100%",
    "& > :not(:last-child)": {
      marginBottom: 20,
    },
  },
  section1Header: {
    marginRight: 250,
  },
  sectionHeader: {
    marginBottom: 20,
    width: "100%",
  },
  tableContainer: {
    width: "auto",
  },
}));

export default AgentProfilePage;
