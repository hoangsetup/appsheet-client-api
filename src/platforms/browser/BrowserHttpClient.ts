export async function fetchPost<T>(
  url: string,
  applicationAccessKey: string,
  data?: unknown,
): Promise<T> {
  const response = await fetch(
    url,
    {
      method: 'POST',
      headers: {
        ApplicationAccessKey: applicationAccessKey,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : null,
    }
  );

  const json = await response.json();

  if (response.status === 200) {
    return json.Rows ?? json;
  }

  throw new Error(`${json.Message}. HttpStatus: ${response.status}`)
}

