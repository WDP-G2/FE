export class HttpError extends Error {
  constructor(message, { status, data } = {}) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.data = data
  }
}

export async function parseResponse(response) {
  const contentType = response.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const message =
      (typeof data === 'object' && data?.message) ||
      response.statusText ||
      'Request failed'

    throw new HttpError(message, { status: response.status, data })
  }

  return data
}
