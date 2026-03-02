import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface FormCollectionItem {
  name: string;
  links: string;
}

@customElement("form-collections")
export class FormCollections extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .form-block {
      display: flex;
      flex-direction: column;
      border: 1px solid #ddd;
      padding: 12px;
      margin-bottom: 16px;
      border-radius: 6px;

      position: relative;
    }

    .index {
      position: absolute;
      top: 8px;
      right: 16px;
    }

    input,
    textarea {
      padding: 8px;
      margin: 6px 0;
      font-size: 1rem;
    }

    button {
      padding: 6px 12px;
      font-size: 0.9rem;
      cursor: pointer;
      margin-right: 6px;
    }

    .actions {
      margin-top: 8px;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      margin-top: 16px;
    }
  `;

  @property({ type: String })
  name = "";

  /**
   * Controlled value property
   */
  @property({ type: Array })
  value: FormCollectionItem[] = [{ name: "", links: "" }];

  @property({ type: Boolean })
  disabled = false;

  public reset() {
    this.value = [{ name: "", links: "" }];
  }

  private updateForm<K extends keyof FormCollectionItem>(index: number, field: K, fieldValue: FormCollectionItem[K]) {
    const updated = [...this.value];

    const item = updated[index];
    if (!item) return;

    updated[index] = {
      ...item,
      [field]: fieldValue,
    } as FormCollectionItem;

    this.value = updated;
  }

  private async addForm() {
    const newIndex = this.value.length;

    this.value = [...this.value, { name: "", links: "" }];

    await this.updateComplete;

    const el = this.renderRoot.querySelector(`#form-${newIndex}`) as HTMLElement | null;

    el?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  private removeForm(index: number) {
    if (this.value.length <= 1) return;

    this.value = this.value.filter((_, i) => i !== index);
  }

  private submit() {
    this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true }));
  }

  override render() {
    return html`
      ${this.value.map(
        (form, index) => html`
          <div class="form-block" id="form-${index}">
            <div class="index">${index + 1}</div>
            <label>Name</label>
            <input
              type="text"
              placeholder="Name"
              .value=${form.name || this.name}
              ?disabled=${this.disabled}
              @input=${(e: Event) => this.updateForm(index, "name", (e.target as HTMLInputElement).value)}
            />

            <label>Links</label>
            <textarea
              rows="8"
              placeholder="https://example.com/image.jpg"
              .value=${form.links}
              ?disabled=${this.disabled}
              @input=${(e: Event) => this.updateForm(index, "links", (e.target as HTMLTextAreaElement).value)}
            ></textarea>

            <div class="actions">
              ${this.value.length > 1 ? html` <button type="button" ?disabled=${this.disabled} @click=${() => this.removeForm(index)}>Remove</button> ` : null}
            </div>
          </div>
        `,
      )}

      <div class="footer">
        <button type="button" ?disabled=${this.disabled} @click=${this.addForm}>+ Add</button>
        <button type="button" ?disabled=${this.disabled} @click=${this.submit}>Download</button>
      </div>
    `;
  }
}
