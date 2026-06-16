import requests

BACKEND_URL = "http://localhost:8001"
SUBDOMAIN = "testcorp"

def test_crud():
    print("Testing GET documents...")
    res = requests.get(f"{BACKEND_URL}/api/tenant/{SUBDOMAIN}/documents")
    assert res.status_code == 200, f"GET failed: {res.status_code} {res.text}"
    initial_docs = res.json()
    print("Initial documents:", initial_docs)

    print("\nTesting POST document...")
    payload = {
        "filename": "return_policy.txt",
        "content": "Our return policy allows items to be returned within 30 days of purchase.",
        "file_size": 71
    }
    res = requests.post(f"{BACKEND_URL}/api/tenant/{SUBDOMAIN}/documents", json=payload)
    assert res.status_code == 200, f"POST failed: {res.status_code} {res.text}"
    new_doc = res.json()
    print("Created document:", new_doc)
    doc_id = new_doc["id"]
    assert new_doc["filename"] == "return_policy.txt"
    assert new_doc["file_size"] == 71

    print("\nTesting GET documents after create...")
    res = requests.get(f"{BACKEND_URL}/api/tenant/{SUBDOMAIN}/documents")
    assert res.status_code == 200
    docs = res.json()
    print("Documents after create:", docs)
    assert len(docs) == len(initial_docs) + 1
    assert any(d["id"] == doc_id for d in docs)

    print("\nTesting DELETE document...")
    res = requests.delete(f"{BACKEND_URL}/api/tenant/{SUBDOMAIN}/documents/{doc_id}")
    assert res.status_code == 200, f"DELETE failed: {res.status_code} {res.text}"
    print("Deleted document status:", res.json())

    print("\nTesting GET documents after delete...")
    res = requests.get(f"{BACKEND_URL}/api/tenant/{SUBDOMAIN}/documents")
    assert res.status_code == 200
    docs_after = res.json()
    print("Documents after delete:", docs_after)
    assert len(docs_after) == len(initial_docs)
    assert not any(d["id"] == doc_id for d in docs_after)

    print("\n✅ All Documents API CRUD operations verified successfully!")

if __name__ == "__main__":
    test_crud()
