import { type SchemaTypeDefinition } from "sanity";

import { seoType } from "./seo";
import { authorType } from "./author";
import { postType } from "./post";
import { pageType } from "./page";
import { serviceType } from "./service";
import { resourceType } from "./resource";
import { siteSettingsType } from "./siteSettings";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    seoType,
    postType,
    pageType,
    serviceType,
    resourceType,
    authorType,
    siteSettingsType,
  ],
};
