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
  if (!photo) return "/images/noPosterMenu.webp";
  return photo.startsWith("http") ? photo : `http://localhost:8888${photo}`;
};




const photoUrl = getPhotoUrl(item.preview, item.photo_menu_item);

  if (isOverlay) {
    return (
      <div className={`${styles.item} ${styles.sortableOverlay} ${styles.overlayItem}`}>
              <div className={styles.plate}>
                 <img src={photoUrl || "/images/noPosterMenu.webp"}
                  width={100}
                  height={70}
                  alt={item.name}
                  className={styles.photoImage}
              />
              </div>
        <div className={styles.itemDetail}>
          <strong className={styles.title}>{item.name}</strong>
            <p className={styles.about}>{item.description}</p>
          <p className={styles.price}>{item.price}  -  {item.currency}</p>

        </div>
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
      className={styles.item}
    >
            <div className={styles.plate}>
                    <img src={photoUrl || "/images/noPosterMenu.webp"}
                    alt={item.name}
                    className={styles.photoImage}
                />
            </div>
      <div className={styles.itemDetail}>
        <strong className={styles.title}>{item.name}</strong>
          <p className={styles.about}>{item.description}</p>
          <p className={styles.price}>{item.price}  -  {item.currency}</p>
      </div>
            <button
                onClick={onDelete}
                className={styles.deleteButton}
            >Delete
            </button>
    </div>
  );
};

export default SortableMenuItem;

