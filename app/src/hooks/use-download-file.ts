import { saveAs } from "file-saver";
import { useCallback } from "react";

import { generateFileUrl } from "lib/helper";

function _getExtension(headers: Headers): string {
  const contentDisposition = headers.get("Content-disposition");

  if (!contentDisposition) {
    return "";
  }

  const splitted = contentDisposition.split(".");

  if (splitted.length <= 1) {
    return "";
  }

  return splitted.pop() ?? "";
}

const useDownloadFile = (token?: string) =>
  useCallback(
    (fileId: string, name: string): void => {
      if (!token) {
        return;
      }

      const fileUrl = generateFileUrl(fileId);

      fetch(fileUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(async (res) => ({
          blob: await res.blob(),
          ext: _getExtension(res.headers),
        }))
        .then(({ blob, ext }) => saveAs(blob, name + (ext ? "." + ext : "")));
    },
    [token]
  );

export default useDownloadFile;
