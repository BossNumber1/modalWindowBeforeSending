// import { ClientReadableStream } from "grpc-web";
// Error

import { ClientPromiseClient } from "@problembo/grpc-web-problembo-core/client/client_grpc_web_pb";

import {
    AgentForChoiceListPr,
    ClientTaskFilterPr,
    InfoForPayPr,
    PayTaskManualPr,
    TaskAddPr,
    TaskAddReturnPr,
    TaskCancelByClientPr,
    TaskCancelClientEnumPr,
    TaskClaimPr,
    TaskPaymentListPr,
    TaskPaymentPr,
    TaskUpdatePr,
    TaskConfirmPr,
    TaskConfirmEnumPr
} from "@problembo/grpc-web-problembo-core/client/client_pb";

import { ClientProfilePromiseClient } from "@problembo/grpc-web-problembo-core/client/client-profile_grpc_web_pb";

import { ClientProfilePr } from "@problembo/grpc-web-problembo-core/client/client-profile_pb";

import {
    ClientReviewPr,
    FileIdPr,
    PhoneNumberPr,
    TaskIdPr,
    TenderTaskIdPr,
    VerifyCodePr,
    WtodoRequestPr,
} from "@problembo/grpc-web-problembo-core/common/core-share_pb";

import {
    ClientTaskPr,
    TaskPr,
    TaskShortListPr,
} from "@problembo/grpc-web-problembo-core/common/task-share_pb";

import google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

import {
    CommonPhoneVerifyFinishArgs,
    CommonPhoneVerifyFinishReturn,
    СommonPhoneVerifyStartArgs,
    СommonPhoneVerifyStartReturn,
    CommonRequestArgs,
    CommonReturnMessagePrReturn,
    CommonTaskRequestArgs,
    getResponse,
    GetResponseReturn,
    hostname,
    CommonEmailVerifyReturn,
    CommonGetWtodoListReturn,
} from "./common";

const clientClient = new ClientPromiseClient(hostname);

const clientProfileClient = new ClientProfilePromiseClient(hostname);

export async function clientGetWtodoList({ token }: CommonRequestArgs) {
    const request = new WtodoRequestPr();

    return (await getResponse(
        clientProfileClient,
        "getWtodoList",
        request,
        token
    )) as CommonGetWtodoListReturn;
}

export interface ClientGetTaskListReturn
    extends GetResponseReturn,
        TaskShortListPr.AsObject {}

export async function clientGetTaskList({
                                            token,
                                        }: CommonRequestArgs): Promise<ClientGetTaskListReturn> {
    const request = new ClientTaskFilterPr();

    return (await getResponse(
        clientClient,
        "getTaskList",
        request,
        token
    )) as ClientGetTaskListReturn;
}

export interface ClientGetPaymentListReturn
    extends GetResponseReturn,
        TaskPaymentListPr.AsObject {}

export async function clientGetPaymentList({
                                               token,
                                           }: CommonRequestArgs): Promise<ClientGetPaymentListReturn> {
    const request = new TaskPaymentListPr();

    return (await getResponse(
        clientClient,
        "getPaymentList",
        request,
        token
    )) as ClientGetPaymentListReturn;
}

export interface ClientGetProfileReturn
    extends GetResponseReturn,
        ClientProfilePr.AsObject {}

export async function clientGetProfile({
                                           token,
                                       }: CommonRequestArgs): Promise<ClientGetProfileReturn> {
    const request = new TaskPaymentListPr();

    return (await getResponse(
        clientProfileClient,
        "getClientProfile",
        request,
        token
    )) as ClientGetProfileReturn;
}

export async function clientPhoneVerifyStart({
                                                 token,
                                                 phone,
                                             }: СommonPhoneVerifyStartArgs): Promise<СommonPhoneVerifyStartReturn> {
    const request = new PhoneNumberPr().setPhone(phone);

    return (await getResponse(
        clientProfileClient,
        "phoneVerifyStart",
        request,
        token
    )) as СommonPhoneVerifyStartReturn;
}

