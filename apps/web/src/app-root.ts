import { LitElement, html } from "lit";
import "ui-components/my-button"; // import the built UI bundle (works when built) or the source registered custom element

class AppRoot extends LitElement {
  override render() {
    return html`
      <h1>Hello — Lit in a Bun monorepo!</h1>
      <my-button label="Hello from monorepo"></my-button>
    `;
  }
}
customElements.define("app-root", AppRoot);
