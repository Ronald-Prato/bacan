import { ConvexError } from "convex/values"

import type { Id } from "./_generated/dataModel"
import type { MutationCtx, QueryCtx } from "./_generated/server"

type AuthCtx = Pick<QueryCtx | MutationCtx, "auth">
type DatabaseCtx = Pick<QueryCtx | MutationCtx, "auth" | "db">

export async function requireUserIdentity(ctx: AuthCtx) {
  const identity = await ctx.auth.getUserIdentity()

  if (!identity) {
    throw new ConvexError("Debes iniciar sesión para acceder a Bacan")
  }

  return identity
}

export async function requireUserId(ctx: AuthCtx) {
  return (await requireUserIdentity(ctx)).tokenIdentifier
}

export async function requireOwnedProject(ctx: DatabaseCtx, projectId: Id<"projects">) {
  const ownerId = await requireUserId(ctx)
  const project = await ctx.db.get(projectId)

  if (!project || project.ownerId !== ownerId) {
    throw new ConvexError("No estás autorizado para acceder a este proyecto")
  }

  return { ownerId, project }
}
