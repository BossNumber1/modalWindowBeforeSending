import { makeStyles, Button, TextField, Typography } from "@material-ui/core";

import { useKeycloak } from "@react-keycloak/web";

import React, { useCallback, useEffect, useState } from "react";
import Countdown, { zeroPad } from "react-countdown";
import MaskedInput from "react-text-mask";

import agentApi from "api/grpc/agent";

import { ResponseType } from "api/grpc/common";

import {
  clientEmailVerifyFinish,
  clientEmailVerifyStart,
  clientGetProfile,
  clientPhoneVerifyFinish,
  clientPhoneVerifyStart,
} from "api/grpc/client";

import { isRoleAgent, isRoleClient } from "lib/helper";

import CenteringContainer from "components/common/centering-container";
import Error from "components/common/error";
import Loader from "components/common/loader";
import Section from "components/common/section";

enum Role {
  Agent = "AGENT",
  Client = "CLIENT",
}

export enum ChangeModalType {
  Email = "EMAIL",
  Phone = "PHONE",
}

const methodsMap = {
  AGENT: {
    phoneVerifyStart: agentApi.phoneVerifyStart,
    phoneVerifyFinish: agentApi.phoneVerifyFinish,
    emailVerifyStart: agentApi.emailVerifyStart,
    emailVerifyFinish: agentApi.emailVerifyFinish,
  },
  CLIENT: {
    phoneVerifyStart: clientPhoneVerifyStart,
    phoneVerifyFinish: clientPhoneVerifyFinish,
    emailVerifyStart: clientEmailVerifyStart,
    emailVerifyFinish: clientEmailVerifyFinish,
  },
};

// TODO refactor client api

enum ChangePhoneStep {
  Input,
  Confirm,
  Success,
  Loading,
  Error,
}

function _validateCode(code: string): boolean {
  return /^\d{4}$/.test(code);
}

function _validatePhone(phone: string): boolean {
  return /^\+?7(\d{10})$/.test(phone);
}

interface MaskedInputPhoneProps {
  inputRef: (ref: HTMLInputElement | null) => void;
}

