import { WtodoPriorityEnumPr } from "@problembo/grpc-web-problembo-core/common/core-share_pb";

import { useHistory } from "react-router-dom";

import { CommonGetWtodoListReturn, ResponseType } from "api/grpc/common";

import { routes } from "components/app/routes";

const RedirectPath: { [key: string]: string } = {
  EMAIL: routes.verifyEmail.getRedirectPath(),
  PHONE: routes.verifyPhone.getRedirectPath(),
};

const useTodoList = (
  todoList: CommonGetWtodoListReturn | null,
  isLoaded: boolean
): void => {
  const history = useHistory();

  if (!isLoaded || !todoList || todoList.responseType === ResponseType.Error) {
    return;
  }

  const filteredTodoList = todoList.wtodolistList.filter(
    (item) =>
      item.priority === WtodoPriorityEnumPr.WTODO_PRIORITY_ENUM_PR_CRITICAL
  );

  if (!filteredTodoList.length) {
    return;
  }

  const redirectPath = RedirectPath[filteredTodoList[0].wtodotype];

  if (!redirectPath) {
    console.error(
      "Не реализовано для данного wtodotype",
      filteredTodoList[0].wtodotype
    );

    return;
  }

  history.push(redirectPath);
};

export default useTodoList;
