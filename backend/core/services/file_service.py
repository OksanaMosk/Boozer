import os
from uuid import uuid1


def upload_venue_photo(instance, filename: str) -> str:
    ext = filename.split('.')[-1]
    venue_id = instance.venue.id
    return os.path.join(f'venues/{venue_id}/photos', f'{uuid1()}.{ext}')