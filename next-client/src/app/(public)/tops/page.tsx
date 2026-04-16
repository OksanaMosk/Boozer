import { ButtonGoBackComponent } from "@/components/button-go-back-component/ButtonGoBackComponent";
import { ButtonScrollTopComponent } from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import TopStaffListComponent from "@/components/top-staff-list-component/TopStaffListComponent";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: "TOPs | Boozer",
    description: "Explore TOPs on Boozer.",
};

const TopsPage = () => {
    return (
        <div style={{
            margin: '80px auto'
        }}>
            <ButtonGoBackComponent/>
            <TopStaffListComponent/>
            <ButtonScrollTopComponent/>
        </div>
    )
}

export default TopsPage;