import {Button, makeStyles, Typography} from "@material-ui/core";

import {AgentCashAccountPr, AgentTaskShortPr, TransactionPr} from "@problembo/grpc-web-problembo-core/agent/agent_pb";

import {useKeycloak} from "@react-keycloak/web";

import {useCallback, useEffect, useState} from "react";
import DocumentTitle from "react-document-title";

import agentApi, {AgentGetCashAccountListReturn, AgentGetTaskListReturn,} from "api/grpc/agent";

import {CommonGetWtodoListReturn, CommonReturnMessagePrReturn, ResponseType,} from "api/grpc/common";

import {generateCategoriesString, generateTableString, getTaskStatusString, getTransactionTypeString} from "lib/helper";

import useModal from "hooks/use-modal";
import useTodoList from "hooks/use-todolist";

import {routes} from "components/app/routes";

import LoadingContainer from "components/common/loading-container";
import Modal from "components/common/modal";
import ModalWithdrawal from "components/common/modal/withdrawal";
import Page from "components/common/page";
import Section from "components/common/section";
import Table from "components/common/table";

import useDateFormatter from "hooks/use-date-formatter";

function _getTaskLink(taskId: number | undefined) {
    if (!taskId) {
        return;
    }

    return routes.agent.task.taskId.view.getRedirectPath({
        taskId: taskId.toString(),
    });
}

const FREE_TASKS_HEADERS = [
    "№ задачи",
    "Дата создания",
    "Категория",
    "Оценка",
    "Действие",
];

function _generateFreeTasksData(
    tasksList: AgentTaskShortPr.AsObject[],
    formatDate: any
) {
    return tasksList.map((item) => {
        return [
            generateTableString(item.task!.taskid?.taskid),
            generateTableString(formatDate(item.task!.datecreate)),
            generateCategoriesString(item.task!.categoryList),
            generateTableString(item.priceoffer),
            {
                link: _getTaskLink(item.task!.taskid?.taskid),
                name: "Просмотр",
            },
        ];
    });
}

const ASSIGN_TASKS_HEADERS = [
    "№ задачи",
    "Дата создания",
    "Запланированное время",
    "Категория",
    "Оценка",
    "Клиент",
    "Действие",
];

function _generateAssignTasksData(
    tasksList: AgentTaskShortPr.AsObject[],
    formatDate: any
) {
    return tasksList.map((item) => {
        return [
            generateTableString(item.task!.taskid?.taskid),
            generateTableString(formatDate(item.task!.datecreate)),
            generateTableString(formatDate(item.task!.scheduledtime)),
            generateCategoriesString(item.task!.categoryList),
            generateTableString(item.task?.price),
            "Имя Отчество",
            {
                link: _getTaskLink(item.task!.taskid?.taskid),
                name: "Просмотр",
            },
        ];
    });
}

const WAIT_TASKS_HEADERS = [
    "№ задачи",
    "Дата завершения задачи",
    "Статус задачи",
    "Категория",
    "Сумма",
    "Действие",
];

function _generateCompleteTasksData(
    tasksList: AgentTaskShortPr.AsObject[],
    formatDate: any
) {
    return tasksList.map((item) => {
        return [
            generateTableString(item.task!.taskid?.taskid),
            generateTableString(formatDate(item.task!.datecreate)),
            getTaskStatusString(item.task!.status),
            //getTaskStatusString(item.task!.datecreate),
            generateTableString(item.task!.categoryList.join(',')),
            generateTableString(item.task?.price),
            {
                link: _getTaskLink(item.task!.taskid?.taskid),
                name: "Просмотр",
            },
        ];
    });
}

const CASH_ACCOUNT_HEADERS = [
    "№ транзакции",
    "Дата транзакции",
    "№ задачи",
    "Сумма",
    "Тип",
];

function _generateCashAccountData(
    tasksList: TransactionPr.AsObject[],
    formatDate: any
) {
    return tasksList.map((item) => {
        return [
            generateTableString(item.transactionid?.id),
            generateTableString(formatDate(item.datetransaction)),
            getTaskStatusString(item.taskid?.taskid),
            generateTableString(item.pricetotal?.count),
            getTransactionTypeString(item.type),
        ];
    });
}

function _generateTasksPriceSum(tasksList?: AgentCashAccountPr.AsObject[]) {
    if (!tasksList) {
        return 0;
    }

    return tasksList
        .filter((item) => item.price)
        .map((item) => Number(item.price) || 0)
        .reduce((acc, curr) => acc + curr, 0);
}

