**Vue 3 + TypeScript**

Frontend Architecture Reference

*Feature-based architecture with Pinia, Zod, VeeValidate & FSD
influence*

**1. Folder Structure**

The top-level structure separates global concerns from feature domains.
Everything belonging to a specific domain lives inside its feature
slice.

+-----------------------------------------------------------------------+
| src/                                                                  |
|                                                                       |
| app/ \# app init, plugins, global styles                              |
|                                                                       |
| assets/                                                               |
|                                                                       |
| components/                                                           |
|                                                                       |
| ui/ \# design system primitives (Button, Input, Modal)                |
|                                                                       |
| shared/ \# composed reusable components (EmptyState, etc.)            |
|                                                                       |
| layout/ \# structural components (AppHeader, AppSidebar)              |
|                                                                       |
| composables/ \# global composables (useTheme, useBreakpoint)          |
|                                                                       |
| features/ \# feature slices --- see Section 2                         |
|                                                                       |
| pages/ \# route-level components (one per route)                      |
|                                                                       |
| router/                                                               |
|                                                                       |
| index.ts                                                              |
|                                                                       |
| guards/                                                               |
|                                                                       |
| services/ \# global infrastructure services                           |
|                                                                       |
| api.service.ts                                                        |
|                                                                       |
| auth.service.ts                                                       |
|                                                                       |
| storage.service.ts                                                    |
|                                                                       |
| stores/ \# global state only (useAuthStore)                           |
|                                                                       |
| types/ \# global types (AppError, PaginatedResponse)                  |
|                                                                       |
| utils/ \# global pure helpers (formatDate, validators)                |
+-----------------------------------------------------------------------+

**1.1 Component Layers**

  ------------------------- ------------------------------------------------
  **Layer**                 **Rule**

  components/ui/            Primitives only. No store access, no business
                            logic, props/emits/slots only.

  components/shared/        Composes ui/ primitives. Still no store access.

  components/layout/        Structural shells. May read auth store for nav
                            state.

  features/\*/components/   Can access stores, composables, feature types
                            freely.
  ------------------------- ------------------------------------------------

**2. Feature Slice**

Each feature is a self-contained vertical slice. Everything belonging to
\[example\] lives inside features/\[example\]/. Nothing outside the
feature imports from inside it --- only from its index.ts public API.

+-----------------------------------------------------------------------+
| features/                                                             |
|                                                                       |
| \[example\]/                                                          |
|                                                                       |
| components/                                                           |
|                                                                       |
| \[Example\]Card.vue                                                   |
|                                                                       |
| \[Example\]CardSkeleton.vue                                           |
|                                                                       |
| \[Example\]Detail.vue                                                 |
|                                                                       |
| \[Example\]DetailSkeleton.vue                                         |
|                                                                       |
| \[Example\]ListSkeleton.vue                                           |
|                                                                       |
| composables/                                                          |
|                                                                       |
| use\[Example\]Form.ts                                                 |
|                                                                       |
| use\[Example\]Page.ts                                                 |
|                                                                       |
| services/                                                             |
|                                                                       |
| \[example\].service.ts                                                |
|                                                                       |
| \[example\].service.spec.ts                                           |
|                                                                       |
| store/                                                                |
|                                                                       |
| \[example\].store.ts                                                  |
|                                                                       |
| \[example\].store.spec.ts                                             |
|                                                                       |
| types/                                                                |
|                                                                       |
| \[example\].types.ts                                                  |
|                                                                       |
| index.ts \# public API --- only import from here                      |
+-----------------------------------------------------------------------+

**2.1 The index.ts Public API**

This is the most important file in each feature. Code outside the
feature must only import from this file, never from internal paths.

+-----------------------------------------------------------------------+
| // features/\[example\]/index.ts                                      |
|                                                                       |
| export { use\[Example\]Store } from \'./store/\[example\].store\'     |
|                                                                       |
| export { use\[Example\]Form } from                                    |
| \'./composables/use\[Example\]Form\'                                  |
|                                                                       |
| export { \[example\]Service } from \'./services/\[example\].service\' |
|                                                                       |
| export type { \[Example\],                                            |
|                                                                       |
| Create\[Example\]Dto,                                                 |
|                                                                       |
| Update\[Example\]Dto } from \'./types/\[example\].types\'             |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Import rule**                                                       |
|                                                                       |
| import { use\[Example\]Store } from \'@/features/\[example\]\' //     |
| correct                                                               |
|                                                                       |
| import { use\[Example\]Store } from                                   |
| \'@/features/\[example\]/store/\...\' // wrong                        |
+-----------------------------------------------------------------------+

