import {AgentPromiseClient} from "@problembo/grpc-web-problembo-core/agent/agent_grpc_web_pb";

import {AgentProfilePromiseClient} from "@problembo/grpc-web-problembo-core/agent/agent-profile_grpc_web_pb";

import {
    AgentCallRequestPr,
    AgentFilterTaskEnumPr,
    AgentFilterTaskPr,
    AgentTaskPr,
    AgentTaskPricePr, AgentTaskShortListPr,
    TaskCancelAgentEnumPr,
    TaskCancelByAgentPr,
    TransactionListPr,
    WithdrawalMoneyRequestPr,
} from "@problembo/grpc-web-problembo-core/agent/agent_pb";

import {AgentSpecListPr} from "@problembo/grpc-web-problembo-core/agent/agent-profile_pb";

import {
    AgentProfilePr,
    AddAgentSpecPr,
    AgentSpecPrId
} from "@problembo/grpc-web-problembo-core/common/agent-share_pb";

import {
    AgentModerateFormForAddPr,
    FileIdPr,
    MoneyPr,
    PhoneNumberPr,
    ScheduledTaskTimeAddPr,
    TaskIdPr,
    VerifyCodePr,
    // WtodoPriorityEnumPr,
    WtodoRequestPr,
} from "@problembo/grpc-web-problembo-core/common/core-share_pb";

import google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

import {
    CommonRequestArgs,
    hostname,
    getResponse,
    GetResponseReturn,
    CommonTaskRequestArgs,
    СommonPhoneVerifyStartArgs,
    СommonPhoneVerifyStartReturn,
    CommonPhoneVerifyFinishArgs,
    CommonPhoneVerifyFinishReturn,
    CommonReturnMessagePrReturn,
    CommonEmptyReturn,
    CommonGetWtodoListReturn,
    CommonEmailVerifyReturn,
} from "./common";
import {CategoryIdPr} from "@problembo/grpc-web-problembo-core/common/core_pb";

const agentClient = new AgentPromiseClient(hostname);

const agentProfileClient = new AgentProfilePromiseClient(hostname);

// agentClient.withdrawalMoney;

// agentProfileClient.removeSpec;

export interface AgentSetAgentTaskPriceArgs extends CommonTaskRequestArgs {
    price: number;
}

export interface AgentSetScheduledTaskTimeArgs extends CommonTaskRequestArgs {
    time: string;
}

export interface AgentWithdrawalMoneyArgs extends CommonRequestArgs {
    amount: number;
    card: string;
}

export interface AgentCommonSpecArgs extends CommonRequestArgs {
    categoryId: number;
}

export interface AgentSetAgentModerateFormArgs extends CommonRequestArgs {
    mainFileId: string;
    placeFileId: string;
    selfieFileId: string;
}

export interface AgentGetTaskListReturn
    extends GetResponseReturn,
        AgentTaskShortListPr.AsObject {
}

export interface AgentGetTaskReturn
    extends GetResponseReturn,
        AgentTaskPr.AsObject {
}

export interface AgentGetCashAccountListReturn
    extends GetResponseReturn,
        TransactionListPr.AsObject {
}

export interface AgentGetAgentProfileReturn
    extends GetResponseReturn,
        AgentProfilePr.AsObject {
}

export interface AgentCommonSpecReturn
    extends GetResponseReturn,
        AgentSpecListPr.AsObject {
}