const CabinetAgentPage = () => {
    const [todoList, setTodolist] =
        useState<CommonGetWtodoListReturn | null>(null);

    const [freeTaskList, setFreeTaskList] =
        useState<AgentGetTaskListReturn | null>(null);

    const [assignTaskList, setAssignTaskList] =
        useState<AgentGetTaskListReturn | null>(null);

    const [waitTaskList, setWaitTaskList] =
        useState<AgentGetTaskListReturn | null>(null);

    const [unpaidTaskList, setUnpaidTaskList] =
        useState<AgentGetTaskListReturn | null>(null);

    const [cashAccountList, setCashAccountList] =
        useState<AgentGetCashAccountListReturn | null>(null);

    const [
        modalWithdrawalProps,
        {closeModal: closeModalWithdawal, openModal: openModalWithdrawal},
    ] = useModal();

    const formatDate = useDateFormatter();

    const classes = useStyles();

    const {keycloak} = useKeycloak();

    const token = keycloak.token;

    const errorMessage =
        todoList?.message ||
        freeTaskList?.message ||
        assignTaskList?.message ||
        waitTaskList?.message ||
        unpaidTaskList?.message ||
        cashAccountList?.message;

    const isLoaded =
        freeTaskList?.responseType === ResponseType.Success &&
        assignTaskList?.responseType === ResponseType.Success &&
        waitTaskList?.responseType === ResponseType.Success &&
        unpaidTaskList?.responseType === ResponseType.Success &&
        cashAccountList?.responseType === ResponseType.Success &&
        todoList?.responseType === ResponseType.Success;

    const isError =
        freeTaskList?.responseType === ResponseType.Error ||
        assignTaskList?.responseType === ResponseType.Error ||
        waitTaskList?.responseType === ResponseType.Error ||
        unpaidTaskList?.responseType === ResponseType.Error ||
        cashAccountList?.responseType === ResponseType.Error ||
        todoList?.responseType === ResponseType.Error;

    const reload = useCallback(() => {
        if (!token) {
            return;
        }

        agentApi.getFreeTaskList({token}).then((res) => {
            setFreeTaskList(res);
        });

        agentApi.getAssignTaskList({token}).then((res) => {
            setAssignTaskList(res);
        });

        agentApi.getWaitTaskList({token}).then((res) => {
            setWaitTaskList(res);
        });

        agentApi.getUnpaidTaskList({token}).then((res) => {
            setUnpaidTaskList(res);
        });

        agentApi.getCashAccountList({token}).then((res) => {
            setCashAccountList(res);
        });

        agentApi.getWtodoList({token}).then((res) => {
            setTodolist(res);
        });
    }, [token]);

    const handleWithdrawalSubmit = (response: CommonReturnMessagePrReturn) => {
        if (response.responseType === ResponseType.Error) {
            return;
        }

        closeModalWithdawal();

        reload();
    };

    useTodoList(todoList, isLoaded);

    useEffect(() => {
        reload();
    }, [reload]);

    return (
        <DocumentTitle title="Кабинет агента">
            <Page>
                <LoadingContainer
                    isLoaded={isLoaded}
                    isError={isError}
                    errorMessage={errorMessage}
                >
                    <Section className={classes.section}>
                        <Typography>Свободные задачи</Typography>
                        {freeTaskList?.tasksList && (
                            <Table
                                headers={FREE_TASKS_HEADERS}
                                data={_generateFreeTasksData(
                                    freeTaskList?.tasksList,
                                    formatDate
                                )}
                            />
                        )}
                    </Section>
                    <Section className={classes.section}>
                        <Typography>Назначенные задачи</Typography>
                        {assignTaskList?.tasksList && (
                            <Table
                                headers={ASSIGN_TASKS_HEADERS}
                                data={_generateAssignTasksData(
                                    assignTaskList?.tasksList,
                                    formatDate
                                )}
                            />
                        )}
                    </Section>
                    <Section className={classes.section}>
                        <div className={classes.sectionHeaderContainer}>
                            <Typography>Выполненные задания</Typography>
                            <Typography>
                                {/*Итого: {_generateTasksPriceSum(waitTaskList?.tasksList)} руб*/}
                            </Typography>
                        </div>
                        {waitTaskList?.tasksList && (
                            <Table
                                headers={WAIT_TASKS_HEADERS}
                                data={_generateCompleteTasksData(
                                    waitTaskList?.tasksList,
                                    formatDate
                                )}
                            />
                        )}
                    </Section>
                    <Section className={classes.section}>
                        <div className={classes.sectionHeaderContainer}>
                            <Typography>Закрытые задачи без оплаты</Typography>
                            <Typography>
                                {/*Итого: {_generateTasksPriceSum(unpaidTaskList?.tasksList)} руб*/}
                            </Typography>
                        </div>
                        {unpaidTaskList?.tasksList && (
                            <Table
                                headers={WAIT_TASKS_HEADERS}
                                data={_generateCompleteTasksData(
                                    unpaidTaskList?.tasksList,
                                    formatDate
                                )}
                            />
                        )}
                    </Section>
                    <Section className={classes.section}>
                        <div className={classes.sectionHeaderContainer}>
                            <Typography>Финансовый счет</Typography>
                            <div className={classes.buttonWrapper}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={openModalWithdrawal}
                                >
                                    Вывести
                                </Button>
                                <Typography>
                                    Итого:{" "}
                                    {_generateTasksPriceSum(
                                        cashAccountList?.agentcashaccountList
                                    )}{" "}
                                    руб
                                </Typography>
                            </div>
                        </div>
                        {cashAccountList?.transactionsList && (
                            <Table
                                headers={CASH_ACCOUNT_HEADERS}
                                data={_generateCashAccountData(
                                    cashAccountList.transactionsList,
                                    formatDate
                                )}
                            />
                        )}
                    </Section>
                </LoadingContainer>
                <Modal {...modalWithdrawalProps}>
                    <ModalWithdrawal onSubmit={handleWithdrawalSubmit}/>
                </Modal>
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
    sectionHeaderContainer: {
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
    },
    buttonWrapper: {
        display: "flex",
        alignItems: "center",
        width: "auto",
        "& > :not(:last-child)": {
            marginRight: 20,
        },
    },
}));

export default CabinetAgentPage;
