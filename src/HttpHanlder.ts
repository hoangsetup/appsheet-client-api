export type HttpHandler = <T>(url: string, applicationAccessKey: string, data?: unknown) => Promise<T>
