import {VenuesClientComponent} from "@/components/venues-client-component/VenuesClientComponent";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: "Venues | Boozer",
    description: "Explore all available venues on Boozer.",
};

const VenuesPage = () => {
  return (
    <div style={{
      textAlign: 'center',
    }}>
        <ButtonGoBackComponent/>
        <VenuesClientComponent/>
        <ButtonScrollTopComponent/>
    </div>
  );
};

export default VenuesPage;


