def normalize_suburb(value: str) -> str:
    return " ".join(value.strip().lower().split())


def canonical_suburb(suburb: str) -> str:
    normalized_suburb = normalize_suburb(suburb)
    if not normalized_suburb:
        return ""
    return normalized_suburb.title()
