import { LitElement, html } from "lit";
import "./download/image-download";

class AppRoot extends LitElement {
  override render() {
    return html`
      <image-download></image-download>
    `;
  }
}
customElements.define("app-root", AppRoot);
