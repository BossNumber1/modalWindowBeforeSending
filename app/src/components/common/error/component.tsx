import React from 'react'
import { Button, makeStyles, Typography } from "@material-ui/core";

import { useHistory } from "react-router-dom";

import Section from "components/common/section";

interface ErrorProps {
  message?: string;
  redirectPath?: string;
  onErrorClick?: () => void;
}

const Error = (props: ErrorProps) => {
  const { message, redirectPath, onErrorClick } = props;

  const classes = useStyles();

  const history = useHistory();

  const onButtonClick = () => {
    if (onErrorClick) {
      onErrorClick();

      return;
    }

    if (redirectPath) {
      history.push(redirectPath);
    }
  };

  if (message) {
    return (
      <div className={classes.root}>
        {(redirectPath || onErrorClick) && (
          <Section className={classes.section1}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={onButtonClick}
            >
              Назад
            </Button>
          </Section>
        )}
        <Section className={classes.section2}>
          <Typography variant="h5" color="error">
            {message}
          </Typography>
        </Section>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      {(redirectPath || onErrorClick) && (
        <Section className={classes.section1}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={onButtonClick}
          >
            Назад
          </Button>
        </Section>
      )}
      <Section className={classes.section2}>
        <Typography variant="h5" color="error">
          Ошибка загрузки
        </Typography>
      </Section>
    </div>
  );
};

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
  },
  section1: {
    display: "flex",
    alignItems: "flex-start",
  },
  section2: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "1 0 auto",
  },
}));

export default Error;
