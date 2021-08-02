import {
  AgentFormIdPr,
  AgentModerateFormConfirmPr,
  AgentModerateFormStatusEnumPr,
  ResultVerifyTaskPr,
  TaskIdPr,
  TaskStatusEnumPr,
} from "@problembo/grpc-web-problembo-core/common/core-share_pb";

import {
  TaskPr,
  TaskShortListPr,
} from "@problembo/grpc-web-problembo-core/common/task-share_pb";

import { ModeratorPromiseClient } from "@problembo/grpc-web-problembo-core/moderator/moderator_grpc_web_pb";

import {
  AgentModerateFormFilterPr,
  AgentModerateFormPassportPr,
  AgentModerateFormPr,
  AgentModerateFormShortListPr,
  VerifyingFormActionEnumPr,
  VerifyingFormResultPr,
  VerifyingFormResultResponsePr,
} from "@problembo/grpc-web-problembo-core/moderator/moderator_pb";

import google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

import {
  CommonRequestArgs,
  hostname,
  getResponse,
  GetResponseReturn,
  CommonTaskRequestArgs,
  CommonReturnMessagePrReturn,
} from "./common";

const moderatorClient = new ModeratorPromiseClient(hostname);

// moderatorClient.setVerifyingFormResult;

export interface GetAgentModerateFormsReturn
  extends GetResponseReturn,
    AgentModerateFormShortListPr.AsObject {}

export interface NewTaskListReturn
  extends GetResponseReturn,
    TaskShortListPr.AsObject {}

export interface GetTaskForReviewReturn
  extends GetResponseReturn,
    TaskPr.AsObject {}

export interface VerifyTaskArgs extends CommonTaskRequestArgs {
  status: TaskStatusEnumPr;
  messageForClient: string;
  categoriesList?: number[];
}

interface ModeratorCommonFormArgs extends CommonRequestArgs {
  formId: number;
}

interface GetAgentModerateFormsArgs extends CommonRequestArgs {
  status: AgentModerateFormStatusEnumPr;
}

export interface PassportEntryData {
  address: string;
  birthday: string;
  cityOfBirth: string;
  fatherName: string;
  firstName: string;
  lastName: string;
  passportNumber: string;
  passportSerial: string;
}

export interface FormConfirmData {
  isMainConfirmed: boolean;
  isPlaceConfirmed: boolean;
  isSelfieConfimed: boolean;
}
export interface ModeratorSetVerifyingFormResult
  extends ModeratorCommonFormArgs {
  passportEntryData: PassportEntryData;
  formConfirmData: FormConfirmData;
  result: VerifyingFormActionEnumPr;
}

export interface ModeratorGetAgentModerateFormReturn
  extends GetResponseReturn,
    AgentModerateFormPr.AsObject {}

export interface ModeratorSetVerifyingFormResultReturn
  extends GetResponseReturn,
    VerifyingFormResultResponsePr.AsObject {}

interface IModeratorApi {
  getAgentModerateForms: (
    args: GetAgentModerateFormsArgs
  ) => Promise<GetAgentModerateFormsReturn>;
  newTaskList: (args: CommonRequestArgs) => Promise<NewTaskListReturn>;
  getTaskForReview: (
    args: CommonTaskRequestArgs
  ) => Promise<GetTaskForReviewReturn>;
  verifyTask: (args: VerifyTaskArgs) => Promise<CommonReturnMessagePrReturn>;
  getAgentModerateForm: (
    args: ModeratorCommonFormArgs
  ) => Promise<ModeratorGetAgentModerateFormReturn>;
  setVerifyingFormResult: (
    args: ModeratorSetVerifyingFormResult
  ) => Promise<ModeratorSetVerifyingFormResultReturn>;
}

const moderatorApi: IModeratorApi = {
  getAgentModerateForms: async ({ token, status }) => {
    let request = new AgentModerateFormFilterPr();

    if (
      status !==
      AgentModerateFormStatusEnumPr.AGENT_MODERATE_FORM_STATUS_ENUM_PR_UNSPECIFIED
    ) {
      request = request.setStatusList([status]);
    }

    return (await getResponse(
      moderatorClient,
      "getAgentModerateForms",
      request,
      token
    )) as GetAgentModerateFormsReturn;
  },
  newTaskList: async ({ token }) => {
    const request = new google_protobuf_empty_pb.Empty();

    return (await getResponse(
      moderatorClient,
      "newTaskList",
      request,
      token
    )) as NewTaskListReturn;
  },
  getTaskForReview: async ({ token, taskId }) => {
    const request = new TaskIdPr().setTaskid(taskId);

    return (await getResponse(
      moderatorClient,
      "getTaskForReview",
      request,
      token
    )) as GetTaskForReviewReturn;
  },
  verifyTask: async ({ token, taskId, status, messageForClient, categoriesList }) => {
    const taskIdPr = new TaskIdPr().setTaskid(taskId);

    let request = new ResultVerifyTaskPr()
      .setTaskid(taskIdPr)
      .setStatus(status)
      .setMessageforclient(messageForClient);

    if (categoriesList) {
      request = request.setCategoriesList(categoriesList);
    }

    return (await getResponse(
      moderatorClient,
      "verifyTask",
      request,
      token
    )) as CommonReturnMessagePrReturn;
  },
  getAgentModerateForm: async ({ token, formId }) => {
    const request = new AgentFormIdPr().setId(formId);

    return (await getResponse(
      moderatorClient,
      "getAgentModerateForm",
      request,
      token
    )) as ModeratorGetAgentModerateFormReturn;
  },
  setVerifyingFormResult: async ({
    token,
    formId,
    passportEntryData,
    formConfirmData,
    result,
  }) => {
    const {
      address,
      birthday,
      cityOfBirth,
      fatherName,
      firstName,
      lastName,
      passportNumber,
      passportSerial,
    } = passportEntryData;

    const { isMainConfirmed, isPlaceConfirmed, isSelfieConfimed } =
      formConfirmData;

    const agentFormIdPr = new AgentFormIdPr().setId(formId);

    const agentModerateFormPassportPr = new AgentModerateFormPassportPr()
      .setAddress(address)
      .setBirthday(birthday)
      .setCityofbirth(cityOfBirth)
      .setFathername(fatherName)
      .setFirstname(firstName)
      .setLastname(lastName)
      .setPassportnumber(passportNumber)
      .setPassportserial(passportSerial);

    const agentModerateFormConfirmPr = new AgentModerateFormConfirmPr()
      .setIspassportmainconfirmed(isMainConfirmed)
      .setIspassportplaceconfirmed(isPlaceConfirmed)
      .setIspassportselfyconfirmed(isSelfieConfimed);

    const request = new VerifyingFormResultPr()
      .setId(agentFormIdPr)
      .setPassportentry(agentModerateFormPassportPr)
      .setFormconfirm(agentModerateFormConfirmPr)
      .setResult(result);

    return (await getResponse(
      moderatorClient,
      "setVerifyingFormResult",
      request,
      token
    )) as ModeratorSetVerifyingFormResultReturn;
  },
};

export default moderatorApi;
