import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("image-download")
export class ImageDownload extends LitElement {
  @state() isSubmitting = false;

  static override styles = css`
    :host {
      display: block;
      padding: 16px;
      max-width: 600px;
    }

    input,
    textarea {
      width: 100%;
      padding: 8px;
      margin: 8px 0;
      font-size: 1rem;
    }

    button {
      padding: 10px 16px;
      cursor: pointer;
      font-size: 1rem;
    }
  `;

  async handleSubmit() {
    this.isSubmitting = true;
    const zipInput = this.renderRoot.querySelector("input.zip") as HTMLInputElement;
    const textareaUrls = this.renderRoot.querySelector("textarea.urls") as HTMLTextAreaElement;

    const zipName = zipInput.value;
    const urls = textareaUrls.value.split("\n");
    const urlList = urls.map((u) => u.trim()).filter((u) => u.length > 0);

    if (!zipName || urlList.length === 0) {
      alert("Please provide zip name and at least one URL.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls: urlList,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      // Convert response stream → Blob
      const blob = await response.blob();

      // Build a temporary download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${zipName}.zip`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download ZIP");
    } finally {
      this.isSubmitting = false;
    }
  }

  override render() {
    return html`
      <h2>Download Images as ZIP</h2>

      <form>
        <label>ZIP Name</label>
        <input class="zip" type="text" placeholder="images-pack" />

        <label>Image URLs (one per line)</label>
        <textarea class="urls" rows="8" placeholder="https://example.com/image1.jpg"></textarea>

        <button ?disabled=${this.isSubmitting} @click="${this.handleSubmit}">Download ZIP</button>
      </form>
    `;
  }
}
