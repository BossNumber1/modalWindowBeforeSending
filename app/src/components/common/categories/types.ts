import { CategoryPr } from "@problembo/grpc-web-problembo-core/common/core_pb";

import { SELECT_UNSPECIFIED } from "./component";

export type SelectedCategoryType = number | typeof SELECT_UNSPECIFIED;

export interface CategoryData {
  id: number;
  childrenList: CategoryPr.AsObject[];
  selectedChild: SelectedCategoryType;
}

export type CategoryDataList = CategoryData[];
