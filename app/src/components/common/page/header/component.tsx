import React from 'react'
import { useKeycloak } from "@react-keycloak/web";

import { useCallback } from "react";
import { Link as RouterLink } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import { AppBar, Button, Link, Toolbar, Typography } from "@material-ui/core";

import {
  isRoleAgent,
  isRoleBuh,
  isRoleClient,
  isRoleModerator,
} from "lib/helper";

import { PageSize } from "..";

function _generateHeader(roles: string[]): string {
  if (isRoleBuh(roles)) {
    return "Кабинет бухгалтера";
  }

  if (isRoleClient(roles)) {
    return "Кабинет клиента";
  }

  if (isRoleModerator(roles)) {
    return "Кабинет модератора";
  }

  if (isRoleAgent(roles)) {
    return "Кабинет агента";
  }

  return "Кабинет";
}

interface ProfileLinkProps {
  roles: string[];
}

const ProfileLink = (props: ProfileLinkProps) => {
  const { roles } = props;

  const isShowLink =
    (isRoleClient(roles) || isRoleAgent(roles)) &&
    !(isRoleBuh(roles) || isRoleModerator(roles));

  if (isShowLink) {
    return (
      <Typography>
        <Link
          component={RouterLink}
          to={`/${window.location.pathname.split('/')[1]}/profile`}
          color="inherit"
        >
          Профиль
        </Link>
      </Typography>
    );
  }

  return <></>;
};

const Header = () => {
  const classes = useStyles();

  const { keycloak } = useKeycloak();

  const logout = useCallback(() => {
    keycloak.logout();
  }, [keycloak]);

  const getEmail = () => {
    const tokenParsed = keycloak.tokenParsed as { email: string };
    return tokenParsed?.email || "";
  };

  const roles = keycloak.tokenParsed?.realm_access?.roles;

  return (
    <AppBar position="static">
      <Toolbar className={classes.headerContentContainer}>
        <div className={classes.headerContent}>
          <Typography variant="h6">
            <Link component={RouterLink} to="/" color="inherit">
              {!!roles?.length && _generateHeader(roles)}
            </Link>
          </Typography>
          <div className={classes.menu}>
            <Typography>{getEmail()}</Typography>
            {!!roles?.length && <ProfileLink roles={roles} />}
            <Button variant="contained" onClick={logout}>
              Выход
            </Button>
          </div>
        </div>
      </Toolbar>
    </AppBar>
  );
};

const useStyles = makeStyles(() => ({
  headerContentContainer: {
    display: "flex",
    justifyContent: "center",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "100%",
    width: "100%",
    maxWidth: PageSize.Width,
  },
  menu: {
    display: "flex",
    alignItems: "center",
    "& > :not(:last-child)": {
      marginRight: 20,
    },
  },
}));

export default Header;
