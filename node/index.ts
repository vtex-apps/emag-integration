import type { ClientsConfig, ServiceContext } from "@vtex/api";
import { LRUCache, Service } from "@vtex/api";
import { mapObjIndexed } from "ramda";
import { method } from "@vtex/api";

import { Clients } from "./clients";
// import { mutations, queries } from "./resolvers";
// import { getConfig } from "./routes/getConfig";
// import { getConnectorConfig } from "./routes/getConnectorConfig";

import { readDBLogs } from "./routes/masterData";
import { getMapping, saveMapping } from "./routes/mapper";
import { install } from "./routes/install";
import { productNotify } from "./routes/productNotify";
import { syncEmagProducts } from "./routes/syncEmagProducts";
import { getProductNotifications } from "./routes/getProductNotifications";
import { orderNotify } from "./routes/orderNotify";
import { orderStatusChange } from "./routes/orderStatusChange";

const prepare = (resolver: any) =>
  async function prepareContext(ctx: Context, next: () => Promise<any>) {
    ctx.set("cache-control", "no-cache");
    ctx.set("type", "application/json");

    return resolver(ctx, next);
  };

const TIMEOUT_MS = 800;

// Create a LRU memory cache for the Status client.
// The @vtex/api HttpClient respects Cache-Control headers and uses the provided cache.
const memoryCache = new LRUCache<string, any>({ max: 5000 });

metrics.trackCache("status", memoryCache);

// This is the configuration for clients available in `ctx.clients`.
const clients: ClientsConfig<Clients> = {
  // We pass our custom implementation of the clients bag, containing the Status client.
  implementation: Clients,
  options: {
    // All IO Clients will be initialized with these options, unless otherwise specified.
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
  },
};

declare global {
  // We declare a global Context type just to avoid re-writing ServiceContext<Clients, State> in every handler and resolver
  type Context = ServiceContext<Clients>;
}

// Export a service that defines route handlers and client options.
export default new Service({
  clients,
  // graphql: {
  //   resolvers: {
  //     Query: {
  //       ...queries,
  //     },
  //     Mutation: {
  //       ...mutations,
  //     },
  //   },
  // },
  routes: {
    ...mapObjIndexed(prepare, {
      install: method({
        GET: install,
      }),
      // getConfig: method({
      //   GET: getConfig,
      // }),
      // getConnectorConfig: method({
      //   GET: getConnectorConfig,
      // }),
      syncEmagProducts: method({
        GET: syncEmagProducts,
      }),
      mapping: method({
        POST: saveMapping,
        GET: getMapping,
      }),
      productNotify: method({
        POST: productNotify,
        GET: getProductNotifications,
      }),
      orderNotify: method({
        POST: orderNotify,
      }),
      orderStatusChange: method({
        POST: orderStatusChange,
      }),
      readDBLogs: method({
        GET: readDBLogs,
      }),
    }),
  },
});
