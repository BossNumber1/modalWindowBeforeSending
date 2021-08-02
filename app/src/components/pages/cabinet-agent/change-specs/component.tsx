import React from 'react'
import { Button, makeStyles } from "@material-ui/core";

import { useKeycloak } from "@react-keycloak/web";

import { useCallback, useEffect, useState } from "react";
import DocumentTitle from "react-document-title";
import { Redirect } from "react-router-dom";

import agentApi, { AgentGetAgentProfileReturn } from "api/grpc/agent";

import commonApi, {
  CommonGetCategoryListReturn,
  ResponseType,
} from "api/grpc/common";

import { generateTableString, SubmitState } from "lib/helper";

import { routes } from "components/app/routes";

import Categories, {
  CategoriesLoadState,
  CategoryDataList,
  getIsLastCategorySelected,
  getLastCategory,
} from "components/common/categories";
import LoadingContainer from "components/common/loading-container";
import Page from "components/common/page";
import Section from "components/common/section";
import Table from "components/common/table";

const TABLE_HEADERS = ["Компетенция", "Действие"];

function _generateTableData(
  profile: AgentGetAgentProfileReturn,
  categoryTree: CommonGetCategoryListReturn,
  action: (categoryId?: number) => void
) {
  return profile.specsList.map((item) => {
    return [
      generateTableString(item.category?.title),
      {
        action: () => action(item.category?.id),
        name: "Удалить",
      },
    ];
  });
}

interface ChangeSpecsContentProps {
  profile: AgentGetAgentProfileReturn;
  categoryTree: CommonGetCategoryListReturn;
  token: string;
  reload: () => void;
  getLoadingState: (state: CategoriesLoadState) => void;
}

const ChangeSpecsContent = (props: ChangeSpecsContentProps) => {
  const { token, profile, categoryTree, reload, getLoadingState } = props;

  const [categories, setCategories] = useState<CategoryDataList | null>(null);

  const [submitState, setSubmitState] = useState<SubmitState>(SubmitState.Idle);

  const [errorMessage, setErrorMessage] = useState<string>("");

  const classes = useStyles();

  const isLastCategorySelected = getIsLastCategorySelected(categories);

  const getCategories = (categories: CategoryDataList): void => {
    setCategories(categories);
  };

  const onSubmit = useCallback(
    async (e: React.SyntheticEvent): Promise<void> => {
      e.preventDefault();

      if (!(categories && isLastCategorySelected)) {
        return;
      }

      const lastCategory = getLastCategory(categories);

      setSubmitState(SubmitState.Submitted);

      const response = await agentApi.addSpec({
        token,
        categoryId: lastCategory.selectedChild as number,
      });

      if (response.responseType === ResponseType.Error) {
        setSubmitState(SubmitState.Error);

        setErrorMessage(response.message || "");

        return;
      }

      reload();

      setSubmitState(SubmitState.Success);
    },
    [token, categories, reload, isLastCategorySelected]
  );

  const tableAction = useCallback(
    async (categoryId?: number) => {
      if (!(token && categoryId)) {
        return;
      }

      setSubmitState(SubmitState.Submitted);

      const response = await agentApi.removeSpec({ token, categoryId });

      if (response.responseType === ResponseType.Error) {
        setSubmitState(SubmitState.Error);

        setErrorMessage(response.message || "");

        return;
      }

      setSubmitState(SubmitState.Success);
    },
    [token]
  );

  if (submitState !== SubmitState.Idle) {
    return (
      <LoadingContainer
        isLoaded={submitState === SubmitState.Success}
        isError={submitState === SubmitState.Error}
        errorMessage={errorMessage}
        redirectPathOnError={routes.agent.profile.getRedirectPath()}
      >
        <Redirect to={routes.agent.profile.getRedirectPath()} />
      </LoadingContainer>
    );
  }

  return (
    <div className={classes.content}>
      <Section className={classes.section}>
        <form className={classes.form} onSubmit={onSubmit}>
          <Categories
            getLoadingState={getLoadingState}
            getCategories={getCategories}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!isLastCategorySelected}
          >
            Добавить
          </Button>
        </form>
      </Section>
      <Section className={classes.section}>
        <Table
          headers={TABLE_HEADERS}
          data={_generateTableData(profile, categoryTree, tableAction)}
        />
      </Section>
    </div>
  );
};

const ChangeSpecsPage = () => {
  const [profile, setProfile] = useState<AgentGetAgentProfileReturn | null>(
    null
  );

  const [categoryTree, setCategoryTree] =
    useState<CommonGetCategoryListReturn | null>(null);

  const [categoriesLoadingState, setCategoriesLoadingState] =
    useState<CategoriesLoadState | null>(null);

  const [errorMessage, setErrorMessage] = useState<string>("");

  const { keycloak } = useKeycloak();

  const token = keycloak.token;

  const isLoaded =
    profile?.responseType === ResponseType.Success &&
    categoryTree?.responseType === ResponseType.Success;

  const isError =
    profile?.responseType === ResponseType.Error ||
    categoryTree?.responseType === ResponseType.Error ||
    categoriesLoadingState === CategoriesLoadState.Error;

  const getLoadingState = (state: CategoriesLoadState) => {
    setCategoriesLoadingState(state);
  };

  const getData = useCallback((): void => {
    if (token) {
      agentApi.getAgentProfile({ token }).then((res) => {
        setProfile(res);

        setErrorMessage(res.message || "");
      });

      commonApi.getCategoryTree({ token }).then((res) => {
        setCategoryTree(res);

        setErrorMessage(res.message || "");
      });
    }
  }, [token]);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <DocumentTitle title="Кабинет агента — изменение компетенций">
      <Page>
        <LoadingContainer
          isLoaded={isLoaded}
          isError={isError}
          errorMessage={errorMessage}
          redirectPathOnError={routes.agent.profile.getRedirectPath()}
        >
          {profile && categoryTree && token && (
            <ChangeSpecsContent
              profile={profile}
              categoryTree={categoryTree}
              token={token}
              reload={getData}
              getLoadingState={getLoadingState}
            />
          )}
        </LoadingContainer>
      </Page>
    </DocumentTitle>
  );
};

const useStyles = makeStyles(() => ({
  content: {
    display: "flex",
    flexDirection: "column",
  },
  section: {
    display: "flex",
    alignItems: "flex-start",
    width: "100%",
    "& > :not(:last-child)": {
      marginBottom: 20,
    },
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    "& > :not(:last-child)": {
      marginBottom: 20,
    },
  },
  categorySelect: {
    width: 400,
  },
}));

export default ChangeSpecsPage;