interface IAgentApi {
    getWtodoList: (args: CommonRequestArgs) => Promise<CommonGetWtodoListReturn>;
    getFreeTaskList: (args: CommonRequestArgs) => Promise<AgentGetTaskListReturn>;
    getAssignTaskList: (
        args: CommonRequestArgs
    ) => Promise<AgentGetTaskListReturn>;
    getWaitTaskList: (
        args: CommonRequestArgs
    ) => Promise<AgentGetTaskListReturn>;
    getUnpaidTaskList: (
        args: CommonRequestArgs
    ) => Promise<AgentGetTaskListReturn>;
    getTask: (args: CommonTaskRequestArgs) => Promise<AgentGetTaskReturn>;
    getCashAccountList: (
        args: CommonRequestArgs
    ) => Promise<AgentGetCashAccountListReturn>;
    getAgentProfile: (
        args: CommonRequestArgs
    ) => Promise<AgentGetAgentProfileReturn>;
    phoneVerifyStart: (
        args: СommonPhoneVerifyStartArgs
    ) => Promise<СommonPhoneVerifyStartReturn>;
    phoneVerifyFinish: (
        args: CommonPhoneVerifyFinishArgs
    ) => Promise<CommonPhoneVerifyFinishReturn>;
    emailVerifyStart: (
        args: CommonRequestArgs
    ) => Promise<CommonEmailVerifyReturn>;
    emailVerifyFinish: (
        args: CommonPhoneVerifyFinishArgs
    ) => Promise<CommonEmailVerifyReturn>;
    callToClient: (
        args: CommonTaskRequestArgs
    ) => Promise<CommonReturnMessagePrReturn>;
    taskCancel: (
        args: CommonTaskRequestArgs
    ) => Promise<CommonReturnMessagePrReturn>;
    hideTask: (args: CommonTaskRequestArgs) => Promise<CommonEmptyReturn>;
    setAgentTaskPrice: (
        args: AgentSetAgentTaskPriceArgs
    ) => Promise<CommonReturnMessagePrReturn>;
    setScheduledTaskTime: (
        args: AgentSetScheduledTaskTimeArgs
    ) => Promise<CommonReturnMessagePrReturn>;
    withdrawalMoney: (
        args: AgentWithdrawalMoneyArgs
    ) => Promise<CommonReturnMessagePrReturn>;
    addSpec: (args: AgentCommonSpecArgs) => Promise<AgentCommonSpecReturn>;
    removeSpec: (args: AgentCommonSpecArgs) => Promise<AgentCommonSpecReturn>;
    setAgentModerateForm: (
        args: AgentSetAgentModerateFormArgs
    ) => Promise<CommonReturnMessagePrReturn>;
    getAgentModerateForm: (args: CommonRequestArgs) =>
        Promise<CommonReturnMessagePrReturn>;
    setTaskAsComplited: (
        args: CommonTaskRequestArgs
    ) => Promise<CommonReturnMessagePrReturn>;
}

