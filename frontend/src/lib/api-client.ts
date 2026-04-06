const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  return handleResponse<T>(res);
}

export async function apiPost<TReq, TRes>(
  path: string,
  body: TReq,
  init?: RequestInit,
): Promise<TRes> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
  });
  return handleResponse<TRes>(res);
}

export async function apiPut<TReq, TRes>(
  path: string,
  body: TReq,
  init?: RequestInit,
): Promise<TRes> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
  });
  return handleResponse<TRes>(res);
}
export async function apiDelete<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  // Vissa DELETE endpoints returnerar tom body (204)
  if (res.status === 204) {
    return undefined as T;
  }

  return handleResponse<T>(res);
}

export async function deleteProject(projectId: number): Promise<void> {
  await apiDelete<void>(`/projects/${projectId}`);
}
