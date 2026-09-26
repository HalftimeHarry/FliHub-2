export type Organization = {
  id: string;
  name: string;
  slug?: string;
};

export type OrganizationSummary = {
  id: string;
  name: string;
  userCount?: number;
};
