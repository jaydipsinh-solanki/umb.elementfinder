var J = Object.defineProperty;
var z = (c) => {
  throw TypeError(c);
};
var V = (c, l, e) => l in c ? J(c, l, { enumerable: !0, configurable: !0, writable: !0, value: e }) : c[l] = e;
var p = (c, l, e) => V(c, typeof l != "symbol" ? l + "" : l, e), X = (c, l, e) => l.has(c) || z("Cannot " + e);
var E = (c, l, e) => l.has(c) ? z("Cannot add the same private member more than once") : l instanceof WeakSet ? l.add(c) : l.set(c, e);
var s = (c, l, e) => (X(c, l, "access private method"), e);
import { nothing as g, html as r, css as Y } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as Q } from "@umbraco-cms/backoffice/lit-element";
import { UMB_AUTH_CONTEXT as Z } from "@umbraco-cms/backoffice/auth";
import { umbConfirmModal as R } from "@umbraco-cms/backoffice/modal";
import { UMB_NOTIFICATION_CONTEXT as ee } from "@umbraco-cms/backoffice/notification";
import { UmbModalRouteRegistrationController as te } from "@umbraco-cms/backoffice/router";
import { UMB_WORKSPACE_MODAL as ae } from "@umbraco-cms/backoffice/workspace";
const f = "/umbraco/backoffice/elementfinder/content-cleaner", se = "content-cleaner-usage", ie = 12e4;
var t, $, A, w, C, y, v, U, D, K, B, L, M, P, S, I, j, N, W, q, O, H, b, k, ne, T, F;
class x extends Q {
  constructor() {
    super();
    E(this, t);
    p(this, "_authContext");
    p(this, "_notificationContext");
    p(this, "_initialLoadStarted", !1);
    p(this, "_candidateRequestId", 0);
    p(this, "_selectedUsageCandidate");
    p(this, "_usageWorkspaceRoute");
    p(this, "_usageWorkspacePathBuilder");
    this._items = [], this._summary = void 0, this._loading = !0, this._error = "", this._search = "", this._type = "all", this._risk = "all", this._page = 1, this._pageSize = 20, this._total = 0, this._scannedAt = void 0, this._sortBy = "name", this._sortDirection = "asc", this._selectedKeys = /* @__PURE__ */ new Set(), this.consumeContext(Z, (e) => {
      if (!e) {
        this._error = "Umbraco authentication context is unavailable.", this._loading = !1;
        return;
      }
      this._authContext = e, this._initialLoadStarted || (this._initialLoadStarted = !0, s(this, t, w).call(this));
    }), this.consumeContext(ee, (e) => {
      this._notificationContext = e;
    }), this._usageWorkspaceRoute = new te(this, ae).addAdditionalPath(":candidateKey").onSetup((e) => {
      const a = this._items.find((i) => i.key === e.candidateKey) ?? this._selectedUsageCandidate;
      return {
        data: {
          entityType: se,
          preset: { candidate: a }
        }
      };
    }).onSubmit(() => {
    }).onReject(() => {
    }).observeRouteBuilder((e) => {
      this._usageWorkspacePathBuilder = e, this.requestUpdate();
    });
  }
  disconnectedCallback() {
    this._usageWorkspaceRoute.destroy(), super.disconnectedCallback();
  }
  render() {
    const e = Math.max(1, Math.ceil(this._total / this._pageSize));
    return r`
      <div id="main">
        <uui-box headline="Content model analysis">
          <p>
            Find unused or potentially obsolete Umbraco configuration and review its dependencies before cleanup.
          </p>

            <div class="toolbar">
              <uui-button look="primary" label="Run scan" @click=${s(this, t, A)} ?disabled=${this._loading}>
                Run scan
              </uui-button>

              ${this._scannedAt ? r`<span class="muted">Last scan: ${new Date(this._scannedAt).toLocaleString()}</span>` : g}
            </div>
          </uui-box>

          ${this._summary ? r`
                <div class="summary-grid">
                  ${s(this, t, b).call(this, "Total analyzed", this._summary.totalItems, "icon-search")}
                  ${s(this, t, b).call(this, "Low risk", this._summary.lowRisk, "icon-check")}
                  ${s(this, t, b).call(this, "Moderate", this._summary.moderate, "icon-shield")}
                  ${s(this, t, b).call(this, "Review", this._summary.review, "icon-alert")}
                  ${s(this, t, b).call(this, "High risk", this._summary.highRisk, "icon-stop-alt")}
                </div>
              ` : g}

          <uui-box headline="Cleanup candidates">
            <div class="filters">
              <uui-input
                label="Search"
                placeholder="Search by name or alias"
                .value=${this._search}
                @input=${(a) => this._search = a.target.value}
                @keydown=${s(this, t, B)}>
              </uui-input>

              <uui-select
                label="Type"
                .options=${[
      { name: "All types", value: "all", selected: this._type === "all" },
      { name: "Document Type", value: "Document Type", selected: this._type === "Document Type" },
      { name: "Element Type", value: "Element Type", selected: this._type === "Element Type" },
      { name: "Property", value: "Property", selected: this._type === "Property" },
      { name: "Data Type", value: "Data Type", selected: this._type === "Data Type" }
    ]}
                @change=${s(this, t, U)}>
              </uui-select>

              <uui-select
                label="Risk"
                .options=${[
      { name: "All risks", value: "all", selected: this._risk === "all" },
      { name: "Low", value: "Low", selected: this._risk === "Low" },
      { name: "Moderate", value: "Moderate", selected: this._risk === "Moderate" },
      { name: "Review", value: "Review", selected: this._risk === "Review" },
      { name: "High", value: "High", selected: this._risk === "High" }
    ]}
                @change=${s(this, t, D)}>
              </uui-select>

              <div class="filter-actions">
                <uui-button look="primary" label="Search" @click=${s(this, t, v)}>Search</uui-button>
                <uui-button look="secondary" label="Clear" @click=${s(this, t, K)}>Clear</uui-button>
              </div>
            </div>

            ${this._error ? r`<uui-box class="error-box"><uui-icon name="icon-alert"></uui-icon> ${this._error}</uui-box>` : g}

            ${this._loading ? r`<div class="loader"><uui-loader></uui-loader></div>` : r`
                  <div class="table-wrap">
                    ${this._selectedKeys.size > 0 ? r`
                          <div class="selection-bar">
                            <span><strong>${this._selectedKeys.size}</strong> candidate(s) selected</span>
                            <div class="selection-actions">
                              <uui-button
                                compact
                                look="outline"
                                color="danger"
                                label="Delete selected"
                                @click=${s(this, t, W)}>
                                <uui-icon name="icon-trash"></uui-icon> Delete selected (${this._selectedKeys.size})
                              </uui-button>
                              <uui-button
                                compact
                                look="secondary"
                                label="Clear selection"
                                @click=${() => {
      this._selectedKeys = /* @__PURE__ */ new Set();
    }}>
                                Clear
                              </uui-button>
                            </div>
                          </div>
                        ` : g}

                    <uui-table>
                      <uui-table-head>
                        <uui-table-head-cell class="checkbox-head-cell">
                          <uui-checkbox
                            .checked=${s(this, t, S).call(this)}
                            .indeterminate=${s(this, t, I).call(this)}
                            @change=${s(this, t, j)}
                            label="Select all candidates">
                          </uui-checkbox>
                        </uui-table-head-cell>
                        ${s(this, t, k).call(this, "Name", "name")}
                        ${s(this, t, k).call(this, "Type", "type")}
                        ${s(this, t, k).call(this, "Usage Count", "usage")}
                        ${s(this, t, k).call(this, "Risk", "risk")}
                        <uui-table-head-cell>Details</uui-table-head-cell>
                        <uui-table-head-cell class="usage-head-cell">Usage</uui-table-head-cell>
                        <uui-table-head-cell class="action-head-cell">Action</uui-table-head-cell>
                      </uui-table-head>

                      ${this._items.map((a) => {
      var i;
      return r`
                          <uui-table-row ?selected=${this._selectedKeys.has(a.key)}>
                            <uui-table-cell class="checkbox-cell">
                              <uui-checkbox
                                .checked=${this._selectedKeys.has(a.key)}
                                @change=${(n) => s(this, t, N).call(this, a.key, n)}
                                label="Select ${a.name}">
                              </uui-checkbox>
                            </uui-table-cell>
                            <uui-table-cell>
                              <strong>${a.name}</strong>
                              <div class="muted">${a.alias}</div>
                            </uui-table-cell>
                            <uui-table-cell>${a.type}</uui-table-cell>
                            <uui-table-cell class="usage-count-cell">${s(this, t, O).call(this, a)}</uui-table-cell>
                            <uui-table-cell>
                              <uui-tag class=${a.risk === "Moderate" ? "risk-moderate" : ""} color=${s(this, t, P).call(this, a.risk)}>${a.risk}</uui-tag>
                            </uui-table-cell>
                            <uui-table-cell>
                              <div>${a.summary}</div>
                            </uui-table-cell>
                            <uui-table-cell class="usage-cell-action">
                              ${(i = a.usages) != null && i.length ? r`
                                    <uui-button
                                      compact
                                      look="secondary"
                                      label="View usage"
                                      .href=${s(this, t, T).call(this, a)}
                                      @click=${(n) => s(this, t, F).call(this, n, a)}>
                                      View usage
                                    </uui-button>
                                  ` : r`<span class="muted">-</span>`}
                            </uui-table-cell>
                            <uui-table-cell class="action-cell">
                              <uui-button
                                compact
                                look="outline"
                                color="danger"
                                label="Delete ${a.name}"
                                title="Delete ${a.name}"
                                @click=${() => s(this, t, q).call(this, a)}>
                                <uui-icon name="icon-trash"></uui-icon>
                              </uui-button>
                            </uui-table-cell>
                          </uui-table-row>
                        `;
    })}
                    </uui-table>

                    ${this._items.length === 0 ? r`
                          <div class="empty-state">
                            <uui-icon name="icon-search"></uui-icon>
                            <span>No cleanup candidates match the selected filters.</span>
                          </div>
                        ` : g}
                  </div>
                `}
          </uui-box>

          ${this._loading ? g : s(this, t, H).call(this, e)}
        </div>
    `;
  }
}
t = new WeakSet(), $ = async function(e) {
  if (!this._authContext)
    throw new Error("Umbraco authentication context is unavailable.");
  const a = await this._authContext.getLatestToken(), i = new AbortController(), n = globalThis.setTimeout(() => i.abort(), ie);
  let o;
  try {
    o = await fetch(e, {
      credentials: "include",
      signal: i.signal,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${a}`
      }
    });
  } catch (d) {
    throw d instanceof DOMException && d.name === "AbortError" ? new Error("The Content Cleaner request timed out. Please try Run scan again.") : d;
  } finally {
    globalThis.clearTimeout(n);
  }
  if (!o.ok)
    throw new Error(`Request failed (${o.status})`);
  return o.json();
}, A = async function() {
  this._loading = !0, this._error = "";
  let e = !1;
  try {
    const a = await s(this, t, $).call(this, `${f}/scan`);
    this._page = 1, s(this, t, C).call(this, a), e = !0;
  } catch (a) {
    this._error = a instanceof Error ? a.message : "Unable to run the analysis.";
  } finally {
    this._loading = !1;
  }
  e && s(this, t, y).call(this, !1);
}, w = async function() {
  this._loading = !0, this._error = "";
  let e = !1;
  try {
    const a = await s(this, t, $).call(this, `${f}/snapshot`);
    s(this, t, C).call(this, a), e = !0;
  } catch (a) {
    this._error = a instanceof Error ? a.message : "Unable to load the latest analysis.";
  } finally {
    this._loading = !1;
  }
  e && s(this, t, y).call(this, !1);
}, C = function(e) {
  const a = e.items ?? [];
  this._summary = e.summary, this._scannedAt = e.scannedAtUtc, this._items = a.slice(0, this._pageSize), this._total = a.length, this._selectedKeys = /* @__PURE__ */ new Set();
}, y = async function(e = !0) {
  const a = ++this._candidateRequestId;
  e && (this._loading = !0), this._error = "";
  try {
    const i = new URLSearchParams({
      skip: String((this._page - 1) * this._pageSize),
      take: String(this._pageSize),
      search: this._search,
      type: this._type,
      risk: this._risk,
      sortBy: this._sortBy,
      sortDirection: this._sortDirection
    }), n = await s(this, t, $).call(this, `${f}/candidates?${i}`);
    if (a !== this._candidateRequestId) return;
    this._items = n.items ?? [], this._total = n.total ?? 0, this._scannedAt = n.scannedAtUtc, this._selectedKeys = /* @__PURE__ */ new Set();
    const o = Math.max(1, Math.ceil(this._total / this._pageSize));
    this._page > o && (this._page = o, await s(this, t, y).call(this, e));
  } catch (i) {
    if (a !== this._candidateRequestId) return;
    this._error = i instanceof Error ? i.message : "Unable to load cleanup candidates.";
  } finally {
    e && a === this._candidateRequestId && (this._loading = !1);
  }
}, v = function() {
  this._page = 1, s(this, t, y).call(this);
}, U = function(e) {
  this._type = e.target.value, s(this, t, v).call(this);
}, D = function(e) {
  this._risk = e.target.value, s(this, t, v).call(this);
}, K = function() {
  this._search = "", this._type = "all", this._risk = "all", this._page = 1, s(this, t, y).call(this);
}, B = function(e) {
  e.key === "Enter" && (e.preventDefault(), s(this, t, v).call(this));
}, L = function(e) {
  var n, o;
  const a = e.target, i = Number(((n = e.detail) == null ? void 0 : n.pageNumber) ?? ((o = e.detail) == null ? void 0 : o.page) ?? a.current);
  !Number.isFinite(i) || i < 1 || i === this._page || (this._page = i, s(this, t, y).call(this));
}, M = function(e) {
  this._sortBy === e ? this._sortDirection = this._sortDirection === "asc" ? "desc" : "asc" : (this._sortBy = e, this._sortDirection = "asc"), this._page = 1, s(this, t, y).call(this);
}, P = function(e) {
  switch (e) {
    case "Low":
      return "positive";
    case "Moderate":
      return "default";
    case "Review":
      return "warning";
    case "High":
      return "danger";
    default:
      return "default";
  }
}, S = function() {
  return this._items.length > 0 && this._items.every((e) => this._selectedKeys.has(e.key));
}, I = function() {
  return this._items.some((e) => this._selectedKeys.has(e.key)) && !s(this, t, S).call(this);
}, j = function(e) {
  const a = e.target.checked, i = new Set(this._selectedKeys);
  for (const n of this._items)
    a ? i.add(n.key) : i.delete(n.key);
  this._selectedKeys = i;
}, N = function(e, a) {
  const i = a.target.checked, n = new Set(this._selectedKeys);
  i ? n.add(e) : n.delete(e), this._selectedKeys = n;
}, W = async function() {
  var o, d;
  const e = this._items.filter((u) => this._selectedKeys.has(u.key));
  if (e.length === 0) return;
  const a = e.length, n = e.some((u) => {
    var h;
    return (((h = u.usages) == null ? void 0 : h.length) ?? u.usageCount) > 0;
  }) ? " Warning: Some selected items have detected usages. Deleting them may impact existing content or configuration." : "";
  try {
    await R(this, {
      headline: `Delete ${a} item${a === 1 ? "" : "s"}`,
      content: `Are you sure you want to delete the ${a} selected cleanup candidate${a === 1 ? "" : "s"}?${n} This action cannot be undone.`,
      color: "danger",
      confirmLabel: "Delete"
    });
  } catch {
    return;
  }
  this._loading = !0;
  try {
    if (!this._authContext)
      throw new Error("Umbraco authentication context is unavailable.");
    const u = await this._authContext.getLatestToken(), h = {
      items: e.map((m) => ({ key: m.key, type: m.type }))
    }, _ = await fetch(`${f}/batch-delete`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${u}`
      },
      body: JSON.stringify(h)
    });
    if (!_.ok) {
      const m = await _.json().catch(() => ({}));
      throw new Error(m.message || `Request failed (${_.status})`);
    }
    (o = this._notificationContext) == null || o.peek("positive", {
      data: { message: `Successfully deleted ${a} item${a === 1 ? "" : "s"}.` }
    }), this._selectedKeys = /* @__PURE__ */ new Set(), await s(this, t, w).call(this);
  } catch (u) {
    const h = u instanceof Error ? u.message : "Unable to delete selected items.";
    (d = this._notificationContext) == null || d.peek("danger", {
      data: { message: h }
    }), this._error = h;
  } finally {
    this._loading = !1;
  }
}, q = async function(e) {
  var o, d, u;
  const a = (((o = e.usages) == null ? void 0 : o.length) ?? e.usageCount) > 0, i = e.usages && e.usages.length > 0 ? e.usages.length : e.usageCount, n = a ? ` Warning: This item has ${i} detected usage(s). Deleting it may impact existing content or configuration.` : "";
  try {
    await R(this, {
      headline: `Delete ${e.type}`,
      content: `Are you sure you want to delete ${e.type.toLowerCase()} "${e.name}"?${n} This action cannot be undone.`,
      color: "danger",
      confirmLabel: "Delete"
    });
  } catch {
    return;
  }
  this._loading = !0;
  try {
    if (!this._authContext)
      throw new Error("Umbraco authentication context is unavailable.");
    const h = await this._authContext.getLatestToken(), _ = new URLSearchParams({ type: e.type }), m = await fetch(`${f}/candidate/${e.key}?${_}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${h}`
      }
    });
    if (!m.ok) {
      const G = await m.json().catch(() => ({}));
      throw new Error(G.message || `Request failed (${m.status})`);
    }
    (d = this._notificationContext) == null || d.peek("positive", {
      data: { message: `${e.type} "${e.name}" was successfully deleted.` }
    }), await s(this, t, w).call(this);
  } catch (h) {
    const _ = h instanceof Error ? h.message : "Unable to delete item.";
    (u = this._notificationContext) == null || u.peek("danger", {
      data: { message: _ }
    }), this._error = _;
  } finally {
    this._loading = !1;
  }
}, O = function(e) {
  var o, d;
  const a = ((o = e.usages) == null ? void 0 : o.filter((u) => u.referenceType === "Content" || u.referenceType === "BlockList" || u.referenceType === "BlockGrid").length) ?? 0, i = (((d = e.usages) == null ? void 0 : d.length) ?? 0) - a, n = e.usages && e.usages.length > 0 ? a + i : e.usageCount;
  return e.usages && e.usages.length > 0 && (a > 0 || i > 0) ? r`
        <div class="usage-count-tags">
          ${a > 0 ? r`
                <uui-tag look="outline">
                  <span class="usage-count-tag-content">
                    <span class="usage-count-culture">Content</span>
                    <span class="usage-count-value">${a}</span>
                  </span>
                </uui-tag>
              ` : g}
          ${i > 0 ? r`
                <uui-tag look="outline">
                  <span class="usage-count-tag-content">
                    <span class="usage-count-culture">Config</span>
                    <span class="usage-count-value">${i}</span>
                  </span>
                </uui-tag>
              ` : g}
        </div>
      ` : n === 0 ? r`<span class="muted">-</span>` : r`
      <div class="usage-count-tags">
        <uui-tag look="outline">
          <span class="usage-count-tag-content">
            <span class="usage-count-value">${n}</span>
          </span>
        </uui-tag>
      </div>
    `;
}, H = function(e) {
  return e <= 1 ? g : r`
      <div class="pagination-wrapper">
        <uui-pagination
          label="Cleanup candidates pages"
          .total=${e}
          .current=${this._page}
          @change=${s(this, t, L)}>
        </uui-pagination>
      </div>
    `;
}, b = function(e, a, i) {
  return r`
      <uui-box class="summary-card">
        <div class="summary-card__content">
          <uui-icon name=${i}></uui-icon>
          <div>
            <div class="summary-card__value">${a}</div>
            <div class="summary-card__label">${e}</div>
          </div>
        </div>
      </uui-box>
    `;
}, k = function(e, a) {
  const i = this._sortBy === a, n = i ? this._sortDirection === "asc" ? "ascending" : "descending" : "none";
  return r`
      <uui-table-head-cell aria-sort=${n} style="white-space: nowrap;">
        <uui-button
          compact
          look="default"
          label="Sort by ${e}"
          @click=${() => s(this, t, M).call(this, a)}>
          <span>${e}</span>
          ${i ? r`<uui-icon name=${this._sortDirection === "asc" ? "icon-navigation-up" : "icon-navigation-down"}></uui-icon>` : g}
        </uui-button>
      </uui-table-head-cell>
    `;
}, ne = function(e) {
  const a = e.usages.filter((o) => o.referenceType === "Content" || o.referenceType === "BlockList" || o.referenceType === "BlockGrid").length, i = e.usages.length - a, n = [];
  return a > 0 && n.push(`${a} content usage${a === 1 ? "" : "s"}`), i > 0 && n.push(`${i} configuration usage${i === 1 ? "" : "s"}`), n.join(" / ");
}, T = function(e) {
  if (!(!e.key || !this._usageWorkspacePathBuilder))
    return this._usageWorkspacePathBuilder({ candidateKey: e.key });
}, F = function(e, a) {
  if (!s(this, t, T).call(this, a)) {
    e.preventDefault();
    return;
  }
  this._selectedUsageCandidate = a;
}, p(x, "properties", {
  _items: { state: !0 },
  _summary: { state: !0 },
  _loading: { state: !0 },
  _error: { state: !0 },
  _search: { state: !0 },
  _type: { state: !0 },
  _risk: { state: !0 },
  _page: { state: !0 },
  _pageSize: { state: !0 },
  _total: { state: !0 },
  _scannedAt: { state: !0 },
  _sortBy: { state: !0 },
  _sortDirection: { state: !0 },
  _selectedKeys: { state: !0 }
}), p(x, "styles", Y`
    :host {
      display: block;
      box-sizing: border-box;
      padding: var(--uui-size-layout-1);
    }

    #main {
      display: grid;
      gap: var(--uui-size-space-5);
    }

    p {
      margin-top: 0;
    }

    .toolbar,
    .filter-actions,
    .usage-actions {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-3);
    }

    .toolbar {
      justify-content: space-between;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: var(--uui-size-space-4);
    }

    .summary-card__content {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-4);
    }

    .summary-card__value {
      font-size: var(--uui-type-h4-size);
      font-weight: 700;
    }

    .summary-card__label,
    .muted {
      color: var(--uui-color-text-alt);
    }

    .filters {
      display: grid;
      grid-template-columns: minmax(220px, 2fr) minmax(170px, 1fr) minmax(170px, 1fr) auto;
      gap: var(--uui-size-space-3);
      align-items: end;
      margin-bottom: var(--uui-size-space-4);
    }

    .table-wrap {
      overflow-x: auto;
    }

    .loader,
    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .loader,
    .empty-state {
      gap: var(--uui-size-space-3);
      padding: var(--uui-size-layout-2);
    }

    .error-box {
      margin-bottom: var(--uui-size-space-4);
    }

    .usage-actions {
      flex-wrap: wrap;
      margin-top: var(--uui-size-space-2);
    }

    .pagination-wrapper {
      display: block;
      width: 100%;
      padding-top: var(--uui-size-space-4);
    }

    .pagination-wrapper uui-pagination {
      display: inline-flex;
      width: 100%;
    }

    .usage-count-cell {
      text-align: center;
    }

    .usage-count-tags {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--uui-size-space-2);
    }

    .usage-count-tags uui-tag {
      --uui-color-default-standalone: var(--uui-color-border-standalone);
      --uui-tag-border-radius: 999px;
      --uui-tag-padding: var(--uui-size-space-1) var(--uui-size-space-2);
      box-sizing: border-box;
      width: auto;
    }

    .usage-count-tag-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--uui-size-space-2);
      width: 100%;
      white-space: nowrap;
      line-height: 1;
    }

    .usage-count-culture {
      color: var(--uui-color-text-alt);
      font-weight: 700;
    }

    .usage-count-value {
      display: inline-flex;
      flex: 0 0 auto;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      width: auto;
      min-width: var(--uui-size-6);
      min-height: var(--uui-size-6);
      padding: var(--uui-size-space-1) var(--uui-size-space-2);
      border-radius: 999px;
      background: #eaeaea;
      color: var(--uui-color-text);
      font-weight: 700;
    }

    .risk-moderate {
      --uui-tag-background-color: #e0f2fe;
      --uui-tag-color: #0369a1;
      border: 1px solid #7dd3fc;
      font-weight: 600;
    }

    .checkbox-head-cell,
    .checkbox-cell,
    .usage-head-cell,
    .usage-cell-action,
    .action-head-cell,
    .action-cell {
      width: 1%;
      text-align: center;
      white-space: nowrap;
    }

    .selection-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--uui-size-space-3);
      padding: var(--uui-size-space-3) var(--uui-size-space-4);
      background-color: var(--uui-color-surface-emphasis);
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius);
      margin-bottom: var(--uui-size-space-4);
    }

    .selection-actions {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-2);
    }

    @media (max-width: 900px) {
      .filters {
        grid-template-columns: 1fr;
      }

      .toolbar {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `);
customElements.define("umb-content-cleaner-dashboard", x);
export {
  x as default
};
