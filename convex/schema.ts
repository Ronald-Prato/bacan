import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  projects: defineTable({
    // Optional only while legacy documents without an authenticated owner remain.
    ownerId: v.optional(v.string()),
    name: v.string(),
    canvas: v.any(),
    previewUrl: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_ownerId_and_updatedAt", ["ownerId", "updatedAt"]),
  projectVersions: defineTable({
    ownerId: v.string(),
    projectId: v.id("projects"),
    label: v.string(),
    canvas: v.any(),
    pageCount: v.number(),
    elementCount: v.number(),
    createdAt: v.number(),
  }).index("by_projectId_and_createdAt", ["projectId", "createdAt"]),
  projectShares: defineTable({
    ownerId: v.string(),
    projectId: v.id("projects"),
    access: v.union(v.literal("view"), v.literal("comment"), v.literal("edit")),
    token: v.string(),
    createdAt: v.number(),
    revokedAt: v.optional(v.number()),
  })
    .index("by_projectId_and_createdAt", ["projectId", "createdAt"])
    .index("by_token", ["token"]),
  projectPresence: defineTable({
    // Optional only while legacy presence rows from unowned projects remain.
    ownerId: v.optional(v.string()),
    projectId: v.id("projects"),
    clientId: v.string(),
    displayName: v.string(),
    color: v.string(),
    pageId: v.union(v.string(), v.null()),
    selectedElementName: v.union(v.string(), v.null()),
    updatedAt: v.number(),
  })
    .index("by_projectId_and_updatedAt", ["projectId", "updatedAt"])
    .index("by_projectId_and_clientId", ["projectId", "clientId"]),
  assets: defineTable({
    ownerId: v.string(),
    name: v.string(),
    storageId: v.id("_storage"),
    contentType: v.optional(v.string()),
    size: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_updatedAt", ["updatedAt"])
    .index("by_ownerId_and_updatedAt", ["ownerId", "updatedAt"]),
  comments: defineTable({
    ownerId: v.string(),
    projectId: v.id("projects"),
    body: v.string(),
    authorName: v.string(),
    pageId: v.union(v.string(), v.null()),
    elementId: v.union(v.string(), v.null()),
    createdAt: v.number(),
  }).index("by_projectId_and_createdAt", ["projectId", "createdAt"]),
  sharedTemplates: defineTable({
    ownerId: v.string(),
    name: v.string(),
    description: v.string(),
    authorName: v.string(),
    canvas: v.any(),
    pageCount: v.number(),
    elementCount: v.number(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
})
