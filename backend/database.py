import httpx
from config import settings


class SupabaseClient:
    def __init__(self):
        self.url = settings.supabase_url
        self.key = settings.supabase_key
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
        }

    def table(self, table_name: str):
        return SupabaseTable(self.url, self.key, self.headers, table_name)


class SupabaseTable:
    def __init__(self, url, key, headers, table_name):
        self.url = url
        self.key = key
        self.headers = headers
        self.table_name = table_name
        self._filters = []
        self._select = "*"

    def select(self, columns: str = "*"):
        self._select = columns
        return self

    def eq(self, column: str, value: str):
        self._filters.append(f"{column}=eq.{value}")
        return self

    def insert(self, data: dict):
        self._insert_data = data
        return self

    def execute(self):
        if hasattr(self, "_insert_data"):
            return self._do_insert()
        return self._do_select()

    def _do_select(self):
        url = f"{self.url}/rest/v1/{self.table_name}?select={self._select}"
        if self._filters:
            url += "&" + "&".join(self._filters)

        response = httpx.get(url, headers=self.headers)
        response.raise_for_status()
        return SupabaseResponse(response.json())

    def _do_insert(self):
        url = f"{self.url}/rest/v1/{self.table_name}"
        headers = {**self.headers, "Prefer": "return=representation"}

        response = httpx.post(url, headers=headers, json=self._insert_data)
        response.raise_for_status()
        return SupabaseResponse(response.json())


class SupabaseResponse:
    def __init__(self, data):
        self.data = data


supabase_client = SupabaseClient()


def get_supabase() -> SupabaseClient:
    return supabase_client
