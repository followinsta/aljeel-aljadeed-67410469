export const CURRENCIES = [
  { code: "SAR", label: "ريال سعودي", short: "ريال" },
  { code: "USD", label: "دولار أمريكي", short: "دولار" },
  { code: "KWD", label: "دينار كويتي", short: "د.ك" },
  { code: "JOD", label: "دينار أردني", short: "د.أ" },
  { code: "IQD", label: "دينار عراقي", short: "د.ع" },
  { code: "AED", label: "درهم إماراتي", short: "درهم" },
  { code: "YER", label: "ريال يمني", short: "ريال يمني" },
] as const;

export const currencyShort = (code?: string | null) =>
  CURRENCIES.find((c) => c.code === (code || "SAR"))?.short ?? "ريال";

export const currencyLabel = (code?: string | null) =>
  CURRENCIES.find((c) => c.code === (code || "SAR"))?.label ?? "ريال سعودي";
