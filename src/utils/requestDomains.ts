export const requestDomains = [
  { id: "family", label: "خانواده", domainId: 1 },
  { id: "criminal", label: "کیفری", domainId: 2 },
  { id: "law", label: "حقوقی", domainId: 3 },
  { id: "registry", label: "ثبتی", domainId: 4 },
  { id: "property", label: "اراضی املاک", domainId: 5 },
  { id: "insurance", label: "بیمه تصادفات", domainId: 6 },
] as const;

export function domainLabel(domainId: number) {
  return requestDomains.find((item) => item.domainId === domainId)?.label ?? `حوزه ${domainId}`;
}
