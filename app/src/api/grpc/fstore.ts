import { FstorePromiseClient } from "@problembo/grpc-web-problembo-fstore/fstore_grpc_web_pb";

import {
  FileInfoPr,
  FileStorePr,
} from "@problembo/grpc-web-problembo-fstore/fstore_pb";

import {
  CommonRequestArgs,
  getResponse,
  GetResponseReturn,
  hostname,
} from "./common";

const fstoreClient = new FstorePromiseClient(hostname);

// fstoreClient.getFile

export interface FstoreUpload4SmallFileArgs extends CommonRequestArgs {
  file: Uint8Array;
  name: string;
  roles?: string[];
}

export interface FstoreUpload4SmallFileReturn
  extends GetResponseReturn,
    FileInfoPr.AsObject {}

interface IFstoreApi {
  upload4SmallFile: (
    args: FstoreUpload4SmallFileArgs
  ) => Promise<FstoreUpload4SmallFileReturn>;
}

const fstoreApi: IFstoreApi = {
  upload4SmallFile: async ({ token, file, name, roles }) => {
    let request = new FileStorePr().setFile(file).setOrigname(name);

    if (roles) {
      request = request.setRolesList(roles);
    }

    return (await getResponse(
      fstoreClient,
      "upload4SmallFile",
      request,
      token
    )) as FstoreUpload4SmallFileReturn;
  },
};

export default fstoreApi;