const MaskedInputPhone = (props: MaskedInputPhoneProps) => {
  const { inputRef, ...inputProps } = props;

  return (
    <MaskedInput
      {...inputProps}
      ref={(ref: any) => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={[
        "+",
        "7",
        " ",
        /\d/,
        /\d/,
        /\d/,
        " ",
        /\d/,
        /\d/,
        /\d/,
        " ",
        /\d/,
        /\d/,
        "-",
        /\d/,
        /\d/,
      ]}
      showMask
    />
  );
};

interface MaskedInputCodeProps {
  inputRef: (ref: HTMLInputElement | null) => void;
}

const MaskedInputCode = (props: MaskedInputCodeProps) => {
  const { inputRef, ...inputProps } = props;

  return (
    <MaskedInput
      {...inputProps}
      ref={(ref: any) => {
        inputRef(ref ? ref.inputElement : null);
      }} 
      onFocus={ (e) => { e.target.value = ""; e.target.selectionStart = 0; e.target.selectionEnd = 0; } }
      mask={[/\d/, /\d/, /\d/, /\d/]}
      showMask
    />
  );
};

interface ChangePhoneErrors {
  phone: string;
  code: string;
  email: string;
}

interface ModalChangePhoneProps {
  onSubmit: () => void;
  modalType: ChangeModalType;
}

const ModalChangePhone = (props: ModalChangePhoneProps) => {
  const { onSubmit: handleSubmit, modalType } = props;

  const [step, setStep] = useState<ChangePhoneStep>(ChangePhoneStep.Input);

  const [email, setEmail] = useState<string | "">("");

  const [phone, setPhone] = useState<string>("");

  const [code, setCode] = useState<string>("");

  const [errors, setErrors] = useState<ChangePhoneErrors>({
    phone: "",
    code: "",
    email: "",
  });

  const [errorMessage, setErrorMessage] = useState<string>("");

  const [showCountdown, setShowCountdown] = useState<boolean>(false);

  const [role, setRole] = useState<Role | null>(null);

  const methods = role ? methodsMap[role] : null;

  const { keycloak } = useKeycloak();

  const token = keycloak.token;

  const classes = useStyles();

  const onPhoneChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPhone(e.target.value);
  };

  const onCodeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCode(e.target.value);
  };

  const confirmPhone = useCallback(() => {
    const formattedTrimmedPhone = phone.replace(/[-\s]/g, "").trim();

    if (methods && token && formattedTrimmedPhone) {
      if (!_validatePhone(formattedTrimmedPhone)) {
        setErrors((errors) => ({
          ...errors,
          phone: "Введите корректный номер телефона",
        }));

        return;
      }

      setErrors((errors) => ({ ...errors, phone: "" }));

      setStep(ChangePhoneStep.Loading);

      methods
        .phoneVerifyStart({ token, phone: formattedTrimmedPhone })
        .then((res) => {
          if (res.responseType === ResponseType.Success) {
            setStep(ChangePhoneStep.Confirm);
          } else {
            setErrors((errors) => ({
              ...errors,
              phone: res.message || "",
            }));

            setStep(ChangePhoneStep.Input);
          }
        });
    }
  }, [token, phone, methods]);

  const confirmEmail = useCallback(() => {
    if (!(methods && token && email)) {
      return;
    }

    setStep(ChangePhoneStep.Loading);

    methods.emailVerifyStart({ token }).then((res) => {
      if (res.responseType === ResponseType.Success) {
        setStep(ChangePhoneStep.Confirm);
      } else {
        setErrors((errors) => ({
          ...errors,
          email: res.message || "",
        }));

        setStep(ChangePhoneStep.Input);
      }
    });
  }, [token, email, methods]);

  const confirmStart = useCallback(() => {
    setShowCountdown(true);

    if (modalType === ChangeModalType.Email) {
      confirmEmail();
    }

    if (modalType === ChangeModalType.Phone) {
      confirmPhone();
    }
  }, [confirmEmail, confirmPhone, modalType]);

  const confirmCode = useCallback(() => {
    const trimmedCode = code.trim();

    if (methods && token && trimmedCode) {
      if (!_validateCode(trimmedCode)) {
        setErrors((errors) => ({ ...errors, code: "Введите код полностью" }));

        return;
      }

      setErrors((errors) => ({ ...errors, code: "" }));

      setStep(ChangePhoneStep.Loading);

      if (modalType === ChangeModalType.Phone) {
        methods
          .phoneVerifyFinish({ token, code: Number(trimmedCode) })
          .then((res) => {
            if (res.responseType === ResponseType.Success) {
              setStep(ChangePhoneStep.Success);
            } else {
              setErrors((errors) => ({
                ...errors,
                code: res.message || "",
              }));

              setStep(ChangePhoneStep.Confirm);
            }
          });
      }

      if (modalType === ChangeModalType.Email) {
        methods
          .emailVerifyFinish({ token, code: Number(trimmedCode) })
          .then((res) => {
            if (res.responseType === ResponseType.Success) {
              setStep(ChangePhoneStep.Success);
            } else {
              setErrors((errors) => ({
                ...errors,
                code: res.message || "",
              }));

              setStep(ChangePhoneStep.Confirm);
            }
          });
      }
    }
  }, [token, code, methods, modalType]);

  const countdownRenderer = ({
    minutes,
    seconds,
    completed,
  }: {
    [key: string]: any;
  }) => {
    if (completed) {
      return "";
    } else {
      return `(${zeroPad(minutes)}:${zeroPad(seconds)})`;
    }
  };

  useEffect(() => {
    confirmCode();
  }, [confirmCode, code]);

  useEffect(() => {
    const roles = keycloak.tokenParsed?.realm_access?.roles;

    if (!roles) {
      return;
    }

    if (isRoleClient(roles)) {
      setRole(Role.Client);
    }

    if (isRoleAgent(roles)) {
      setRole(Role.Agent);
    }
  }, [keycloak]);

  useEffect(() => {
    if (!(token && role && modalType === ChangeModalType.Email)) {
      return;
    }

    setStep(ChangePhoneStep.Loading);

    if (role === Role.Agent) {
      agentApi.getAgentProfile({ token }).then((res) => {
        if (res.responseType === ResponseType.Success) {
          setEmail(res.baseprofile?.email || "");

          setStep(ChangePhoneStep.Input);
        } else {
          setStep(ChangePhoneStep.Error);

          setErrorMessage(res.message || "");
        }
      });
    }

    if (role === Role.Client) {
      clientGetProfile({ token }).then((res) => {
        if (res.responseType === ResponseType.Success) {
          setEmail(res.baseprofile?.email || "");

          setStep(ChangePhoneStep.Input);
        } else {
          setStep(ChangePhoneStep.Error);

          setErrorMessage(res.message || "");
        }
      });
    }
  }, [token, role, modalType]);

  if (step === ChangePhoneStep.Loading) {
    return (
      <div className={classes.root}>
        <CenteringContainer className={classes.centeringContainer}>
          <Loader />
        </CenteringContainer>
      </div>
    );
  }

  if (step === ChangePhoneStep.Error) {
    return (
      <div className={classes.root}>
        <CenteringContainer className={classes.centeringContainer}>
          <Error message={errorMessage} />
        </CenteringContainer>
      </div>
    );
  }

  if (step === ChangePhoneStep.Input) {
    return (
      <div className={classes.root}>
        <Section>
          {modalType === ChangeModalType.Phone && (
            <Typography>Введите телефон</Typography>
          )}

          {modalType === ChangeModalType.Email && <Typography> </Typography>}
        </Section>
        <Section>
          <Section>
            {modalType === ChangeModalType.Phone && (
              <TextField
                label="Телефон:"
                id="phone"
                InputProps={{
                  inputComponent: MaskedInputPhone as any,
                }}
                onChange={onPhoneChange}
                value={phone}
                error={!!errors.phone}
              />
            )}
            {modalType === ChangeModalType.Email && (
              <TextField
                disabled
                label="Почта"
                id="email"
                value={email}
                error={!!errors.email}
              />
            )}
            {modalType === ChangeModalType.Phone && (
              <Typography color="error" variant="subtitle2">
                {errors.phone}
              </Typography>
            )}
            {modalType === ChangeModalType.Email && (
              <Typography color="error" variant="subtitle2">
                {errors.email}
              </Typography>
            )}
          </Section>
          <Section>
            <Button
              type="button"
              variant="contained"
              color="primary"
              onClick={confirmStart}
              disabled={
                (modalType === ChangeModalType.Phone && !phone) ||
                (modalType === ChangeModalType.Email && !email)
              }
            >
              {modalType === ChangeModalType.Phone && "Подтвердить телефон"}
              {modalType === ChangeModalType.Email && "Подтвердить почту"}
            </Button>
          </Section>
        </Section>
      </div>
    );
  }

  if (step === ChangePhoneStep.Confirm) {
    return (
      <div className={classes.root}>
        <Section>
          <Typography>
            {modalType === ChangeModalType.Phone && "Подтверждение телефона"}
            {modalType === ChangeModalType.Email && "Подтверждение Email"}
          </Typography>
        </Section>
        <Section>
          <Section>
            {modalType === ChangeModalType.Phone && (
              <TextField
                label="Телефон:"
                id="phone"
                InputProps={{
                  inputComponent: MaskedInputPhone as any,
                }}
                onChange={onPhoneChange}
                value={phone}
                helperText="Вам выслан код по СМС"
                error={!!errors.phone}
                disabled
              />
            )}
            {modalType === ChangeModalType.Email && (
              <TextField
                disabled
                label="Почта"
                id="email"
                value={email}
                helperText="Вам выслан код по почте"
                error={!!errors.email}
              />
            )}
            {modalType === ChangeModalType.Phone && (
              <Typography color="error" variant="subtitle2">
                {errors.phone}
              </Typography>
            )}
            {modalType === ChangeModalType.Email && (
              <Typography color="error" variant="subtitle2">
                {errors.email}
              </Typography>
            )}
          </Section>
          <Section>
            <Button
              type="button"
              variant="contained"
              color="primary"
              onClick={confirmStart}
              disabled={showCountdown}
            >
              Отправить код через 60
              {showCountdown && (
                <Countdown
                  date={Date.now() + 60000}
                  renderer={countdownRenderer}
                  onComplete={() => {
                    setShowCountdown(false);
                  }}
                />
              )}{" "}
              сек
            </Button>
          </Section>
          <Section>
            {modalType === ChangeModalType.Phone && (
              <TextField
                label="Введите код из СМС:"
                id="code"
                InputProps={{
                  inputComponent: MaskedInputCode as any,
                }}
                onChange={onCodeChange}
                value={code}
                error={!!errors.code}
              />
            )}
            {modalType === ChangeModalType.Email && (
              <TextField
                label="Код из почты:"
                id="code"
                InputProps={{
                  inputComponent: MaskedInputCode as any,
                }}
                onChange={onCodeChange}
                value={code}
                error={!!errors.code}
              />
            )}
            <Typography color="error" variant="subtitle2">
              {errors.code}
            </Typography>
          </Section>
        </Section>
      </div>
    );
  }

  if (step === ChangePhoneStep.Success) {
    return (
      <div className={classes.root}>
        <Section>
          <Typography> </Typography>
        </Section>
        <Section>
          <Section>
            {modalType === ChangeModalType.Phone && (
              <TextField
                label="Телефон:"
                id="phone"
                InputProps={{
                  inputComponent: MaskedInputPhone as any,
                }}
                onChange={onPhoneChange}
                value={phone}
                disabled
              />
            )}
            {modalType === ChangeModalType.Email && (
              <TextField disabled label="Почта" id="email" value={email} />
            )}
          </Section>
          <Section>
            <Typography>
              {modalType === ChangeModalType.Phone &&
                "Телефон успешно подтвержден"}
              {modalType === ChangeModalType.Email &&
                "Email успешно подтвержден"}
            </Typography>
          </Section>
          <Section>
            <Button
              type="button"
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Далее
            </Button>
          </Section>
        </Section>
      </div>
    );
  }

  return <div className={classes.root}></div>;
};

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
    width: 500,
    height: 430,
  },
  centeringContainer: {
    position: "relative",
  },
}));

export default ModalChangePhone;
