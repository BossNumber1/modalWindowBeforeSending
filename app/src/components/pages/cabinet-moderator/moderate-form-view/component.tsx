import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";

import { VerifyingFormActionEnumPr } from "@problembo/grpc-web-problembo-core/moderator/moderator_pb";

import { useKeycloak } from "@react-keycloak/web";

import React, { useEffect, useState } from "react";
import DocumentTitle from "react-document-title";
import { useParams, Redirect } from "react-router-dom";

import {
  getModerateFormStatusString,
  SubmitState,
} from "lib/helper";

import { ResponseType } from "api/grpc/common";

import moderatorApi, {
  FormConfirmData,
  ModeratorGetAgentModerateFormReturn,
  PassportEntryData,
} from "api/grpc/moderator";

import useDownloadFile from "hooks/use-download-file";

import { routes } from "components/app/routes";

import LoadingContainer from "components/common/loading-container";
import Page from "components/common/page";
import Section from "components/common/section";

enum CheckboxType {
  Confimed = "Confirmed",
  Canceled = "Canceled",
}

enum CheckboxName {
  Main = "main",
  Place = "place",
  Selfie = "selfie",
}

interface ModeratorFormViewContentProps {
  token: string;
  moderateForm: ModeratorGetAgentModerateFormReturn;
  formId: number;
}

