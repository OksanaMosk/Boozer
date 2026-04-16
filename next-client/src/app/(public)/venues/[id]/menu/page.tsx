import { ButtonGoBackComponent } from "@/components/button-go-back-component/ButtonGoBackComponent";
import { ButtonScrollTopComponent } from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import MenuVisitorComponent from "@/components/menu-visitor-component/MenuVisitorComponent";
import {Metadata} from "next";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    return {
        title: `Menu Venue ${id} | Boozer`,
        description: `Menu for Venue #${id} on Boozer.`,
    };
}
export default async function MenuPage({ params }: Props) {
  const { id } = await params;

  return (
    <div style={{ fontWeight: "bolder", margin: "40px auto", textAlign: "center" }}>
      <ButtonGoBackComponent />
           <MenuVisitorComponent venueId={ id }/>
      <ButtonScrollTopComponent />
    </div>
  );
}