import type { StructureResolver } from "sanity/structure";
import {
  CogIcon,
  DocumentTextIcon,
  DocumentIcon,
  CaseIcon,
  DocumentsIcon,
  UserIcon,
} from "@sanity/icons";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Blog posts")
        .icon(DocumentTextIcon)
        .child(S.documentTypeList("post").title("Blog posts")),
      S.listItem()
        .title("Page SEO")
        .icon(DocumentIcon)
        .child(S.documentTypeList("page").title("Page SEO")),
      S.divider(),
      S.listItem()
        .title("Service copy")
        .icon(CaseIcon)
        .child(S.documentTypeList("service").title("Service copy")),
      S.listItem()
        .title("Resource copy")
        .icon(DocumentsIcon)
        .child(S.documentTypeList("resource").title("Resource copy")),
      S.divider(),
      S.listItem()
        .title("Authors")
        .icon(UserIcon)
        .child(S.documentTypeList("author").title("Authors")),
      // Singleton — one settings document, edited directly rather than listed.
      S.listItem()
        .title("Site settings")
        .icon(CogIcon)
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
    ]);
