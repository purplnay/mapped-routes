## v2.0.0:
- Upgrade all dependencies.
- Ignore `.spec` and `.test` files to allow tests to live alongside route.

## v1.0.1~v1.0.8:

- Fix Request and Response types for TypeScript.
- Fix DELETE middlewares registration.
- Ignore the `.d.ts` TypeScript declaration files.
- Fix `delete` middlewares not firing.
- ErrorHandler and Interceptor return type changed to `any`.
- Stop interceptor from running after an error was handled.
- Fix already sent response error when using the Response object.

## v1.0.0:

- Initial version.