**3. Naming Conventions**

  ------------------ ---------------------- -----------------------------
  **Thing**          **Convention**         **Example**

  Pages              PascalCase + Page      \[Example\]ListPage.vue
                     suffix                 

  Components         PascalCase             \[Example\]Card.vue

  Skeletons          PascalCase + Skeleton  \[Example\]CardSkeleton.vue
                     suffix                 

  Composables        use prefix + camelCase use\[Example\]Form.ts

  Services           camelCase + Service    \[example\].service.ts
                     suffix                 

  Stores             use prefix + Store     use\[Example\]Store.ts
                     suffix                 

  Types file         camelCase + types      \[example\].types.ts
                     suffix                 

  Interfaces / Types PascalCase, no I       \[Example\],
                     prefix                 Create\[Example\]Dto

  Enums              PascalCase             \[Example\]Status,
                                            \[Example\]Role

  Utils              descriptive camelCase  formatDate.ts, validators.ts

  Tests              same name + spec       \[example\].service.spec.ts
                     suffix                 
  ------------------ ---------------------- -----------------------------

**4. Types, Schemas & DTOs**

All types for a feature live in \[example\].types.ts. Zod schemas are
used at trust boundaries --- API responses, form inputs, env vars.
TypeScript types are derived from schemas to keep a single source of
truth.

