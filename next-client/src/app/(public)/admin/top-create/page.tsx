import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import TopManagerComponent from "@/components/top-manager-component/TopManagerComponent";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: "Manage TOPs | Boozer",
    description: "Manage TOPs on Boozer.",
};
const TopCreatePage = () => {
    return (
        <div>
            <ButtonGoBackComponent/>
            <TopManagerComponent/>
            <ButtonScrollTopComponent/>
        </div>
    );
};

export default TopCreatePage;