import React from "react";
import MenuItemsCreateComponent from "@/components/menu-items-create-component/MenuItemsCreateComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";


export default async function MenuItemsPage({ params }: { params: { id: string; menuId: string } }) {
  const { id: venueId, menuId } = await params;

  return (
    <div>
        <ButtonGoBackComponent/>
      <MenuItemsCreateComponent venueId={venueId} menuId={menuId} />
        <ButtonScrollTopComponent/>
    </div>
  );
}