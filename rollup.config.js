import commonjs from "rollup-plugin-commonjs";
import nodeResolve from "rollup-plugin-node-resolve";

export default {
  input: "src/handler.js",
  external: [
    "aws-sdk",
    // Aunque estas van a ser tratadas como externas por node-resolve ya que en
    // la configuración usamos `preferBuiltins: true`, si no las incluimos
    // acá se va generar una advertencia del tipo: (!) Unresolved dependencies
    "url",
    "https",
    "tty",
    "util",
    "os"
  ],
  output: {
    file: "dist/handler.js",
    format: "cjs",
    moduleName: "trm"
  },
  plugins: [
    nodeResolve({
      // incluimos esta opción para hacer explícito que no queremos incluir
      // módulos de nodejs como `url` o `http`. Por defecto el valor de esta
      // opción es `true` pero si no lo hacemos explícitamente se generan
      // advertencias del tipo:
      // preferring built-in module 'url' over local alternative, pass 'preferBuiltins: false' to disable this behavior or 'preferBuiltins: true' to disable this warning
      preferBuiltins: true
    }),
    commonjs()
  ]
};
