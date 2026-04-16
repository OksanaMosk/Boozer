import MenuItemsCreateComponent from "@/components/menu-items-create-component/MenuItemsCreateComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import {Metadata} from "next";

interface Props {
    params: Promise<{ id: string; menuId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id, menuId } = await params;

    return {
        title: `Manage Items • Menu ${menuId} | Venue ${id} | Boozer`,
        description: `Create and manage items for menu ${menuId}.`,
        robots: {
            index: false,
            follow: false,
        },
    };
}
export default async function MenuItemsPage({ params }: Props) {
  const { id: venueId, menuId } = await params;

  return (
    <div>
        <ButtonGoBackComponent/>
           <MenuItemsCreateComponent venueId={venueId} menuId={menuId} />
        <ButtonScrollTopComponent/>
    </div>
  );
}