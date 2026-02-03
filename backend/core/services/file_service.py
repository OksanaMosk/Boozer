import os
from uuid import uuid1


def upload_car_photo(instance, filename: str) -> str:
    ext = filename.split('.')[-1]
    car_id = instance.car.id
    return os.path.join(f'cars/{car_id}/photos', f'{uuid1()}.{ext}')