/** Preload hook: Next's `server-only` package throws outside the bundler; stub it for CLI scripts. */
const Module = require("module");
const orig = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "server-only") return {};
  return orig.apply(this, arguments);
};
