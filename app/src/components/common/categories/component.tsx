import React from 'react'
import { Button, makeStyles, MenuItem, Select } from "@material-ui/core";

import { CategoryPr } from "@problembo/grpc-web-problembo-core/common/core_pb";

import { useKeycloak } from "@react-keycloak/web";

import { useCallback, useEffect, useState } from "react";

import commonApi, {
  CommonGetCategoryListReturn,
  ResponseType,
} from "api/grpc/common";

import { CategoryData, CategoryDataList } from "./types";

export const SELECT_UNSPECIFIED = "unspecified";

export enum CategoriesLoadState {
  Loaded,
  Loading,
  Error,
}

export function getLastCategory(categories: CategoryDataList): CategoryData {
  return categories.slice(-1)[0];
}

export function getIsLastCategorySelected(
  categories?: CategoryDataList | null
): boolean {
  if (!categories || !categories.length) {
    return false;
  }

  const lastCategory = getLastCategory(categories);

  return lastCategory.selectedChild !== SELECT_UNSPECIFIED;
}

interface CategoriesProps {
  getLoadingState: (state: CategoriesLoadState) => void;
  getCategories: (categories: CategoryDataList) => void;
}

const Categories = (props: CategoriesProps) => {
  const { getLoadingState, getCategories } = props;

  const [selectData, setSelectData] = useState<CategoryDataList>([]);

  const [selectedCategories, setSelectedCategories] =
    useState<CategoryDataList>([]);

  const [isCategoriesLoaded, setIsCategoriesLoaded] =
    useState<CategoriesLoadState>(CategoriesLoadState.Loaded);

  const classes = useStyles();

  const { keycloak } = useKeycloak();

  const token = keycloak.token;

  const onCategoryChange = (
    e: React.ChangeEvent<{ value: unknown }>,
    categoryId: number
  ): void => {
    const selectedCategoryId = e.target.value as number;

    setSelectedCategories((prevCategories) => {
      const newCategories = [...prevCategories];

      const targetIndex = newCategories.findIndex(
        (item) => item.id === categoryId
      );

      newCategories[targetIndex] = {
        ...newCategories[targetIndex],
        selectedChild: selectedCategoryId,
      };

      const selectedChild = selectData.find(
        (item) => item.id === selectedCategoryId
      ) as CategoryData;

      if (selectedChild.childrenList.length) {
        newCategories.push(selectedChild);
      }

      return newCategories;
    });
  };

  const resetSelectedCategories = useCallback(() => {
    if (!selectData.length) {
      return;
    }

    setSelectedCategories([selectData[0]]);
  }, [selectData]);

  const getSelectData = (categoryTreeResponse: CommonGetCategoryListReturn) => {
    const newSelectData: CategoryDataList = [
      {
        id: 0,
        childrenList: categoryTreeResponse.categoriesList,
        selectedChild: SELECT_UNSPECIFIED,
      },
    ];

    const populateSelectData = (category: CategoryPr.AsObject): void => {
      const { id, childrenList } = category;

      newSelectData.push({
        id,
        childrenList,
        selectedChild: SELECT_UNSPECIFIED,
      });

      if (!childrenList.length) {
        return;
      }

      childrenList.forEach((child) => {
        populateSelectData(child);
      });
    };

    categoryTreeResponse.categoriesList.forEach((category) => {
      populateSelectData(category);
    });

    setSelectData(newSelectData);
  };

  const getCategoryTree = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsCategoriesLoaded(CategoriesLoadState.Loading);

    const categoryTreeResponse = await commonApi.getCategoryTree({ token });

    if (categoryTreeResponse.responseType === ResponseType.Error) {
      setIsCategoriesLoaded(CategoriesLoadState.Error);

      return;
    }

    getSelectData(categoryTreeResponse);

    setIsCategoriesLoaded(CategoriesLoadState.Loaded);
  }, [token]);

  useEffect(() => {
    getCategoryTree();
  }, [getCategoryTree]);

  useEffect(() => {
    resetSelectedCategories();
  }, [resetSelectedCategories]);

  useEffect(() => {
    getLoadingState(isCategoriesLoaded);
  }, [isCategoriesLoaded, getLoadingState]);

  useEffect(() => {
    getCategories(selectedCategories);
  }, [selectedCategories, getCategories]);

  return (
    <div className={classes.root}>
      <div className={classes.categoriesContainer}>
        {selectedCategories.length ? (
          selectedCategories.map((categoryData) => (
            <Select
              key={categoryData.id}
              value={categoryData.selectedChild}
              onChange={(e) => {
                onCategoryChange(e, categoryData.id);
              }}
              className={classes.categorySelect}
              disabled={categoryData.selectedChild !== SELECT_UNSPECIFIED}
            >
              <MenuItem value={SELECT_UNSPECIFIED}>Не выбрано</MenuItem>
              {categoryData.childrenList.map((subCategory) => (
                <MenuItem key={subCategory.id} value={subCategory.id}>
                  {subCategory.title}
                </MenuItem>
              ))}
            </Select>
          ))
        ) : (
          <Select
            disabled
            value={SELECT_UNSPECIFIED}
            className={classes.categorySelect}
          >
            <MenuItem value={SELECT_UNSPECIFIED}>Не выбрано</MenuItem>
          </Select>
        )}
      </div>
      <Button
        variant="contained"
        color="primary"
        onClick={resetSelectedCategories}
      >
        Сбросить выбор
      </Button>
    </div>
  );
};

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    alignItems: "flex-start",
    "& > :not(:last-child)": {
      marginRight: 30,
    },
  },
  categoriesContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    "& > :not(:last-child)": {
      marginBottom: 20,
    },
    "& + &": {
      marginTop: 70,
    },
  },
  categorySelect: {
    width: 400,
  },
}));

export default Categories;
