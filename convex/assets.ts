import { v } from "convex/values"

import { mutation, query } from "./_generated/server"
import { requireUserId } from "./auth"

export const list = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await requireUserId(ctx)
    const assets = await ctx.db
      .query("assets")
      .withIndex("by_ownerId_and_updatedAt", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .take(100)

    return await Promise.all(
      assets.map(async (asset) => ({
        _id: asset._id,
        name: asset.name,
        url: await ctx.storage.getUrl(asset.storageId),
        contentType: asset.contentType,
        size: asset.size,
        updatedAt: asset.updatedAt,
      })),
    )
  },
})

export const get = query({
  args: {
    id: v.id("assets"),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx)
    const asset = await ctx.db.get(args.id)

    if (!asset || asset.ownerId !== ownerId) {
      return null
    }

    return {
      _id: asset._id,
      name: asset.name,
      url: await ctx.storage.getUrl(asset.storageId),
      contentType: asset.contentType,
      size: asset.size,
      updatedAt: asset.updatedAt,
    }
  },
})

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx)
    return await ctx.storage.generateUploadUrl()
  },
})

export const save = mutation({
  args: {
    name: v.string(),
    storageId: v.id("_storage"),
    contentType: v.optional(v.string()),
    size: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx)
    const now = Date.now()

    return await ctx.db.insert("assets", {
      ownerId,
      name: args.name,
      storageId: args.storageId,
      contentType: args.contentType,
      size: args.size,
      updatedAt: now,
    })
  },
})