const ModeratorFormViewContent = (props: ModeratorFormViewContentProps) => {
  const { moderateForm, formId, token } = props;

  const [lastName, setLastName] = useState<string>("");

  const [firstName, setFirstName] = useState<string>("");

  const [fatherName, setFatherName] = useState<string>("");

  const [birthday, setBirthday] = useState<string>("");

  const [passportSerial, setPassportSerial] = useState<string>("");

  const [passportNumber, setPassportNumber] = useState<string>("");

  const [cityOfBirth, setCityOfBirth] = useState<string>("");

  const [address, setAddress] = useState<string>("");

  const [checkboxesState, setCheckboxesState] = useState({
    [CheckboxName.Main + CheckboxType.Confimed]: false,
    [CheckboxName.Place + CheckboxType.Confimed]: false,
    [CheckboxName.Selfie + CheckboxType.Confimed]: false,
    [CheckboxName.Main + CheckboxType.Canceled]: false,
    [CheckboxName.Place + CheckboxType.Canceled]: false,
    [CheckboxName.Selfie + CheckboxType.Canceled]: false,
  });

  const [submitState, setSubmitState] = useState<SubmitState>(SubmitState.Idle);

  const [errorMessage, setErrorMessage] = useState<string>("");

  const classes = useStyles();

  const downloadFile = useDownloadFile(token);

  const handleCheckboxChange =
    (type: CheckboxType) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setCheckboxesState((prevCheckboxesState) => {
        switch (type) {
          case CheckboxType.Confimed:
            return {
              ...prevCheckboxesState,
              [e.target.name + CheckboxType.Confimed]: e.target.checked,
              [e.target.name + CheckboxType.Canceled]: !e.target.checked,
            };

          case CheckboxType.Canceled:
            return {
              ...prevCheckboxesState,
              [e.target.name + CheckboxType.Canceled]: e.target.checked,
              [e.target.name + CheckboxType.Confimed]: !e.target.checked,
            };
        }
      });
    };

  useEffect(() => {
    if (!moderateForm) {
      return;
    }

    if (moderateForm?.passportentry?.lastname) {
      setLastName(moderateForm.passportentry.lastname);
    }

    if (moderateForm?.passportentry?.firstname) {
      setFirstName(moderateForm.passportentry.firstname);
    }

    if (moderateForm?.passportentry?.fathername) {
      setFatherName(moderateForm.passportentry.fathername);
    }

    if (moderateForm?.passportentry?.birthday) {
      setBirthday(moderateForm.passportentry.birthday);
    }

    if (moderateForm?.passportentry?.passportserial) {
      setPassportSerial(moderateForm.passportentry.passportserial);
    }

    if (moderateForm?.passportentry?.passportnumber) {
      setPassportNumber(moderateForm.passportentry.passportnumber);
    }

    if (moderateForm?.passportentry?.cityofbirth) {
      setCityOfBirth(moderateForm.passportentry.cityofbirth);
    }

    if (moderateForm?.passportentry?.address) {
      setAddress(moderateForm.passportentry.address);
    }

    if (moderateForm?.formconfirm?.ispassportmainconfirmed) {
      handleCheckboxChange(CheckboxType.Confimed)({
        target: {
          checked: true,
          name: CheckboxName.Main
        }
      } as React.ChangeEvent<HTMLInputElement>);
    }

    if (moderateForm?.formconfirm?.ispassportplaceconfirmed) {
      handleCheckboxChange(CheckboxType.Confimed)({
        target: {
          checked: true,
          name: CheckboxName.Place
        }
      } as React.ChangeEvent<HTMLInputElement>);
    }

    if (moderateForm?.formconfirm?.ispassportselfyconfirmed) {
      handleCheckboxChange(CheckboxType.Confimed)({
        target: {
          checked: true,
          name: CheckboxName.Selfie
        }
      } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [moderateForm]);

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
  };

  const handleSubmitButtonClick =
    (result: VerifyingFormActionEnumPr) =>
    async (e: React.SyntheticEvent): Promise<void> => {
      e.preventDefault();

      const passportEntryData: PassportEntryData = {
        address,
        birthday,
        cityOfBirth,
        fatherName,
        firstName,
        lastName,
        passportNumber,
        passportSerial,
      };

      const formConfirmData: FormConfirmData = {
        isMainConfirmed:
          checkboxesState[CheckboxName.Main + CheckboxType.Confimed],
        isPlaceConfirmed:
          checkboxesState[CheckboxName.Place + CheckboxType.Confimed],
        isSelfieConfimed:
          checkboxesState[CheckboxName.Selfie + CheckboxType.Confimed],
      };

      setSubmitState(SubmitState.Submitted);

      const response = await moderatorApi.setVerifyingFormResult({
        token,
        passportEntryData,
        formConfirmData,
        formId,
        result,
      });

      if (response.responseType === ResponseType.Error) {
        setSubmitState(SubmitState.Error);

        setErrorMessage(response.message || "");

        return;
      }

      setSubmitState(SubmitState.Success);
    };

  if (submitState !== SubmitState.Idle) {
    return (
      <LoadingContainer
        isLoaded={submitState === SubmitState.Success}
        isError={submitState === SubmitState.Error}
        errorMessage={errorMessage}
        onErrorClick={() => {
          setSubmitState(SubmitState.Idle);
        }}
      >
        <Redirect to={routes.mod.getRedirectPath()} />
      </LoadingContainer>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <Section className={classes.section}>
        <div>
          <div className={classes.fieldGroupContainer}>
            <Typography>Фио</Typography>
            <TextField
              id="lastName"
              onChange={(e) => {
                setLastName(e.target.value);
              }}
              value={lastName}
            />
            <TextField
              id="firstName"
              onChange={(e) => {
                setFirstName(e.target.value);
              }}
              value={firstName}
            />
            <TextField
              id="fatherName"
              onChange={(e) => {
                setFatherName(e.target.value);
              }}
              value={fatherName}
            />
          </div>
          <div className={classes.fieldGroupContainer}>
            <Typography>Дата рождения</Typography>
            <TextField
              id="birthday"
              onChange={(e) => {
                setBirthday(e.target.value);
              }}
              value={birthday}
            />
          </div>
          <div className={classes.fieldGroupContainer}>
            <Typography>Серия номер паспорта</Typography>
            <TextField
              id="passportSerial"
              onChange={(e) => {
                setPassportSerial(e.target.value);
              }}
              value={passportSerial}
            />
            <TextField
              id="passportNumber"
              onChange={(e) => {
                setPassportNumber(e.target.value);
              }}
              value={passportNumber}
            />
          </div>
          <div className={classes.fieldGroupContainer}>
            <Typography>Место рождения</Typography>
            <TextField
              id="cityOfBirth"
              onChange={(e) => {
                setCityOfBirth(e.target.value);
              }}
              value={cityOfBirth}
            />
          </div>
          <div className={classes.fieldGroupContainer}>
            <Typography>Прописка</Typography>
            <TextField
              id="address"
              onChange={(e) => {
                setAddress(e.target.value);
              }}
              value={address}
            />
          </div>
        </div>
        <div>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormGroup>
              <div className={classes.groupContainer}>
                <Typography>Паспорт разворот</Typography>
                <div className={classes.groupContainer}>
                  <div
                    className={classes.fileContainer}
                    onClick={() => {
                      if (!moderateForm.formforadd?.passportmain?.fileid) {
                        alert('Файл отсутствует');

                        return;
                      }

                      downloadFile(
                        moderateForm.formforadd.passportmain.fileid,
                        moderateForm.formforadd.passportmain.fileid
                      );
                    }}
                  >
                    Открыть
                  </div>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          checkboxesState[
                            CheckboxName.Main + CheckboxType.Confimed
                          ]
                        }
                        onChange={handleCheckboxChange(CheckboxType.Confimed)}
                        name={CheckboxName.Main}
                      />
                    }
                    label="Проверено"
                    labelPlacement="end"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          checkboxesState[
                            CheckboxName.Main + CheckboxType.Canceled
                          ]
                        }
                        onChange={handleCheckboxChange(CheckboxType.Canceled)}
                        name={CheckboxName.Main}
                      />
                    }
                    label="Отказано"
                    labelPlacement="end"
                  />
                </div>
              </div>
              <div className={classes.groupContainer}>
                <Typography>Паспорт прописка</Typography>
                <div className={classes.groupContainer}>
                  <div
                    className={classes.fileContainer}
                    onClick={() => {
                      if (!moderateForm.formforadd?.passportplace?.fileid) {
                        alert('Файл отсутствует');

                        return;
                      }

                      downloadFile(
                        moderateForm.formforadd.passportplace.fileid,
                        moderateForm.formforadd.passportplace.fileid
                      );
                    }}
                  >
                    Открыть
                  </div>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          checkboxesState[
                            CheckboxName.Place + CheckboxType.Confimed
                          ]
                        }
                        onChange={handleCheckboxChange(CheckboxType.Confimed)}
                        name={CheckboxName.Place}
                      />
                    }
                    label="Проверено"
                    labelPlacement="end"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          checkboxesState[
                            CheckboxName.Place + CheckboxType.Canceled
                          ]
                        }
                        onChange={handleCheckboxChange(CheckboxType.Canceled)}
                        name={CheckboxName.Place}
                      />
                    }
                    label="Отказано"
                    labelPlacement="end"
                  />
                </div>
              </div>
              <div className={classes.groupContainer}>
                <Typography>Селфи с паспортом</Typography>
                <div className={classes.groupContainer}>
                  <div
                    className={classes.fileContainer}
                    onClick={() => {
                      if (!moderateForm.formforadd?.passportselfie?.fileid) {
                        alert('Файл отсутствует');

                        return;
                      }

                      downloadFile(
                        moderateForm.formforadd.passportselfie.fileid,
                        moderateForm.formforadd.passportselfie.fileid
                      );
                    }}
                  >
                    Открыть
                  </div>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          checkboxesState[
                            CheckboxName.Selfie + CheckboxType.Confimed
                          ]
                        }
                        onChange={handleCheckboxChange(CheckboxType.Confimed)}
                        name={CheckboxName.Selfie}
                      />
                    }
                    label="Проверено"
                    labelPlacement="end"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          checkboxesState[
                            CheckboxName.Selfie + CheckboxType.Canceled
                          ]
                        }
                        onChange={handleCheckboxChange(CheckboxType.Canceled)}
                        name={CheckboxName.Selfie}
                      />
                    }
                    label="Отказано"
                    labelPlacement="end"
                  />
                </div>
              </div>
            </FormGroup>
          </FormControl>
        </div>
      </Section>
      <Section className={classes.section}>
        <div className={classes.groupContainer}>
          <Typography>
            Статус анкеты: {getModerateFormStatusString(moderateForm.status)}
          </Typography>
          <div className={classes.groupContainer}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={handleSubmitButtonClick(
                VerifyingFormActionEnumPr.VERIFYING_FORM_ACTION_ENUM_PR_SAVE
              )}
            >
              Сохранить
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={handleSubmitButtonClick(
                VerifyingFormActionEnumPr.VERIFYING_FORM_ACTION_ENUM_PR_FIX
              )}
            >
              На доработку
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={handleSubmitButtonClick(
                VerifyingFormActionEnumPr.VERIFYING_FORM_ACTION_ENUM_PR_DENY
              )}
            >
              Отклонить
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={handleSubmitButtonClick(
                VerifyingFormActionEnumPr.VERIFYING_FORM_ACTION_ENUM_PR_CONFIRM
              )}
            >
              Одобрить
            </Button>
          </div>
        </div>
      </Section>
    </form>
  );
};