const agentApi: IAgentApi = {
    getWtodoList: async ({token}) => {
        const request = new WtodoRequestPr();

        return (await getResponse(
            agentProfileClient,
            "getWtodoList",
            request,
            token
        )) as CommonGetWtodoListReturn;
    },
    getFreeTaskList: async ({token}) => {
        const request = new AgentFilterTaskPr().addTaskfilter(
            AgentFilterTaskEnumPr.AGENT_FILTER_TASK_ENUM_PR_FREE
        );

        return (await getResponse(
            agentClient,
            "getTaskList",
            request,
            token
        )) as AgentGetTaskListReturn;
    },
    getAssignTaskList: async ({token}) => {
        const request = new AgentFilterTaskPr().addTaskfilter(
            AgentFilterTaskEnumPr.AGENT_FILTER_TASK_ENUM_PR_ASSIGN
        );

        return (await getResponse(
            agentClient,
            "getTaskList",
            request,
            token
        )) as AgentGetTaskListReturn;
    },
    getWaitTaskList: async ({token}) => {
        const request = new AgentFilterTaskPr().addTaskfilter(
            AgentFilterTaskEnumPr.AGENT_FILTER_TASK_ENUM_PR_SUCCESS
        );

        return (await getResponse(
            agentClient,
            "getTaskList",
            request,
            token
        )) as AgentGetTaskListReturn;
    },
    getUnpaidTaskList: async ({token}) => {
        const request = new AgentFilterTaskPr().addTaskfilter(
            AgentFilterTaskEnumPr.AGENT_FILTER_TASK_ENUM_PR_FAIL
        );

        return (await getResponse(
            agentClient,
            "getTaskList",
            request,
            token
        )) as AgentGetTaskListReturn;
    },
    getTask: async ({token, taskId}) => {
        const request = new TaskIdPr().setTaskid(taskId);

        return (await getResponse(
            agentClient,
            "getTask",
            request,
            token
        )) as AgentGetTaskReturn;
    },
    getCashAccountList: async ({token}) => {
        const request = new google_protobuf_empty_pb.Empty();

        return (await getResponse(
            agentClient,
            "getTransactions",
            request,
            token
        )) as AgentGetCashAccountListReturn;
    },
    getAgentProfile: async ({token}) => {
        const request = new google_protobuf_empty_pb.Empty();

        return (await getResponse(
            agentProfileClient,
            "getAgentProfile",
            request,
            token
        )) as AgentGetAgentProfileReturn;
    },
    phoneVerifyStart: async ({token, phone}) => {
        const request = new PhoneNumberPr().setPhone(phone);

        return (await getResponse(
            agentProfileClient,
            "phoneVerifyStart",
            request,
            token
        )) as СommonPhoneVerifyStartReturn;
    },
    phoneVerifyFinish: async ({token, code}) => {
        const request = new VerifyCodePr().setCode(code);

        return (await getResponse(
            agentProfileClient,
            "phoneVerifyFinish",
            request,
            token
        )) as CommonPhoneVerifyFinishReturn;
    },
    emailVerifyStart: async ({token}) => {
        const request = new google_protobuf_empty_pb.Empty();

        return (await getResponse(
            agentProfileClient,
            "emailVerifyStart",
            request,
            token
        )) as CommonEmailVerifyReturn;
    },
    emailVerifyFinish: async ({token, code}) => {
        const request = new VerifyCodePr().setCode(code);

        return (await getResponse(
            agentProfileClient,
            "emailVerifyFinish",
            request,
            token
        )) as CommonEmailVerifyReturn;
    },
    callToClient: async ({token, taskId}) => {
        const request = new AgentCallRequestPr().setTaskid(taskId);

        return (await getResponse(
            agentClient,
            "callToClient",
            request,
            token
        )) as CommonReturnMessagePrReturn;
    },
    taskCancel: async ({token, taskId}) => {
        const taskIdPr = new TaskIdPr().setTaskid(taskId);

        const request = new TaskCancelByAgentPr()
            .setTaskid(taskIdPr)
            .setCanceltype(
                TaskCancelAgentEnumPr.TASK_CANCEL_AGENT_ENUM_PR_UNSPECIFIED
            );

        return (await getResponse(
            agentClient,
            "taskCancel",
            request,
            token
        )) as CommonReturnMessagePrReturn;
    },
    hideTask: async ({token, taskId}) => {
        const request = new TaskIdPr().setTaskid(taskId);

        return (await getResponse(
            agentClient,
            "hideTask",
            request,
            token
        )) as CommonEmptyReturn;
    },
    setAgentTaskPrice: async ({token, taskId, price}) => {
        const taskIdPr = new TaskIdPr().setTaskid(taskId);

        const moneyPr = new MoneyPr().setCount(price);

        const request = new AgentTaskPricePr()
            .setTaskid(taskIdPr)
            .setPrice(moneyPr);

        return (await getResponse(
            agentClient,
            "setAgentTaskPrice",
            request,
            token
        )) as CommonReturnMessagePrReturn;
    },
    setScheduledTaskTime: async ({token, taskId, time}) => {
        const taskIdPr = new TaskIdPr().setTaskid(taskId);

        const request = new ScheduledTaskTimeAddPr()
            .setTaskid(taskIdPr)
            .setScheduledtime(time);

        return (await getResponse(
            agentClient,
            "setScheduledTaskTime",
            request,
            token
        )) as CommonReturnMessagePrReturn;
    },
    withdrawalMoney: async ({token, amount, card}) => {
        const moneyPr = new MoneyPr().setCount(amount);

        const request = new WithdrawalMoneyRequestPr()
            .setAmount(moneyPr)
            .setCard(card);

        return (await getResponse(
            agentClient,
            "withdrawalMoney",
            request,
            token
        )) as CommonReturnMessagePrReturn;
    },
    addSpec: async ({token, categoryId}) => {
        const categoryPr = new CategoryIdPr().setCategoryid(categoryId);

        const request = new AddAgentSpecPr().setCategoryid(categoryPr);

        return (await getResponse(
            agentProfileClient,
            "addSpecV2",
            request,
            token
        )) as AgentCommonSpecReturn;
    },
    removeSpec: async ({token, categoryId}) => {
        const request = new AgentSpecPrId().setAgentspecid(categoryId);
        return (await getResponse(
            agentProfileClient,
            "removeSpecV2",
            request,
            token
        )) as AgentCommonSpecReturn;
    },
    setAgentModerateForm: async ({
                                     token,
                                     mainFileId,
                                     placeFileId,
                                     selfieFileId,
                                 }) => {
        const mainFileIdPr = new FileIdPr().setFileid(mainFileId);

        const placeFileIdPr = new FileIdPr().setFileid(placeFileId);

        const selfieFileIdPr = new FileIdPr().setFileid(selfieFileId);

        const request = new AgentModerateFormForAddPr()
            .setPassportmain(mainFileIdPr)
            .setPassportplace(placeFileIdPr)
            .setPassportselfie(selfieFileIdPr);

        return (await getResponse(
            agentProfileClient,
            "setAgentModerateForm",
            request,
            token
        )) as CommonReturnMessagePrReturn;
    },
    getAgentModerateForm: async ({
                                     token
                                 }) => {
        const request = new google_protobuf_empty_pb.Empty();
        return (await getResponse(
            agentProfileClient,
            "getAgentModerateForm",
            request,
            token
        )) as CommonReturnMessagePrReturn;
    },
    setTaskAsComplited: async ({token, taskId}) => {
        const request = new TaskIdPr().setTaskid(taskId);

        return (await getResponse(
            agentClient,
            "setTaskAsComplited",
            request,
            token
        )) as CommonReturnMessagePrReturn;
    }
};

export default agentApi;
