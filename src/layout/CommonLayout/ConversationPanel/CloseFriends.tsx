// MTak Begin
// import CustomImage from "@/Common/CustomImage";
// import HoverMessage from "@/Common/HoverMessage";
import HoverMessage from "@/layout/CommonLayout/ConversationPanel/HoverMessage/index";
// import { ImagePath } from "../../../utils/constant";
// import { SingleData, commonInterFace } from "@/layout/LayoutTypes";
import { FC, useState,useEffect } from "react";
import { Collapse, Media } from "reactstrap";
import ChatBoxCommon from "./common/ChatBoxCommon";
import CommonHeader from "./common/CommonHeader";
import useMobileSize from "@/utils/useMobileSize";

//Type script begin
interface CloseFriendsInterface {
  chatUsers : any,
};
//Type script end

const loginDiffSeconds = 20;
const defaultUserImagePath = '/assets/default/user.png';
const CloseFriends: FC<CloseFriendsInterface> = ({ chatUsers }) => {
  //state begin
  const [isOpen, setIsOpen] = useState(true);
  const [chatBox, setChatBox] = useState(false);
  const mobileSize = useMobileSize();
  const [selectedUserData,setSelectedUserData] =  useState<any>();
  //state end
  //event handler begin
  const handleOpenChatBox = (data: any) => {
    setSelectedUserData(data);
    setChatBox(true);
  };
  //event handler end

  useEffect(()=>{
    let updatedUserData = chatUsers.filter((record:any,index:number)=>{
      return (record?.user_id == selectedUserData?.user_id) ? true : false;
    });
    if(updatedUserData.length)
    {
      setSelectedUserData(updatedUserData[0]);
    }
  },[chatUsers]);
  
  // console.log(chatUsers);
  return (
    <div className="friend-section">
      <CommonHeader isOpen={isOpen} setIsOpen={setIsOpen} heading="close friend"/>
      <Collapse isOpen={isOpen} className="friend-list">
        <ul id = "ConversationPanelCloseFriendUlId">
           {chatUsers.map((data:any, index:number) => (
              <li key={data.id} className={`friend-box ${ (data?.last_seen_object?.seconds_since_last_login < loginDiffSeconds) ? 'online' : 'offline'} user${data.id + 1}`}>
                {
                  Boolean(data.unseen_chat_count) &&
                  <div className="message_count">
                    { 
                      (data.unseen_chat_count >= 100) 
                      ? 
                      <span>99+</span>
                      :
                      <span>{data.unseen_chat_count}</span>
                    }
                  </div>
                }
                <Media onClick={() => handleOpenChatBox(data)}>
                  {/* <a className={`popover-cls user-img bg-size blur-up lazyloaded `} id={`PopOver-${data.id}`}>
                    <CustomImage src={ `${Boolean(data.profile_photo) ? `${data.profile_photo}` : `${defaultUserImagePath}` }` } className="img-fluid blur-up lazyload bg-img" alt="user"/>
                    <span className={`available-stats`} />
                  </a> */}
                  <a className={`popover-cls user-img bg-size blur-up lazyloaded `} id={`PopOver-${data.id}`} 
                    style = {{ backgroundSize: 'cover',backgroundPosition: 'center center',backgroundRepeat: 'no-repeat',display: 'block', backgroundImage : `url(${Boolean(data.profile_photo) ? `${data.profile_photo}` : `${defaultUserImagePath}` })` }} >
                    <span className={`available-stats`} />
                  </a>
                  <Media body>
                    <h5 className="user-name">{data.full_name}</h5>
                    <h6>{data.country_name}</h6>
                  </Media>
                </Media>
                <HoverMessage loginDiffSeconds = {loginDiffSeconds} placement={mobileSize ?"right":"top"} target={`PopOver-${data.id}`} data = {data}/>
              </li>
          ))}
        </ul>
        {chatBox && selectedUserData?.id && (
          <ChatBoxCommon key={selectedUserData?.id} loginDiffSeconds = {loginDiffSeconds} setChatBox={setChatBox} selectedUserData = {selectedUserData} setSelectedUserData = {setSelectedUserData}/>
        )}
      </Collapse>
    </div>
  );
};

export default CloseFriends;
