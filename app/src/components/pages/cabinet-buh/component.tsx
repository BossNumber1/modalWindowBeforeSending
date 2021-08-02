import React from 'react'
import { makeStyles, Typography } from "@material-ui/core";

import { useKeycloak } from "@react-keycloak/web";

import { useEffect, useState } from "react";
import DocumentTitle from "react-document-title";

import { ResponseType } from "api/grpc/common";

import buhApi, { BuhPaymentToAgentListReturn } from "api/grpc/buh";

import { generateTableString, getPaymentStatusString } from "lib/helper";

import { routes } from "components/app/routes";

import LoadingContainer from "components/common/loading-container";
import Page from "components/common/page";
import Section from "components/common/section";
import Table from "components/common/table";
import {AgentWithdrawalPr} from "@problembo/grpc-web-problembo-core/buh/buh_pb";

function _getLink(requestId: number | undefined) {
  if (!requestId) {
    return;
  }

  return routes.buh.request.requestId.view.getRedirectPath({
    requestId: requestId.toString(),
  });
}

const PAYMENT_LIST_HEADERS = [
  "№ заявки",
  "Дата создания",
  "Сумма",
  "ФИО",
  "Статус",
  "Действие",
];

function _generatePaymentListData(listsList: AgentWithdrawalPr.AsObject[]) {
  // return [
  //   [
  //     generateTableString(1),
  //     generateTableString("дата"),
  //     generateTableString(10000),
  //     generateTableString("Вася Пупкин"),
  //     getPaymentStatusString(undefined),
  //     {
  //       link: _getLink(1),
  //       name: "Просмотр",
  //     },
  //   ],
  // ];

  // TODO remove

  return listsList.map((item) => {
    return [
      generateTableString(item.id?.id),
      generateTableString(item.created),
      generateTableString(item.money),
      generateTableString(item.agentname),
      getPaymentStatusString(item.status),
      {
        link: _getLink(item.id?.id),
        name: "Просмотр",
      },
    ];
  });
}

const CabinetBuhPage = () => {
  const [paymentToAgentList, setPaymentToAgentList] =
    useState<BuhPaymentToAgentListReturn | null>(null);

  const classes = useStyles();

  const { keycloak } = useKeycloak();

  const token = keycloak.token;

  const isLoaded = paymentToAgentList?.responseType === ResponseType.Success;

  const isError = paymentToAgentList?.responseType === ResponseType.Error;

  useEffect(() => {
    if (token) {
      buhApi.paymentToAgentList({ token }).then((res) => {
        setPaymentToAgentList(res);
      });
    }
  }, [token]);

  return (
    <DocumentTitle title="Кабинет бухгалтера">
      <Page>
        <LoadingContainer
          isLoaded={isLoaded}
          isError={isError}
          errorMessage={paymentToAgentList?.message}
        >
          <Section className={classes.section}>
            <Typography>Заявки на выплату агентам</Typography>
            {paymentToAgentList?.listsList && (
              <Table
                headers={PAYMENT_LIST_HEADERS}
                data={_generatePaymentListData(paymentToAgentList.listsList)}
              />
            )}
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
}));

export default CabinetBuhPage;
