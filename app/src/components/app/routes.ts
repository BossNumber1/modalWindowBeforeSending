import buildRouteTree, { getParam } from "build-route-tree";

export const routesTree = {
  client: {
    addTask: null,
    profile: null,
    task: {
      taskId: getParam({
        view: null,
        choiceAgent: null,
        edit: null,
        review: {
          add: null,
        },
        addClaim: null,
        pay: null,
        "pay-wait": null,
      }),
    },
  },
  agent: {
    profile: {
      form: null,
    },
    changeSpecs: null,
    task: {
      taskId: getParam({
        view: null,
      }),
    },
  },
  mod: {
    form: {
      formId: getParam({
        view: null,
      }),
    },
    task: {
      taskId: getParam({
        view: null,
      }),
    },
  },
  buh: {
    request: {
      requestId: getParam({
        view: null,
      }),
    },
  },
  verifyEmail: null,
  verifyPhone: null,
};

export const routes = buildRouteTree(routesTree);
