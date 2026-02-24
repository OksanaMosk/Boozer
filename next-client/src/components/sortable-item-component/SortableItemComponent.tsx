import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./SortableItemComponent.module.css"

interface MenuItemProps {
  item: {
    id: number | string;
    name: string;
    price: number | string;
    description?: string;
    currency: string;
    preview?: string | null;
    photo_menu_item?: string;
  };
  onDelete: () => void | Promise<void>;
  isOverlay?: boolean;
}

const SortableMenuItem = ({ item, onDelete, isOverlay }: MenuItemProps) => {
const getPhotoUrl = (preview?: string | null, photo_menu_item?: string) => {
  const photo = preview || photo_menu_item;
  if (!photo) return "/images/noPoster.png";
  return photo.startsWith("http") ? photo : `http://localhost:8888${photo}`;
};

const photoUrl = getPhotoUrl(item.preview, item.photo_menu_item);

  if (isOverlay) {
    return (
      <div className={`${styles.itemsArray} ${styles.overlay}`}>
        <div>
          <strong>{item.name}</strong>
          <p>{item.price} {item.currency}</p>
          <p>{item.description}</p>
        </div>

          {(item.preview || item.photo_menu_item) && (
              <img
                  src={photoUrl}
                  width={100}
                  height={70}
                  alt={item.name}
                  className={styles.photoImage}
              />
          )}
      </div>
    );
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={styles.photoArray}
    >
      <div>
        <strong>{item.name}</strong>
        <p>{item.price} {item.currency}</p>
          <p>{item.description}</p>
      </div>

        {(item.preview || item.photo_menu_item) && (
            <img
                src={photoUrl}
                width={100}
                height={70}
                alt={item.name}
                className={styles.photoImage}
            />
        )}

        <div>
        <button onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
};

export default SortableMenuItem;

