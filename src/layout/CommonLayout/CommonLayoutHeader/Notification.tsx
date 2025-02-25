
// Mtak Begin
import {useEffect,useState} from "react";
import axios from 'axios';
import { toast } from "react-toastify";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Close, NotificationHeader } from "../../../utils/constant";
import NotificationLists from "./NotificationLists";
// import FriendRequest from "./FriendRequest";
import useOutsideDropdown from "@/utils/useOutsideDropdown";
//constatnts begin
type ApiResponse = {status:number,  data?: any, message: string, error?: string };
const commonAPIPath : string = `${process.env.NEXT_PUBLIC_API_URL as string}/auth`;
const loadNotificationInterval : number = 5000;
//constatnts end
const Notification: React.FC = () => {
  //Hooks Begin
  const { isComponentVisible, ref, setIsComponentVisible } =useOutsideDropdown(false);
  //state begin
  const [notificData,setNotificData] =  useState<any []>([]);
  const [notificCount,setNotificCount] =  useState<any>(null);
  //state end

  //event handler Begin
  const getIncomingNotificationAPI = async(_data : any): Promise<unknown | never> =>{
    let response : unknown = null;
    let url : string | undefined = `${commonAPIPath}/notification/get_incoming_notification`;
    try{
      let _response = await axios.post(url,_data,{
        headers : {
          'Content-Type':'application/json',
        }
      });
      response = {'status': _response.status , ..._response.data};
    }
    catch(error:any){
      throw error;
    }
    finally{
    }
    return response;
  }

  const readNotificationAPI = async(_data : any): Promise<unknown | never> =>{
    let response : unknown = null;
    let url : string | undefined = `${commonAPIPath}/notification/read_notification`;
    try{
      let _response = await axios.post(url,_data,{});
      response = {'status': _response.status , ..._response.data};
    }
    catch(error:any){
      throw error;
    }
    finally{
    }
    return response;
  }

  const handleMarkAsReadMessage = async (e:any,notiId:number , isReadAll : boolean = false)  =>{
    e.stopPropagation();
    try{
      let success_message : string = "";
      let notiIdArr : any = [];
      let formData = new FormData();
      if(!isReadAll)
      {
        success_message = "marked as read";
        notiIdArr = [notiId];
      }
      else{
        success_message = "marked all as read";
        notiIdArr = notificData.map((record:any,index:number)=>{
          return record.id;
        });
      }

      if(notiIdArr?.length)
      {
        formData.append('notiIds',notiIdArr)
        let response : ApiResponse = await readNotificationAPI(formData) as ApiResponse;
        if(response?.status ==  200)
        {
          toast.success(success_message);
        }
      }
    }
    catch(e:any)
    {
    }
  }
  //event handler End
  
  //useEffect begin
  useEffect(()=>{
    let isMounted = true;
    let intervalId : any =  null;
    const loadData  = async () => {
      let _data : any = {'notification':'N','count':'Y'};
      if(isComponentVisible)
      { 
        _data = {..._data,'notification' : 'Y'};
      }
      let notifiData : any[] = [];
      let notifi_count : number = 0;
      try{
        let response : ApiResponse = await getIncomingNotificationAPI(_data) as ApiResponse;
        if(response?.status == 200)
        {
          notifiData = response?.data?.notification ?? [];
          notifi_count = response?.data?.count ?? 0;
        }
      }
      catch(error:any)
      {
      }
      finally{
        setNotificData(notifiData);
        setNotificCount(notifi_count);
      }
    }
    if(isMounted)
    {
      setNotificData([]);
      intervalId = setInterval(()=>{
        loadData();
      },loadNotificationInterval)
    }
    return ()=>{
      clearInterval(intervalId);
      isMounted = false;
    }
  },[isComponentVisible]);

  //useEffect end
  return (
    <>
      <StyleNotificationComponent/>
      <li className="header-btn custom-dropdown dropdown-lg btn-group notification-btn">
        <a  className={`main-link ${isComponentVisible ? "show" : ""}`}>
          <DynamicFeatherIcon iconName="Bell" className="icon-light stroke-width-3 iw-16 ih-16" onClick={() => setIsComponentVisible(!isComponentVisible)}/>
          {
            Boolean(notificCount) &&
            <span className="count warning">{notificCount}</span>
          }
        </a>
        <div id = "NotificationMainDropDown" ref={ref} className={`dropdown-menu dropdown-menu-right ${isComponentVisible ? "show" : ""}`} >
          <div className="dropdown-header">
            <span>{NotificationHeader}</span>
            <div className="mobile-close" onClick={() => setIsComponentVisible(!isComponentVisible)}>
              <h5>{Close}</h5>
            </div>
            <div>
              <button disabled = { !Boolean(notificData.length) } 
                className={`no_style_button ${ Boolean(notificData.length) ? 'text-primary' : 'text-secondary' } fw-bold`} 
                title = {`${Boolean(notificData.length) ? 'mark all as read' : 'nothing to read'}`}
                onClick = { (e) => { handleMarkAsReadMessage(e,0,true) }}
              >
                Read All
              </button>
            </div>
          </div>
          {
            Boolean(notificCount == 0)
            ?
              <div className="text-center text-danger fw-bold px-2 py-2 fs-6">
                No notification
              </div>
            :
            <>
              {
                Boolean(notificData?.length)
                ?
                  <div className="dropdown-content">
                    <ul className="friend-list">
                      <NotificationLists handleMarkAsReadMessage = {handleMarkAsReadMessage} notificData = {notificData} setShowNotification={setIsComponentVisible} />
                    </ul>
                  </div>
                :
                  <div className="text-center text-secondary fw-bold px-2 py-2 fs-6">
                    Loading...
                  </div>
              }
            </>
          }
        </div>
      </li>
    </>
  );
};

const StyleNotificationComponent = () =>{
  return(
    <>
    <style>
        {
          `
            #NotificationMainDropDown .friend-list li
            {
              justify-content: space-between;
              gap:0.2rem;
            }
              
            #NotificationMainDropDown .no_style_button
            {
              cursor: pointer;
              padding: 0;
              margin: 0;
              border: 0;
              line-height: 0;
              background: transparent;
            }

            #NotificationMainDropDown .friend-list .left_div
            {
              flex-grow : 1;
            }

            #NotificationMainDropDown .dropdown-header
            {
              display: flex;
              justify-content: space-between;
            }
          `
        }
      </style>
    </>
  );
}

export default Notification;
