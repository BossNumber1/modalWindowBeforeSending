import React from 'react'
import { Button, makeStyles, Typography } from "@material-ui/core";

import { TaskPaymentPr } from "@problembo/grpc-web-problembo-core/client/client_pb";

import { TaskShortPr } from "@problembo/grpc-web-problembo-core/common/task-share_pb";

import { useKeycloak } from "@react-keycloak/web";

import { useEffect, useState } from "react";
import DocumentTitle from "react-document-title";
import { Link as RouterLink } from "react-router-dom";

import {
  clientGetPaymentList,
  ClientGetPaymentListReturn,
  clientGetTaskList,
  ClientGetTaskListReturn,
  clientGetWtodoList,
} from "api/grpc/client";

import { CommonGetWtodoListReturn, ResponseType } from "api/grpc/common";

import {
  generateCategoriesString,
  generateTableString,
  getTaskStatusString,
} from "lib/helper";

import useTodoList from "hooks/use-todolist";

import { routes } from "components/app/routes";

import LoadingContainer from "components/common/loading-container";
import Page from "components/common/page";
import Section from "components/common/section";
import Table from "components/common/table";
import useDateFormatter from "hooks/use-date-formatter";

const TASKS_HEADERS = [
  "№ задачи",
  "Дата создания",
  "Категория",
  "Запланированное время",
  "Статус",
  "Стоимость",
  "Действие",
];

function _getTaskLink(taskId: number | undefined) {
  if (!taskId) {
    return;
  }

  return routes.client.task.taskId.view.getRedirectPath({
    taskId: taskId.toString(),
  });
}

function _generateTasksData(
  tasksList: TaskShortPr.AsObject[],
  formatDate: any
) {
  return tasksList.map((item) => {
    return [
      generateTableString(item.taskid?.taskid),
      generateTableString(formatDate(item.datecreate)),
      generateCategoriesString(item.categoryList),
      generateTableString(formatDate(item.scheduledtime)),
      getTaskStatusString(item.status) || "—",
      generateTableString(item.price),
      {
        link: _getTaskLink(item.taskid?.taskid),
        name: "Просмотр",
      },
    ];
  });
}

const PAYMENTS_HEADERS = [
  "№ задачи",
  "№ операции",
  "Дата операции",
  "№ карты",
  "Сумма",
];

function _generatePaymentsData(
  paymentsList: TaskPaymentPr.AsObject[],
  formatDate: any
) {
  return paymentsList.map((item) => {
    return [
      generateTableString(item.taskid?.taskid),
      generateTableString(item.paymentid?.moneytrid),
      generateTableString(formatDate(item.payedat)),
      generateTableString(item.card4),
      generateTableString(item.amount?.count),
    ];
  });
}

const CabinetClientPage = () => {
  const [todoList, setTodolist] =
    useState<CommonGetWtodoListReturn | null>(null);

  const [taskList, setTaskList] =
    useState<ClientGetTaskListReturn | undefined>(undefined);

  const [paymentList, setPaymentList] =
    useState<ClientGetPaymentListReturn | undefined>(undefined);

  const formatDate = useDateFormatter();

  const classes = useStyles();

  const { keycloak } = useKeycloak();

  const token = keycloak.token;

  const errorMessage =
    todoList?.message || taskList?.message || paymentList?.message;

  const isLoaded =
    taskList?.responseType === ResponseType.Success &&
    paymentList?.responseType === ResponseType.Success &&
    todoList?.responseType === ResponseType.Success;

  const isError =
    taskList?.responseType === ResponseType.Error ||
    paymentList?.responseType === ResponseType.Error ||
    todoList?.responseType === ResponseType.Error;

  useTodoList(todoList, isLoaded);

  useEffect(() => {
    if (token) {
      clientGetTaskList({ token }).then((res) => {
        setTaskList(res);
      });

      clientGetPaymentList({ token }).then((res) => {
        setPaymentList(res);
      });

      clientGetWtodoList({ token }).then((res) => {
        setTodolist(res);
      });
    }
  }, [token]);

  return (
    <DocumentTitle title="Кабинет клиента">
      <Page>
        <LoadingContainer
          isLoaded={isLoaded}
          isError={isError}
          errorMessage={errorMessage}
        >
          <Section className={classes.section}>
            <Button
              component={RouterLink}
              to={routes.client.addTask.getRoutePath()}
              variant="contained"
              color="primary"
            >
              Создать задачу
            </Button>
          </Section>
          <Section className={classes.section}>
            <Typography>Задачи</Typography>
            {taskList?.tasksList && (
              <Table
                headers={TASKS_HEADERS}
                data={_generateTasksData(taskList?.tasksList, formatDate)}
              />
            )}
          </Section>
          <Section className={classes.section}>
            <Typography>Список платежей</Typography>
            {paymentList?.paymentsList && (
              <Table
                headers={PAYMENTS_HEADERS}
                data={_generatePaymentsData(
                  paymentList?.paymentsList,
                  formatDate
                )}
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

export default CabinetClientPage;
