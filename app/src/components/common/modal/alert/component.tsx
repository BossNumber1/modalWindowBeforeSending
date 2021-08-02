import React from 'react'
import { Button, makeStyles, Typography } from "@material-ui/core";

import Section from "components/common/section";

interface ModalAlertProps {
  text: string;
  closeModal: (arg: any) => void | Promise<void>;
}

const ModalAlert = (props: ModalAlertProps) => {
   const { closeModal, text } = props;

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Section>
        <Typography>{text}</Typography>
      </Section>
      <Section>
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={closeModal}
        >
          Закрыть
        </Button>
      </Section>
    </div>
  );
};

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    width: 350,
    height: 250,
  },
}));

export default ModalAlert;
