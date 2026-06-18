# Fix 4 Broken AI Tools — Frontend Rewrite Plan

## Context
The 4 AI tools (Contract Builder, Expense Calculator, Skill Analyzer, Scope Planner) have frontend-backend mismatches causing dropdowns to be empty and results to never display. The approach is to rewrite the **frontend** components to match the existing backend APIs.

## Strategy
For each tool: (a) fix dropdown rendering, (b) fix request field names/defaults, (c) map backend response to the frontend's internal display types, (d) keep the existing UI styling/display logic intact.

---

## 1. Contract Builder (`frontend/app/components/ContractBuilder/ContractBuilder.tsx`)

**Problems:**
- `ContractOptions` interface types `contract_types`/`jurisdictions` as `Record<string, string>` but backend returns arrays
- Dropdown iterates `Object.entries(options.contract_types)` which produces wrong values for arrays
- Form sends `party_a_name/party_b_name/total_value/scope_description` but backend expects `client_name/freelancer_name/total_amount/project_description`
- Default `contract_type: 'freelance_service'` should be `'service_agreement'`; `jurisdiction: 'us_federal'` should be `'US'`
- Response: frontend reads `result.document` + `result.analysis`, backend returns `result.contract` + `result.risk_analysis` + `result.completeness`
- Clause checkbox uses `clause.id`/`clause.title` but backend returns `clause.key`/`clause.label`

**Changes:**
1. Update `ContractOptions` interface to use arrays
2. Fix dropdowns: `options.contract_types.map(ct => ...)` with `ct.key` as value, `ct.label` as text
3. Rename formData fields to match backend Pydantic model
4. Update defaults to valid backend values
5. Map response: `result.document` → `result.contract`, `result.analysis.completeness_score` → `result.completeness.score`, `result.analysis.risk_level` → `result.risk_analysis.overall_risk`
6. Fix clause checkbox: `clause.key` as id, `clause.label` as display text

**Files:** `frontend/app/components/ContractBuilder/ContractBuilder.tsx`

---

## 2. Expense Calculator (`frontend/app/ai/expense-calculator/ExpenseTaxCalculator.tsx`)

**Problems:**
- Frontend sends `region` + `gross_income` + `expenses` dict; backend expects `country` + `annual_income` + `deductions` list
- Frontend `TaxResult` interface expects deeply nested response (`gross_business_income`, `se_tax_deduction`, `profit_margin`, etc.); backend returns flat simple structure
- Frontend `us_state` dropdown uses lowercase 'us' but backend checks `req.state != "none"`

**Changes:**
1. In `handleSubmit` body construction: send `country` instead of `region`, `annual_income` instead of `gross_income`, convert `deductions` dict to `deductions` list of `[{category, amount}]`
2. Rewrite `TaxResult` interface to match backend response structure
3. Rewrite `ResultsDashboard` component to render the actual backend response fields:
   - `result.income.gross_annual`, `result.income.gross_monthly`
   - `result.taxes.self_employment_tax`, `result.taxes.federal_income_tax`, `result.taxes.state_tax`, `result.taxes.total_tax`, `result.taxes.effective_rate`, `result.taxes.marginal_rate`
   - `result.quarterly.estimated_payment`, `result.quarterly.due_dates`
   - `result.net_income.annual`, `result.net_income.monthly`, `result.net_income.weekly`
   - `result.profit_loss.revenue`, `result.profit_loss.expenses`, `result.profit_loss.net_profit`
   - `result.deductions.total`, `result.deductions.items`, `result.deductions.taxable_income`
   - `result.recommendations[].type`, `result.recommendations[].detail`
4. Fix `us_state` value to use uppercase state codes ('CA', 'NY', etc.)

**Files:** `frontend/app/ai/expense-calculator/ExpenseTaxCalculator.tsx`

---

## 3. Skill Analyzer (`frontend/app/ai/skill-analyzer/SkillAnalyzer.tsx`)

**Problems:**
- Frontend sends `country_code` field which backend ignores (minor, no functionality impact)
- Backend response `skills_analyzed[]` has `skill`, `category`, `proficiency`, `market_demand` — frontend expects `demand_score`, `demand_trend`, `your_estimated_rate`, etc.
- Backend `synergies[]` has `skills`, `synergy`, `strength` — frontend expects `label`, `skills_present`, `current_match`, `total`, `rate_premium`
- Backend `skill_gaps[]` has `skill`, `demand`, `supply`, `competition_ratio`, `opportunity_score` — frontend expects `label`, `category`, `demand_score`, `learn_time_months`, `potential_rate_increase`, etc.
- Backend `recommendations[]` has `type`, `skill`, `detail`, `priority` — frontend expects `title`, `description`

**Changes:**
1. Remove `country_code` from request body
2. Rewrite `AnalysisResult` interface and `ResultsDashboard` to match backend response:
   - `profile_score.score/level/label` — already matches
   - `skills_analyzed`: use `skill` as name, derive demand display from `market_demand` field
   - `synergies`: use `synergy` as label, `skills` as skills list, `strength` as progress
   - `skill_gaps`: use `skill` as name, `opportunity_score` as priority indicator, `demand`/`supply`/`competition_ratio` as stats
   - `recommendations`: use `type` as title, `detail` as description, `priority` as badge
   - `estimated_rate`: already matches

**Files:** `frontend/app/ai/skill-analyzer/SkillAnalyzer.tsx`

---

## 4. Scope Planner (`frontend/app/ai/scope-planner/ScopePlanner.tsx`)

**Problems:**
- Frontend sends `project_name`, `category: 'web_app'`, `complexity: 'moderate'`; backend expects `project_type: 'web_development'`, `complexity: 'medium'`
- Frontend sends `team_members`, `deliverables` — backend only accepts `features`
- Backend response is simpler: `timeline.phases[].duration_weeks` not `weeks`, no `resources.allocation`, no `risks[].title/message`, no `project.name/multiplier`
- Frontend `PlanResult` interface expects fields not in backend response

**Changes:**
1. In `handleSubmit`: map `category` → `project_type`, map complexity labels (`'simple'`→`'simple'`, `'moderate'`→`'medium'`, `'complex'`→`'complex'`, `'enterprise'`→`'enterprise'`), remove unsupported fields from body
2. Rewrite `PlanResult` interface and `ResultsDashboard` to match backend response:
   - `project.type/complexity/budget/timeline_weeks` — use for hero display
   - `timeline.phases[].name/duration_weeks/deliverables/status` — render timeline
   - `budget.labor_cost/risk_buffer/total_estimated/team_breakdown/phase_budgets` — render budget
   - `resources.team_size/total_hours/hourly_rate` — render resources
   - `risks[].risk/probability/impact/mitigation` — render risks
   - `features[].name/priority` — render features
   - `completeness.score/level/missing` — render completeness
   - `recommendations[].type/detail` — render recommendations

**Files:** `frontend/app/ai/scope-planner/ScopePlanner.tsx`

---

## Verification
1. Start backend: `cd backend && python -m uvicorn main:app --reload --port 8000`
2. Start frontend: `cd frontend && npm run dev`
3. Test each tool:
   - Contract Builder: verify dropdowns populate, generate contract shows result
   - Expense Calculator: fill income/expenses, verify tax breakdown displays
   - Skill Analyzer: select skills, verify analysis results display
   - Scope Planner: fill project details, verify plan results display
4. Run `npm run build` in frontend to check for TypeScript errors
