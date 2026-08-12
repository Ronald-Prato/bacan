# Graph Report - .  (2026-08-04)

## Corpus Check
- 128 files · ~70,222 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 682 nodes · 909 edges · 61 communities (41 shown, 20 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Editor Document Model|Editor Document Model]]
- [[_COMMUNITY_Convex Auth Guidance|Convex Auth Guidance]]
- [[_COMMUNITY_Convex Backend Functions|Convex Backend Functions]]
- [[_COMMUNITY_Editor App Orchestration|Editor App Orchestration]]
- [[_COMMUNITY_Convex Component Patterns|Convex Component Patterns]]
- [[_COMMUNITY_Convex Performance Guidance|Convex Performance Guidance]]
- [[_COMMUNITY_Package Metadata|Package Metadata]]
- [[_COMMUNITY_Design Templates|Design Templates]]
- [[_COMMUNITY_Component Architecture Guidance|Component Architecture Guidance]]
- [[_COMMUNITY_App TypeScript Config|App TypeScript Config]]
- [[_COMMUNITY_UI Component Config|UI Component Config]]
- [[_COMMUNITY_Project Persistence|Project Persistence]]
- [[_COMMUNITY_Assets and Dashboard|Assets and Dashboard]]
- [[_COMMUNITY_Runtime Dependencies|Runtime Dependencies]]
- [[_COMMUNITY_Tooling TypeScript Config|Tooling TypeScript Config]]
- [[_COMMUNITY_Legacy TypeScript Config|Legacy TypeScript Config]]
- [[_COMMUNITY_Project Sharing|Project Sharing]]
- [[_COMMUNITY_Canvas Snapping|Canvas Snapping]]
- [[_COMMUNITY_Editor Shell Components|Editor Shell Components]]
- [[_COMMUNITY_Collaboration Presence|Collaboration Presence]]
- [[_COMMUNITY_Product Documentation|Product Documentation]]
- [[_COMMUNITY_Undo Redo History|Undo Redo History]]
- [[_COMMUNITY_Canvas Interaction Helpers|Canvas Interaction Helpers]]
- [[_COMMUNITY_Export Options|Export Options]]
- [[_COMMUNITY_Editor Comments|Editor Comments]]
- [[_COMMUNITY_Editor Search|Editor Search]]
- [[_COMMUNITY_Convex Data Model|Convex Data Model]]
- [[_COMMUNITY_Convex Server Types|Convex Server Types]]
- [[_COMMUNITY_Lint Configuration|Lint Configuration]]
- [[_COMMUNITY_Convex Auth Integration|Convex Auth Integration]]
- [[_COMMUNITY_Editor Architecture Rules|Editor Architecture Rules]]
- [[_COMMUNITY_Auth0 Integration|Auth0 Integration]]
- [[_COMMUNITY_Clerk Integration|Clerk Integration]]
- [[_COMMUNITY_WorkOS Integration|WorkOS Integration]]
- [[_COMMUNITY_Shape Creation|Shape Creation]]
- [[_COMMUNITY_Badge Component|Badge Component]]
- [[_COMMUNITY_Button Component|Button Component]]
- [[_COMMUNITY_Vite Environment Types|Vite Environment Types]]
- [[_COMMUNITY_TypeScript Project References|TypeScript Project References]]
- [[_COMMUNITY_Component Icon|Component Icon]]
- [[_COMMUNITY_Migration Icon|Migration Icon]]
- [[_COMMUNITY_Performance Icon|Performance Icon]]
- [[_COMMUNITY_Quickstart Icon|Quickstart Icon]]
- [[_COMMUNITY_Generated Convex API|Generated Convex API]]
- [[_COMMUNITY_App Identity Creation|App Identity Creation]]
- [[_COMMUNITY_Canvas Image Rendering|Canvas Image Rendering]]
- [[_COMMUNITY_Quickstart Icon Variant|Quickstart Icon Variant]]
- [[_COMMUNITY_Authentication Icon|Authentication Icon]]
- [[_COMMUNITY_Internal API Reference|Internal API Reference]]
- [[_COMMUNITY_Action API Reference|Action API Reference]]
- [[_COMMUNITY_HTTP Action Reference|HTTP Action Reference]]
- [[_COMMUNITY_Internal Action Reference|Internal Action Reference]]
- [[_COMMUNITY_Internal Mutation Reference|Internal Mutation Reference]]
- [[_COMMUNITY_Internal Query Reference|Internal Query Reference]]
- [[_COMMUNITY_Bacan Brand Mark|Bacan Brand Mark]]

