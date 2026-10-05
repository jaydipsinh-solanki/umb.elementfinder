var E = Object.defineProperty;
var T = (s) => {
  throw TypeError(s);
};
var U = (s, n, e) => n in s ? E(s, n, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[n] = e;
var d = (s, n, e) => U(s, typeof n != "symbol" ? n + "" : n, e), A = (s, n, e) => n.has(s) || T("Cannot " + e);
var b = (s, n, e) => n.has(s) ? T("Cannot add the same private member more than once") : n instanceof WeakSet ? n.add(s) : n.set(s, e);
var r = (s, n, e) => (A(s, n, "access private method"), e);
import { html as c, nothing as h, css as B } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as R } from "@umbraco-cms/backoffice/lit-element";
import { UMB_AUTH_CONTEXT as v } from "@umbraco-cms/backoffice/auth";
import { UMB_MODAL_CONTEXT as P } from "@umbraco-cms/backoffice/modal";
import { UmbModalRouteRegistrationController as z } from "@umbraco-cms/backoffice/router";
import { UMB_WORKSPACE_MODAL as M } from "@umbraco-cms/backoffice/workspace";
import { UMB_DOCUMENT_ENTITY_TYPE as N, UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN as D } from "@umbraco-cms/backoffice/document";
import { UMB_DOCUMENT_TYPE_ENTITY_TYPE as O, UMB_EDIT_DOCUMENT_TYPE_WORKSPACE_PATH_PATTERN as L } from "@umbraco-cms/backoffice/document-type";
import { UMB_DATA_TYPE_ENTITY_TYPE as Y, UMB_EDIT_DATA_TYPE_WORKSPACE_PATH_PATTERN as j } from "@umbraco-cms/backoffice/data-type";
var a, w, k, C, $, p, m, f, x;
class y extends R {
  constructor() {
    super();
    b(this, a);
    d(this, "_workspaceContext");
    d(this, "_authContext");
    d(this, "_workspaceModalRoute");
    d(this, "_workspaceRouteBuilder");
    this._candidate = void 0, this._loadingFallback = !1, this.consumeContext(v, (e) => {
      this._authContext = e ?? void 0;
    }), this.consumeContext(P, (e) => {
      var o, l;
      const t = e;
      this._workspaceContext = t;
      const i = (l = (o = t == null ? void 0 : t.data) == null ? void 0 : o.preset) == null ? void 0 : l.candidate;
      i ? this._candidate = i : r(this, a, w).call(this);
    }), this._workspaceModalRoute = new z(this, M).addAdditionalPath(":entityType").onSetup((e) => ({
      data: {
        entityType: e.entityType,
        preset: {}
      }
    })).onSubmit(() => {
    }).onReject(() => {
    }).observeRouteBuilder((e) => {
      this._workspaceRouteBuilder = e, this.requestUpdate();
    });
  }
  disconnectedCallback() {
    this._workspaceModalRoute.destroy(), super.disconnectedCallback();
  }
  render() {
    if (this._loadingFallback)
      return c`<div class="loader"><uui-loader></uui-loader></div>`;
    const e = this._candidate;
    if (!e) return h;
    const t = e.usages ?? [], i = t.filter((l) => r(this, a, p).call(this, l)), o = t.filter((l) => !r(this, a, p).call(this, l));
    return c`
      <umb-body-layout headline="Usage — ${e.name}">
        <div id="main">
          <uui-box class="candidate-summary">
            <div slot="headline" class="candidate-headline">
              <span class="candidate-name">${e.name}</span>
              <uui-tag look="outline" class="type-tag">${e.type}</uui-tag>
            </div>
            <p>${e.summary}</p>
            <span class="muted">Review each reference before changing or deleting this item.</span>
          </uui-box>

          <div class="summary-grid" aria-label="Usage summary">
            ${r(this, a, m).call(this, "Total Usages", t.length, "icon-list")}
            ${r(this, a, m).call(this, "Content Usages", i.length, "icon-document")}
            ${r(this, a, m).call(this, "Configurational Usages", o.length, "icon-settings")}
          </div>

          ${t.length === 0 ? c`
                <uui-box class="empty-state">
                  <uui-icon name="icon-search"></uui-icon>
                  <strong>No usage references were detected.</strong>
                  <span class="muted">There are no items available to open.</span>
                </uui-box>
              ` : c`
                <div class="usage-content">
                  ${r(this, a, f).call(this, "Content Usages", "icon-document", i)}
                  ${r(this, a, f).call(this, "Configurational Usages", "icon-settings", o)}
                </div>
              `}
        </div>

        <umb-footer-layout slot="footer">
          <uui-button slot="actions" label="Close" @click=${r(this, a, x)}>Close</uui-button>
        </umb-footer-layout>
      </umb-body-layout>
    `;
  }
}
a = new WeakSet(), w = async function() {
  const e = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i, t = window.location.href.match(e), i = t == null ? void 0 : t[0];
  if (!i) return;
  let o = this._authContext;
  o || (o = await new Promise((l) => {
    const u = this.consumeContext(v, (g) => {
      var _;
      g && ((_ = u == null ? void 0 : u.destroy) == null || _.call(u), l(g));
    });
  })), this._loadingFallback = !0;
  try {
    const l = await o.getLatestToken(), u = await fetch(
      `/umbraco/backoffice/elementfinder/content-cleaner/candidate/${i}`,
      {
        credentials: "include",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${l}`
        }
      }
    );
    u.ok && (this._candidate = await u.json());
  } catch {
  } finally {
    this._loadingFallback = !1;
  }
}, k = function(e) {
  if (!e.key || !this._workspaceRouteBuilder) return;
  let t, i;
  if (e.referenceType === "Content" || e.referenceType === "BlockList" || e.referenceType === "BlockGrid" ? (t = this._workspaceRouteBuilder({ entityType: N }), i = D.generateLocal({ unique: e.key })) : e.referenceType === "DataType" ? (t = this._workspaceRouteBuilder({ entityType: Y }), i = j.generateLocal({ unique: e.key })) : (t = this._workspaceRouteBuilder({ entityType: O }), i = L.generateLocal({ unique: e.key })), !(!t || !i))
    return `${t}${i}`;
}, C = function(e) {
  switch (e.referenceType) {
    case "BlockList":
      return "Content - Block List";
    case "BlockGrid":
      return "Content - Block Grid";
    case "DocumentType":
      return "Document Type";
    case "ElementType":
      return "Element Type";
    case "DataType":
      return "Data Type";
    case "Composition":
      return "Composition";
    default:
      return "Content";
  }
}, $ = function(e) {
  return e.propertyAlias && e.dataTypeName ? `${e.propertyAlias} - ${e.dataTypeName}` : e.propertyAlias ?? e.dataTypeName ?? e.contentTypeAlias ?? "-";
}, p = function(e) {
  return e.referenceType === "Content" || e.referenceType === "BlockList" || e.referenceType === "BlockGrid";
}, m = function(e, t, i) {
  return c`
      <uui-box class="summary-card">
        <div class="summary-card__content">
          <uui-icon name=${i}></uui-icon>
          <div>
            <strong>${t}</strong>
            <span>${e}</span>
          </div>
        </div>
      </uui-box>
    `;
}, f = function(e, t, i) {
  return i.length === 0 ? h : c`
      <uui-box class="usage-group">
        <div slot="headline" class="usage-group__headline">
          <uui-icon name=${t}></uui-icon>
          <span>${e}</span>
        </div>
        <span slot="header-actions">
          <uui-tag color="default">${i.length}</uui-tag>
        </span>

        <div class="table-wrap" role="region" aria-label="${e} table" tabindex="0">
          <uui-table>
            <uui-table-head>
              <uui-table-head-cell>Name</uui-table-head-cell>
              <uui-table-head-cell>Type</uui-table-head-cell>
              <uui-table-head-cell>Reference</uui-table-head-cell>
              <uui-table-head-cell class="action-cell">Action</uui-table-head-cell>
            </uui-table-head>

            ${i.map((o) => {
    const l = r(this, a, k).call(this, o), u = r(this, a, p).call(this, o) ? "Open" : "View";
    return c`
                <uui-table-row>
                  <uui-table-cell>
                    <strong>${o.name}</strong>
                    ${o.contentTypeAlias ? c`<div class="muted">${o.contentTypeAlias}</div>` : h}
                  </uui-table-cell>
                  <uui-table-cell>${r(this, a, C).call(this, o)}</uui-table-cell>
                  <uui-table-cell>${r(this, a, $).call(this, o)}</uui-table-cell>
                  <uui-table-cell class="action-cell">
                    ${l ? c`
                          <uui-button
                            look="primary"
                            label=${u}
                            .href=${l}>
                            ${u}
                          </uui-button>
                        ` : c`<span class="muted">Unavailable</span>`}
                  </uui-table-cell>
                </uui-table-row>
              `;
  })}
          </uui-table>
        </div>
      </uui-box>
    `;
}, x = function() {
  var e;
  (e = this._workspaceContext) == null || e.reject();
}, d(y, "properties", {
  _candidate: { state: !0 },
  _loadingFallback: { state: !0 }
}), d(y, "styles", B`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    #main {
      display: grid;
      gap: var(--uui-size-space-5);
      padding: var(--uui-size-layout-1);
    }

    .candidate-headline {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-2);
      flex-wrap: wrap;
    }

    .candidate-name {
      font-size: var(--uui-type-h5-size);
      font-weight: 700;
    }

    .type-tag {
      --uui-tag-color: #000000;
      font-weight: 600;
    }

    .candidate-summary p {
      margin: 0 0 var(--uui-size-space-1);
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: var(--uui-size-space-3);
    }

    .summary-card__content {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-3);
    }

    .summary-card__content div {
      display: grid;
      gap: var(--uui-size-space-1);
    }

    .summary-card__content strong {
      font-size: var(--uui-type-h4-size);
    }

    .summary-card__content span,
    .muted {
      color: var(--uui-color-text-alt);
    }

    .usage-content {
      display: grid;
      gap: var(--uui-size-space-5);
    }

    .usage-group__headline {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-2);
      font-size: var(--uui-type-h5-size);
      font-weight: 700;
    }

    .table-wrap {
      overflow-x: auto;
    }

    .action-cell {
      width: 1%;
      text-align: right;
      white-space: nowrap;
    }

    .empty-state {
      display: grid;
      justify-items: center;
      gap: var(--uui-size-space-2);
      padding: var(--uui-size-layout-2);
      text-align: center;
    }

    @media (max-width: 800px) {
      .summary-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    .loader {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: var(--uui-size-layout-2);
    }
  `);
customElements.define("umb-content-cleaner-usage-workspace", y);
export {
  y as default
};
