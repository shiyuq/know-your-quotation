export enum UserStatus {
  InValid = 0,
  Valid = 1,
}

export enum ProductStatus {
  InValid = 0,
  Valid = 1,
}

export enum ProductImportStatus {
  ValidString = '在售',
  InValidstring = '下架',
}

export enum PricingType {
  PriceByUnit = 1,
  PriceByAttribute = 2,
}

export enum PricingImportType {
  PriceByUnitString = '按单位计价',
  PriceByAttributeString = '按属性计价',
}
