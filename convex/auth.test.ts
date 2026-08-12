/// <reference types="vite/client" />

import { convexTest } from "convex-test"
import { describe, expect, it } from "vitest"

import { api } from "./_generated/api"
import schema from "./schema"

const modules = import.meta.glob("./**/*.ts")

const aliceIdentity = {
  issuer: "https://bacan.clerk.accounts.dev",
  subject: "user_alice",
  tokenIdentifier: "https://bacan.clerk.accounts.dev|user_alice",
  name: "Alice",
}

const bobIdentity = {
  issuer: "https://bacan.clerk.accounts.dev",
  subject: "user_bob",
  tokenIdentifier: "https://bacan.clerk.accounts.dev|user_bob",
  name: "Bob",
}

describe("Convex authorization", () => {
  it("rejects unauthenticated project and upload access", async () => {
    const t = convexTest(schema, modules)

    await expect(t.query(api.projects.list, {})).rejects.toThrow("iniciar sesión")
    await expect(t.mutation(api.assets.generateUploadUrl, {})).rejects.toThrow("iniciar sesión")
  })

  it("isolates projects and project mutations by authenticated owner", async () => {
    const t = convexTest(schema, modules)
    const alice = t.withIdentity(aliceIdentity)
    const bob = t.withIdentity(bobIdentity)
    const canvas = { pages: [] }

    const projectId = await alice.mutation(api.projects.create, {
      name: "Diseño de Alice",
      canvas,
      previewUrl: "data:image/jpeg;base64,alice-preview",
    })

    await expect(alice.query(api.projects.list, {})).resolves.toMatchObject([
      {
        _id: projectId,
        name: "Diseño de Alice",
        previewUrl: "data:image/jpeg;base64,alice-preview",
      },
    ])
    await expect(bob.query(api.projects.list, {})).resolves.toEqual([])
    await expect(bob.query(api.projects.get, { id: projectId })).resolves.toBeNull()
    await expect(
      bob.mutation(api.projects.updateCanvas, {
        id: projectId,
        name: "Robado",
        canvas,
      }),
    ).rejects.toThrow("autorizado")
  })

  it("backfills a project preview without changing its editing timestamp", async () => {
    const t = convexTest(schema, modules)
    const alice = t.withIdentity(aliceIdentity)
    const bob = t.withIdentity(bobIdentity)
    const projectId = await alice.mutation(api.projects.create, {
      name: "Diseño anterior",
      canvas: { pages: [] },
    })
    const before = await t.run((ctx) => ctx.db.get(projectId))

    await expect(
      bob.mutation(api.projects.updatePreview, {
        id: projectId,
        previewUrl: "data:image/jpeg;base64,stolen",
      }),
    ).rejects.toThrow("autorizado")

    await alice.mutation(api.projects.updatePreview, {
      id: projectId,
      previewUrl: "data:image/jpeg;base64,backfilled",
    })

    const after = await t.run((ctx) => ctx.db.get(projectId))
    expect(after?.previewUrl).toBe("data:image/jpeg;base64,backfilled")
    expect(after?.updatedAt).toBe(before?.updatedAt)
  })

  it("protects child resources through project ownership", async () => {
    const t = convexTest(schema, modules)
    const alice = t.withIdentity(aliceIdentity)
    const bob = t.withIdentity(bobIdentity)
    const projectId = await alice.mutation(api.projects.create, {
      name: "Privado",
      canvas: { pages: [] },
    })

    await expect(
      bob.mutation(api.projectVersions.create, {
        projectId,
        label: "Copia",
        canvas: { pages: [] },
      }),
    ).rejects.toThrow("autorizado")
    await expect(bob.query(api.comments.list, { projectId })).rejects.toThrow("autorizado")
    await expect(bob.query(api.projectPresence.list, { projectId })).rejects.toThrow("autorizado")
    await expect(bob.query(api.projectShares.list, { projectId })).rejects.toThrow("autorizado")
  })

  it("isolates uploaded assets by owner", async () => {
    const t = convexTest(schema, modules)
    const alice = t.withIdentity(aliceIdentity)
    const bob = t.withIdentity(bobIdentity)
    const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["asset"])))
    const assetId = await alice.mutation(api.assets.save, {
      name: "alice.png",
      storageId,
      contentType: "image/png",
      size: 5,
    })

    await expect(alice.query(api.assets.list, {})).resolves.toMatchObject([
      { _id: assetId, name: "alice.png" },
    ])
    await expect(bob.query(api.assets.list, {})).resolves.toEqual([])
    await expect(bob.query(api.assets.get, { id: assetId })).resolves.toBeNull()
  })

  it("requires a session for share links while allowing authenticated recipients", async () => {
    const t = convexTest(schema, modules)
    const alice = t.withIdentity(aliceIdentity)
    const bob = t.withIdentity(bobIdentity)
    const projectId = await alice.mutation(api.projects.create, {
      name: "Compartido",
      canvas: { pages: [] },
    })
    await alice.mutation(api.projectShares.create, {
      projectId,
      access: "view",
      token: "share-token",
    })

    await expect(t.query(api.projectShares.getByToken, { token: "share-token" })).rejects.toThrow(
      "iniciar sesión",
    )
    await expect(bob.query(api.projectShares.getByToken, { token: "share-token" })).resolves.toMatchObject({
      project: { _id: projectId },
      share: { access: "view" },
    })
  })

  it("requires authentication for shared templates and attributes new ones", async () => {
    const t = convexTest(schema, modules)
    const alice = t.withIdentity(aliceIdentity)

    await expect(t.query(api.sharedTemplates.list, {})).rejects.toThrow("iniciar sesión")
    const templateId = await alice.mutation(api.sharedTemplates.create, {
      name: "Portada",
      description: "Plantilla compartida",
      authorName: "Nombre enviado por cliente",
      canvas: { pages: [] },
    })

    const stored = await t.run((ctx) => ctx.db.get(templateId))
    expect(stored?.ownerId).toBe(aliceIdentity.tokenIdentifier)
  })
})
