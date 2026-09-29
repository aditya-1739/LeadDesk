import json
import os
import sys
import urllib.error
import urllib.request

API_BASE_URL = os.getenv("API_BASE_URL", "https://leaddesk-ageb.onrender.com")

SEED_LEADS = [
    {
        
        "name": "Rahul Sharma",
        "location": "Noida",
        "propertyRequirement": "3 BHK apartment near a metro station",
        "budget": "₹1.2 crore",
        "buyingTimeline": "Within 3 months",
        "customerMessage": "I am actively looking for a 3 BHK near the metro. I would like to visit some properties this weekend.",
    },
    {
        "name": "Priya Mehta",
        "location": "Gurugram",
        "propertyRequirement": "2 BHK apartment near a metro station with parking",
        "budget": "₹85 lakh",
        "buyingTimeline": "Within 6 months",
        "customerMessage": "I am comparing a few 2 BHK options in Gurugram. I prefer something close to the metro and need dedicated parking. Please share some suitable properties.",
    },
    {
        "name": "Amit Verma",
        "location": "Pune",
        "propertyRequirement": "2 BHK apartment in a family-friendly area",
        "budget": "₹70 lakh",
        "buyingTimeline": "6 to 12 months",
        "customerMessage": "We are planning to move to Pune next year and are exploring 2 BHK apartments. We are still comparing locations and prices.",
    },
    {
        "name": "Neha Kapoor",
        "location": "Bengaluru",
        "propertyRequirement": "1 BHK apartment close to an IT corridor",
        "budget": "₹55 lakh",
        "buyingTimeline": "More than 12 months",
        "customerMessage": "I may buy a 1 BHK in Bengaluru in the future. For now I am mainly researching prices and neighborhoods.",
    },
    {
        "name": "Arjun Singh",
        "location": "Jaipur",
        "propertyRequirement": "Independent house",
        "budget": "₹90 lakh",
        "buyingTimeline": "Not decided",
        "customerMessage": "Just checking what kind of independent houses are available in Jaipur. I haven't decided when I would buy.",
    },
]


def seed_leads():
    endpoint = f"{API_BASE_URL}/api/leads"
    print(f"Seeding {len(SEED_LEADS)} leads into: {endpoint}")
    print("Note: Each script execution creates a new set of leads.\n")

    for i, lead in enumerate(SEED_LEADS, start=1):
        payload = json.dumps(lead).encode("utf-8")
        req = urllib.request.Request(
            endpoint,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                print(
                    f"[{i}/{len(SEED_LEADS)}] {data['name']} -> "
                    f"HTTP {resp.status} | "
                    f"Score: {data['priorityScore']} ({data['priorityLabel']}) | "
                    f"ID: {data['id']}"
                )
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            print(f"Failed to seed {lead['name']}: HTTP {e.code} - {err_body}", file=sys.stderr)
            sys.exit(1)
        except Exception as e:
            print(f"Failed to seed {lead['name']}: {e}", file=sys.stderr)
            sys.exit(1)

    print("\nAll 5 seed leads processed successfully.")


if __name__ == "__main__":
    seed_leads()