export async function clientPhoneVerifyFinish({
                                                  token,
                                                  code,
                                              }: CommonPhoneVerifyFinishArgs): Promise<CommonPhoneVerifyFinishReturn> {
    const request = new VerifyCodePr().setCode(code);

    return (await getResponse(
        clientProfileClient,
        "phoneVerifyFinish",
        request,
        token
    )) as CommonPhoneVerifyFinishReturn;
}

export async function clientEmailVerifyStart({ token }: CommonRequestArgs) {
    const request = new google_protobuf_empty_pb.Empty();

    return (await getResponse(
        clientProfileClient,
        "emailVerifyStart",
        request,
        token
    )) as CommonEmailVerifyReturn;
}

export async function clientEmailVerifyFinish({
                                                  token,
                                                  code,
                                              }: CommonPhoneVerifyFinishArgs) {
    const request = new VerifyCodePr().setCode(code);

    return (await getResponse(
        clientProfileClient,
        "emailVerifyFinish",
        request,
        token
    )) as CommonEmailVerifyReturn;
}

export interface ClientGetTaskReturn
    extends GetResponseReturn,
        ClientTaskPr.AsObject {}

export async function clientGetTask({
                                        token,
                                        taskId,
                                    }: CommonTaskRequestArgs): Promise<ClientGetTaskReturn> {
    const request = new TaskIdPr().setTaskid(taskId);

    return (await getResponse(
        clientClient,
        "getTask",
        request,
        token
    )) as ClientGetTaskReturn;
}

export interface ClientAddTaskArgs extends CommonRequestArgs {
    problemText: string;
    fileIdList?: string[];
}

export interface ClientAddTaskReturn
    extends GetResponseReturn,
        TaskAddReturnPr.AsObject {}

export async function clientAddTask({
                                        token,
                                        problemText,
                                        fileIdList,
                                    }: ClientAddTaskArgs): Promise<ClientAddTaskReturn> {
    console.log(fileIdList); // TODO

    let request = new TaskAddPr().setProblemtext(problemText);

    if (fileIdList?.length) {
        const filesList = fileIdList.map((item) => new FileIdPr().setFileid(item));

        request = request.setFilesList(filesList);
    }

    return (await getResponse(
        clientClient,
        "taskAdd",
        request,
        token
    )) as ClientAddTaskReturn;
}

export interface ClientUpdateTaskArgs extends CommonTaskRequestArgs {
    problemText: string;
    fileIdList?: string[];
}

export interface ClientUpdateTaskReturn
    extends GetResponseReturn,
        TaskPr.AsObject {}

export async function clientUpdateTask({
                                           token,
                                           taskId,
                                           problemText,
                                           fileIdList,
                                       }: ClientUpdateTaskArgs): Promise<ClientUpdateTaskReturn> {
    const taskIdPr = new TaskIdPr().setTaskid(taskId);

    let request = new TaskUpdatePr()
        .setTaskid(taskIdPr)
        .setProblemtext(problemText);

    if (fileIdList?.length) {
        request = request.setFilesidList(fileIdList);
    }

    return (await getResponse(
        clientClient,
        "taskUpdate",
        request,
        token
    )) as ClientUpdateTaskReturn;
}

export interface ClientTaskConfirmArgs {
    taskId: number,
    confirmType: string;
}

export interface ClientGetAgentListForChooseReturn
    extends GetResponseReturn,
        AgentForChoiceListPr.AsObject {}

export async function clientGetAgentListForChoose({
                                                      token,
                                                      taskId,
                                                  }: CommonTaskRequestArgs): Promise<ClientGetAgentListForChooseReturn> {
    const request = new TaskIdPr().setTaskid(taskId);

    return (await getResponse(
        clientClient,
        "getAgentListForChoose",
        request,
        token
    )) as ClientGetAgentListForChooseReturn;
}

export interface ClientSetAssignAgentArgs extends CommonRequestArgs {
    tenderTaskId?: number;
}

