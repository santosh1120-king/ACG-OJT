import httpx
from config import settings


"""Small adapter that lets the rest of the app read and write Supabase tables."""


class SupabaseClient:
    def __init__(self):
        self.url = settings.supabase_url
        self.key = settings.supabase_key
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
        }

    # Start building a database request for one named table, such as `users`.
    def table(self, table_name: str):
        return SupabaseTable(self.url, self.key, self.headers, table_name)


class SupabaseTable:
    """Build one database request step by step before sending it."""
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

    def update(self, data: dict):
        self._update_data = data
        return self

    # Decide whether the built request reads, creates, or changes information.
    def execute(self):
        if hasattr(self, "_insert_data"):
            return self._do_insert()
        if hasattr(self, "_update_data"):
            return self._do_update()
        return self._do_select()

    # Ask Supabase for matching rows and return its JSON response.
    def _do_select(self):
        url = f"{self.url}/rest/v1/{self.table_name}?select={self._select}"
        if self._filters:
            url += "&" + "&".join(self._filters)

        response = httpx.get(url, headers=self.headers)
        response.raise_for_status()
        return SupabaseResponse(response.json())

    # Send new information to Supabase and ask it to return the created row.
    def _do_insert(self):
        url = f"{self.url}/rest/v1/{self.table_name}"
        headers = {**self.headers, "Prefer": "return=representation"}

        response = httpx.post(url, headers=headers, json=self._insert_data)
        response.raise_for_status()
        return SupabaseResponse(response.json())

    # Change matching rows in Supabase and return their new values.
    def _do_update(self):
        url = f"{self.url}/rest/v1/{self.table_name}"
        if self._filters:
            url += "?" + "&".join(self._filters)
        headers = {**self.headers, "Prefer": "return=representation"}
        response = httpx.patch(url, headers=headers, json=self._update_data)
        response.raise_for_status()
        return SupabaseResponse(response.json())


class SupabaseResponse:
    def __init__(self, data):
        self.data = data


supabase_client = SupabaseClient()


def get_supabase() -> SupabaseClient:
    return supabase_client
