import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import InstructionComponent from "@/components/instruction-component/InstructionComponent";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: "Instruction | Boozer",
    description: "Instruction on Boozer.",
};

const InstructionPage = () => {
    return (
         <div style={{margin: "40px auto", textAlign: "center" }}>
             <ButtonGoBackComponent/>
             <InstructionComponent/>
        </div>
    );
};

export default InstructionPage;