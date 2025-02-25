"use client";

import { FC, useEffect, useState } from "react";
import { getLoggedInUserInfo } from "@/libs/user/getLoggedInUserInfo";
import DefaultDashboard from "@/components/Dashboard/DefaultDashboard";
import NewUserDashboard from "@/components/Dashboard/NewUserDashboard";
import LoadingLoader from "@/layout/LoadingLoader";

const Dashboard: FC = () => {

  const [userInfo, setUserInfo] = useState({yb_cnt : 0});
  const [isLoadedUserInfo, setIsLoadedUserInfo] = useState(false);
  
  useEffect(() => {
    const loadUserInfo = async () => {
      
      const info = await getLoggedInUserInfo();
      
      if(info && (info.length??0)) {

        setUserInfo((prev:any) => {

          return {...prev, ...info[0] };
        });

        setIsLoadedUserInfo(true);
      }
    };
    
    if(!isLoadedUserInfo) {

      loadUserInfo();
    }
  
  },[isLoadedUserInfo]);

  const reloadDashboard = (reload_status:any) => {

    if(reload_status) {

      setIsLoadedUserInfo(false);
    }
  }; 

  return (
    <>
    <LoadingLoader />
    {
      isLoadedUserInfo ?
      (userInfo?.yb_cnt > 0 ? <DefaultDashboard/> : <NewUserDashboard userDetails={userInfo} reloadDashboard={reloadDashboard} />)
      : null   
    }
    </>
  ); 

};

export default Dashboard;
