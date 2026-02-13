search_terms = ["Product Group", "Item Group", "Item Setup"]
with open("docs/synapse_concepts_extracted.txt", "r", encoding="utf-8") as f:
    for i, line in enumerate(f, 1):
        for term in search_terms:
            if term.lower() in line.lower():
                print(f"{i}: {line.strip()}")
