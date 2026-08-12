import { v } from "convex/values"

import { mutation, query } from "./_generated/server"
import { requireOwnedProject, requireUserId } from "./auth"

export const list = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await requireUserId(ctx)
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_ownerId_and_updatedAt", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .take(50)

    return projects.map((project) => ({
      _id: project._id,
      name: project.name,
      previewUrl: project.previewUrl ?? null,
      updatedAt: project.updatedAt,
      pageCount: Array.isArray(project.canvas?.pages) ? project.canvas.pages.length : 0,
      elementCount: Array.isArray(project.canvas?.pages)
        ? project.canvas.pages.reduce(
            (count: number, page: { elements?: unknown[] }) =>
              count + (Array.isArray(page.elements) ? page.elements.length : 0),
            0,
          )
        : 0,
    }))
  },
})

export const get = query({
  args: {
    id: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx)
    const project = await ctx.db.get(args.id)

    return project?.ownerId === ownerId ? project : null
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    canvas: v.any(),
    previewUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx)
    const now = Date.now()

    return await ctx.db.insert("projects", {
      ownerId,
      name: args.name,
      canvas: args.canvas,
      ...(args.previewUrl ? { previewUrl: args.previewUrl } : {}),
      updatedAt: now,
    })
  },
})

export const updateCanvas = mutation({
  args: {
    id: v.id("projects"),
    name: v.string(),
    canvas: v.any(),
    previewUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.id)

    await ctx.db.patch(args.id, {
      name: args.name,
      canvas: args.canvas,
      ...(args.previewUrl ? { previewUrl: args.previewUrl } : {}),
      updatedAt: Date.now(),
    })
  },
})

export const updatePreview = mutation({
  args: {
    id: v.id("projects"),
    previewUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.id)

    await ctx.db.patch(args.id, {
      previewUrl: args.previewUrl,
    })
  },
})