export async function clientSetAssignAgent({
                                               token,
                                               tenderTaskId,
                                           }: ClientSetAssignAgentArgs): Promise<CommonReturnMessagePrReturn> {
    let request = new TenderTaskIdPr();

    // TODO cancel all agents?

    if (tenderTaskId) {
        request = request.setId(tenderTaskId);
    }

    return (await getResponse(
        clientClient,
        "setAssignAgent",
        request,
        token
    )) as CommonReturnMessagePrReturn;
}

export async function clientTaskCancel({
                                           token,
                                           taskId,
                                       }: CommonTaskRequestArgs): Promise<CommonReturnMessagePrReturn> {
    const taskIdPr = new TaskIdPr().setTaskid(taskId);

    const request = new TaskCancelByClientPr()
        .setTaskid(taskIdPr)
        .setCanceltype(
            TaskCancelClientEnumPr.TASK_CANCEL_CLIENT_ENUM_PR_UNSPECIFIED
        );

    return (await getResponse(
        clientClient,
        "taskCancel",
        request,
        token
    )) as CommonReturnMessagePrReturn;
}

export async function clientTaskConfirm({ token,
                                            taskId,}: CommonTaskRequestArgs): Promise<CommonReturnMessagePrReturn> {


    const taskIdPr = new TaskIdPr().setTaskid(taskId);
    const request = new TaskConfirmPr()
        .setTaskid(taskIdPr)
        .setConfirmtype(
            TaskConfirmEnumPr.TASK_CONFIRM_ENUM_PR_CONFIRM_SUCCESS
        );

    return (await getResponse(
        clientClient,
        "taskConfirm",
        request,
        token
    )) as CommonReturnMessagePrReturn;

}
export interface ClientSetReviewArgs extends CommonTaskRequestArgs {
    rating: number;
    comment: string;
}

export async function clientSetReview({
                                          token,
                                          taskId,
                                          rating,
                                          comment,
                                      }: ClientSetReviewArgs): Promise<CommonReturnMessagePrReturn> {
    const taskIdPr = new TaskIdPr().setTaskid(taskId);

    let request = new ClientReviewPr().setTaskid(taskIdPr).setRating(rating);

    if (comment) {
        request = request.setComment(comment);
    }

    return (await getResponse(
        clientClient,
        "setReview",
        request,
        token
    )) as CommonReturnMessagePrReturn;
}

export interface ClientSetClaimArgs extends CommonTaskRequestArgs {
    content: string;
}

export async function clientCreateTaskClaim({
                                                token,
                                                taskId,
                                                content,
                                            }: ClientSetClaimArgs): Promise<CommonReturnMessagePrReturn> {
    const taskIdPr = new TaskIdPr().setTaskid(taskId);

    const request = new TaskClaimPr().setTaskid(taskIdPr).setContent(content);

    return (await getResponse(
        clientClient,
        "createTaskClaim",
        request,
        token
    )) as CommonReturnMessagePrReturn;
}

export interface ClientPayTaskReturn
    extends GetResponseReturn,
        InfoForPayPr.AsObject {}

export async function clientPayTask({
                                        token,
                                        taskId,
                                    }: CommonTaskRequestArgs): Promise<ClientPayTaskReturn> {
    const taskIdPr = new TaskIdPr().setTaskid(taskId);

    const request = new PayTaskManualPr().setTaskid(taskIdPr);

    return (await getResponse(
        clientClient,
        "payTask",
        request,
        token
    )) as ClientPayTaskReturn;
}

export interface ClientPayStatusReturn
    extends GetResponseReturn,
        TaskPaymentPr.AsObject {}

export async function clientPayStatus({
                                          token,
                                          taskId,
                                      }: CommonTaskRequestArgs): Promise<ClientPayStatusReturn> {
    const request = new TaskIdPr().setTaskid(taskId);

    return (await getResponse(
        clientClient,
        "payStatus",
        request,
        token
    )) as ClientPayStatusReturn;
}
