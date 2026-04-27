import { GradingStrategyType } from "../types";
import { PassFailGradingStrategy } from "./PassFailGradingStrategy";
import { PercentageGradingStrategy } from "./PercentageGradingStrategy";
import { GradingStrategy } from "./GradingStrategy";
import { WeightedGradingStrategy } from "./WeightedGradingStrategy";

export const createGradingStrategy = (type: GradingStrategyType): GradingStrategy => {
  switch (type) {
    case "pass-fail":
      return new PassFailGradingStrategy();
    case "percentage":
      return new PercentageGradingStrategy();
    case "weighted":
      return new WeightedGradingStrategy();
    default:
      throw new Error(`Unsupported grading strategy: ${type}`);
  }
};
