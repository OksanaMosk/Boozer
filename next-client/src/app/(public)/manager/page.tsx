"use client";
import ManagerDashboardComponent from "@/components/manager-dashboard-component/ManagerDashboardComponent";
import {GoBackButtonComponent} from "@/components/go-back-button-component/GoBackButtonComponent";

const Page = () => {
    return (
        <div style={{
            fontWeight: 'bolder',
            margin: '40px auto',
            textAlign: 'center',
            width: '100%'
        }}>

            <GoBackButtonComponent/>
            <ManagerDashboardComponent/>

        </div>
    )
}
export default Page;