export async function openProtectedFile(fetchFile, onError) {
  const previewWindow = window.open("about:blank", "_blank");

  try {
    const { blob, mimeType } = await fetchFile();
    const fileBlob = mimeType && blob.type !== mimeType
      ? new Blob([blob], { type: mimeType })
      : blob;
    const objectUrl = URL.createObjectURL(fileBlob);

    if (previewWindow) {
      previewWindow.location.href = objectUrl;
    } else {
      const link = document.createElement("a");
      link.href = objectUrl;
      link.target = "_blank";
      link.rel = "noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
  } catch (error) {
    if (previewWindow) {
      previewWindow.close();
    }

    onError?.(error);
  }
}