+-----------------------------------------------------------------------+
| // features/\[example\]/types/\[example\].types.ts                    |
|                                                                       |
| import { z } from \'zod\'                                             |
|                                                                       |
| // ── API schemas (validate incoming data) ──                         |
|                                                                       |
| export const \[Example\]Schema = z.object({                           |
|                                                                       |
| id: z.string(),                                                       |
|                                                                       |
| name: z.string(),                                                     |
|                                                                       |
| status: z.enum(\[\'active\', \'inactive\'\]),                         |
|                                                                       |
| })                                                                    |
|                                                                       |
| // ── Derive TS types from schemas ──                                 |
|                                                                       |
| export type \[Example\] = z.infer\<typeof \[Example\]Schema\>         |
|                                                                       |
| // ── DTOs (what you send to the API) ──                              |
|                                                                       |
| export const Create\[Example\]Schema = z.object({                     |
|                                                                       |
| name: z.string().min(2, \'Name required\'),                           |
|                                                                       |
| })                                                                    |
|                                                                       |
| export type Create\[Example\]Dto = z.infer\<typeof                    |
| Create\[Example\]Schema\>                                             |
|                                                                       |
| export type Update\[Example\]Dto = Partial\<Pick\<\[Example\],        |
| \'name\' \| \'status\'\>\>                                            |
|                                                                       |
| // ── Plain TS for internal shapes (no Zod needed) ──                 |
|                                                                       |
| export interface \[Example\]Filters {                                 |
|                                                                       |
| search?: string                                                       |
|                                                                       |
| status?: \[Example\]\[\'status\'\]                                    |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

  ---------------------- ------------------------------------------------
  **Use Zod for**        **Skip Zod for**

  API response           Internal store state
  validation             

  Form schemas           TS types you create yourself
  (VeeValidate)          

  Environment variables  Utility function arguments

  URL / query params     Data that never crosses a boundary
  ---------------------- ------------------------------------------------

**5. Service Layer**

**5.1 Global api.service.ts**

The global api service owns the axios instance, interceptors, token
injection, error normalisation and token refresh. Feature services never
configure axios themselves.

+-----------------------------------------------------------------------+
| // services/api.service.ts                                            |
|                                                                       |
| import axios, { type AxiosInstance } from \'axios\'                   |
|                                                                       |
| class ApiService {                                                    |
|                                                                       |
| private client: AxiosInstance                                         |
|                                                                       |
| constructor() {                                                       |
|                                                                       |
| this.client = axios.create({                                          |
|                                                                       |
| baseURL: import.meta.env.VITE_API_URL,                                |
|                                                                       |
| timeout: 10000,                                                       |
|                                                                       |
| })                                                                    |
|                                                                       |
| this.initInterceptors()                                               |
|                                                                       |
| }                                                                     |
|                                                                       |
| private initInterceptors() {                                          |
|                                                                       |
| this.client.interceptors.request.use(config =\> {                     |
|                                                                       |
| const token = storageService.getAccessToken()                         |
|                                                                       |
| if (token) config.headers.Authorization = \`Bearer \${token}\`        |
|                                                                       |
| return config                                                         |
|                                                                       |
| })                                                                    |
|                                                                       |
| this.client.interceptors.response.use(                                |
|                                                                       |
| response =\> response,                                                |
|                                                                       |
| async error =\> {                                                     |
|                                                                       |
| if (error.response?.status === 401 && !error.config.\_retry) {        |
|                                                                       |
| error.config.\_retry = true                                           |
|                                                                       |
| await authService.refresh()                                           |
|                                                                       |
| return this.client(error.config)                                      |
|                                                                       |
| }                                                                     |
|                                                                       |
| return Promise.reject(this.normalizeError(error))                     |
|                                                                       |
| }                                                                     |
|                                                                       |
| )                                                                     |
|                                                                       |
| }                                                                     |
|                                                                       |
| get\<T\>(url: string): Promise\<T\> {                                 |
|                                                                       |
| return this.client.get(url).then(r =\> r.data)                        |
|                                                                       |
| }                                                                     |
|                                                                       |
| // post, patch, delete follow same pattern                            |
|                                                                       |
| }                                                                     |
|                                                                       |
| export const apiService = new ApiService()                            |
+-----------------------------------------------------------------------+

**5.2 Feature Service**

Feature services call apiService and validate responses with Zod. They
are plain objects --- no reactive state, no store imports, no router
imports.

+-----------------------------------------------------------------------+
| // features/\[example\]/services/\[example\].service.ts               |
|                                                                       |
| import { apiService } from \'@/services/api.service\'                 |
|                                                                       |
| import { \[Example\]Schema } from \'@/features/\[example\]\'          |
|                                                                       |
| import type { \[Example\], Create\[Example\]Dto, Update\[Example\]Dto |
| } from \'@/features/\[example\]\'                                     |
|                                                                       |
| import type { PaginatedResponse, PaginationParams } from \'@/types\'  |
|                                                                       |
| import { z } from \'zod\'                                             |
|                                                                       |
| const \[Example\]ListSchema = z.array(\[Example\]Schema)              |
|                                                                       |
| export const \[example\]Service = {                                   |
|                                                                       |
| getAll: async (params?: PaginationParams):                            |
| Promise\<PaginatedResponse\<\[Example\]\>\> =\> {                     |
|                                                                       |
| const raw = await apiService.get(\'/\[examples\]\', { params })       |
|                                                                       |
| return { \...raw, data: \[Example\]ListSchema.parse(raw.data) }       |
|                                                                       |
| },                                                                    |
|                                                                       |
| getById: async (id: string): Promise\<\[Example\]\> =\> {             |
|                                                                       |
| const raw = await apiService.get(\`/\[examples\]/\${id}\`)            |
|                                                                       |
| return \[Example\]Schema.parse(raw)                                   |
|                                                                       |
| },                                                                    |
|                                                                       |
| create: async (dto: Create\[Example\]Dto): Promise\<\[Example\]\> =\> |
| {                                                                     |
|                                                                       |
| const raw = await apiService.post(\'/\[examples\]\', dto)             |
|                                                                       |
| return \[Example\]Schema.parse(raw)                                   |
|                                                                       |
| },                                                                    |
|                                                                       |
| update: async (id: string, dto: Update\[Example\]Dto):                |
| Promise\<\[Example\]\> =\> {                                          |
|                                                                       |
| const raw = await apiService.patch(\`/\[examples\]/\${id}\`, dto)     |
|                                                                       |
| return \[Example\]Schema.parse(raw)                                   |
|                                                                       |
| },                                                                    |
|                                                                       |
| remove: (id: string): Promise\<void\> =\>                             |
|                                                                       |
| apiService.delete(\`/\[examples\]/\${id}\`),                          |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Service rules --- never break these**                               |
|                                                                       |
| Services are pure async functions --- input in, typed data out.       |
|                                                                       |
| No ref(), no reactive(), no useRouter(), no store imports.            |
|                                                                       |
| Error handling belongs in the store, not the service.                 |
|                                                                       |
| Data transformation belongs in the store, not the service.            |
+-----------------------------------------------------------------------+

**6. Store Layer**

Always use the setup store style (not options style). Granular loading
and error state per operation allows each UI section to react
independently.

+-----------------------------------------------------------------------+
| // features/\[example\]/store/\[example\].store.ts                    |
|                                                                       |
| import { ref, computed } from \'vue\'                                 |
|                                                                       |
| import { defineStore } from \'pinia\'                                 |
|                                                                       |
| import { \[example\]Service } from \'@/features/\[example\]\'         |
|                                                                       |
| import type { \[Example\], Create\[Example\]Dto, Update\[Example\]Dto |
| } from \'@/features/\[example\]\'                                     |
|                                                                       |
| import type { AppError, PaginationParams } from \'@/types\'           |
|                                                                       |
| export const use\[Example\]Store = defineStore(\'\[example\]\', ()    |
| =\> {                                                                 |
|                                                                       |
| // ── State ──                                                        |
|                                                                       |
| const items = ref\<\[Example\]\[\]\>(\[\])                            |
|                                                                       |
| const selected = ref\<\[Example\] \| null\>(null)                     |
|                                                                       |
| const total = ref(0)                                                  |
|                                                                       |
| const loading = ref({                                                 |
|                                                                       |
| fetch: false,                                                         |
|                                                                       |
| create: false,                                                        |
|                                                                       |
| update: false,                                                        |
|                                                                       |
| remove: false,                                                        |
|                                                                       |
| })                                                                    |
|                                                                       |
| const error = ref({                                                   |
|                                                                       |
| fetch: null as AppError \| null,                                      |
|                                                                       |
| create: null as AppError \| null,                                     |
|                                                                       |
| update: null as AppError \| null,                                     |
|                                                                       |
| remove: null as AppError \| null,                                     |
|                                                                       |
| })                                                                    |
|                                                                       |
| // ── Getters ──                                                      |
|                                                                       |
| const hasItems = computed(() =\> items.value.length \> 0)             |
|                                                                       |
| const itemById = computed(() =\> (id: string) =\>                     |
|                                                                       |
| items.value.find(i =\> i.id === id) ?? null                           |
|                                                                       |
| )                                                                     |
|                                                                       |
| // ── Actions ──                                                      |
|                                                                       |
| const fetchAll = async (params?: PaginationParams) =\> {              |
|                                                                       |
| loading.value.fetch = true                                            |
|                                                                       |
| error.value.fetch = null                                              |
|                                                                       |
| try {                                                                 |
|                                                                       |
| const res = await \[example\]Service.getAll(params)                   |
|                                                                       |
| items.value = res.data                                                |
|                                                                       |
| total.value = res.total                                               |
|                                                                       |
| } catch (e) {                                                         |
|                                                                       |
| error.value.fetch = e as AppError                                     |
|                                                                       |
| } finally {                                                           |
|                                                                       |
| loading.value.fetch = false                                           |
|                                                                       |
| }                                                                     |
|                                                                       |
| }                                                                     |
|                                                                       |
| const fetchById = async (id: string) =\> {                            |
|                                                                       |
| const cached = itemById.value(id)                                     |
|                                                                       |
| if (cached && !error.value.fetch) {                                   |
|                                                                       |
| selected.value = cached                                               |
|                                                                       |
| return                                                                |
|                                                                       |
| }                                                                     |
|                                                                       |
| loading.value.fetch = true                                            |
|                                                                       |
| error.value.fetch = null                                              |
|                                                                       |
| try {                                                                 |
|                                                                       |
| selected.value = await \[example\]Service.getById(id)                 |
|                                                                       |
| } catch (e) {                                                         |
|                                                                       |
| error.value.fetch = e as AppError                                     |
|                                                                       |
| } finally {                                                           |
|                                                                       |
| loading.value.fetch = false                                           |
|                                                                       |
| }                                                                     |
|                                                                       |
| }                                                                     |
|                                                                       |
| const clearSelected = () =\> {                                        |
|                                                                       |
| selected.value = null                                                 |
|                                                                       |
| error.value.fetch = null                                              |
|                                                                       |
| }                                                                     |
|                                                                       |
| const reset = () =\> {                                                |
|                                                                       |
| items.value = \[\]                                                    |
|                                                                       |
| selected.value = null                                                 |
|                                                                       |
| total.value = 0                                                       |
|                                                                       |
| loading.value = { fetch: false, create: false, update: false, remove: |
| false }                                                               |
|                                                                       |
| error.value = { fetch: null, create: null, update: null, remove: null |
| }                                                                     |
|                                                                       |
| }                                                                     |
|                                                                       |
| return {                                                              |
|                                                                       |
| items, selected, total, loading, error,                               |
|                                                                       |
| hasItems, itemById,                                                   |
|                                                                       |
| fetchAll, fetchById, clearSelected, reset,                            |
|                                                                       |
| }                                                                     |
|                                                                       |
| })                                                                    |
+-----------------------------------------------------------------------+

**7. Pages**

Pages are route-level components only. They compose feature components,
connect the router, orchestrate stores and delegate lifecycle concerns
to a page composable when the view grows complex.

+-----------------------------------------------------------------------+
| \<!\-- pages/\[Example\]DetailPage.vue \--\>                          |
|                                                                       |
| \<script setup lang=\'ts\'\>                                          |
|                                                                       |
| import { watch, onUnmounted } from \'vue\'                            |
|                                                                       |
| import { use\[Example\]Store } from \'@/features/\[example\]\'        |
|                                                                       |
| import { useSkeletonLoading } from                                    |
| \'@/composables/useSkeletonLoading\'                                  |
|                                                                       |
| import \[Example\]Detail from                                         |
| \'@/features/\[example\]/components/\[Example\]Detail.vue\'           |
|                                                                       |
| import \[Example\]DetailSkeleton from                                 |
| \'@/features/\[example\]/components/\[Example\]DetailSkeleton.vue\'   |
|                                                                       |
| const props = defineProps\<{ id: string }\>()                         |
|                                                                       |
| const store = use\[Example\]Store()                                   |
|                                                                       |
| const { showSkeleton } = useSkeletonLoading(                          |
|                                                                       |
| () =\> store.loading.fetch,                                           |
|                                                                       |
| { minimumMs: 300 }                                                    |
|                                                                       |
| )                                                                     |
|                                                                       |
| watch(() =\> props.id, id =\> store.fetchById(id), { immediate: true  |
| })                                                                    |
|                                                                       |
| onUnmounted(() =\> store.clearSelected())                             |
|                                                                       |
| \</script\>                                                           |
|                                                                       |
| \<template\>                                                          |
|                                                                       |
| \<\[Example\]DetailSkeleton v-if=\'showSkeleton\' /\>                 |
|                                                                       |
| \<ErrorState                                                          |
|                                                                       |
| v-else-if=\'store.error.fetch\'                                       |
|                                                                       |
| :error=\'store.error.fetch\'                                          |
|                                                                       |
| \@retry=\'store.fetchById(props.id)\'                                 |
|                                                                       |
| /\>                                                                   |
|                                                                       |
| \<\[Example\]Detail                                                   |
|                                                                       |
| v-else-if=\'store.selected\'                                          |
|                                                                       |
| :item=\'store.selected\'                                              |
|                                                                       |
| /\>                                                                   |
|                                                                       |
| \</template\>                                                         |
+-----------------------------------------------------------------------+

**7.1 Multi-section Page with Independent Loading**

For pages with several independent sections, each section has its own
skeleton and fires its own fetch in parallel.

+-----------------------------------------------------------------------+
| // features/\[example\]/composables/use\[Example\]Page.ts             |
|                                                                       |
| import { watch, onUnmounted } from \'vue\'                            |
|                                                                       |
| import { use\[Example\]Store } from \'@/features/\[example\]\'        |
|                                                                       |
| import { useSkeletonLoading } from                                    |
| \'@/composables/useSkeletonLoading\'                                  |
|                                                                       |
| export const use\[Example\]Page = (id: () =\> string) =\> {           |
|                                                                       |
| const store = use\[Example\]Store()                                   |
|                                                                       |
| const skeletons = {                                                   |
|                                                                       |
| header: useSkeletonLoading(() =\> store.loading.header, { minimumMs:  |
| 300 }),                                                               |
|                                                                       |
| stats: useSkeletonLoading(() =\> store.loading.stats, { minimumMs:    |
| 300 }),                                                               |
|                                                                       |
| feed: useSkeletonLoading(() =\> store.loading.feed, { minimumMs: 300  |
| }),                                                                   |
|                                                                       |
| }                                                                     |
|                                                                       |
| watch(id, newId =\> {                                                 |
|                                                                       |
| Promise.all(\[                                                        |
|                                                                       |
| store.fetchHeader(newId),                                             |
|                                                                       |
| store.fetchStats(newId),                                              |
|                                                                       |
| store.fetchFeed(newId),                                               |
|                                                                       |
| \])                                                                   |
|                                                                       |
| }, { immediate: true })                                               |
|                                                                       |
| onUnmounted(() =\> store.reset())                                     |
|                                                                       |
| return { store, skeletons }                                           |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

**8. Skeleton Loading**

**8.1 Base Primitive**

+-----------------------------------------------------------------------+
| \<!\-- components/ui/Skeleton/Skeleton.vue \--\>                      |
|                                                                       |
| \<script setup lang=\'ts\'\>                                          |
|                                                                       |
| interface Props {                                                     |
|                                                                       |
| width?: string                                                        |
|                                                                       |
| height?: string                                                       |
|                                                                       |
| rounded?: \'none\' \| \'sm\' \| \'md\' \| \'full\'                    |
|                                                                       |
| }                                                                     |
|                                                                       |
| withDefaults(defineProps\<Props\>(), { rounded: \'md\' })             |
|                                                                       |
| \</script\>                                                           |
|                                                                       |
| \<template\>                                                          |
|                                                                       |
| \<div class=\'skeleton\' :style=\'{ width, height }\'                 |
| :class=\'\`skeleton\--\${rounded}\`\' /\>                             |
|                                                                       |
| \</template\>                                                         |
|                                                                       |
| \<style scoped\>                                                      |
|                                                                       |
| .skeleton {                                                           |
|                                                                       |
| background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0  |
| 75%);                                                                 |
|                                                                       |
| background-size: 200% 100%;                                           |
|                                                                       |
| animation: shimmer 1.5s infinite;                                     |
|                                                                       |
| }                                                                     |
|                                                                       |
| \@keyframes shimmer {                                                 |
|                                                                       |
| 0% { background-position: 200% 0; }                                   |
|                                                                       |
| 100% { background-position: -200% 0; }                                |
|                                                                       |
| }                                                                     |
|                                                                       |
| \</style\>                                                            |
+-----------------------------------------------------------------------+

**8.2 useSkeletonLoading Composable**

Prevents the skeleton from flashing when data loads faster than the
minimum display time.

+-----------------------------------------------------------------------+
| // composables/useSkeletonLoading.ts                                  |
|                                                                       |
| import { ref, watch } from \'vue\'                                    |
|                                                                       |
| export const useSkeletonLoading = (                                   |
|                                                                       |
| source: () =\> boolean,                                               |
|                                                                       |
| { minimumMs = 300 } = {}                                              |
|                                                                       |
| ) =\> {                                                               |
|                                                                       |
| const showSkeleton = ref(source())                                    |
|                                                                       |
| let timer: ReturnType\<typeof setTimeout\>                            |
|                                                                       |
| watch(source, isLoading =\> {                                         |
|                                                                       |
| if (isLoading) {                                                      |
|                                                                       |
| clearTimeout(timer)                                                   |
|                                                                       |
| showSkeleton.value = true                                             |
|                                                                       |
| return                                                                |
|                                                                       |
| }                                                                     |
|                                                                       |
| timer = setTimeout(() =\> { showSkeleton.value = false }, minimumMs)  |
|                                                                       |
| })                                                                    |
|                                                                       |
| return { showSkeleton }                                               |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

**9. Routing & Navigation**

**9.1 Route Setup --- Props Mode**

Always use props: true so the page receives :id as a typed prop instead
of reading useRoute() directly.

+-----------------------------------------------------------------------+
| // router/index.ts                                                    |
|                                                                       |
| {                                                                     |
|                                                                       |
| path: \'/\[examples\]/:id\',                                          |
|                                                                       |
| name: \'\[example\]-detail\',                                         |
|                                                                       |
| component: () =\> import(\'@/pages/\[Example\]DetailPage.vue\'),      |
|                                                                       |
| props: true,                                                          |
|                                                                       |
| beforeEnter: \[authGuard\],                                           |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

**9.2 Typed Navigation Composable**

Never hardcode route paths. Use named routes wrapped in a feature
composable so navigation is refactor-safe.

+-----------------------------------------------------------------------+
| // features/\[example\]/composables/use\[Example\]Navigation.ts       |
|                                                                       |
| import { useRouter } from \'vue-router\'                              |
|                                                                       |
| export const use\[Example\]Navigation = () =\> {                      |
|                                                                       |
| const router = useRouter()                                            |
|                                                                       |
| return {                                                              |
|                                                                       |
| goTo\[Example\]: (id: string) =\> router.push({ name:                 |
| \'\[example\]-detail\', params: { id } }),                            |
|                                                                       |
| goTo\[Example\]List: () =\> router.push({ name: \'\[examples\]\' }),  |
|                                                                       |
| goTo\[Example\]Edit: (id: string) =\> router.push({ name:             |
| \'\[example\]-edit\', params: { id } }),                              |
|                                                                       |
| }                                                                     |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

**10. Forms --- VeeValidate + Zod**

Form schemas live in the types file alongside API schemas. Form logic
lives in a composable, never in the component directly.

+-----------------------------------------------------------------------+
| // features/\[example\]/composables/use\[Example\]Form.ts             |
|                                                                       |
| import { useForm } from \'vee-validate\'                              |
|                                                                       |
| import { toTypedSchema } from \'@vee-validate/zod\'                   |
|                                                                       |
| import { use\[Example\]Store } from \'@/features/\[example\]\'        |
|                                                                       |
| import { Create\[Example\]Schema } from \'@/features/\[example\]\'    |
|                                                                       |
| export const use\[Example\]Form = () =\> {                            |
|                                                                       |
| const store = use\[Example\]Store()                                   |
|                                                                       |
| const { handleSubmit, resetForm, defineField, errors } = useForm({    |
|                                                                       |
| validationSchema: toTypedSchema(Create\[Example\]Schema),             |
|                                                                       |
| })                                                                    |
|                                                                       |
| const \[name, nameAttrs\] = defineField(\'name\')                     |
|                                                                       |
| const submit = handleSubmit(async values =\> {                        |
|                                                                       |
| const result = await store.create(values)                             |
|                                                                       |
| if (result) resetForm()                                               |
|                                                                       |
| })                                                                    |
|                                                                       |
| return { name, nameAttrs, errors, submit, isSubmitting:               |
| store.loading.create }                                                |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

**11. Testing**

**11.1 Test Placement**

Unit and integration tests are co-located with the source file they
test. E2E tests live in a root-level e2e/ folder.

+-----------------------------------------------------------------------+
| features/                                                             |
|                                                                       |
| \[example\]/                                                          |
|                                                                       |
| services/                                                             |
|                                                                       |
| \[example\].service.ts                                                |
|                                                                       |
| \[example\].service.spec.ts \# co-located                             |
|                                                                       |
| store/                                                                |
|                                                                       |
| \[example\].store.ts                                                  |
|                                                                       |
| \[example\].store.spec.ts \# co-located                               |
|                                                                       |
| components/                                                           |
|                                                                       |
| \[Example\]Card.vue                                                   |
|                                                                       |
| \[Example\]Card.spec.ts \# co-located                                 |
|                                                                       |
| e2e/ \# root level                                                    |
|                                                                       |
| \[examples\].spec.ts                                                  |
|                                                                       |
| \[example\]-detail.spec.ts                                            |
+-----------------------------------------------------------------------+

**11.2 What to Test at Each Level**

  ---------------------- ------------------------------------------------
  **Layer**              **What to test**

  utils/                 Pure functions --- input/output only

  services/              Mock apiService, test that Zod parses responses

  stores/                Mock service, test state transitions and error
                         handling

  components/            Props, emits, slots --- not implementation
                         details

  pages/                 Integration --- store + components wired
                         correctly

  e2e/                   Full user flows against real or mocked API
  ---------------------- ------------------------------------------------

**11.3 Vitest Config**

+-----------------------------------------------------------------------+
| // vitest.config.ts                                                   |
|                                                                       |
| export default defineConfig({                                         |
|                                                                       |
| test: {                                                               |
|                                                                       |
| environment: \'jsdom\',                                               |
|                                                                       |
| globals: true,                                                        |
|                                                                       |
| include: \[\'src/\*\*/\*.spec.ts\'\],                                 |
|                                                                       |
| exclude: \[\'e2e/\*\*\'\],                                            |
|                                                                       |
| coverage: {                                                           |
|                                                                       |
| exclude: \[                                                           |
|                                                                       |
| \'src/\*\*/\*.types.ts\', // type files                               |
|                                                                       |
| \'src/\*\*/index.ts\', // barrel files                                |
|                                                                       |
| \]                                                                    |
|                                                                       |
| }                                                                     |
|                                                                       |
| }                                                                     |
|                                                                       |
| })                                                                    |
+-----------------------------------------------------------------------+

**12. Enforcing the Architecture**

  --------------------------------- ------------------------------------------------
  **Tool**                          **What it enforces**

  eslint-plugin-boundaries          Layer import rules --- ui cannot import stores,
                                    services cannot import Vue

  no-restricted-imports             Forces imports through feature index.ts, no deep
                                    paths

  vite-plugin-circular-dependency   Detects circular store/feature dependencies at
                                    build time

  husky + lint-staged               Runs eslint + type-check before every commit

  CI pipeline                       Final gate --- nothing merges without passing
                                    all checks
  --------------------------------- ------------------------------------------------

**12.1 Path Aliases (tsconfig.json)**

+-----------------------------------------------------------------------+
| \"paths\": {                                                          |
|                                                                       |
| \"@/\*\": \[\"./src/\*\"\],                                           |
|                                                                       |
| \"@pages/\*\": \[\"./src/pages/\*\"\],                                |
|                                                                       |
| \"@features/\*\": \[\"./src/features/\*\"\],                          |
|                                                                       |
| \"@components/\*\": \[\"./src/components/\*\"\],                      |
|                                                                       |
| \"@stores/\*\": \[\"./src/stores/\*\"\],                              |
|                                                                       |
| \"@services/\*\": \[\"./src/services/\*\"\],                          |
|                                                                       |
| \"@composables/\*\": \[\"./src/composables/\*\"\],                    |
|                                                                       |
| \"@types/\*\": \[\"./src/types/\*\"\],                                |
|                                                                       |
| \"@utils/\*\": \[\"./src/utils/\*\"\]                                 |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

**13. Data Flow Summary**

The full request-response cycle follows a strict unidirectional path.
Each layer has one job and nothing bleeds into adjacent layers.

+-----------------------------------------------------------------------+
| Page / Component                                                      |
|                                                                       |
| → calls store action                                                  |
|                                                                       |
| → store sets loading.fetch = true                                     |
|                                                                       |
| → calls feature service                                               |
|                                                                       |
| → service calls apiService                                            |
|                                                                       |
| → apiService injects auth token                                       |
|                                                                       |
| → axios → API                                                         |
|                                                                       |
| ← apiService normalises error                                         |
|                                                                       |
| ← service validates response with Zod                                 |
|                                                                       |
| ← store updates state                                                 |
|                                                                       |
| → store sets loading.fetch = false                                    |
|                                                                       |
| ← component reacts to store state (loading / error / data)            |
|                                                                       |
| Leave route                                                           |
|                                                                       |
| → onUnmounted fires in page                                           |
|                                                                       |
| → store.clearSelected() or store.reset()                              |
|                                                                       |
| → no stale state on next navigation                                   |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **Golden Rules**                                                      |
|                                                                       |
| URL is always the source of truth --- watch props.id, never cache     |
| route state in the store.                                             |
|                                                                       |
| Components never call services directly --- always go through the     |
| store.                                                                |
|                                                                       |
| Stores never import the router --- only the auth store may call       |
| router.push.                                                          |
|                                                                       |
| Services never import Vue or Pinia --- they are framework-agnostic    |
| async functions.                                                      |
|                                                                       |
| Nothing outside a feature imports from inside it --- only from its    |
| index.ts.                                                             |
+-----------------------------------------------------------------------+

*Vue 3 + TypeScript Architecture Reference*
