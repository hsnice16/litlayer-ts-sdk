/**
 *
 * @class RequiredError
 * @extends {Error}
 */
export class InvalidParameterError extends Error {
   readonly name: string = "RequiredError";

   constructor(public field: string, msg?: string) {
      super(msg || `Field '${field}' is required.`);
   }
}

/**
 * Custom error for HTTP-related issues (e.g., network errors, non-2xx status codes).
 */
export class HttpError extends Error {
   readonly name: string = "HttpError";

   /**
    * @param {number} status The HTTP status code.
    * @param {string} message An error message.
    * @param {Response} [response] The original Response object, if available.
    */
   constructor(
      public status: number,
      message: string,
      public response?: Response
   ) {
      super(message);
   }
}

/**
 * Custom error for issues reported by the Litlayer API (e.g., success: false responses).
 */
export class LitlayerApiError extends Error {
   readonly name: string = "LitlayerApiError";

   /**
    * @param {number} code The API-specific error code.
    * @param {string} apiMessage The error message from the API.
    * @param {any} [responseData] The full response data from the API, if available.
    */
   constructor(
      public code: number,
      public apiMessage: string,
      public responseData?: any
   ) {
      super(`API Error Code: ${code} - ${apiMessage}`);
   }
}
