import React from 'react'
import { Button, makeStyles, Typography } from "@material-ui/core";

import Section from "components/common/section";

interface ModalConfirmProps {
  onSubmit: (arg: any) => void | Promise<void>;
  onCancel: (arg: any) => void | Promise<void>;
}

const ModalConfirm = (props: ModalConfirmProps) => {
  const { onSubmit, onCancel } = props;

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Section>
        <Typography>Подтвердить действие?</Typography>
      </Section>
      <Section>
        <div className={classes.buttonContainer}>
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={onSubmit}
          >
            Подтвердить
          </Button>
          <Button type="button" variant="contained" onClick={onCancel}>
            Отмена
          </Button>
        </div>
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
  buttonContainer: {
    display: "flex",
    "& > :not(:last-child)": {
      marginRight: 20,
    },
  },
}));

export default ModalConfirm;
