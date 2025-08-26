import { Business } from "../types";

export const convertBusinessEntityToBusinessMap = (businesses: Business[]) => {
  const businessMap = new Map();
  businesses.forEach((business) => {
    businessMap.set(business.business_id, business.name);
  });
  return businessMap;
};
