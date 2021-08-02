import React from 'react'
import { Button, makeStyles, Typography } from "@material-ui/core";

import { BaseProfilePr } from "@problembo/grpc-web-problembo-core/common/core-share_pb";

import { useKeycloak } from "@react-keycloak/web";

import { useCallback, useEffect, useState } from "react";
import DocumentTitle from "react-document-title";
import { Link as RouterLink } from "react-router-dom";

import { clientGetProfile, ClientGetProfileReturn } from "api/grpc/client";

import { ResponseType } from "api/grpc/common";

import useModal from "hooks/use-modal";

import { routes } from "components/app/routes";

import LoadingContainer from "components/common/loading-container";
import Modal from "components/common/modal";
import ModalChangePhone, {
  ChangeModalType,
} from "components/common/modal/change-phone";
import Page from "components/common/page";
import Section from "components/common/section";

interface ProfileContentProps {
  profile: BaseProfilePr.AsObject;
  openModal: () => void;
}

const ProfileContent = (props: ProfileContentProps) => {
  const { profile, openModal } = props;

  const classes = useStyles();

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
          Профиль клиента
        </Typography>
      </Section>
      <Section className={classes.section}>
        <Typography className={classes.sectionHeader}>Имя отчество:</Typography>
        <Typography>
          {profile.fname} {profile.mname}
        </Typography>
      </Section>
      <Section className={classes.section}>
        <Typography className={classes.sectionHeader}>Email:</Typography>
        <Typography>{profile.email}</Typography>
      </Section>
      <Section className={classes.section}>
        <Typography className={classes.sectionHeader}>Телефон:</Typography>
        <Typography>{profile.phone}</Typography>
        <Button variant="contained" color="primary" onClick={openModal}>
          Изменить телефон
        </Button>
      </Section>
    </div>
  );
};

const ProfilePage = () => {
  const [profile, setProfile] =
    useState<ClientGetProfileReturn | undefined>(undefined);

  const [modalProps, { closeModal, openModal }] = useModal();

  const { keycloak } = useKeycloak();

  const token = keycloak.token;

  const isLoaded = profile?.responseType === ResponseType.Success;

  const isError = profile?.responseType === ResponseType.Error;

  const getProfile = useCallback((): void => {
    if (token) {
      clientGetProfile({ token }).then((res) => {
        setProfile(res);
      });
    }
  }, [token]);

  const onModalSubmit = () => {
    getProfile();
    closeModal();
  };

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  return (
    <DocumentTitle title="Кабинет клиента — профиль">
      <Page>
        <LoadingContainer
          isLoaded={isLoaded}
          isError={isError}
          errorMessage={profile?.message}
          redirectPathOnError={routes.client.getRedirectPath()}
        >
          {profile?.baseprofile && (
            <ProfileContent
              profile={profile.baseprofile}
              openModal={openModal}
            />
          )}
          <Modal {...modalProps}>
            <ModalChangePhone
              onSubmit={onModalSubmit}
              modalType={ChangeModalType.Phone}
            />
          </Modal>
        </LoadingContainer>
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
  },
  section1Header: {
    marginRight: 250,
  },
  sectionHeader: {
    marginBottom: 20,
    width: "100%",
  },
}));

export default ProfilePage;
