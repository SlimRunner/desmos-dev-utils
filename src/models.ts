/**
 * Copyright (c) 2024 Jared Hughes
 *
 * This file is part of DesModder which is released under MIT license.
 * Go to
 * https://github.com/DesModder/DesModder/blob/56c7dcb7a24c2cda5db70623200609b4dfac50f7/graph-state/LICENSE
 * for more details
 */

/**
 * This file includes type definition for internal graph state models.
 * These have more information than the graph state related to getState and setState.
 */
import { CalcController } from "Calc";

interface BasicSetExpression {
  id: string;
  latex?: string;
  color?: string;
  lineStyle?: "SOLID" | "DASHED" | "DOTTED";
  lineWidth?: number | string;
  lineOpacity?: number | string;
  pointStyle?: "POINT" | "OPEN" | "CROSS";
  pointSize?: number | string;
  pointOpacity?: number | string;
  fillOpacity?: number | string;
  points?: boolean;
  lines?: boolean;
  hidden?: boolean;
  shouldGraph?: boolean;
  dragMode?: "X" | "Y" | "XY" | "NONE" | "AUTO";
}

interface ItemModelBase {
  index: number;
  id: string;
  folderId?: string;
  secret?: boolean;
  error?: any;
  formula?: {
    expression_type:
      | "X_OR_Y"
      // Soon, X_OR_Y will be removed in favor of the following two:
      | "X_OR_Y_EQUATION"
      | "X_OR_Y_INEQUALITY"
      | "SINGLE_POINT"
      | "POINT_LIST"
      | "PARAMETRIC"
      | "POLAR"
      | "IMPLICIT"
      // Soon, IMPLICIT will be removed in favor of the following two:
      | "IMPLICIT_EQUATION"
      | "IMPLICIT_INEQUALITY"
      | "POLYGON"
      | "HISTOGRAM"
      | "DOTPLOT"
      | "BOXPLOT"
      | "TTEST"
      | "STATS"
      | "CUBE"
      | "SPHERE"
      // There are many possible expression types due to 3d. No point writing them all out.
      | string;
    is_graphable: boolean;
    is_inequality: boolean;
    action_value?: Record<string, string>;
  };
  controller: CalcController;
  dcgView?: any;
}

interface BaseClickable {
  enabled?: boolean;
  // description is the screen reader label
  description?: string;
  latex?: string;
}

export interface ExpressionModel extends BasicSetExpression, ItemModelBase {
  cachedAssignmentOrFunctionName: {
    latex: string;
    result:
      | {
          identifier: string;
          latex: string;
        }
      | undefined;
  };
  type?: "expression";
  fill?: boolean;
  secret?: boolean;
  sliderBounds?: {
    min: string;
    max: string;
    step?: string | undefined;
  };
  parametricDomain?: {
    min: string;
    max: string;
  };
  polarDomain?: {
    min: string;
    max: string;
  };
  label?: string;
  showLabel?: boolean;
  labelSize?: "small" | "medium" | "large";
  labelOrientation?:
    | "default"
    | "center"
    | "center_auto"
    | "auto_center"
    | "above"
    | "above_left"
    | "above_right"
    | "above_auto"
    | "below"
    | "below_left"
    | "below_right"
    | "below_auto"
    | "left"
    | "auto_left"
    | "right"
    | "auto_right";
  clickableInfo?: BaseClickable;
  shouldGraph?: boolean;
}

interface TableColumn extends BasicSetExpression {
  values?: string[];
}

export interface TableModel extends ItemModelBase {
  type: "table";
  columns: TableColumn[];
  columnModels: { draggable: boolean }[];
}

export interface TextModel extends ItemModelBase {
  type: "text";
  text?: string;
}

export interface ImageModel extends ItemModelBase {
  type: "image";
  image_url: string;
  angle?: string;
  center?: string;
  height?: string;
  width?: string;
  name?: string;
  opacity?: string;
  clickableInfo?: BaseClickable & {
    hoveredImage?: string;
    depressedImage?: string;
  };
}

export interface FolderModel {
  type: "folder";
  folderId?: undefined;
  id: string;
  title?: string;
  secret?: boolean;
  error?: any;
  index: number;
  controller: CalcController;
}

export type ItemModel =
  | ExpressionModel
  | TableModel
  | TextModel
  | ImageModel
  | FolderModel;
