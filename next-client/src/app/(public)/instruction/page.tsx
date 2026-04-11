import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import InstructionComponent from "@/components/instruction-component/InstructionComponent";


const InstructionPage = () => {
    return (
         <div style={{margin: "40px auto", textAlign: "center" }}>
             <ButtonGoBackComponent/>
             <InstructionComponent/>
        </div>
    );
};

export default InstructionPage;