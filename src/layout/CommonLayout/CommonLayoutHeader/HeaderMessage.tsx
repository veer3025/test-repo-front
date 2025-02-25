// Mtak Begin
import { useEffect , useState } from "react";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Close, Href,  Messages } from "../../../utils/constant";
// import RightOption from "./RightOption";
// import { Input } from "reactstrap";
import { toast } from "react-toastify";
import UserMessage from "./UserMessage";
import useOutsideDropdown from "@/utils/useOutsideDropdown";
//my imports
import {getChatNotificationAPI,readIncomingChatsAPI,ApiResponse} from "@/layout/client_api/chat_box_common/api";
const loginDiffSeconds = 20;
const loadChatNotificationInterval : number = 5000;
const HeaderMessage: React.FC = () => {
  //hooks
  const { isComponentVisible, ref, setIsComponentVisible } = useOutsideDropdown(false);
  //state begin
  const [notiFicChats , setNotiFicChats] = useState<any[]>([]);
  const [notiFicChatsCount,setNotiFicChatsCount] =  useState<any>(null);
  //state end
  //event handler begin
  const handleShowMessageDropDown = (e:any) =>{
    e.stopPropagation();
    setIsComponentVisible((prev)=>{
      return !prev;
    });
  }

  const handleMarkAsReadMessage = async (chatId:number , isReadAll : boolean = false)  =>{
    try{
      let success_message : string = "";
      let chatIdArr : any = [];
      let formData = new FormData();
      if(!isReadAll)
      {
        success_message = "marked as read";
        chatIdArr = [chatId];
      }
      else{
        success_message = "marked all as read";
        chatIdArr = notiFicChats.map((record:any,index:number)=>{
          return record.id;
        });
      }

      if(chatIdArr?.length)
      {
        formData.append('chatIds',chatIdArr)
        let response : ApiResponse = await readIncomingChatsAPI(formData) as ApiResponse;
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
  //event handler end

  //useEffect Begin
  useEffect(()=>{
    let isMounted : boolean = true;
    let intervalId : any =  null;
    const loadData = async () =>{
      let chats : any[] = [];
      let count : any = null;
      try{
        let _data : any = {'chat':'N','count':'Y'};
        if(isComponentVisible)
        { 
          _data = {..._data,'chat' : 'Y'};
        }
        
        let response = await getChatNotificationAPI(_data) as ApiResponse;
        if(response.status == 200)
        {
          let data : any =  response.data ?? {};
          chats = data?.chats ?? [];
          count = data?.count ?? 0;
        }
      }
      catch(error)
      {
      }
      finally{
        setNotiFicChats(chats);
        setNotiFicChatsCount((prev:any)=>{
          return count;
        });
      }
    }

    if(isMounted)
    {
      setNotiFicChats([]);
      intervalId = setInterval(()=>{    
        loadData();
      },loadChatNotificationInterval);
    }
    return ()=>{
      clearInterval(intervalId);
      isMounted = false;
    }
  },[isComponentVisible]);
  //useEffect End
  return (
    <>
      <StyleHeaderMessageComponent/>
      <li className="header-btn custom-dropdown dropdown-lg btn-group message-btn">
        <a className={`main-link ${isComponentVisible ? "show" : ""}`} href={Href} onClick={ (e) => { handleShowMessageDropDown(e) }}>
          <DynamicFeatherIcon iconName="MessageCircle" className="icon-light stroke-width-3 iw-16 ih-16" />
          {
            Boolean(notiFicChatsCount) &&
            <span className="count success">{notiFicChatsCount}</span>
          }
        </a>
        <div id ="HeaderMessageNotificationDiv" className={`dropdown-menu dropdown-menu-right ${isComponentVisible ? "show" : ""}`} ref={ref}>
          <div className="dropdown-header">
            <div className="left-title">
              <span>{Messages}</span>
            </div>
            {/* <RightOption /> */}
            <div>
              <button disabled = { !Boolean(notiFicChats.length) } 
                className={`no_style_button ${ Boolean(notiFicChats.length) ? 'text-primary' : '' } fw-bold`} 
                title = {`${Boolean(notiFicChats.length) ? 'mark all as read' : 'nothing to read'}`}
                onClick = { (e) => { handleMarkAsReadMessage(0,true) }}
              >
                Read All
              </button>
            </div>
            <div className="mobile-close" onClick={() => setIsComponentVisible(!isComponentVisible)}>
              <h5>{Close}</h5>
            </div>
          </div>
          {
            Boolean(notiFicChatsCount == 0)
            ?
              <div className="text-center text-danger fw-bold px-2 py-2 fs-6">
                No notification
              </div>
            :
            <>
              {
                Boolean(notiFicChats?.length)
                ?
                <UserMessage handleMarkAsReadMessage = {handleMarkAsReadMessage} loginDiffSeconds = {loginDiffSeconds} notiFicChats = {notiFicChats}/>
                :
                <div className="text-center fw-bold px-2 py-2 fs-6">
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

const StyleHeaderMessageComponent = () =>{
  return(
    <>
    <style>
        {
          `
            #HeaderMessageNotificationDiv .friend-list li
            {
              justify-content: space-between;
              gap:0.2rem;
            }

            #HeaderMessageNotificationDiv .friend-list .message_body .send_date
            {
              font-size : 0.7rem;
              font-weight: bold;
            }
            
            #HeaderMessageNotificationDiv .friend-list .media .userPic 
            {
              position : relative;
            }
            
            #HeaderMessageNotificationDiv .friend-list .media .userPic .status
            {
              position: absolute;
              height: 0.6rem;
              aspect-ratio: 1/1;
              border-radius: 50%;
              top: 0;
              right: 0.6rem;
            }
        
            #HeaderMessageNotificationDiv .friend-list  .status.offline{
              background-color: rgb(255 , 44 ,37);
            }
            
            #HeaderMessageNotificationDiv .friend-list  .status.online{
              background-color: rgb(43 , 198 ,12);
            }

            #HeaderMessageNotificationDiv .no_style_button
            {
              cursor: pointer;
              padding: 0;
              margin: 0;
              border: 0;
              line-height: 0;
              background: transparent;
            }

            #HeaderMessageNotificationDiv .dropdown-header
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
export default HeaderMessage;
