import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./form-collections";
import type { FormCollectionItem, FormCollections } from "./form-collections";

@customElement("image-download")
export class ImageDownload extends LitElement {
  @state() isSubmitting = false;

  static override styles = css`
    :host {
      display: block;
      padding: 16px;
      max-width: 600px;
    }

    button {
      padding: 10px 16px;
      cursor: pointer;
      font-size: 1rem;
    }
  `;

  private async download(name: string, urls: string[]) {
    if (!name || urls.length === 0) {
      throw new Error("Invalid name or empty URL list");
    }

    const response = await fetch("http://localhost:8000/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls }),
    });

    if (!response.ok) {
      throw new Error("Failed to download file");
    }

    const blob = await response.blob();
    const fileUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = `${name}.zip`;
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(fileUrl);
  }

  /**
   * Sequential download handler
   */
  private async handleSubmit(e: CustomEvent<FormCollectionItem[]>) {
    this.isSubmitting = true;

    const formCollections = this.renderRoot.querySelector("form-collections") as FormCollections;

    const collections = formCollections.value;

    try {
      // Sequential loop (IMPORTANT: await inside loop)
      for (const item of collections) {
        const name = item.name.trim();
        const urls = item.links
          .split("\n")
          .map((u) => u.trim())
          .filter((u) => u.length > 0);

        await this.download(name, urls);
      }

      formCollections.reset()
    } catch (err) {
      console.error(err);
      alert("Failed to download one of the ZIP files.");
    } finally {
      this.isSubmitting = false;
    }
  }

  override render() {
    return html`
      <h2>Download</h2>

      <form-collections
        name=""
        ?disabled=${this.isSubmitting}
        @change=${this.handleSubmit}
      ></form-collections>
    `;
  }
}