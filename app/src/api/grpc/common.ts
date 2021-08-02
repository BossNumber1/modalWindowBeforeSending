import {
  EmailVerifyRetPr,
  PhoneVerifyRetPr,
  ReturnMessagePr,
  WtodoBaseListPr,
} from "@problembo/grpc-web-problembo-core/common/core-share_pb";

import { CategoryPromiseClient } from "@problembo/grpc-web-problembo-core/common/core_grpc_web_pb";

import {
  CategoryIdPr,
  CategoryListPr,
  CategoryPr,
} from "@problembo/grpc-web-problembo-core/common/core_pb";

import google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

export enum ResponseType {
  Success,
  Error,
}

export interface CommonRequestArgs {
  token: string;
}

export interface CommonTaskRequestArgs extends CommonRequestArgs {
  taskId: number;
}

export interface CommonReturnMessagePrReturn
  extends GetResponseReturn,
    ReturnMessagePr.AsObject {}

export interface СommonPhoneVerifyStartArgs extends CommonRequestArgs {
  phone: string;
}

export interface СommonPhoneVerifyStartReturn
  extends GetResponseReturn,
    PhoneVerifyRetPr.AsObject {}

export interface CommonPhoneVerifyFinishArgs extends CommonRequestArgs {
  code: number;
}

// TODO rename to CommonVerifyFinishArgs

export interface CommonPhoneVerifyFinishReturn
  extends GetResponseReturn,
    PhoneVerifyRetPr.AsObject {}

export interface CommonEmailVerifyReturn
  extends GetResponseReturn,
    EmailVerifyRetPr.AsObject {}

export interface CommonEmptyReturn
  extends GetResponseReturn,
    google_protobuf_empty_pb.Empty.AsObject {}

export interface CommonGetWtodoListReturn
  extends GetResponseReturn,
    WtodoBaseListPr.AsObject {}

// TODO types

export interface GetResponseReturn {
  responseType: ResponseType;
  [key: string]: any;
}

export async function getResponse(
  client: any,
  method: string,
  request: any,
  token: string
): Promise<{ [key: string]: any } | undefined> {
  try {
    const response = await client[method](request, {
      Authorization: `Bearer ${token}`,
    });

    return {
      responseType: ResponseType.Success,
      ...response.toObject(),
    };
  } catch (err) {
    console.error(err, method);

    return {
      responseType: ResponseType.Error,
      ...err,
    };
  }
}

export const hostname = "//" + window.location.host;

export function getFileUrl(fileId: string): string {
  return hostname + "/fstore/id/" + fileId;
}

const categoryClient = new CategoryPromiseClient(hostname);

// categoryClient.getCategoryTree;

export interface CommonGetCategoryByIdArgs extends CommonRequestArgs {
  categoryId: number;
}

export interface CommonGetCategoryListReturn
  extends GetResponseReturn,
    CategoryListPr.AsObject {}

export interface CommonGetCategoryReturn
  extends GetResponseReturn,
    CategoryPr.AsObject {}

interface ICommonApi {
  getCategoryRoot: (
    args: CommonRequestArgs
  ) => Promise<CommonGetCategoryListReturn>;
  getCategoryByParentId: (
    args: CommonGetCategoryByIdArgs
  ) => Promise<CommonGetCategoryListReturn>;
  getCategoryById: (
    args: CommonGetCategoryByIdArgs
  ) => Promise<CommonGetCategoryReturn>;
  getCategoryTree: (
    args: CommonRequestArgs
  ) => Promise<CommonGetCategoryListReturn>;
}

const commonApi: ICommonApi = {
  getCategoryRoot: async ({ token }) => {
    const request = new google_protobuf_empty_pb.Empty();

    return (await getResponse(
      categoryClient,
      "getCategoryRoot",
      request,
      token
    )) as CommonGetCategoryListReturn;
  },
  getCategoryByParentId: async ({ token, categoryId }) => {
    const request = new CategoryIdPr().setCategoryid(categoryId);

    return (await getResponse(
      categoryClient,
      "getCategoryByParentId",
      request,
      token
    )) as CommonGetCategoryListReturn;
  },
  getCategoryById: async ({ token, categoryId }) => {
    const request = new CategoryIdPr().setCategoryid(categoryId);

    return (await getResponse(
      categoryClient,
      "getCategoryById",
      request,
      token
    )) as CommonGetCategoryReturn;
  },
  getCategoryTree: async ({ token }) => {
    const request = new google_protobuf_empty_pb.Empty();

    return (await getResponse(
      categoryClient,
      "getCategoryTree",
      request,
      token
    )) as CommonGetCategoryListReturn;
  },
};

export default commonApi;