interface ModerateFormViewMatchParams {
  formId: string;
}

const ModerateFormViewPage = () => {
  const [moderateForm, setModerateForm] =
    useState<ModeratorGetAgentModerateFormReturn | null>(null);

  const params = useParams<ModerateFormViewMatchParams>();

  const formId = Number(params.formId);

  const { keycloak } = useKeycloak();

  const token = keycloak.token;

  const isLoaded = moderateForm?.responseType === ResponseType.Success;

  const isError = moderateForm?.responseType === ResponseType.Error;

  useEffect(() => {
    if (token) {
      moderatorApi.getAgentModerateForm({ token, formId }).then((res) => {
        setModerateForm(res);
      });
    }
  }, [token, formId]);

  return (
    <DocumentTitle title="Кабинет модератора — проверка задачи">
      <Page>
        <LoadingContainer
          isLoaded={isLoaded}
          isError={isError}
          errorMessage={moderateForm?.message}
          redirectPathOnError={routes.mod.getRedirectPath()}
        >
          {token && moderateForm && !!formId && (
            <ModeratorFormViewContent
              moderateForm={moderateForm}
              formId={formId}
              token={token}
            />
          )}
        </LoadingContainer>
      </Page>
    </DocumentTitle>
  );
};

const useStyles = makeStyles(() => ({
  section: {
    display: "flex",
    alignItems: "flex-start",
    "& > :not(:last-child)": {
      marginBottom: 20,
    },
  },
  fileContainer: {
    color: "#3f51b5",
    cursor: "pointer",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  fieldGroupContainer: {
    display: "flex",
    alignItems: "center",
    "& > :not(:last-child)": {
      marginRight: 20,
    },
    "& + &": {
      marginBottom: 10,
    },
  },
  formControl: {
    display: "flex",
    flexDirection: "column",
    "& > :not(:last-child)": {
      marginBottom: 10,
    },
  },
  groupContainer: {
    display: "flex",
    alignItems: "center",
    "& > :not(:last-child)": {
      marginRight: 20,
    },
  },
}));

export default ModerateFormViewPage;
