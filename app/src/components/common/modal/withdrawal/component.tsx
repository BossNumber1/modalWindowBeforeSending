import React from 'react'
import { Button, makeStyles, TextField, Typography } from "@material-ui/core";

import { useKeycloak } from "@react-keycloak/web";

import { useCallback, useState } from "react";
import MaskedInput from "react-text-mask";

import { SubmitState } from "lib/helper";

import agentApi from "api/grpc/agent";

import { CommonReturnMessagePrReturn, ResponseType } from "api/grpc/common";

import LoadingContainer from "components/common/loading-container";
import Section from "components/common/section";

function _isNumber(string: string): boolean {
  return !isNaN(Number(string)) && !isNaN(parseFloat(string));
}

function _validateCard(card: string): boolean {
  return /^\d{4}-\d{4}-\d{4}-\d{4}$/.test(card);
}

interface MaskedInputCardProps {
  inputRef: (ref: HTMLInputElement | null) => void;
}

const MaskedInputCard = (props: MaskedInputCardProps) => {
  const { inputRef, ...inputProps } = props;

  return (
    <MaskedInput
      {...inputProps}
      ref={(ref: any) => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={[
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        "-",
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        "-",
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        "-",
        /\d/,
        /\d/,
        /\d/,
        /\d/,
      ]}
      showMask
    />
  );
};

interface WithdrawalErrors {
  card: string;
  amount: string;
}

interface ModalWithdrawalProps {
  onSubmit: (arg: CommonReturnMessagePrReturn) => void | Promise<void>;
}

const ModalWithdrawal = (props: ModalWithdrawalProps) => {
  const { onSubmit: handleSubmit } = props;

  const [card, setCard] = useState<string>("");

  const [amount, setAmount] = useState<string>("");

  const [errors, setErrors] = useState<WithdrawalErrors>({
    card: "",
    amount: "",
  });

  const [submitState, setSubmitState] = useState<SubmitState>(SubmitState.Idle);

  const [errorMessage, setErrorMessage] = useState<string>("");

  const classes = useStyles();

  const { keycloak } = useKeycloak();

  const token = keycloak.token;

  const onCardChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCard(e.target.value);
  };

  const onAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setAmount(e.target.value);
  };

  const onSubmit = useCallback(() => {
    if (!(token && _isNumber(amount) && _validateCard(card))) {
      setErrors((errors) => {
        const newErrors = { ...errors };

        if (!_isNumber(amount)) {
          newErrors.amount = "Введите корректную сумму";
        }

        if (!_validateCard(card)) {
          newErrors.card = "Введите корректный номер карты";
        }

        return newErrors;
      });

      return;
    }

    setSubmitState(SubmitState.Submitted);

    agentApi
      .withdrawalMoney({ token, amount: Number(amount), card })
      .then((res) => {
        if (res.responseType === ResponseType.Error) {
          setSubmitState(SubmitState.Error);

          setErrorMessage(res.message || "");

          return;
        }

        setSubmitState(SubmitState.Success);

        handleSubmit(res);
      });
  }, [token, amount, card, handleSubmit]);

  if (submitState !== SubmitState.Idle) {
    return (
      <div className={classes.root}>
        <LoadingContainer
          isLoaded={submitState === SubmitState.Success}
          isError={submitState === SubmitState.Error}
          errorMessage={errorMessage}
        >
          <></>
        </LoadingContainer>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <Section className={classes.section}>
        <Typography>Вывод средств</Typography>
      </Section>
      <Section className={classes.section}>
        <Typography>Номер карты</Typography>
        <TextField
          id="card"
          InputProps={{
            inputComponent: MaskedInputCard as any,
          }}
          onChange={onCardChange}
          value={card}
        />
        <Typography color="error" variant="subtitle2">
          {errors.card}
        </Typography>
      </Section>
      <Section className={classes.section}>
        <Typography>Сумма</Typography>
        <TextField
          id="amount"
          type="number"
          onChange={onAmountChange}
          value={amount}
        />
        <Typography color="error" variant="subtitle2">
          {errors.amount}
        </Typography>
      </Section>
      <Section className={classes.buttonContainer}>
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={onSubmit}
          disabled={!(card && amount)}
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
    height: 350,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
}));

export default ModalWithdrawal;
