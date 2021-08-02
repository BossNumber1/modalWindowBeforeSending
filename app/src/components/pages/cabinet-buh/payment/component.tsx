import React from 'react'
import {
  Button,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@material-ui/core";

import { useKeycloak } from "@react-keycloak/web";

import { useCallback, useEffect, useState } from "react";
import DocumentTitle from "react-document-title";
import { Redirect, RouteComponentProps } from "react-router-dom";

import buhApi, { BuhPaymentToAgentViewReturn } from "api/grpc/buh";

import { ResponseType } from "api/grpc/common";

import { routes } from "components/app/routes";
import LoadingContainer from "components/common/loading-container";
import Page from "components/common/page";
import Section from "components/common/section";

enum SubmitState {
  Submitted,
  Success,
  Error,
  Idle,
}

interface BuhPaymentMatchParams {
  requestId: string;
}

interface BuhPaymentPageProps
  extends RouteComponentProps<BuhPaymentMatchParams> {}

const BuhPaymentPage = (props: BuhPaymentPageProps) => {
  const { match } = props;

  const requestId = Number(match.params.requestId);

  const [paymentData, setPaymentData] =
    useState<BuhPaymentToAgentViewReturn | null>(null);

  const [submitState, setSubmitState] = useState<SubmitState>(SubmitState.Idle);

  const [errorMessage, setErrorMessage] = useState<string>("");

  const { keycloak } = useKeycloak();

  const token = keycloak.token;

  const classes = useStyles();

  const isLoaded = paymentData?.responseType === ResponseType.Success;

  const isError = paymentData?.responseType === ResponseType.Error;

  const onSubmit = useCallback(async () => {
    if (!(token && requestId)) {
      return;
    }

    setSubmitState(SubmitState.Submitted);

    const response = await buhApi.paymentToAgentDo({
      token,
      requestId,
      success: true,
    });

    if (response.responseType === ResponseType.Error) {
      setSubmitState(SubmitState.Error);

      setErrorMessage(response.message || "");

      return;
    }

    setSubmitState(SubmitState.Success);
  }, [token, requestId]);

  useEffect(() => {
    if (token && requestId) {
      buhApi.paymentToAgentView({ token, requestId }).then((res) => {
        setPaymentData(res);
      });
    }
  }, [token, requestId]);

  if (submitState !== SubmitState.Idle) {
    return (
      <DocumentTitle title="Кабинет бухгалтера — подтверждение выплаты агенту">
        <Page>
          <LoadingContainer
            isLoaded={submitState === SubmitState.Success}
            isError={submitState === SubmitState.Error}
            errorMessage={errorMessage}
            redirectPathOnError={routes.buh.request.requestId.view.getRedirectPath(
              { requestId: requestId.toString() }
            )}
          >
            <Redirect to={routes.buh.getRedirectPath()} />
          </LoadingContainer>
        </Page>
      </DocumentTitle>
    );
  }

  return (
    <DocumentTitle title="Кабинет бухгалтера — подтверждение выплаты агенту">
      <Page>
        <LoadingContainer
          isLoaded={isLoaded}
          isError={isError}
          errorMessage={paymentData?.message}
          redirectPathOnError={routes.buh.request.requestId.view.getRedirectPath(
            { requestId: requestId.toString() }
          )}
        >
          <Section className={classes.section}>
            <Typography>Выплата агенту</Typography>
          </Section>
          <Section className={classes.section}>
            <TableContainer className={classes.tableContainer}>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Номер карты:
                    </TableCell>
                    <TableCell>{paymentData?.card}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Сумма:
                    </TableCell>
                    <TableCell>{paymentData?.amount}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Section>
          <Section className={classes.section}>
            <div className={classes.buttonContainer}>
              <Button
                type="button"
                variant="contained"
                color="primary"
                onClick={onSubmit}
              >
                Подтвердить выплату
              </Button>
            </div>
          </Section>
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
  buttonContainer: {
    display: "flex",
    "& > :not(:last-child)": {
      marginRight: 20,
    },
  },
  tableContainer: {
    width: "auto",
  },
}));

export default BuhPaymentPage;
