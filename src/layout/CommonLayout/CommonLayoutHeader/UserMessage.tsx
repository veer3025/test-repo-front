// Mtak Begin
import {FC} from 'react'
// import { userMessageData } from "@/Data/Layout";
// import { Href, ImagePath } from "../../../utils/constant";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
// import Image from "next/image";
import { Media } from "reactstrap";
const userChatsFilesPath = '/images/user_chats';
const defaultUserImagePath : string = '/assets/default/user.png';
interface UserMessageInterface {
  notiFicChats : any[];
  loginDiffSeconds : number;
  // handleMarkAsReadMessage : ( event : React.MouseEvent<HTMLButtonElement> , chatId :number ) => void;
  handleMarkAsReadMessage : ( chatId :number ,isReadAll : boolean) => void;
}
const UserMessage : FC<UserMessageInterface> = (props) => {
  //props begin
  const {notiFicChats,loginDiffSeconds,handleMarkAsReadMessage} = props;

  //props end
  return (
    <div className="dropdown-content">
      <ul className="friend-list">
        {notiFicChats.map((data:any,index:number) => (
          <li key={data.id}>
            <div style={{ flexGrow:'1' }}>
              <Media>
                <div className='userPic'>
                  <img width={40} height={40} src={ `${Boolean(data.from_user_profile_photo) ? `${data.from_user_profile_photo}` : `${defaultUserImagePath}` }` } alt="user"/>
                  <div className={`status ${ (data?.last_seen_object?.seconds_since_last_login < loginDiffSeconds) ? 'online' : 'offline'}`}></div>
                </div>
                <Media body>
                  <div className='message_body'>
                    <h5 className="mt-0">{data.from_user_full_name}</h5>
                    <h6>
                      {
                        data.chat_type == 'T'
                        ?
                        <span className=''>
                          {
                            data.message?.length > 40 
                            ? 
                              `${data.message.substring(0,40)}...`
                            : 
                              data.message 
                          } 
                        </span>
                        :
                        <a title = {data.file_original_name} href = {`${userChatsFilesPath}/${data?.file_system_name}`} target = "_blank">
                          view
                        </a>
                      }
                    </h6>
                    <div className='mt-1 send_date'>
                      {data.send_text}
                    </div>
                  </div>
                </Media>
              </Media>
            </div>
            <button className="no_style_button" title = "mark as read" onClick = { (e) => { handleMarkAsReadMessage(data.id,false) } }>
              <DynamicFeatherIcon className = "text-primary" iconName="Eye"/>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserMessage;
