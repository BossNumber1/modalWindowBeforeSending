import { BuhPromiseClient } from "@problembo/grpc-web-problembo-core/buh/buh_grpc_web_pb";

import {
  AgentWithdrawalFilterPr,
  AgentWithdrawalIdPr,
  AgentWithdrawalDetailsPr, AgentWithdrawalListPr, AgentWithdrawalResponsePr,
} from "@problembo/grpc-web-problembo-core/buh/buh_pb";

import {
  CommonRequestArgs,
  CommonReturnMessagePrReturn,
  getResponse,
  GetResponseReturn,
  hostname,
} from "./common";

const buhClient = new BuhPromiseClient(hostname);

// buhClient.paymentToAgentDo;

export interface BuhAgentRequestArgs extends CommonRequestArgs {
  requestId: number;
}

export interface BuhPaymentToAgentDoArgs extends BuhAgentRequestArgs {
  success: boolean;
}

export interface BuhPaymentToAgentListReturn
  extends GetResponseReturn,
      AgentWithdrawalListPr.AsObject {}

export interface BuhPaymentToAgentViewReturn
  extends GetResponseReturn,
      AgentWithdrawalDetailsPr.AsObject {}

interface IBuhApi {
  paymentToAgentList: (
    args: CommonRequestArgs
  ) => Promise<BuhPaymentToAgentListReturn>;
  paymentToAgentView: (
    args: BuhAgentRequestArgs
  ) => Promise<BuhPaymentToAgentViewReturn>;
  paymentToAgentDo: (
    args: BuhPaymentToAgentDoArgs
  ) => Promise<CommonReturnMessagePrReturn>;
}

const buhApi: IBuhApi = {
  paymentToAgentList: async ({ token }) => {
    const request = new AgentWithdrawalFilterPr();

    return (await getResponse(
      buhClient,
      "getAgentWithdrawalList",
      request,
      token
    )) as BuhPaymentToAgentListReturn;
  },
  paymentToAgentView: async ({ token, requestId }) => {
    const request = new AgentWithdrawalIdPr().setId(requestId);

    return (await getResponse(
      buhClient,
      "getAgentWithdrawalDetails",
      request,
      token
    )) as BuhPaymentToAgentViewReturn;
  },
  paymentToAgentDo: async ({ token, requestId, success }) => {
    const request = new AgentWithdrawalResponsePr()
      .setWithdrawalid(new AgentWithdrawalIdPr().setId(requestId))
      .setSuccess(success);

    return (await getResponse(
      buhClient,
      "answerAgentWithdrawal",
      request,
      token
    )) as CommonReturnMessagePrReturn;
  },
};

export default buhApi;