## God Nodes (most connected - your core abstractions)
1. `updatePage()` - 22 edges
2. `compilerOptions` - 20 edges
3. `EditorApp()` - 15 edges
4. `compilerOptions` - 15 edges
5. `compilerOptions` - 13 edges
6. `Convex Component Design` - 10 edges
7. `element()` - 9 edges
8. `Convex Performance Audit` - 8 edges
9. `Convex Authentication Setup` - 8 edges
10. `scripts` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Bacan MVP` --semantically_similar_to--> `Bacan v1 MVP Overview`  [INFERRED] [semantically similar]
  README.md → v1.html
- `Bounded Indexed Queries` --semantically_similar_to--> `Storage-Pushed Filtering`  [INFERRED] [semantically similar]
  convex/_generated/ai/guidelines.md → .claude/skills/convex-performance-audit/references/hot-path-rules.md
- `Convex Auth Identity` --semantically_similar_to--> `Server-Side Identity Verification`  [INFERRED] [semantically similar]
  convex/_generated/ai/guidelines.md → .claude/skills/convex-setup-auth/SKILL.md
- `Convex Agent Guidance` --semantically_similar_to--> `Convex Claude Guidance`  [INFERRED] [semantically similar]
  AGENTS.md → CLAUDE.md
- `EditorApp()` --references--> `jspdf`  [EXTRACTED]
  src/App.tsx → package.json

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Convex component shapes** — _agents_skills_convex_create_component_references_local_components_local_convex_components, _agents_skills_convex_create_component_references_packaged_components_packaged_convex_components, _agents_skills_convex_create_component_references_hybrid_components_hybrid_convex_components [EXTRACTED 1.00]
- **Convex performance problem classes** — _agents_skills_convex_performance_audit_references_function_budget_function_budget, _agents_skills_convex_performance_audit_references_hot_path_rules_hot_path_rules, _agents_skills_convex_performance_audit_references_occ_conflicts_occ_conflict_resolution, _agents_skills_convex_performance_audit_references_subscription_cost_subscription_cost [EXTRACTED 1.00]
- **Convex Auth Provider Integration Paths** — _agents_skills_convex_setup_auth_skill_convex_authentication_setup, _agents_skills_convex_setup_auth_references_auth0_auth0_convex_integration, _agents_skills_convex_setup_auth_references_clerk_clerk_convex_integration, _agents_skills_convex_setup_auth_references_convex_auth_convex_auth_integration, _agents_skills_convex_setup_auth_references_workos_authkit_workos_authkit_convex_integration [EXTRACTED 1.00]
- **Convex Component Distribution Shapes** — _claude_skills_convex_create_component_skill_convex_component_design, _claude_skills_convex_create_component_references_local_components_local_convex_components, _claude_skills_convex_create_component_references_packaged_components_packaged_convex_components, _claude_skills_convex_create_component_references_hybrid_components_hybrid_convex_components [EXTRACTED 1.00]
- **Convex Safe Migration System** — _claude_skills_convex_migration_helper_skill_widen_migrate_narrow, _claude_skills_convex_migration_helper_references_migration_patterns_convex_migration_patterns, _claude_skills_convex_migration_helper_references_migrations_component_batched_resumable_migrations [EXTRACTED 1.00]
- **Convex Authentication Provider Ecosystem** — _claude_skills_convex_setup_auth_references_auth0_auth0_integration, _claude_skills_convex_setup_auth_references_clerk_clerk_integration, _claude_skills_convex_setup_auth_references_convex_auth_convex_auth_integration, _claude_skills_convex_setup_auth_references_workos_authkit_workos_authkit_integration [EXTRACTED 1.00]
- **Convex Performance Audit Strategies** — _claude_skills_convex_performance_audit_references_hot_path_rules_hot_path_optimization, _claude_skills_convex_performance_audit_references_occ_conflicts_conflict_reduction, _claude_skills_convex_performance_audit_references_subscription_cost_subscription_cost_model [INFERRED 0.95]
- **Bacan v1 Editor Capabilities** — v1_image_asset_bank, v1_vertical_pages, v1_canvas_elements, v1_active_page_png_export [EXTRACTED 1.00]

## Communities (61 total, 20 thin omitted)

### Community 0 - "Editor Document Model"
Cohesion: 0.05
Nodes (81): addElementToPage(), addPage(), alignElementToCanvas(), BaseElement, clamp(), createCopiedGroupId(), createDefaultImageCrop(), createDefaultImageFilters() (+73 more)

### Community 1 - "Convex Auth Guidance"
Cohesion: 0.04
Nodes (48): Convex Setup Auth Agent Configuration, Provider-first Auth Setup Prompt, Authentication Padlock Icon, Auth Provider Selection, Conditional App-level User Storage, Convex Authentication Setup, Official Auth Guidance as Source of Truth, Server-side Identity Verification (+40 more)

### Community 2 - "Convex Backend Functions"
Cohesion: 0.08
Nodes (26): generateUploadUrl, get, list, save, create, list, mutation, query (+18 more)

### Community 3 - "Editor App Orchestration"
Cohesion: 0.06
Nodes (25): api, AssetPersistence, AutosaveStatus, backgroundSwatches, colorSwatches, CommentPersistence, DocumentUpdater, DragSelection (+17 more)

### Community 4 - "Convex Component Patterns"
Cohesion: 0.06
Nodes (34): Convex Create Component agent interface, Advanced Component Patterns, Function handles for callbacks, Schema-derived validators, Hybrid Convex Components, Local Convex Components, Packaged Convex Components, App-facing component wrapper (+26 more)

### Community 5 - "Convex Performance Guidance"
Cohesion: 0.07
Nodes (29): Denormalized Data Fallback, Digest Tables, Convex Hot Path Optimization, Storage-Pushed Filtering, OCC Conflict Reduction, Optimistic Concurrency Control, Point-in-Time Reads, Subscription Batching (+21 more)

### Community 6 - "Package Metadata"
Cohesion: 0.08
Nodes (25): description, devDependencies, oxlint, @types/node, @types/react, @types/react-dom, typescript, vite (+17 more)

### Community 7 - "Design Templates"
Cohesion: 0.14
Nodes (22): DocumentSize, IdFactory, cloneEditorDocument(), createBlankDocumentForFormat(), createDocumentFromSharedTemplate(), createDocumentFromTemplate(), createSharedTemplateDraft(), createTemplatePage() (+14 more)

### Community 8 - "Component Architecture Guidance"
Cohesion: 0.09
Nodes (23): Boundary-first Component Prompt, Convex Create Component Agent Configuration, Component Boundary Icon, Advanced Convex Component Patterns, Class-based Client Wrappers, Function Handle Callbacks, Globals Table Configuration, Schema-derived Validators (+15 more)

### Community 9 - "App TypeScript Config"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly, ignoreDeprecations, jsx, lib, module (+14 more)

### Community 10 - "UI Component Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 11 - "Project Persistence"
Cohesion: 0.19
Nodes (18): EditorDocument, Page, cloneEditorDocument(), createDocumentFingerprint(), createProjectSavePayload(), createProjectVersionDocument(), createProjectVersionDraft(), isEditorDocument() (+10 more)

### Community 12 - "Assets and Dashboard"
Cohesion: 0.17
Nodes (16): AssetRecord, createLocalAsset(), isSupportedImageAsset(), LibraryAsset, normalizeAssetName(), summarizeAssetRecord(), SUPPORTED_IMAGE_TYPES, createWorkspaceStats() (+8 more)

### Community 13 - "Runtime Dependencies"
Cohesion: 0.11
Nodes (18): dependencies, class-variance-authority, clsx, convex, @fontsource-variable/geist, konva, lucide-react, radix-ui (+10 more)

### Community 14 - "Tooling TypeScript Config"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 15 - "Legacy TypeScript Config"
Cohesion: 0.12
Nodes (15): compilerOptions, allowJs, allowSyntheticDefaultImports, forceConsistentCasingInFileNames, isolatedModules, jsx, lib, module (+7 more)

### Community 16 - "Project Sharing"
Cohesion: 0.24
Nodes (13): SharedProjectPreview(), createProjectShareDraft(), createShareToken(), createShareUrl(), fallbackShareId(), getShareTokenFromPath(), isShareAccess(), ProjectShareDraft (+5 more)

### Community 17 - "Canvas Snapping"
Cohesion: 0.24
Nodes (11): CANVAS_SIZE, CanvasElement, AxisReference, compareSnapCandidates(), createHorizontalReferences(), createVerticalReferences(), findBestSnap(), SnapCandidate (+3 more)

### Community 18 - "Editor Shell Components"
Cohesion: 0.17
Nodes (6): EditorContextSidebarProps, EditorFooterProps, EditorToolItem, EditorToolRailProps, EditorTopBarProps, EditorWorkspaceProps

### Community 19 - "Collaboration Presence"
Cohesion: 0.29
Nodes (10): CollaboratorPresence, createPresenceClientId(), createPresenceDraft(), fallbackPresenceId(), listActiveCollaborators(), normalizePresenceColor(), PRESENCE_COLORS, PresenceColor (+2 more)

### Community 20 - "Product Documentation"
Cohesion: 0.20
Nodes (11): Bacan Vite Application Shell, Bacan Open Source Editor, Bacan MVP, Bacan Technology Stack, Active Page PNG Export, Bacan v1 Local State Limits, Bacan v1 MVP Overview, Transformable Canvas Elements (+3 more)

### Community 21 - "Undo Redo History"
Cohesion: 0.29
Nodes (8): createHistoryState(), HistoryOptions, HistoryState, pushHistory(), redoHistory(), replaceHistoryPresent(), TestDocument, undoHistory()

### Community 22 - "Canvas Interaction Helpers"
Cohesion: 0.20
Nodes (10): jspdf, clamp(), createDragSelectionBounds(), EditorApp(), getStageDocumentPointer(), hasDragSelectionArea(), isCanvasBackgroundTarget(), loadImageSize() (+2 more)

### Community 23 - "Export Options"
Cohesion: 0.33
Nodes (8): buildExportFileName(), clampQuality(), createExportOptions(), EXPORT_FORMATS, ExportFormat, ExportFormatId, ExportOptions, getExportMimeType()

### Community 24 - "Editor Comments"
Cohesion: 0.36
Nodes (6): CommentDraft, CommentRecord, createCommentDraft(), describeCommentTarget(), EditorComment, summarizeCommentRecord()

### Community 25 - "Editor Search"
Cohesion: 0.46
Nodes (6): filterSearchItems(), matchesSearchQuery(), normalizeSearchText(), resolveAccessor(), SearchAccessor, items

### Community 26 - "Convex Data Model"
Cohesion: 0.33
Nodes (4): DataModel, Doc, Id, TableNames

### Community 27 - "Convex Server Types"
Cohesion: 0.33
Nodes (5): ActionCtx, DatabaseReader, DatabaseWriter, MutationCtx, QueryCtx

### Community 28 - "Lint Configuration"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 29 - "Convex Auth Integration"
Cohesion: 0.40
Nodes (5): Convex Auth Tables Schema, Configured Sign-in Provider, Convex Auth Initializer, Convex Auth Integration, Optional App Users Table

### Community 31 - "Editor Architecture Rules"
Cohesion: 0.50
Nodes (4): Bacan Editor Architecture agent interface, Bacan Editor Architecture, Convex-safe editor boundaries, Framework-light editor modules

### Community 32 - "Auth0 Integration"
Cohesion: 0.50
Nodes (4): Auth0 CLI Setup Path, Auth0 and Convex Integration, Auth0Provider and ConvexProviderWithAuth0 Wiring, Auth0 Refresh-token Validation Caveat

### Community 33 - "Clerk Integration"
Cohesion: 0.50
Nodes (4): Clerk and Convex Integration, Clerk JWT Issuer Mapping, ClerkProvider and ConvexProviderWithClerk Wiring, Convex-authenticated UI State

### Community 34 - "WorkOS Integration"
Cohesion: 0.50
Nodes (4): convex.json AuthKit Configuration, Managed or Existing WorkOS Team Choice, WorkOS AuthKit and Convex Integration, WorkOS JWT and Client Wiring

### Community 35 - "Shape Creation"
Cohesion: 0.67
Nodes (3): isShapeType(), createShapeElement(), SHAPE_OPTIONS

## Knowledge Gaps
- **302 isolated node(s):** `$schema`, `plugins`, `react/rules-of-hooks`, `react/only-export-components`, `$schema` (+297 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `EditorApp()` connect `Canvas Interaction Helpers` to `Editor Document Model`, `Shape Creation`, `Editor App Orchestration`, `Project Persistence`, `App Identity Creation`, `Project Sharing`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Runtime Dependencies` to `Package Metadata`, `Canvas Interaction Helpers`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `jspdf` connect `Canvas Interaction Helpers` to `Runtime Dependencies`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `EditorApp()` (e.g. with `createId()` and `createDocumentFingerprint()`) actually correct?**
  _`EditorApp()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `plugins`, `react/rules-of-hooks` to the rest of the system?**
  _365 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Editor Document Model` be split into smaller, more focused modules?**
  _Cohesion score 0.05182072829131653 - nodes in this community are weakly interconnected._
- **Should `Convex Auth Guidance` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._