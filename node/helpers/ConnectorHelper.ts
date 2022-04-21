import { Apps, IOContext } from "@vtex/api";

export function getAppSettings(ctx: IOContext): Promise<AppSettings> {
  return new Promise((resolve, reject) => {
    const apps = new Apps(ctx);
    return apps
      .getAppSettings("vtex.emag-connector")
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
