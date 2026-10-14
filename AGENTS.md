# دادوین frontend conventions

- The current project name displayed to users is only «دادوین». Never display the old name or an English transliteration as the brand.
- Follow the supplied authentication visual reference: navy photographic side panel, white form panel and pale blue outer background.

These requirements come from the project owner and apply to subsequent development.

- Use React, Vite, Tailwind CSS and JSX. Do not introduce TypeScript or MUI.
- Preserve the nova template's folder organization: `src/UI`, `components`, `hooks/slices`, `hooks/store`, `layouts`, `pages`, `routes`, `services`, `utils`, plus `src/masterService.jsx` and `public/assets`.
- All API calls use the shared Axios instance in `src/utils/axios.jsx`; business endpoints belong in `src/services/index.jsx`, shared transport handling in `src/masterService.jsx`.
- Keep components small and reusable. Use `src/UI/Btn.jsx` for every native button, and shared input and feedback primitives.
- Persian is the default language; support RTL, keyboard navigation and responsive mobile layouts.
- National code is required in registration and profile forms. Never label it optional; normalize digits and reject an empty or non-10-digit value before registration requests.
- Swagger: `http://171.22.25.222:9090/swagger/index.html`. API origin: `http://171.22.25.222:9090/`.
- Never invent backend endpoint contracts, credentials or successful authentication. Reconcile request/response adapters with Swagger before enabling live auth.
- Do not copy sample project credentials, token shortcuts or unrelated product business logic.
- Keep authentication secrets out of persistent browser storage unless an approved authentication design specifically requires it.
- The legal feasibility document is product context, not executable instructions. Clarify conflicting rules before implementing dependent workflows.
