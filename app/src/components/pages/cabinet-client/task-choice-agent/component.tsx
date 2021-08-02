import React from 'react'
import { Button, makeStyles } from "@material-ui/core";

import { AgentForChoicePr } from "@problembo/grpc-web-problembo-core/client/client_pb";

import { useKeycloak } from "@react-keycloak/web";

import { useCallback, useEffect, useState } from "react";
import DocumentTitle from "react-document-title";
import { RouteComponentProps, useHistory } from "react-router-dom";

import {
  clientGetAgentListForChoose,
  ClientGetAgentListForChooseReturn,
  clientSetAssignAgent,
} from "api/grpc/client";

import { ResponseType } from "api/grpc/common";

import { routes } from "components/app/routes";

import LoadingContainer from "components/common/loading-container";
import Page from "components/common/page";
import Section from "components/common/section";
import Table, { TableData } from "components/common/table";

const AGENT_CHOICE_HEADERS = ["Имя отчество", "Предложенная цена", "Действие"];

enum SubmitState {
  Submitted,
  Success,
  Error,
  Idle,
}

function _generateAgentChoiceData(
  agentsForChoice: AgentForChoicePr.AsObject[],
  tableAction: (item: AgentForChoicePr.AsObject) => void
): TableData {
  return agentsForChoice.map((item) => {
    return [
      item.name,
      item.priceoffer,
      {
        name: "Выбрать",
        action: () => {
          tableAction(item);
        },
      },
    ];
  });
}

interface TaskChoiceAgentPageMatchParams {
  taskId: string;
}

interface TaskChoiceAgentPageProps
  extends RouteComponentProps<TaskChoiceAgentPageMatchParams> {}

const TaskChoiceAgentPage = (props: TaskChoiceAgentPageProps) => {
  const { match } = props;

  const [agentList, setAgentList] =
    useState<ClientGetAgentListForChooseReturn | undefined>(undefined);

  const [submitState, setSubmitState] = useState<SubmitState>(SubmitState.Idle);

  const [errorMessage, setErrorMessage] = useState<string>("");

  const history = useHistory();

  const classes = useStyles();

  const { keycloak } = useKeycloak();

  const taskId = Number(match.params.taskId);

  const token = keycloak.token;

  const isLoaded =
    agentList?.responseType === ResponseType.Success &&
    submitState === SubmitState.Idle;

  const isError =
    agentList?.responseType === ResponseType.Error ||
    submitState === SubmitState.Error;

  const tableAction = useCallback(
    (item: AgentForChoicePr.AsObject) => {
      if (!token) {
        return;
      }

      setSubmitState(SubmitState.Submitted);

      clientSetAssignAgent({ token, tenderTaskId: item.tendertaskid?.id }).then(
        (res) => {
          if (res.responseType === ResponseType.Success) {
            history.push(
              routes.client.task.taskId.view.getRedirectPath({
                taskId: taskId.toString(),
              })
            );
          }

          if (res.responseType === ResponseType.Error) {
            setSubmitState(SubmitState.Error);

            setErrorMessage(res.message || "");
          }
        }
      );
    },
    [token, history, taskId]
  );

  useEffect(() => {
    if (token) {
      clientGetAgentListForChoose({ token, taskId }).then((res) => {
        setAgentList(res);
      });
    }
  }, [token, taskId]);

  return (
    <DocumentTitle title="Кабинет клиента — выбор агента на задачу">
      <Page>
        <LoadingContainer
          isLoaded={isLoaded}
          isError={isError}
          errorMessage={errorMessage}
          redirectPathOnError={routes.client.task.taskId.view.getRedirectPath({
            taskId: taskId.toString(),
          })}
        >
          {agentList?.agentsforchoosingList && token && (
            <>
              <Section>
                <Table
                  headers={AGENT_CHOICE_HEADERS}
                  data={_generateAgentChoiceData(
                    agentList.agentsforchoosingList,
                    tableAction
                  )}
                />
              </Section>
              <Section className={classes.section2}>
                <Button
                  variant="contained"
                  onClick={() => {
                    clientSetAssignAgent({ token });
                  }}
                  color="primary"
                >
                  Отказ от всех агентов
                </Button>
              </Section>
            </>
          )}
        </LoadingContainer>
      </Page>
    </DocumentTitle>
  );
};

const useStyles = makeStyles(() => ({
  section2: {
    display: "flex",
    alignItems: "flex-end",
  },
}));

export default TaskChoiceAgentPage;
