import { LitElement, css, html } from "lit";
import { property } from 'lit/decorators.js';

export class MyButton extends LitElement {
  static override styles = css`
    button {
      padding: 8px 12px;
      font-size: 14px;
      border-radius: 6px;
    }
  `;

  @property({ type: String }) label = "Click me";

  override render() {
    return html`<button @click=${this._onClick}>${this.label}</button>`;
  }

  private _onClick() {
    this.dispatchEvent(new CustomEvent("my-button-click"));
  }
}

customElements.define("my-button", MyButton);
