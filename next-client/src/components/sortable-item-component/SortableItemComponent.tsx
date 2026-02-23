import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./SortableItemComponent.module.css"

interface MenuItemProps {
    item: {
        id: number | string;
        name: string;
        price: number | string;
        currency: string;
        preview?: string | null;
    };
      onDelete: () => void | Promise<void>;
}

const SortableMenuItem = ({ item , onDelete }:MenuItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={styles.photoArray}>
            <div>
                <strong>{item.name}</strong>
                <p>{item.price} {item.currency}</p>
            </div>
            {item.preview && <img src={item.preview} width={100} height={70} alt="" className={styles.photoImage}/>}

            <div>
                <span>{item.name}</span>
                <button onClick={onDelete}>Delete</button>
            </div>
        </div>
    );
};

export default SortableMenuItem;