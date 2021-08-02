import React from 'react'
import { Button, makeStyles, TextField, Typography } from "@material-ui/core";

import { useKeycloak } from "@react-keycloak/web";

import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";

import agentApi from "api/grpc/agent";

import { CommonReturnMessagePrReturn } from "api/grpc/common";

import Section from "components/common/section";

function _isNumber(string: string): boolean {
  return !isNaN(Number(string)) && !isNaN(parseFloat(string));
}

interface AgentTaskViewMatchParams {
  taskId: string;
}

interface ModalSetPriceProps {
  onSubmit: (arg: CommonReturnMessagePrReturn) => void | Promise<void>;
}

const ModalSetPrice = (props: ModalSetPriceProps) => {
  const { onSubmit: handleSubmit } = props;

  const [price, setPrice] = useState<string>("");

  const params = useParams<AgentTaskViewMatchParams>();

  const taskId = Number(params.taskId);

  const classes = useStyles();

  const { keycloak } = useKeycloak();

  const token = keycloak.token;

  const onPriceChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPrice(e.target.value);
  };

  const onSubmit = useCallback(() => {
    if (!(token && _isNumber(price))) {
      return;
    }

    agentApi
      .setAgentTaskPrice({ token, taskId, price: Number(price) })
      .then((res) => {
        handleSubmit(res);
      });
  }, [token, taskId, price, handleSubmit]);

  return (
    <div className={classes.root}>
      <Section className={classes.section}>
        <Typography>Установите стоимость вашей услуги</Typography>
      </Section>
      <Section className={classes.section}>
        <TextField
          id="price"
          type="number"
          onChange={onPriceChange}
          value={price}
        />
        <Typography>Рублей</Typography>
      </Section>
      <Section className={classes.buttonContainer}>
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={onSubmit}
          disabled={!_isNumber(price)}
        >
          Отправить
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
    width: 550,
    height: 250,
  },
  section: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    "& > :not(:last-child)": {
      marginRight: 20,
    },
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
}));

export default ModalSetPrice;
