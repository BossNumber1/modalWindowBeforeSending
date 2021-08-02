import { WithdrawalStatusEnumPr } from "@problembo/grpc-web-problembo-core/common/core-share_pb";

import {
  AgentModerateFormStatusEnumPr,
  RolesPr,
  TaskStatusEnumPr,
  TransactionTypeEnumPr
} from "@problembo/grpc-web-problembo-core/common/core-share_pb";

import { CategoryPr } from "@problembo/grpc-web-problembo-core/common/core_pb";

import { hostname } from "api/grpc/common";

import { TIMEZONE_STRING } from "app-constants";

export enum SubmitState {
  Submitted,
  Success,
  Error,
  Idle,
}

export function formatDateToSend(date: Date): string {
  return date.toISOString().split(".")[0] + TIMEZONE_STRING;
}

export function getEnumKeyByEnumValue(
  myEnum: any,
  enumValue: number | string
): string {
  let keys = Object.keys(myEnum).filter((x) => myEnum[x] === enumValue);
  return keys.length > 0 ? keys[0] : "";
}

export function getTransactionTypeString(type: number | undefined): string {
  if (!type) {
    return "-";
  }

  const typeString = getEnumKeyByEnumValue(TransactionTypeEnumPr, type);

  return typeString.replace("TRANSACTION_TYPE_ENUM_PR_", "");
}

export function getTaskStatusString(status: number | undefined): string {
  if (!status) {
    return "—";
  }

  const statusString = getEnumKeyByEnumValue(TaskStatusEnumPr, status);

  return statusString.replace("TASK_STATUS_ENUM_PR_", "");
}

export function getFormStatusString(status?: number): string {
  if (!status) {
    return "—";
  }

  const statusString = getEnumKeyByEnumValue(
    AgentModerateFormStatusEnumPr,
    status
  );

  return statusString.replace("AGENT_MODERATE_FORM_STATUS_ENUM_PR_", "");
}

export function getPaymentStatusString(status?: number): string {
  if (!status) {
    return "—";
  }

  const statusString = getEnumKeyByEnumValue(WithdrawalStatusEnumPr, status);

  return statusString.replace("WITHDRAWAL_STATUS_ENUM_PR_", "");
}

export function getModerateFormStatusString(status?: number): string {
  if (!status) {
    return "—";
  }

  const statusString = getEnumKeyByEnumValue(
    AgentModerateFormStatusEnumPr,
    status
  );

  return statusString.replace("AGENT_MODERATE_FORM_STATUS_ENUM_PR_", "");
}

export function generateCategoriesString(categoryList?: string[]) {
  return categoryList?.length ? categoryList.join(", ") : "—";
}

export function generateTableString(item?: string | number) {
  if (item) {
    return item;
  }

  return "—";
}

export const UserRole = {
  Agent: getEnumKeyByEnumValue(RolesPr, RolesPr.ROLE_AGENT),
  Buh: "ROLE_BUH", // not included in RolesPr
  Client: getEnumKeyByEnumValue(RolesPr, RolesPr.ROLE_USER),
  Moderator: getEnumKeyByEnumValue(RolesPr, RolesPr.ROLE_MODERATOR),
};

export function isRoleClient(roles: string[]): boolean {
  return (
    !isRoleAgent(roles) &&
    !isRoleBuh(roles) &&
    !isRoleModerator(roles) &&
    roles.includes(UserRole.Client)
  );
}

export function isRoleAgent(roles: string[]): boolean {
  return roles.includes(UserRole.Agent);
}

export function isRoleModerator(roles: string[]): boolean {
  return roles.includes(UserRole.Moderator);
}

export function isRoleBuh(roles: string[]): boolean {
  return roles.includes(UserRole.Buh);
}

export function getNodeTitle(
  node: CategoryPr.AsObject,
  id: number
): string | undefined {
  if (node.id === id) {
    return node.title;
  }

  for (const c of node.childrenList) {
    const title = getNodeTitle(c, id);
    if (title) {
      return title;
    }
  }
}

export function generateFileUrl(fileId?: string): string {
  if (!fileId) {
    return "#";
  }

  return hostname + "/fstore/id/" + fileId;
}
